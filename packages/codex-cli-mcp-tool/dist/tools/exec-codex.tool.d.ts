import { z } from "zod";
declare const execCodexArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    sandbox: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    workingDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: string | undefined;
    workingDir?: string | undefined;
}, {
    prompt: string;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: string | undefined;
    workingDir?: string | undefined;
}>;
type ExecCodexArgs = z.infer<typeof execCodexArgsSchema>;
export declare const execCodexTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        prompt: z.ZodString;
        model: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        workingDir: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: string | undefined;
        workingDir?: string | undefined;
    }, {
        prompt: string;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: string | undefined;
        workingDir?: string | undefined;
    }>;
    prompt: {
        description: string;
    };
    category: string;
    execute: (args: ExecCodexArgs, onProgress?: (output: string) => void) => Promise<string>;
};
export {};
