import { spawn } from "child_process";
import { Logger } from "./logger.js";

export async function executeCommand(
  command: string,
  args: string[],
  onProgress?: (output: string) => void,
  timeout?: number,
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    Logger.commandExecution(command, args, startTime);

    const childProcess = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      ...(cwd ? { cwd } : {}),
    });

    let stdout = "";
    let stderr = "";
    let isResolved = false;
    let lastReportedLength = 0;

    // Set up timeout if specified
    let timeoutHandle: NodeJS.Timeout | undefined;
    if (timeout) {
      timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          childProcess.kill("SIGTERM");
          Logger.error(`Command timed out after ${timeout}ms`);
          reject(new Error(`Command timed out after ${timeout}ms`));
        }
      }, timeout);
    }

    childProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      // Report new content if callback provided
      if (onProgress && stdout.length > lastReportedLength) {
        const newContent = stdout.substring(lastReportedLength);
        lastReportedLength = stdout.length;
        onProgress(newContent);
      }
    });

    childProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      // Check for common Codex/OpenAI errors
      if (
        stderr.includes("unauthorized") ||
        stderr.includes("authentication failed") ||
        stderr.includes("invalid api key")
      ) {
        Logger.authenticationStatus(false, "API key or OpenAI credentials");
      }
      if (
        stderr.includes("rate_limit") ||
        stderr.includes("rate limit") ||
        stderr.includes("quota")
      ) {
        Logger.error("Rate limit or quota exceeded");
      }
      if (
        stderr.includes("permission") ||
        stderr.includes("sandbox")
      ) {
        Logger.error("Sandbox permission denied");
      }
    });

    childProcess.on("error", (error: NodeJS.ErrnoException) => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        process.removeListener("SIGINT", sigintHandler);
        process.removeListener("SIGTERM", sigtermHandler);
        Logger.error(`Process error:`, error);
        if (error.message.includes("ENOENT")) {
          reject(
            new Error(
              "Codex CLI not found. Please install with: npm install -g @openai/codex"
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
        process.removeListener("SIGINT", sigintHandler);
        process.removeListener("SIGTERM", sigtermHandler);
        if (code === 0) {
          Logger.commandComplete(startTime, code, stdout.length);
          resolve(stdout.trim());
        } else {
          Logger.commandComplete(startTime, code ?? undefined);
          Logger.error(`Failed with exit code ${code}`);
          const errorMessage = stderr.trim() || "Unknown error";
          reject(
            new Error(`Command failed with exit code ${code}: ${errorMessage}`)
          );
        }
      }
    });

    // Handle process termination - use once() to avoid accumulation across calls,
    // and clean up via removeListener in the close/error handlers.
    const sigintHandler = () => {
      if (!isResolved) {
        childProcess.kill("SIGTERM");
      }
    };

    const sigtermHandler = () => {
      if (!isResolved) {
        childProcess.kill("SIGTERM");
      }
    };

    process.once("SIGINT", sigintHandler);
    process.once("SIGTERM", sigtermHandler);
  });
}
