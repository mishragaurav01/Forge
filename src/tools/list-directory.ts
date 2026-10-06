import { readdir } from "fs/promises";
import { registerTool } from "./registry.js";
import { resolveWorkspacePath, workspaceRoot } from "../security/workspace.js";

registerTool({
  name: "list_directory",
  description:
    "Lists files and directories inside the workspace. Use '.' for the workspace root.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Directory path relative to the workspace root. Use '.' for the workspace root.",
      },
    },
    required: ["path"],
  },

  execute: async (args) => {
    const inputPath = args.path;

    if (typeof inputPath !== "string" || inputPath.trim() === "") {
      return "Invalid directory path. Use '.' for the workspace root.";
    }

    try {
      const resolved =
        inputPath === "."
          ? workspaceRoot
          : resolveWorkspacePath(inputPath);

      const entries = await readdir(resolved, {
        withFileTypes: true,
      });

      if (entries.length === 0) {
        return "Directory is empty.";
      }

      return entries
        .map((entry) =>
          entry.isDirectory()
            ? `[DIR] ${entry.name}`
            : `[FILE] ${entry.name}`
        )
        .join("\n");
    } catch (error) {
      return `Failed to list directory: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});