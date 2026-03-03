// Logging
export const LOG_PREFIX = "[CODEX-MCP]";

// Error messages
export const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: "Rate limit exceeded",
  AUTHENTICATION_FAILED:
    "Authentication failed - please check your OpenAI credentials or OPENAI_API_KEY",
  CODEX_NOT_FOUND:
    "Codex CLI not found - please install with 'npm install -g @openai/codex'",
  TOOL_NOT_FOUND: "not found in registry",
  NO_PROMPT_PROVIDED:
    "Please provide a prompt for Codex. Be specific and direct in your request.",
  SANDBOX_VIOLATION: "Operation blocked by sandbox policy",
  UNSAFE_COMMAND: "Command requires approval or elevated permissions",
};

// Status messages
export const STATUS_MESSAGES = {
  CODEX_RESPONSE: "Codex response:",
  AUTHENTICATION_SUCCESS: "Authentication successful",
  SANDBOX_EXECUTING: "Executing Codex command in sandbox mode...",
  PROCESSING_START: "Starting analysis (may take time for complex requests)",
  PROCESSING_CONTINUE: "Still processing... Codex is working on your request",
  PROCESSING_COMPLETE: "Analysis completed successfully",
};

// Models
export const MODELS = {
  GPT_5: "gpt-5",
  O3: "o3",
  O4_MINI: "o4-mini",
};

// Approval policies
export const APPROVAL_POLICIES = {
  UNTRUSTED: "untrusted",
  ON_FAILURE: "on-failure",
  ON_REQUEST: "on-request",
  NEVER: "never",
};

// Sandbox modes
export const SANDBOX_MODES = {
  READ_ONLY: "read-only",
  WORKSPACE_WRITE: "workspace-write",
  DANGER_FULL_ACCESS: "danger-full-access",
};

// MCP Protocol Constants
export const PROTOCOL = {
  // Message roles
  ROLES: {
    USER: "user",
    ASSISTANT: "assistant",
  },
  // Content types
  CONTENT_TYPES: {
    TEXT: "text",
  },
  // Status codes
  STATUS: {
    SUCCESS: "success",
    ERROR: "error",
    FAILED: "failed",
    REPORT: "report",
  },
  // Notification methods
  NOTIFICATIONS: {
    PROGRESS: "notifications/progress",
  },
  // Timeout prevention
  KEEPALIVE_INTERVAL: 25000, // 25 seconds
};

// CLI Constants
export const CLI = {
  // Command name
  COMMANDS: {
    CODEX: "codex",
  },
  // Subcommands
  SUBCOMMANDS: {
    EXEC: "exec",
  },
  // Command flags
  FLAGS: {
    MODEL: "-m",
    SANDBOX: "-s",
    APPROVAL: "-a",
    WORKING_DIR: "-C",
    IMAGE: "-i",
    CONFIG: "-c",
    PROFILE: "-p",
    JSON: "--json",
    FULL_AUTO: "--full-auto",
    OUTPUT_LAST_MESSAGE: "-o",
    HELP: "--help",
    VERSION: "--version",
  },
  // Default values
  DEFAULTS: {
    MODEL: "gpt-5",
    SANDBOX: "read-only",
    APPROVAL: "untrusted",
  },
};
