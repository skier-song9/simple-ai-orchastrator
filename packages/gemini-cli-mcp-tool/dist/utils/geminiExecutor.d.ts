import { GeminiOutput } from "./outputParser.js";
export interface GeminiExecutionOptions {
    model?: string;
    approvalMode?: string;
    yolo?: boolean;
    sandbox?: boolean;
    outputFormat?: string;
    workingDir?: string;
    timeout?: number;
    includeDirectories?: string[];
    debug?: boolean;
}
/**
 * Execute gemini CLI in non-interactive mode using the -p flag.
 *
 * Key difference from codex: gemini uses `-p "prompt"` (prompt as flag value),
 * NOT a positional argument. There is no "exec" subcommand.
 *
 * Example: gemini -p "write hello world" -m gemini-2.5-pro --yolo -o text
 */
export declare function executeGemini(prompt: string, options?: GeminiExecutionOptions, onProgress?: (output: string) => void): Promise<GeminiOutput>;
/**
 * Format a GeminiOutput for MCP response.
 */
export declare function formatGeminiResponseForMCP(output: GeminiOutput, includeMetadata?: boolean): string;
