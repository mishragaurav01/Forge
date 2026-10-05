import { readdir } from "fs/promises";
import { registerTool } from "./registry";

registerTool({
  name: "list_directory",

  description: "Lists files and directories inside a directory.",

  parameters: {
    type: "object",

    properties: {
      path: {
        type: "string",
        description: "Path of the directory to inspect.",
      },
    },

    required: ["path"],
  },

  execute: async (args) => {
    const path = args.path;

    if (typeof path !== "string") {
      return "Invalid directory path.";
    }

    try {
      const entries = await readdir(path, {
        withFileTypes: true,
      });

      return entries
        .map((entry) =>
          entry.isDirectory()
            ? `[DIR] ${entry.name}`
            : `[FILE] ${entry.name}`
        )
        .join("\n");
    } catch (error) {
      return `Failed to list directory: ${String(error)}`;
    }
  },
});