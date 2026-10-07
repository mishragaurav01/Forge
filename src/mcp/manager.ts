import { MCPClient } from "./client.js";

export class MCPManager {
  private clients: MCPClient[] = [];

  async addServer() {
    const client = new MCPClient();

    await client.initialize();
    await client.registerTools();

    this.clients.push(client);
  }

  closeAll() {
    for (const client of this.clients) {
      client.close();
    }

    this.clients = [];
  }
}