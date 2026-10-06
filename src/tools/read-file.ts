import { readFile, stat } from "fs/promises";
import { registerTool } from "./registry.js";
import {
  resolveWorkspacePath,
  workspaceRoot,
} from "../security/workspace.js";

const MAX_BYTES = 256 * 1024;

registerTool({
  name: "read_file",

  description:
    "Reads the contents of a UTF-8 text file inside the workspace directory.",

  parameters: {
    type: "object",

    properties: {
      path: {
        type: "string",
        description:
          "Path relative to the workspace root. Do not include 'workspace/' in the path.",
      },
    },

    required: ["path"],
  },

  execute: async (args) => {
    const rawPath = args.path;

    if (typeof rawPath !== "string" || rawPath.trim() === "") {
      return "Invalid file path.";
    }

    try {
      const resolved = resolveWorkspacePath(rawPath);

      const stats = await stat(resolved);

      if (stats.isDirectory()) {
        return `Not a file: ${resolved} is a directory.`;
      }

      if (stats.size > MAX_BYTES) {
        return `File too large (${stats.size} bytes, limit ${MAX_BYTES} bytes).`;
      }

      return await readFile(resolved, "utf-8");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : String(error);

      if (message.startsWith("Access denied")) {
        return message;
      }

      const code = (error as NodeJS.ErrnoException).code;

      if (code === "ENOENT") {
        return `File not found inside workspace.`;
      }

      if (code === "EACCES" || code === "EPERM") {
        return `Permission denied.`;
      }

      return `Failed to read file: ${message}`;
    }
  },
});

export { MAX_BYTES, workspaceRoot };