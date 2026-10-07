import readline from "readline";

let rl: readline.Interface | null = null;

export function setApprovalInterface(
  interfaceInstance: readline.Interface
) {
  rl = interfaceInstance;
}

export async function requestApproval(
  toolName: string,
  args: Record<string, unknown>
): Promise<boolean> {
  if (!rl) {
    throw new Error("Approval interface has not been initialized.");
  }

  const answer = await new Promise<string>((resolve) => {
    rl!.question(
      `\n⚠️ Permission required\n\nTool: ${toolName}\nArguments: ${JSON.stringify(
        args,
        null,
        2
      )}\n\nAllow this operation? [y/N]: `,
      resolve
    );
  });

  return answer.trim().toLowerCase() === "y";
}