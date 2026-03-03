import { executeCommand } from "./commandExecutor.js";
import {
  parseGeminiOutput,
  formatGeminiResponse,
  GeminiOutput,
} from "./outputParser.js";
import { Logger } from "./logger.js";
import {
  CLI,
  MODELS,
  APPROVAL_MODES,
  OUTPUT_FORMATS,
  ERROR_MESSAGES,
} from "../constants.js";

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
export async function executeGemini(
  prompt: string,
  options: GeminiExecutionOptions = {},
  onProgress?: (output: string) => void
): Promise<GeminiOutput> {
  const {
    model,
    approvalMode,
    yolo,
    sandbox,
    outputFormat = OUTPUT_FORMATS.TEXT,
    workingDir,
    timeout,
    includeDirectories,
    debug,
  } = options;

  // Build command arguments
  const args: string[] = [];

  // CRITICAL: gemini uses -p flag for non-interactive mode, NOT positional arg
  args.push(CLI.FLAGS.PROMPT, prompt);

  // Add model selection
  if (model) {
    args.push(CLI.FLAGS.MODEL, model);
  }

  // Add approval mode
  if (approvalMode && approvalMode !== APPROVAL_MODES.DEFAULT) {
    args.push(CLI.FLAGS.APPROVAL_MODE, approvalMode);
  }

  // Add yolo flag (auto-approve all actions)
  if (yolo) {
    args.push(CLI.FLAGS.YOLO);
  }

  // Add sandbox flag
  if (sandbox) {
    args.push(CLI.FLAGS.SANDBOX);
  }

  // Add output format
  args.push(CLI.FLAGS.OUTPUT_FORMAT, outputFormat);

  // Add additional workspace directories
  if (includeDirectories && includeDirectories.length > 0) {
    args.push(CLI.FLAGS.INCLUDE_DIRECTORIES, ...includeDirectories);
  }

  // Add debug flag
  if (debug) {
    args.push(CLI.FLAGS.DEBUG);
  }

  Logger.sandboxMode(
    sandbox ? "sandbox" : approvalMode || APPROVAL_MODES.DEFAULT,
    `${CLI.COMMANDS.GEMINI} ${args.join(" ")}`
  );

  try {
    const rawOutput = await executeCommand(
      CLI.COMMANDS.GEMINI,
      args,
      onProgress,
      timeout,
      workingDir
    );

    const parsedOutput = parseGeminiOutput(rawOutput, outputFormat);

    // Attach metadata
    parsedOutput.metadata.model = model || CLI.DEFAULTS.MODEL;
    parsedOutput.metadata.outputFormat = outputFormat;
    if (approvalMode) parsedOutput.metadata.approvalMode = approvalMode;
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
      throw new Error(ERROR_MESSAGES.GEMINI_NOT_FOUND);
    }
    if (
      errorMessage.includes("UNAUTHENTICATED") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("credentials")
    ) {
      throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
    }
    if (
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota")
    ) {
      throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
    }
    if (
      errorMessage.includes("PERMISSION_DENIED") ||
      errorMessage.includes("sandbox")
    ) {
      throw new Error(ERROR_MESSAGES.SANDBOX_VIOLATION);
    }

    throw error;
  }
}

/**
 * Format a GeminiOutput for MCP response.
 */
export function formatGeminiResponseForMCP(
  output: GeminiOutput,
  includeMetadata: boolean = true
): string {
  return formatGeminiResponse(output, includeMetadata);
}
