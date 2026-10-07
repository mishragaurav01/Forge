import { spawn } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";
import readline from "readline";
import { registerTool } from "../tools/registry.js";

export class MCPClient {
  private process: ChildProcessWithoutNullStreams;
  private nextId = 1;

  private pending = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  constructor() {
    this.process = spawn(
  process.platform === "win32" ? "cmd.exe" : "npx",
  process.platform === "win32"
    ? ["/c", "npx", "tsx", "src/mcp/server.ts"]
    : ["tsx", "src/mcp/server.ts"],
  {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  }
);

    const rl = readline.createInterface({
      input: this.process.stdout,
    });

    rl.on("line", (line) => {
      try {
        const message = JSON.parse(line);

        if (message.id && this.pending.has(message.id)) {
          const request = this.pending.get(message.id)!;
          this.pending.delete(message.id);

          if (message.error) {
            request.reject(new Error(message.error.message));
          } else {
            request.resolve(message.result);
          }
        }
      } catch {
        // Ignore invalid output
      }
    });

    this.process.stderr.on("data", (data) => {
      console.error("MCP Server:", data.toString());
    });
  }

  private request(method: string, params?: unknown): Promise<any> {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      this.process.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          method,
          params,
        }) + "\n"
      );
    });
  }

  async initialize() {
    return this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "forge",
        version: "1.0.0",
      },
    });
  }

  async listTools() {
    return this.request("tools/list");
  }

  async callTool(name: string, arguments_: Record<string, unknown> = {}) {
    return this.request("tools/call", {
      name,
      arguments: arguments_,
    });
  }

  async registerTools() {
  const result = await this.listTools();

  for (const tool of result.tools) {
    registerTool({
      name: `mcp_${tool.name}`,
      description: tool.description,
      parameters: tool.inputSchema,

      execute: async (args) => {
        const result = await this.callTool(tool.name, args);

        const text = result.content
          ?.filter((item: any) => item.type === "text")
          .map((item: any) => item.text)
          .join("\n");

        return text ?? "MCP tool returned no text.";
      },
    });
  }
}

  close() {
    this.process.kill();
  }
}