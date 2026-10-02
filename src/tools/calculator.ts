import { registerTool } from "./registry.js";

registerTool({
  name: "calculator",
  description: "Performs basic mathematical calculations.",

  parameters: {
    type: "object",

    properties: {
      expression: {
        type: "string",
        description: "The mathematical expression to calculate.",
      },
    },

    required: ["expression"],
  },

  execute: async (args) => {
    const expression = args.expression;

    if (typeof expression !== "string") {
      return "Invalid expression.";
    }

    try {
      const result = Function(
        `"use strict"; return (${expression})`
      )();

      return String(result);
    } catch {
      return "Invalid mathematical expression.";
    }
  },
});