import readline from "readline";

import { askLLM } from "./llm/provider.js";
import { Session } from "./session.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";
import "./tools/write-files.js";
import "./tools/run-command.js";
import { MCPManager } from "./mcp/manager.js";
import { setApprovalInterface } from "./security/approval.js";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

setApprovalInterface(rl);

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {

const mcp = new MCPManager();

await mcp.addServer();

  console.log("🔥 Forge");
  console.log("Type 'exit' to quit.\n");

  const session = new Session();

  while (true) {
    const input = await askQuestion("Forge> ");

    const message = input.trim();

    if (!message) {
      continue;
    }

    if (message.toLowerCase() === "exit") {
      console.log("Goodbye! 👋");
      break;
    }

    try {
      const answer = await askLLM(message, session);

      console.log("\nForge:");
      console.log(answer);
      console.log();
    } catch (error) {
      console.error(
        "\n❌ Error:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
  mcp.closeAll();
  rl.close();
}

main();