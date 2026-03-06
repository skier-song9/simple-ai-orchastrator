type AnyZodSchema = any;
export interface ToolDefinition {
    name: string;
    description: string;
    zodSchema: AnyZodSchema;
    prompt?: {
        description: string;
        arguments?: Array<{
            name: string;
            description: string;
            required: boolean;
        }>;
    };
    category?: string;
    execute: (args: any, onProgress?: (output: string) => void) => Promise<string>;
}
export declare const toolRegistry: ToolDefinition[];
export declare function toolExists(toolName: string): boolean;
export declare function getToolDefinitions(): {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: any;
        required: any;
    };
}[];
export declare function getPromptDefinitions(): {
    name: string;
    description: string;
    arguments: {
        name: string;
        description: any;
        required: boolean;
    }[];
}[];
export declare function executeTool(toolName: string, args: Record<string, any>, onProgress?: (output: string) => void): Promise<string>;
export declare function getPromptMessage(toolName: string, args: Record<string, any>): string | null;
export {};
