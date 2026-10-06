export type PermissionLevel = "allow" | "ask" | "deny";

const permissions: Record<string, PermissionLevel> = {
  read_file: "allow",
  list_directory: "allow",
  search_files: "allow",

  write_file: "ask",
  delete_file: "ask",
  run_command: "ask",
};

export function getPermission(toolName: string): PermissionLevel {
  return permissions[toolName] ?? "ask";
}