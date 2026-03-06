export declare const LOG_PREFIX = "[CODEX-MCP]";
export declare const ERROR_MESSAGES: {
    QUOTA_EXCEEDED: string;
    AUTHENTICATION_FAILED: string;
    CODEX_NOT_FOUND: string;
    TOOL_NOT_FOUND: string;
    NO_PROMPT_PROVIDED: string;
    SANDBOX_VIOLATION: string;
    UNSAFE_COMMAND: string;
};
export declare const STATUS_MESSAGES: {
    CODEX_RESPONSE: string;
    AUTHENTICATION_SUCCESS: string;
    SANDBOX_EXECUTING: string;
    PROCESSING_START: string;
    PROCESSING_CONTINUE: string;
    PROCESSING_COMPLETE: string;
};
export declare const MODELS: {
    GPT_5: string;
    O3: string;
    O4_MINI: string;
};
export declare const APPROVAL_MODES: {
    DEFAULT: string;
    FULL_AUTO: string;
    BYPASS: string;
};
export declare const SANDBOX_MODES: {
    READ_ONLY: string;
    WORKSPACE_WRITE: string;
    DANGER_FULL_ACCESS: string;
};
export declare const PROTOCOL: {
    ROLES: {
        USER: string;
        ASSISTANT: string;
    };
    CONTENT_TYPES: {
        TEXT: string;
    };
    STATUS: {
        SUCCESS: string;
        ERROR: string;
        FAILED: string;
        REPORT: string;
    };
    NOTIFICATIONS: {
        PROGRESS: string;
    };
    KEEPALIVE_INTERVAL: number;
};
export declare const CLI: {
    COMMANDS: {
        CODEX: string;
    };
    SUBCOMMANDS: {
        EXEC: string;
    };
    FLAGS: {
        MODEL: string;
        SANDBOX: string;
        DANGEROUSLY_BYPASS: string;
        WORKING_DIR: string;
        IMAGE: string;
        CONFIG: string;
        PROFILE: string;
        JSON: string;
        FULL_AUTO: string;
        OUTPUT_LAST_MESSAGE: string;
        HELP: string;
        VERSION: string;
    };
    DEFAULTS: {
        MODEL: string;
        SANDBOX: string;
        APPROVAL: string;
    };
};
