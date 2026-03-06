import { z } from "zod";
declare const askGeminiArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    approvalMode: z.ZodOptional<z.ZodString>;
    yolo: z.ZodOptional<z.ZodBoolean>;
    sandbox: z.ZodOptional<z.ZodBoolean>;
    outputFormat: z.ZodOptional<z.ZodString>;
    workingDir: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    includeDirectories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    includeMetadata: boolean;
    timeout?: number | undefined;
    yolo?: boolean | undefined;
    model?: string | undefined;
    sandbox?: boolean | undefined;
    outputFormat?: string | undefined;
    approvalMode?: string | undefined;
    workingDir?: string | undefined;
    includeDirectories?: string[] | undefined;
}, {
    prompt: string;
    timeout?: number | undefined;
    yolo?: boolean | undefined;
    model?: string | undefined;
    sandbox?: boolean | undefined;
    outputFormat?: string | undefined;
    approvalMode?: string | undefined;
    workingDir?: string | undefined;
    includeDirectories?: string[] | undefined;
    includeMetadata?: boolean | undefined;
}>;
type AskGeminiArgs = z.infer<typeof askGeminiArgsSchema>;
export declare const askGeminiTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        prompt: z.ZodString;
        model: z.ZodOptional<z.ZodString>;
        approvalMode: z.ZodOptional<z.ZodString>;
        yolo: z.ZodOptional<z.ZodBoolean>;
        sandbox: z.ZodOptional<z.ZodBoolean>;
        outputFormat: z.ZodOptional<z.ZodString>;
        workingDir: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        includeDirectories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        includeMetadata: boolean;
        timeout?: number | undefined;
        yolo?: boolean | undefined;
        model?: string | undefined;
        sandbox?: boolean | undefined;
        outputFormat?: string | undefined;
        approvalMode?: string | undefined;
        workingDir?: string | undefined;
        includeDirectories?: string[] | undefined;
    }, {
        prompt: string;
        timeout?: number | undefined;
        yolo?: boolean | undefined;
        model?: string | undefined;
        sandbox?: boolean | undefined;
        outputFormat?: string | undefined;
        approvalMode?: string | undefined;
        workingDir?: string | undefined;
        includeDirectories?: string[] | undefined;
        includeMetadata?: boolean | undefined;
    }>;
    prompt: {
        description: string;
    };
    category: string;
    execute: (args: AskGeminiArgs, onProgress?: (output: string) => void) => Promise<string>;
};
export {};
