import { spawn } from "child_process";
import { registerTool } from "./registry.js";
import { workspaceRoot } from "../security/workspace.js";

const TIMEOUT = 30_000;
const MAX_OUTPUT = 50_000;

registerTool({
  name: "run_command",

  description:
    "Runs a development command inside the Forge workspace.",

  parameters: {
    type: "object",

    properties: {
      command: {
        type: "string",
        description:
          "Command to execute, such as npm, node, or git.",
      },

      args: {
        type: "array",
        description: "Arguments for the command.",
        items: {
          type: "string",
        },
      },
    },

    required: ["command", "args"],
  },

  execute: async (input) => {
    const command = input.command;
    const args = input.args;

    if (
      typeof command !== "string" ||
      !Array.isArray(args) ||
      !args.every((arg) => typeof arg === "string")
    ) {
      return "Invalid command arguments.";
    }

    return new Promise((resolve) => {
      let executable = command;
let spawnArgs = args;

if (process.platform === "win32" && command === "npm") {
  executable = "cmd.exe";
  spawnArgs = ["/c", "npm.cmd", ...args];
}

const child = spawn(executable, spawnArgs, {
  cwd: workspaceRoot,
  shell: false,
  windowsHide: true,
});

      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill();

        resolve(
          [
            "Command timed out.",
            "",
            "STDOUT:",
            stdout,
            "",
            "STDERR:",
            stderr,
          ].join("\n")
        );
      }, TIMEOUT);

      child.stdout.on("data", (data) => {
        stdout += data.toString();

        if (stdout.length > MAX_OUTPUT) {
          stdout = stdout.slice(0, MAX_OUTPUT);
        }
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();

        if (stderr.length > MAX_OUTPUT) {
          stderr = stderr.slice(0, MAX_OUTPUT);
        }
      });

      child.on("error", (error) => {
        clearTimeout(timer);

        resolve(
          [
            "Command failed.",
            "",
            "STDOUT:",
            stdout,
            "",
            "STDERR:",
            stderr,
            "",
            `ERROR: ${error.message}`,
          ].join("\n")
        );
      });

      child.on("close", (code) => {
        clearTimeout(timer);

        resolve(
          [
            `Exit code: ${code}`,
            "",
            "STDOUT:",
            stdout,
            "",
            "STDERR:",
            stderr,
          ].join("\n")
        );
      });
    });
  },
});