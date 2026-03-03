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

  // Set working directory via env if specified
  const execEnv = workingDir
    ? { ...process.env, PWD: workingDir }
    : process.env;

  try {
    // If working directory specified, we need to use spawn with cwd option
    // executeCommand doesn't support cwd, so we handle it via a wrapper
    let rawOutput: string;

    if (workingDir) {
      rawOutput = await executeCommandWithCwd(
        CLI.COMMANDS.GEMINI,
        args,
        workingDir,
        onProgress,
        timeout
      );
    } else {
      rawOutput = await executeCommand(
        CLI.COMMANDS.GEMINI,
        args,
        onProgress,
        timeout
      );
    }

    const parsedOutput = parseGeminiOutput(rawOutput, outputFormat);

    // Attach metadata
    parsedOutput.metadata.model = model || CLI.DEFAULTS.MODEL;
    parsedOutput.metadata.outputFormat = outputFormat;
    if (approvalMode) parsedOutput.metadata.approvalMode = approvalMode;
    if (workingDir) parsedOutput.metadata.workingDir = workingDir;

    // Check for authentication errors in response
    if (
      parsedOutput.response.includes("authentication") ||
      parsedOutput.response.includes("unauthenticated") ||
      parsedOutput.response.includes("credentials")
    ) {
      Logger.authenticationStatus(false);
      throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
    }

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
 * Execute a command with a specific working directory.
 */
async function executeCommandWithCwd(
  command: string,
  args: string[],
  cwd: string,
  onProgress?: (output: string) => void,
  timeout?: number
): Promise<string> {
  const { spawn } = await import("child_process");

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    Logger.commandExecution(command, args, startTime);

    const childProcess = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      cwd,
    });

    let stdout = "";
    let stderr = "";
    let isResolved = false;
    let lastReportedLength = 0;

    let timeoutHandle: NodeJS.Timeout | undefined;
    if (timeout) {
      timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          childProcess.kill("SIGTERM");
          reject(new Error(`Command timed out after ${timeout}ms`));
        }
      }, timeout);
    }

    childProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      if (onProgress && stdout.length > lastReportedLength) {
        const newContent = stdout.substring(lastReportedLength);
        lastReportedLength = stdout.length;
        onProgress(newContent);
      }
    });

    childProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    childProcess.on("error", (error: NodeJS.ErrnoException) => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (error.message.includes("ENOENT")) {
          reject(
            new Error(
              "Gemini CLI not found. Please install with: brew install gemini-cli or npm install -g @google/gemini-cli"
            )
          );
        } else {
          reject(new Error(`Failed to spawn command: ${error.message}`));
        }
      }
    });

    childProcess.on("close", (code: number | null) => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (code === 0) {
          Logger.commandComplete(startTime, code, stdout.length);
          resolve(stdout.trim());
        } else {
          Logger.commandComplete(startTime, code ?? undefined);
          const errorMessage = stderr.trim() || "Unknown error";
          reject(
            new Error(
              `Command failed with exit code ${code}: ${errorMessage}`
            )
          );
        }
      }
    });
  });
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

export function validateModel(model: string): boolean {
  return (
    Object.values(MODELS).includes(model as (typeof MODELS)[keyof typeof MODELS]) ||
    model.startsWith("gemini-")
  );
}

export function validateApprovalMode(mode: string): boolean {
  return Object.values(APPROVAL_MODES).includes(
    mode as (typeof APPROVAL_MODES)[keyof typeof APPROVAL_MODES]
  );
}
