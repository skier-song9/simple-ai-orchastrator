import { spawn } from "child_process";
import { Logger } from "./logger.js";
export async function executeCommand(command, args, onProgress, timeout, cwd) {
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
        let timeoutHandle;
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
        childProcess.stdout.on("data", (data) => {
            stdout += data.toString();
            // Report new content if callback provided
            if (onProgress && stdout.length > lastReportedLength) {
                const newContent = stdout.substring(lastReportedLength);
                lastReportedLength = stdout.length;
                onProgress(newContent);
            }
        });
        childProcess.stderr.on("data", (data) => {
            stderr += data.toString();
            // Check for common Gemini/Google errors
            if (stderr.includes("UNAUTHENTICATED") ||
                stderr.includes("authentication failed") ||
                stderr.includes("credentials")) {
                Logger.authenticationStatus(false, "API key or Google credentials");
            }
            if (stderr.includes("RESOURCE_EXHAUSTED") ||
                stderr.includes("rate limit") ||
                stderr.includes("quota")) {
                Logger.error("Rate limit or quota exceeded");
            }
            if (stderr.includes("PERMISSION_DENIED") ||
                stderr.includes("sandbox")) {
                Logger.error("Sandbox permission denied");
            }
        });
        childProcess.on("error", (error) => {
            if (!isResolved) {
                isResolved = true;
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                process.removeListener("SIGINT", sigintHandler);
                process.removeListener("SIGTERM", sigtermHandler);
                Logger.error(`Process error:`, error);
                if (error.message.includes("ENOENT")) {
                    reject(new Error("Gemini CLI not found. Please install with: brew install gemini-cli or npm install -g @google/gemini-cli"));
                }
                else {
                    reject(new Error(`Failed to spawn command: ${error.message}`));
                }
            }
        });
        childProcess.on("close", (code) => {
            if (!isResolved) {
                isResolved = true;
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                process.removeListener("SIGINT", sigintHandler);
                process.removeListener("SIGTERM", sigtermHandler);
                if (code === 0) {
                    Logger.commandComplete(startTime, code, stdout.length);
                    resolve(stdout.trim());
                }
                else {
                    Logger.commandComplete(startTime, code ?? undefined);
                    Logger.error(`Failed with exit code ${code}`);
                    const errorMessage = stderr.trim() || "Unknown error";
                    reject(new Error(`Command failed with exit code ${code}: ${errorMessage}`));
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
