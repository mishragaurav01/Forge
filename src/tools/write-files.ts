import { writeFile } from "fs/promises";
import { registerTool } from "./registry.js";
import { resolveWorkspacePath } from "../security/workspace.js";

registerTool({
  name: "write_file",

  description:
    "Creates or replaces a UTF-8 text file inside the workspace.",

  parameters: {
    type: "object",

    properties: {
      path: {
        type: "string",
        description: "Path relative to the workspace root.",
      },

      content: {
        type: "string",
        description: "Complete content to write into the file.",
      },
    },

    required: ["path", "content"],
  },

  execute: async (args) => {
    const path = args.path;
    const content = args.content;

    if (
      typeof path !== "string" ||
      typeof content !== "string"
    ) {
      return "Invalid path or content.";
    }

    try {
      const safePath = resolveWorkspacePath(path);

      await writeFile(safePath, content, "utf-8");

      return `Successfully wrote ${path}`;
    } catch (error) {
      return `Failed to write file: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});