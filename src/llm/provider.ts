import OpenAI from "openai";
import "dotenv/config";

import { getTools } from "../tools/registry.js";
import { getPermission } from "../security/permissions.js";
import { requestApproval } from "../security/approval.js";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "openrouter/free";
const MAX_TOOL_ROUNDS = 10;

export async function askLLM(message: string) {
  const tools = getTools();

  const toolDefinitions = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: message,
    },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    console.log(`\n🤖 Agent round ${round + 1}`);

    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions,
    });

    const assistantMessage = response.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error("No response from LLM");
    }

    messages.push(assistantMessage);

    // No tools requested → agent is finished
    if (!assistantMessage.tool_calls?.length) {
      return assistantMessage.content ?? "";
    }

    // Execute every requested tool
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      const tool = tools.find((tool) => tool.name === toolName);

      if (!tool) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Unknown tool: ${toolName}`,
        });

        continue;
      }

      let args: Record<string, unknown>;

      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: "Invalid tool arguments.",
        });

        continue;
      }

      const permission = getPermission(toolName);

      console.log(`\n🔧 Tool requested: ${toolName}`);
      console.log("Permission:", permission);
      console.log("Arguments:", args);

      // Permission denied by policy
      if (permission === "deny") {
        const result = `Permission denied for tool: ${toolName}`;

        console.log("❌", result);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });

        continue;
      }

      // Ask user for dangerous operations
      if (permission === "ask") {
        const approved = await requestApproval(toolName, args);

        if (!approved) {
          const result = `User denied permission for tool: ${toolName}`;

          console.log("❌", result);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });

          continue;
        }

        console.log("✅ Permission granted.");
      }

      // Execute tool
      try {
        const result = await tool.execute(args);

        console.log("Tool result:", result);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      } catch (error) {
        const result = `Tool execution failed: ${
          error instanceof Error ? error.message : String(error)
        }`;

        console.log("❌", result);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }
  }

  return `Agent stopped after reaching the maximum of ${MAX_TOOL_ROUNDS} tool rounds.`;
}