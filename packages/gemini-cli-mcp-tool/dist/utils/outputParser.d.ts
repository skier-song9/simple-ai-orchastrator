export interface GeminiMetadata {
    model?: string;
    outputFormat?: string;
    approvalMode?: string;
    workingDir?: string;
    [key: string]: string | undefined;
}
export interface GeminiOutput {
    metadata: GeminiMetadata;
    response: string;
    rawOutput: string;
}
/**
 * Parse the raw output from gemini CLI.
 *
 * When invoked with `-o json`, gemini outputs a JSON object.
 * When invoked with `-o text` (default), gemini outputs plain text.
 *
 * Returns a structured GeminiOutput with metadata, response, and rawOutput.
 */
export declare function parseGeminiOutput(rawOutput: string, outputFormat?: string): GeminiOutput;
/**
 * Format GeminiOutput for display in MCP responses.
 */
export declare function formatGeminiResponse(output: GeminiOutput, includeMetadata?: boolean): string;
