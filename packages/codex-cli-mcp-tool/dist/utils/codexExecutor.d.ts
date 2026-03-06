export interface CodexMetadata {
    model?: string;
    approvalMode?: string;
    sandbox?: string;
    workingDir?: string;
    [key: string]: string | undefined;
}
export interface CodexOutput {
    metadata: CodexMetadata;
    response: string;
    rawOutput: string;
}
export interface CodexExecutionOptions {
    model?: string;
    sandbox?: string;
    workingDir?: string;
    timeout?: number;
    image?: string | string[];
    config?: string | Record<string, unknown>;
    profile?: string;
    fullAuto?: boolean;
}
/**
 * Execute codex CLI in non-interactive mode using the exec subcommand.
 *
 * Codex uses `codex exec [OPTIONS] "prompt"` where the prompt is a positional
 * argument at the end (not a flag).
 *
 * Example: codex exec -m gpt-5 -s workspace-write --full-auto "write hello world"
 */
export declare function executeCodex(prompt: string, options?: CodexExecutionOptions, onProgress?: (output: string) => void): Promise<CodexOutput>;
/**
 * Format a CodexOutput for MCP response.
 */
export declare function formatCodexResponseForMCP(output: CodexOutput, includeMetadata?: boolean): string;
