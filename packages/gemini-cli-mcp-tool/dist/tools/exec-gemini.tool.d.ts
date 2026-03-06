import { z } from "zod";
declare const execGeminiArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    sandbox: z.ZodOptional<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodNumber>;
    workingDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: boolean | undefined;
    workingDir?: string | undefined;
}, {
    prompt: string;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: boolean | undefined;
    workingDir?: string | undefined;
}>;
type ExecGeminiArgs = z.infer<typeof execGeminiArgsSchema>;
export declare const execGeminiTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        prompt: z.ZodString;
        model: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodBoolean>;
        timeout: z.ZodOptional<z.ZodNumber>;
        workingDir: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: boolean | undefined;
        workingDir?: string | undefined;
    }, {
        prompt: string;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: boolean | undefined;
        workingDir?: string | undefined;
    }>;
    prompt: {
        description: string;
    };
    category: string;
    execute: (args: ExecGeminiArgs, onProgress?: (output: string) => void) => Promise<string>;
};
export {};
