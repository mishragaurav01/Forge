import { readFile, stat } from "fs/promises";
import { isAbsolute, relative, resolve } from "path";
import { registerTool } from "./registry.js";

const MAX_BYTES = 256 * 1024;

// Forge's workspace.
// You can override it with FORGE_WORKSPACE in .env.
const workspaceRoot = resolve(
  process.env.FORGE_WORKSPACE ?? resolve("workspace")
);

function isInsideRoot(candidate: string): boolean {
  const rel = relative(workspaceRoot, candidate);

  // Empty relative path means the workspace root itself.
  // A file must be inside the workspace, not the root directory itself.
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

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
          "Path of the file to read, absolute or relative to the workspace root.",
      },
    },

    required: ["path"],
  },

  execute: async (args) => {
    const rawPath = args.path;

    if (typeof rawPath !== "string" || rawPath.trim() === "") {
      return "Invalid file path.";
    }

    // Resolve both absolute and relative paths.
    const resolved = isAbsolute(rawPath)
      ? resolve(rawPath)
      : resolve(workspaceRoot, rawPath);

    // Security boundary.
    if (!isInsideRoot(resolved)) {
      return `Access denied: path escapes the workspace root (${workspaceRoot}).`;
    }

    try {
      const stats = await stat(resolved);

      if (stats.isDirectory()) {
        return `Not a file: ${resolved} is a directory.`;
      }

      // Prevent extremely large files from consuming the context window.
      if (stats.size > MAX_BYTES) {
        return `File too large (${stats.size} bytes, limit ${MAX_BYTES} bytes).`;
      }

      return await readFile(resolved, "utf-8");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code === "ENOENT") {
        return `File not found: ${resolved}`;
      }

      if (code === "EACCES" || code === "EPERM") {
        return `Permission denied: ${resolved}`;
      }

      return `Failed to read file: ${String(error)}`;
    }
  },
});

export { workspaceRoot, MAX_BYTES, isInsideRoot };