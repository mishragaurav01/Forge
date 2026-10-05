import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";

async function main() {
  const answer = await askLLM(
    "RInspect the current project directory and tell me what files and folders are present."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();