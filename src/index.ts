import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";
import "./tools/write-files.js";
import "./tools/run-command.js";

async function main() {
  const answer = await askLLM(
    "Find the file test.txt in the workspace, read it, and tell me its contents."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();