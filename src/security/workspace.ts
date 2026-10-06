import { isAbsolute, relative, resolve } from "path";

export const workspaceRoot = resolve(
  process.env.FORGE_WORKSPACE ?? "workspace"
);

export function resolveWorkspacePath(inputPath: string): string {
  const resolved = isAbsolute(inputPath)
    ? resolve(inputPath)
    : resolve(workspaceRoot, inputPath);

  const rel = relative(workspaceRoot, resolved);

  if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(
      `Access denied: path escapes the workspace root (${workspaceRoot}).`
    );
  }

  return resolved;
}