import { z } from "zod";
import { executeGemini, formatGeminiResponseForMCP, } from "../utils/geminiExecutor.js";
import { ERROR_MESSAGES, MODELS, OUTPUT_FORMATS, STATUS_MESSAGES } from "../constants.js";
const execGeminiArgsSchema = z.object({
    prompt: z
        .string()
        .min(1)
        .describe("Command or instruction for non-interactive Gemini execution"),
    model: z
        .string()
        .optional()
        .describe(`Model to use: ${Object.values(MODELS).join(", ")}`),
    sandbox: z
        .boolean()
        .optional()
        .describe("Run in sandbox mode"),
    timeout: z
        .number()
        .optional()
        .describe("Maximum execution time in milliseconds (optional)"),
    workingDir: z
        .string()
        .optional()
        .describe("Working directory for execution"),
});
export const execGeminiTool = {
    name: "exec-gemini",
    description: "Non-interactive Gemini execution for automation and scripting",
    zodSchema: execGeminiArgsSchema,
    prompt: {
        description: "Execute Gemini commands non-interactively for automation workflows",
    },
    category: "gemini",
    execute: async (args, onProgress) => {
        const { prompt, model, sandbox, timeout, workingDir } = args;
        if (!prompt?.trim()) {
            throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
        }
        try {
            if (onProgress) {
                onProgress(`${STATUS_MESSAGES.PROCESSING_START} (non-interactive mode)`);
            }
            const result = await executeGemini(prompt.trim(), {
                model,
                sandbox,
                timeout,
                workingDir,
                // Always use yolo mode for non-interactive execution
                yolo: true,
                outputFormat: OUTPUT_FORMATS.TEXT,
            }, onProgress);
            // Format for non-interactive use (more concise, no metadata)
            return formatGeminiResponseForMCP(result, false);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Exec-Gemini failed: ${errorMessage}`);
        }
    },
};
