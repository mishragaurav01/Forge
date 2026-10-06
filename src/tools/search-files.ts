import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";
import { registerTool } from "./registry.js";
import { workspaceRoot } from "../security/workspace.js";

const IGNORED = new Set(["node_modules", ".git", "dist"]);

registerTool({
  name: "search_files",
  description:
    "Searches for a text term inside files in the workspace.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Text to search for.",
      },
    },
    required: ["query"],
  },

  execute: async (args) => {
    const query = args.query;

    if (typeof query !== "string" || query.trim() === "") {
      return "Invalid search query.";
    }

    const results: string[] = [];

    async function walk(directory: string) {
      const entries = await readdir(directory, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (IGNORED.has(entry.name)) {
          continue;
        }

        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
          continue;
        }

        try {
          const content = await readFile(fullPath, "utf-8");

          if (content.includes(query)) {
            results.push(relative(workspaceRoot, fullPath));
          }
        } catch {
          // Ignore unreadable/binary files.
        }
      }
    }

    try {
      await walk(workspaceRoot);

      if (results.length === 0) {
        return `No files found containing "${query}".`;
      }

      return results.join("\n");
    } catch (error) {
      return `Search failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});