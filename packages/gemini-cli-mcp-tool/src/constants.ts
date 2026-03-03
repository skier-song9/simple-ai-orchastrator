// Logging
export const LOG_PREFIX = "[GEMINI-MCP]";

// Error messages
export const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: "Rate limit exceeded",
  AUTHENTICATION_FAILED:
    "Authentication failed - please check your Google credentials or GEMINI_API_KEY",
  GEMINI_NOT_FOUND:
    "Gemini CLI not found - please install with 'brew install gemini-cli' or 'npm install -g @google/gemini-cli'",
  TOOL_NOT_FOUND: "not found in registry",
  NO_PROMPT_PROVIDED:
    "Please provide a prompt for Gemini. Be specific and direct in your request.",
  SANDBOX_VIOLATION: "Operation blocked by sandbox policy",
  UNSAFE_COMMAND: "Command requires approval or elevated permissions",
};

// Status messages
export const STATUS_MESSAGES = {
  GEMINI_RESPONSE: "Gemini response:",
  AUTHENTICATION_SUCCESS: "Authentication successful",
  SANDBOX_EXECUTING: "Executing Gemini command in sandbox mode...",
  PROCESSING_START: "Starting analysis (may take time for complex requests)",
  PROCESSING_CONTINUE: "Still processing... Gemini is working on your request",
  PROCESSING_COMPLETE: "Analysis completed successfully",
};

// Models
export const MODELS = {
  GEMINI_2_5_PRO: "gemini-2.5-pro",
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMINI_2_0_FLASH: "gemini-2.0-flash",
  GEMINI_1_5_PRO: "gemini-1.5-pro",
  GEMINI_1_5_FLASH: "gemini-1.5-flash",
};

// Approval modes
export const APPROVAL_MODES = {
  DEFAULT: "default",
  AUTO_EDIT: "auto_edit",
  YOLO: "yolo",
  PLAN: "plan",
};

// Output formats
export const OUTPUT_FORMATS = {
  TEXT: "text",
  JSON: "json",
  STREAM_JSON: "stream-json",
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
    GEMINI: "gemini",
  },
  // Command flags
  FLAGS: {
    PROMPT: "-p",
    MODEL: "-m",
    SANDBOX: "-s",
    YOLO: "-y",
    APPROVAL_MODE: "--approval-mode",
    OUTPUT_FORMAT: "-o",
    INCLUDE_DIRECTORIES: "--include-directories",
    DEBUG: "-d",
    HELP: "--help",
    VERSION: "--version",
  },
  // Default values
  DEFAULTS: {
    MODEL: "gemini-2.5-pro",
    OUTPUT_FORMAT: "text",
    APPROVAL_MODE: "default",
  },
};
