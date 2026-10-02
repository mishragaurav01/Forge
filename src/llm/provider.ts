import OpenAI from "openai";
import "dotenv/config";
import { getTools } from "../tools/registry.js";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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

  // First LLM call
  const response = await client.chat.completions.create({
    model: "openrouter/free",
    messages,
    tools: toolDefinitions,
  });

  const assistantMessage = response.choices[0]?.message;

  if (!assistantMessage) {
    throw new Error("No response from LLM");
  }

  // Add LLM response to conversation
  messages.push(assistantMessage);

  // Did the LLM request a tool?
  if (assistantMessage.tool_calls) {
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      const tool = tools.find(
        (tool) => tool.name === toolName
      );

      if (!tool) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      const args = JSON.parse(toolCall.function.arguments);

      console.log(`\n🔧 Calling tool: ${toolName}`);
      console.log("Arguments:", args);

      const result = await tool.execute(args);

      console.log("Tool result:", result);

      // Send tool result back to the LLM
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    // Second LLM call
    const finalResponse = await client.chat.completions.create({
      model: "openrouter/free",
      messages,
      tools: toolDefinitions,
    });

    return finalResponse.choices[0]?.message.content ?? "";
  }

  return assistantMessage.content ?? "";
}