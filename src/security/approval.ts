import readline from "readline";

export async function requestApproval(
  toolName: string,
  args: Record<string, unknown>
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      `\n⚠️ Permission required\n\nTool: ${toolName}\nArguments: ${JSON.stringify(
        args,
        null,
        2
      )}\n\nAllow this operation? [y/N]: `,
      resolve
    );
  });

  rl.close();

  return answer.trim().toLowerCase() === "y";
}