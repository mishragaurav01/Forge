import path from "path";

const WORKSPACE_ROOT = path.resolve("workspace");

export function resolveWorkspacePath(inputPath: string): string {
  const resolvedPath = path.resolve(WORKSPACE_ROOT, inputPath);

  const relativePath = path.relative(
    WORKSPACE_ROOT,
    resolvedPath
  );

  // Prevent paths from escaping workspace
  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Access denied: path is outside workspace.");
  }

  return resolvedPath;
}