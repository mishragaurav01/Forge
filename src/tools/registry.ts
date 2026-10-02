export type Tool = {
  name: string;
  description: string;

  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };

  execute: (args: Record<string, unknown>) => Promise<string>;
};

const tools: Tool[] = [];

export function registerTool(tool: Tool) {
  tools.push(tool);
}

export function getTools() {
  return tools;
}