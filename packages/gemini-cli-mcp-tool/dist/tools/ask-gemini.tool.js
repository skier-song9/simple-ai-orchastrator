import { z } from "zod";
import { executeGemini, formatGeminiResponseForMCP, } from "../utils/geminiExecutor.js";
import { ERROR_MESSAGES, MODELS, APPROVAL_MODES, OUTPUT_FORMATS, } from "../constants.js";
/*
 * CRITICAL INSTRUCTIONS FOR CLAUDE:
 *
 * When using this tool, NEVER:
 * 1. Include your own answers or summaries in the prompt
 * 2. Pre-answer questions before sending to Gemini
 * 3. Add interpretations that bias Gemini's response
 *
 * CORRECT: "Review this code for security issues" or "Analyze @file.py"
 * WRONG: "Review this code. I think it has a bug: [content]"
 *
 * QUERY BEST PRACTICES:
 * - Be direct and specific in requests
 * - Let Gemini find and read files independently
 * - Report progress to user during long operations
 *
 * OUTPUT HANDLING:
 * - Present Gemini's raw response to user
 * - Don't summarize unless explicitly asked
 * - Don't add commentary before/after responses
 * - Trust Gemini's technical analysis
 *
 * ERROR HANDLING:
 * - Report errors clearly with helpful context
 * - Don't fallback to your own answers
 * - Include troubleshooting hints
 */
const askGeminiArgsSchema = z.object({
    prompt: z
        .string()
        .min(1)
        .describe("User query or instruction for Gemini. Can include file references and complex requests."),
    model: z
        .string()
        .optional()
        .describe(`Optional model to use. Options: ${Object.values(MODELS).join(", ")}. Defaults to ${MODELS.GEMINI_2_5_PRO}.`),
    approvalMode: z
        .string()
        .optional()
        .describe(`Approval mode: ${Object.values(APPROVAL_MODES).join(", ")}. Defaults to default.`),
    yolo: z
        .boolean()
        .optional()
        .describe("Auto-approve all actions (equivalent to --yolo flag)"),
    sandbox: z
        .boolean()
        .optional()
        .describe("Run in sandbox mode for additional safety"),
    outputFormat: z
        .string()
        .optional()
        .describe(`Output format: ${Object.values(OUTPUT_FORMATS).join(", ")}. Defaults to text.`),
    workingDir: z
        .string()
        .optional()
        .describe("Working directory for Gemini execution"),
    timeout: z
        .number()
        .optional()
        .describe("Maximum execution time in milliseconds (optional)"),
    includeDirectories: z
        .array(z.string())
        .optional()
        .describe("Additional workspace directories to include"),
    includeMetadata: z
        .boolean()
        .default(true)
        .describe("Include configuration metadata in response"),
});
export const askGeminiTool = {
    name: "ask-gemini",
    description: "Execute Google Gemini with comprehensive parameter support for code analysis, generation, and assistance",
    zodSchema: askGeminiArgsSchema,
    prompt: {
        description: "Execute Gemini AI agent for code analysis, generation, debugging, and assistance with full parameter control",
    },
    category: "gemini",
    execute: async (args, onProgress) => {
        const { prompt, model, approvalMode, yolo, sandbox, outputFormat = OUTPUT_FORMATS.TEXT, workingDir, timeout, includeDirectories, includeMetadata, } = args;
        if (!prompt?.trim()) {
            throw new Error("You must provide a valid query or instruction for Gemini analysis");
        }
        try {
            const modelName = model || MODELS.GEMINI_2_5_PRO;
            if (onProgress) {
                onProgress(`Executing Gemini with ${modelName} in ${approvalMode || "default"} mode...`);
            }
            const result = await executeGemini(prompt.trim(), {
                model,
                approvalMode,
                yolo,
                sandbox,
                outputFormat,
                workingDir,
                timeout,
                includeDirectories,
            }, onProgress);
            // Format response for MCP
            const formattedResponse = formatGeminiResponseForMCP(result, includeMetadata);
            return formattedResponse;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Comprehensive error handling with helpful context
            if (errorMessage.includes("not found") ||
                errorMessage.includes("command not found") ||
                errorMessage.includes("ENOENT")) {
                return `**Gemini CLI Not Found**: ${ERROR_MESSAGES.GEMINI_NOT_FOUND}

**Quick Fix:**
\`\`\`bash
brew install gemini-cli
# or
npm install -g @google/gemini-cli
\`\`\`

**Verification:** Run \`gemini --version\` to confirm installation.`;
            }
            if (errorMessage.includes("authentication") ||
                errorMessage.includes("unauthorized") ||
                errorMessage.includes("credentials") ||
                errorMessage.includes("UNAUTHENTICATED")) {
                return `**Authentication Failed**: ${ERROR_MESSAGES.AUTHENTICATION_FAILED}

**Setup Options:**
1. **API Key:** \`export GEMINI_API_KEY=your-key\`
2. **Login:** \`gemini auth\` (requires Google account)
3. **Config:** Add key to Gemini CLI configuration

**Troubleshooting:** Verify credentials are valid and have Gemini API access.`;
            }
            if (errorMessage.includes("quota") ||
                errorMessage.includes("rate limit") ||
                errorMessage.includes("RESOURCE_EXHAUSTED")) {
                return `**Usage Limit Reached**: ${ERROR_MESSAGES.QUOTA_EXCEEDED}

**Immediate Solutions:**
1. **Wait and retry:** Rate limits reset periodically
2. **Check quota:** Visit Google AI Studio for usage details
3. **Try different model:** Consider gemini-2.5-flash for higher limits

**Note:** Different models have different rate limits`;
            }
            if (errorMessage.includes("timeout")) {
                return `**Request Timeout**: Operation took longer than expected

**Solutions:**
1. **Increase timeout:** Add \`timeout: 300000\` (5 minutes)
2. **Simplify request:** Break complex queries into smaller parts
3. **Retry request:** Network issues may be transient
4. **Check connectivity:** Ensure stable internet connection`;
            }
            if (errorMessage.includes("sandbox") ||
                errorMessage.includes("permission") ||
                errorMessage.includes("access denied") ||
                errorMessage.includes("PERMISSION_DENIED")) {
                return `**Permission Error**: ${ERROR_MESSAGES.SANDBOX_VIOLATION}

**Permission Solutions:**
1. **Use yolo mode:** Set \`yolo: true\` for auto-approval
2. **Approval mode:** Try \`approvalMode: "${APPROVAL_MODES.AUTO_EDIT}"\`
3. **Check file permissions:** Ensure Gemini can access target files`;
            }
            if (errorMessage.includes("model") ||
                errorMessage.includes("unsupported")) {
                return `**Model Error**: Requested model may not be available

**Model Alternatives:**
- **gemini-2.5-pro:** \`model: "${MODELS.GEMINI_2_5_PRO}"\` (most capable)
- **gemini-2.5-flash:** \`model: "${MODELS.GEMINI_2_5_FLASH}"\` (faster)
- **gemini-2.0-flash:** \`model: "${MODELS.GEMINI_2_0_FLASH}"\` (stable)

**Check:** Verify model availability in your Google AI account.`;
            }
            // Generic error with comprehensive context
            return `**Gemini Execution Error**: ${errorMessage}

**Request Configuration:**
- **Model:** ${model || MODELS.GEMINI_2_5_PRO + " (default)"}
- **Approval Mode:** ${approvalMode || "default"}
- **Output Format:** ${outputFormat || "text"}
- **Working Directory:** ${workingDir || "current directory"}

**Debug Steps:**
1. Verify Gemini CLI installation: \`gemini --version\`
2. Check authentication: \`gemini auth\` or set GEMINI_API_KEY
3. Test with simpler query: \`gemini -p "Hello world"\`
4. Try different model or approval mode`;
        }
    },
};
