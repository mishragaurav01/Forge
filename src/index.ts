import { askLLM } from "./llm/provider.js";

import "./tools/calculator.js";
import "./tools/read-file.js";

async function main() {
  const answer = await askLLM(
    "Read the package.json file and tell me what scripts are defined."
  );

  console.log("\nForge:");
  console.log(answer);
}

main();