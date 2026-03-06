export declare const LOG_PREFIX = "[GEMINI-MCP]";
export declare const ERROR_MESSAGES: {
    QUOTA_EXCEEDED: string;
    AUTHENTICATION_FAILED: string;
    GEMINI_NOT_FOUND: string;
    TOOL_NOT_FOUND: string;
    NO_PROMPT_PROVIDED: string;
    SANDBOX_VIOLATION: string;
    UNSAFE_COMMAND: string;
};
export declare const STATUS_MESSAGES: {
    GEMINI_RESPONSE: string;
    AUTHENTICATION_SUCCESS: string;
    SANDBOX_EXECUTING: string;
    PROCESSING_START: string;
    PROCESSING_CONTINUE: string;
    PROCESSING_COMPLETE: string;
};
export declare const MODELS: {
    GEMINI_2_5_PRO: string;
    GEMINI_2_5_FLASH: string;
    GEMINI_2_0_FLASH: string;
    GEMINI_1_5_PRO: string;
    GEMINI_1_5_FLASH: string;
};
export declare const APPROVAL_MODES: {
    DEFAULT: string;
    AUTO_EDIT: string;
    YOLO: string;
    PLAN: string;
};
export declare const OUTPUT_FORMATS: {
    TEXT: string;
    JSON: string;
    STREAM_JSON: string;
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
        GEMINI: string;
    };
    FLAGS: {
        PROMPT: string;
        MODEL: string;
        SANDBOX: string;
        YOLO: string;
        APPROVAL_MODE: string;
        OUTPUT_FORMAT: string;
        INCLUDE_DIRECTORIES: string;
        DEBUG: string;
        HELP: string;
        VERSION: string;
    };
    DEFAULTS: {
        MODEL: string;
        OUTPUT_FORMAT: string;
        APPROVAL_MODE: string;
    };
};
