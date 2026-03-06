import { z } from "zod";
declare const askCodexArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    sandbox: z.ZodOptional<z.ZodString>;
    fullAuto: z.ZodOptional<z.ZodBoolean>;
    workingDir: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    config: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    profile: z.ZodOptional<z.ZodString>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    includeMetadata: boolean;
    image?: string | string[] | undefined;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: string | undefined;
    workingDir?: string | undefined;
    config?: string | Record<string, unknown> | undefined;
    profile?: string | undefined;
    fullAuto?: boolean | undefined;
}, {
    prompt: string;
    image?: string | string[] | undefined;
    timeout?: number | undefined;
    model?: string | undefined;
    sandbox?: string | undefined;
    workingDir?: string | undefined;
    config?: string | Record<string, unknown> | undefined;
    profile?: string | undefined;
    fullAuto?: boolean | undefined;
    includeMetadata?: boolean | undefined;
}>;
type AskCodexArgs = z.infer<typeof askCodexArgsSchema>;
export declare const askCodexTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        prompt: z.ZodString;
        model: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodString>;
        fullAuto: z.ZodOptional<z.ZodBoolean>;
        workingDir: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        config: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        profile: z.ZodOptional<z.ZodString>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        includeMetadata: boolean;
        image?: string | string[] | undefined;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: string | undefined;
        workingDir?: string | undefined;
        config?: string | Record<string, unknown> | undefined;
        profile?: string | undefined;
        fullAuto?: boolean | undefined;
    }, {
        prompt: string;
        image?: string | string[] | undefined;
        timeout?: number | undefined;
        model?: string | undefined;
        sandbox?: string | undefined;
        workingDir?: string | undefined;
        config?: string | Record<string, unknown> | undefined;
        profile?: string | undefined;
        fullAuto?: boolean | undefined;
        includeMetadata?: boolean | undefined;
    }>;
    prompt: {
        description: string;
    };
    category: string;
    execute: (args: AskCodexArgs, onProgress?: (output: string) => void) => Promise<string>;
};
export {};
