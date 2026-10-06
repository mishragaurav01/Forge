import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";
import "./tools/list-directory.js";
import "./tools/search-files.js";

async function main() {
  const answer = await askLLM(
    "Read ../package.json and tell me what is inside."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();