import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";
import "./tools/write-files.js";

async function main() {
  const answer = await askLLM(
    "Create a file called hello.ts containing a function called greet that returns 'Hello from Forge'."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();