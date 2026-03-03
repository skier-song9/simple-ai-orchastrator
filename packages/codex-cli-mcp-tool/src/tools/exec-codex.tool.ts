import { z } from "zod";
import {
  executeCodex,
  formatCodexResponseForMCP,
} from "../utils/codexExecutor.js";
import { ERROR_MESSAGES, MODELS, SANDBOX_MODES, APPROVAL_POLICIES, STATUS_MESSAGES } from "../constants.js";

const execCodexArgsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe("Command or instruction for non-interactive Codex execution"),
  model: z
    .string()
    .optional()
    .describe(`Model to use: ${Object.values(MODELS).join(", ")}`),
  sandbox: z
    .string()
    .optional()
    .describe(`Sandbox mode: ${Object.values(SANDBOX_MODES).join(", ")}`),
  timeout: z
    .number()
    .optional()
    .describe("Maximum execution time in milliseconds (optional)"),
  workingDir: z
    .string()
    .optional()
    .describe("Working directory for execution"),
});

type ExecCodexArgs = z.infer<typeof execCodexArgsSchema>;

export const execCodexTool = {
  name: "exec-codex",
  description: "Non-interactive Codex execution for automation and scripting",
  zodSchema: execCodexArgsSchema,
  prompt: {
    description: "Execute Codex commands non-interactively for automation workflows",
  },
  category: "codex",
  execute: async (
    args: ExecCodexArgs,
    onProgress?: (output: string) => void
  ): Promise<string> => {
    const { prompt, model, sandbox, timeout, workingDir } = args;

    if (!prompt?.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    try {
      if (onProgress) {
        onProgress(`${STATUS_MESSAGES.PROCESSING_START} (non-interactive mode)`);
      }

      const result = await executeCodex(
        prompt.trim(),
        {
          model,
          sandbox,
          timeout,
          workingDir,
          // Always use "never" approval for non-interactive execution
          approval: APPROVAL_POLICIES.NEVER,
        },
        onProgress
      );

      // Format for non-interactive use (more concise, no metadata)
      return formatCodexResponseForMCP(result, false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Exec-Codex failed: ${errorMessage}`);
    }
  },
};
