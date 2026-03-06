export declare class Logger {
    static isDebugMode: boolean;
    static debug(message: string, ...args: unknown[]): void;
    static info(message: string, ...args: unknown[]): void;
    static warn(message: string, ...args: unknown[]): void;
    static error(message: string, ...args: unknown[]): void;
    static success(message: string, ...args: unknown[]): void;
    static toolInvocation(toolName: string, args: unknown): void;
    static commandExecution(command: string, args: string[], startTime: number): void;
    static commandComplete(startTime: number, exitCode?: number, outputLength?: number): void;
    static geminiResponse(response: string, tokensUsed?: number): void;
    static sandboxMode(mode: string, command: string): void;
    static authenticationStatus(success: boolean, method?: string): void;
    static configLoad(source: string, success: boolean): void;
    static mcpEvent(event: string, details?: unknown): void;
}
