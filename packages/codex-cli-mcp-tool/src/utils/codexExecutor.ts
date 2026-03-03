import { executeCommand } from "./commandExecutor.js";
import { Logger } from "./logger.js";
import {
  CLI,
  ERROR_MESSAGES,
} from "../constants.js";

export interface CodexMetadata {
  model?: string;
  approval?: string;
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
  approval?: string;
  sandbox?: string;
  workingDir?: string;
  timeout?: number;
  image?: string | string[];
  config?: string | Record<string, unknown>;
  profile?: string;
}

/**
 * Execute codex CLI in non-interactive mode using the exec subcommand.
 *
 * Codex uses `codex exec [OPTIONS] "prompt"` where the prompt is a positional
 * argument at the end (not a flag).
 *
 * Example: codex exec -m gpt-5 -s workspace-write -a on-failure "write hello world"
 */
export async function executeCodex(
  prompt: string,
  options: CodexExecutionOptions = {},
  onProgress?: (output: string) => void
): Promise<CodexOutput> {
  const {
    model,
    approval,
    sandbox,
    workingDir,
    timeout,
    image,
    config,
    profile,
  } = options;

  // Build command arguments: codex exec [OPTIONS] "prompt"
  const args: string[] = [CLI.SUBCOMMANDS.EXEC];

  // Add model selection
  if (model) {
    args.push(CLI.FLAGS.MODEL, model);
  }

  // Add sandbox mode (string value, not boolean)
  if (sandbox) {
    args.push(CLI.FLAGS.SANDBOX, sandbox);
  }

  // Add approval policy
  if (approval) {
    args.push(CLI.FLAGS.APPROVAL, approval);
  }

  // Add working directory
  if (workingDir) {
    args.push(CLI.FLAGS.WORKING_DIR, workingDir);
  }

  // Add image file(s)
  if (image) {
    const images = Array.isArray(image) ? image : [image];
    for (const img of images) {
      args.push(CLI.FLAGS.IMAGE, img);
    }
  }

  // Add config overrides
  if (config) {
    if (typeof config === "string") {
      args.push(CLI.FLAGS.CONFIG, config);
    } else {
      for (const [key, value] of Object.entries(config)) {
        args.push(CLI.FLAGS.CONFIG, `${key}=${JSON.stringify(value)}`);
      }
    }
  }

  // Add profile
  if (profile) {
    args.push(CLI.FLAGS.PROFILE, profile);
  }

  // CRITICAL: prompt is the positional argument at the END
  args.push(prompt);

  Logger.sandboxMode(
    sandbox || approval || CLI.DEFAULTS.APPROVAL,
    `${CLI.COMMANDS.CODEX} ${args.join(" ")}`
  );

  try {
    const rawOutput = await executeCommand(
      CLI.COMMANDS.CODEX,
      args,
      onProgress,
      timeout,
      workingDir
    );

    const parsedOutput = parseCodexOutput(rawOutput);

    // Attach metadata
    parsedOutput.metadata.model = model || CLI.DEFAULTS.MODEL;
    if (approval) parsedOutput.metadata.approval = approval;
    if (sandbox) parsedOutput.metadata.sandbox = sandbox;
    if (workingDir) parsedOutput.metadata.workingDir = workingDir;

    return parsedOutput;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Handle specific error types
    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("not found")
    ) {
      throw new Error(ERROR_MESSAGES.CODEX_NOT_FOUND);
    }
    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("invalid api key") ||
      errorMessage.includes("OPENAI_API_KEY")
    ) {
      throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
    }
    if (
      errorMessage.includes("rate_limit") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota")
    ) {
      throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
    }
    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("sandbox")
    ) {
      throw new Error(ERROR_MESSAGES.SANDBOX_VIOLATION);
    }

    throw error;
  }
}

/**
 * Parse the raw output from codex CLI.
 *
 * Codex exec outputs plain text by default.
 * With --json flag it outputs JSON, but we default to text.
 */
function parseCodexOutput(rawOutput: string): CodexOutput {
  const metadata: CodexMetadata = {};
  const response = rawOutput.trim();

  Logger.codexResponse(response);

  return { metadata, response, rawOutput };
}

/**
 * Format a CodexOutput for MCP response.
 */
export function formatCodexResponseForMCP(
  output: CodexOutput,
  includeMetadata: boolean = true
): string {
  let formatted = "";

  if (includeMetadata && Object.keys(output.metadata).length > 0) {
    formatted += "**Codex Configuration:**\n";
    if (output.metadata.model) formatted += `- Model: ${output.metadata.model}\n`;
    if (output.metadata.approval)
      formatted += `- Approval: ${output.metadata.approval}\n`;
    if (output.metadata.sandbox)
      formatted += `- Sandbox: ${output.metadata.sandbox}\n`;
    if (output.metadata.workingDir)
      formatted += `- Working Directory: ${output.metadata.workingDir}\n`;
    formatted += "\n";
  }

  formatted += `**Response:**\n`;
  formatted += output.response;

  return formatted;
}
