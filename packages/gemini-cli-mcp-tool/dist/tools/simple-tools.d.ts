import { z } from "zod";
declare const pingArgsSchema: z.ZodObject<{
    message: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message?: string | undefined;
}>;
export declare const pingTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        message: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
    }, {
        message?: string | undefined;
    }>;
    prompt: {
        description: string;
    };
    category: string;
    execute: (args: z.infer<typeof pingArgsSchema>) => Promise<string>;
};
export declare const helpTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    prompt: {
        description: string;
    };
    category: string;
    execute: () => Promise<string>;
};
export declare const versionTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    category: string;
    execute: () => Promise<string>;
};
export {};
