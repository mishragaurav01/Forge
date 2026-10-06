import readline from "readline";

import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";
import "./tools/write-files.js";
import "./tools/run-command.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log("🔥 Forge");
  console.log("Type 'exit' to quit.\n");

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
      const answer = await askLLM(message);

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

  rl.close();
}

main();