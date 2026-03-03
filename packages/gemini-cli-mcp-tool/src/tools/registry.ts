import { ZodError } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Use a loose type for Zod schemas to avoid deep type instantiation errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = any;

export interface ToolDefinition {
  name: string;
  description: string;
  zodSchema: AnyZodSchema;
  prompt?: {
    description: string;
    arguments?: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  };
  category?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (args: any, onProgress?: (output: string) => void) => Promise<string>;
}

export const toolRegistry: ToolDefinition[] = [];

export function toolExists(toolName: string): boolean {
  return toolRegistry.some((t) => t.name === toolName);
}

export function getToolDefinitions() {
  return toolRegistry.map((tool) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = zodToJsonSchema(tool.zodSchema, tool.name) as any;
    const def = raw.definitions?.[tool.name] ?? raw;
    const inputSchema = {
      type: "object",
      properties: def.properties || {},
      required: def.required || [],
    };

    return {
      name: tool.name,
      description: tool.description,
      inputSchema,
    };
  });
}

function extractPromptArguments(zodSchema: AnyZodSchema) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(zodSchema) as any;
  const properties = jsonSchema.properties || {};
  const required: string[] = jsonSchema.required || [];

  return Object.entries(properties).map(([name, prop]) => ({
    name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description: (prop as any).description || `${name} parameter`,
    required: required.includes(name),
  }));
}

export function getPromptDefinitions() {
  return toolRegistry
    .filter((tool) => tool.prompt)
    .map((tool) => ({
      name: tool.name,
      description: tool.prompt!.description,
      arguments:
        tool.prompt!.arguments || extractPromptArguments(tool.zodSchema),
    }));
}

export async function executeTool(
  toolName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>,
  onProgress?: (output: string) => void
): Promise<string> {
  const tool = toolRegistry.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  try {
    const validatedArgs = tool.zodSchema.parse(args);
    return tool.execute(validatedArgs, onProgress);
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Invalid arguments for ${toolName}: ${issues}`);
    }
    throw error;
  }
}

export function getPromptMessage(
  toolName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>
): string | null {
  const tool = toolRegistry.find((t) => t.name === toolName);
  if (!tool?.prompt) {
    return null;
  }

  const paramStrings: string[] = [];
  if (args.prompt) {
    paramStrings.push(args.prompt);
  }

  Object.entries(args).forEach(([key, value]) => {
    if (
      key !== "prompt" &&
      value !== undefined &&
      value !== null &&
      value !== false
    ) {
      if (typeof value === "boolean" && value) {
        paramStrings.push(`[${key}]`);
      } else if (typeof value !== "boolean") {
        paramStrings.push(`(${key}: ${value})`);
      }
    }
  });

  return `Use the ${toolName} tool${paramStrings.length > 0 ? ": " + paramStrings.join(" ") : ""}`;
}
