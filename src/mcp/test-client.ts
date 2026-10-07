import { MCPClient } from "./client.js";

const client = new MCPClient();

async function main() {
  console.log("Initializing MCP...");

  const info = await client.initialize();

  console.log("Server:", info);

  const tools = await client.listTools();

  console.log("Tools:", tools);

  const result = await client.callTool("get_time");

  console.log("Result:", result);

  client.close();
}

main();