import { readFile } from "fs/promises";
import { readdir } from "fs/promises";
import { join } from "path";
import { registerTool } from "./registry.js";

async function searchDirectory(
  directory: string,
  searchTerm: string,
  results: string[]
): Promise<void> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    // Skip directories we don't want to search
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await searchDirectory(fullPath, searchTerm, results);
      continue;
    }

    try {
      const content = await readFile(fullPath, "utf-8");

      if (content.includes(searchTerm)) {
        results.push(fullPath);
      }
    } catch {
      // Ignore files that cannot be read as text
    }
  }
}

registerTool({
  name: "search_files",

  description:
    "Searches project files for a specific text or code pattern.",

  parameters: {
    type: "object",

    properties: {
      searchTerm: {
        type: "string",
        description: "Text or code pattern to search for.",
      },

      directory: {
        type: "string",
        description: "Directory to search inside.",
      },
    },

    required: ["searchTerm", "directory"],
  },

  execute: async (args) => {
    const searchTerm = args.searchTerm;
    const directory = args.directory;

    if (
      typeof searchTerm !== "string" ||
      typeof directory !== "string"
    ) {
      return "Invalid search arguments.";
    }

    const results: string[] = [];

    try {
      await searchDirectory(directory, searchTerm, results);

      if (results.length === 0) {
        return `No files found containing "${searchTerm}".`;
      }

      return results.join("\n");
    } catch (error) {
      return `Search failed: ${String(error)}`;
    }
  },
});