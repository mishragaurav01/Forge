import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";

async function main() {
  const answer = await askLLM(
    "Search the src directory for the word 'registerTool' and tell me which files contain it."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();