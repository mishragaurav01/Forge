import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function send(message: unknown) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

rl.on("line", (line) => {
  try {
    const request = JSON.parse(line);

    // MCP-style initialization
    if (request.method === "initialize") {
      send({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "forge-demo-server",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
          },
        },
      });

      return;
    }

    // Tool discovery
    if (request.method === "tools/list") {
      send({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          tools: [
            {
              name: "get_time",
              description: "Returns the current time.",
              inputSchema: {
                type: "object",
                properties: {},
              },
            },
          ],
        },
      });

      return;
    }

    // Tool execution
    if (request.method === "tools/call") {
      const toolName = request.params?.name;

      if (toolName === "get_time") {
        send({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: new Date().toISOString(),
              },
            ],
          },
        });

        return;
      }

      send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`,
        },
      });

      return;
    }

    send({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32601,
        message: `Unknown method: ${request.method}`,
      },
    });
  } catch {
    send({
      jsonrpc: "2.0",
      error: {
        code: -32700,
        message: "Invalid JSON",
      },
    });
  }
});