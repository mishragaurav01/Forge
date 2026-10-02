import { readFile } from "fs/promises";
import { registerTool } from "./registry.js";

registerTool({
  name: "read_file",

  description: "Reads the contents of a file.",

  parameters: {
    type: "object",

    properties: {
      path: {
        type: "string",
        description: "Path of the file to read.",
      },
    },

    required: ["path"],
  },

  execute: async (args) => {
    const path = args.path;

    if (typeof path !== "string") {
      return "Invalid file path.";
    }

    try {
      return await readFile(path, "utf-8");
    } catch (error) {
      return `Failed to read file: ${String(error)}`;
    }
  },
});