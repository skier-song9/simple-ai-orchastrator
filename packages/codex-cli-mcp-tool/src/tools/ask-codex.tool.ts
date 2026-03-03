import { z } from "zod";
import {
  executeCodex,
  formatCodexResponseForMCP,
} from "../utils/codexExecutor.js";
import {
  ERROR_MESSAGES,
  MODELS,
  APPROVAL_POLICIES,
  SANDBOX_MODES,
} from "../constants.js";

/*
 * CRITICAL INSTRUCTIONS FOR CLAUDE:
 *
 * When using this tool, NEVER:
 * 1. Include your own answers or summaries in the prompt
 * 2. Pre-answer questions before sending to Codex
 * 3. Add interpretations that bias Codex's response
 *
 * CORRECT: "Implement user login with JWT" or "Fix the bug in auth.ts"
 * WRONG: "Implement login. I think you should use JWT: [code]"
 *
 * QUERY BEST PRACTICES:
 * - Be direct and specific in requests
 * - Let Codex find and read files independently
 * - Report progress to user during long operations
 *
 * OUTPUT HANDLING:
 * - Present Codex's raw response to user
 * - Don't summarize unless explicitly asked
 * - Don't add commentary before/after responses
 * - Trust Codex's technical analysis
 *
 * ERROR HANDLING:
 * - Report errors clearly with helpful context
 * - Don't fallback to your own answers
 * - Include troubleshooting hints
 */

const askCodexArgsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe(
      "User query or instruction for Codex. Can include file references and complex requests."
    ),
  model: z
    .string()
    .optional()
    .describe(
      `Optional model to use. Options: ${Object.values(MODELS).join(", ")}. Defaults to ${MODELS.GPT_5}.`
    ),
  approval: z
    .string()
    .optional()
    .describe(
      `Approval policy: ${Object.values(APPROVAL_POLICIES).join(", ")}. Defaults to untrusted for safety.`
    ),
  sandbox: z
    .string()
    .optional()
    .describe(
      `Sandbox mode: ${Object.values(SANDBOX_MODES).join(", ")}. Defaults to read-only for safety.`
    ),
  workingDir: z
    .string()
    .optional()
    .describe("Working directory for Codex execution"),
  timeout: z
    .number()
    .optional()
    .describe("Maximum execution time in milliseconds (optional)"),
  image: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Optional image file path(s) to include with the prompt"),
  config: z
    .union([z.string(), z.record(z.unknown())])
    .optional()
    .describe("Configuration overrides as 'key=value' string or object"),
  profile: z
    .string()
    .optional()
    .describe("Configuration profile to use from ~/.codex/config.toml"),
  includeMetadata: z
    .boolean()
    .default(true)
    .describe("Include configuration metadata in response"),
});

type AskCodexArgs = z.infer<typeof askCodexArgsSchema>;

export const askCodexTool = {
  name: "ask-codex",
  description:
    "Execute OpenAI Codex with comprehensive parameter support for code analysis, generation, and assistance",
  zodSchema: askCodexArgsSchema,
  prompt: {
    description:
      "Execute Codex AI agent for code analysis, generation, debugging, and assistance with full parameter control",
  },
  category: "codex",
  execute: async (
    args: AskCodexArgs,
    onProgress?: (output: string) => void
  ): Promise<string> => {
    const {
      prompt,
      model,
      approval,
      sandbox,
      workingDir,
      timeout,
      image,
      config,
      profile,
      includeMetadata,
    } = args;

    if (!prompt?.trim()) {
      throw new Error("You must provide a valid query or instruction for Codex analysis");
    }

    try {
      const modelName = model || MODELS.GPT_5;

      if (onProgress) {
        onProgress(
          `Executing Codex with ${modelName} in ${approval || "untrusted"} mode...`
        );
      }

      const result = await executeCodex(
        prompt.trim(),
        {
          model,
          approval,
          sandbox,
          workingDir,
          timeout,
          image,
          config,
          profile,
        },
        onProgress
      );

      // Format response for MCP
      const formattedResponse = formatCodexResponseForMCP(
        result,
        includeMetadata
      );
      return formattedResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Comprehensive error handling with helpful context
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("command not found") ||
        errorMessage.includes("ENOENT")
      ) {
        return `**Codex CLI Not Found**: ${ERROR_MESSAGES.CODEX_NOT_FOUND}

**Quick Fix:**
\`\`\`bash
npm install -g @openai/codex
\`\`\`

**Verification:** Run \`codex --version\` to confirm installation.`;
      }

      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid api key") ||
        errorMessage.includes("OPENAI_API_KEY")
      ) {
        return `**Authentication Failed**: ${ERROR_MESSAGES.AUTHENTICATION_FAILED}

**Setup Options:**
1. **API Key:** \`export OPENAI_API_KEY=your-key\`
2. **Login:** \`codex login\` (requires OpenAI account)
3. **Config:** Add key to Codex CLI configuration (~/.codex/config.toml)

**Troubleshooting:** Verify credentials are valid and have Codex API access.`;
      }

      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("rate_limit")
      ) {
        return `**Usage Limit Reached**: ${ERROR_MESSAGES.QUOTA_EXCEEDED}

**Immediate Solutions:**
1. **Wait and retry:** Rate limits reset periodically
2. **Check usage:** Visit platform.openai.com for usage details
3. **Try different model:** Consider o4-mini for higher limits

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

      if (
        errorMessage.includes("sandbox") ||
        errorMessage.includes("permission") ||
        errorMessage.includes("access denied")
      ) {
        return `**Permission Error**: ${ERROR_MESSAGES.SANDBOX_VIOLATION}

**Permission Solutions:**
1. **Workspace write:** Set \`sandbox: "${SANDBOX_MODES.WORKSPACE_WRITE}"\`
2. **Full access:** Set \`sandbox: "${SANDBOX_MODES.DANGER_FULL_ACCESS}"\` (use with caution)
3. **Approval policy:** Try \`approval: "${APPROVAL_POLICIES.ON_FAILURE}"\`
4. **Check file permissions:** Ensure Codex can access target files`;
      }

      if (
        errorMessage.includes("model") ||
        errorMessage.includes("unsupported")
      ) {
        return `**Model Error**: Requested model may not be available

**Model Alternatives:**
- **gpt-5:** \`model: "${MODELS.GPT_5}"\` (most capable)
- **o3:** \`model: "${MODELS.O3}"\` (reasoning)
- **o4-mini:** \`model: "${MODELS.O4_MINI}"\` (faster, cheaper)

**Check:** Verify model availability in your OpenAI account.`;
      }

      // Generic error with comprehensive context
      return `**Codex Execution Error**: ${errorMessage}

**Request Configuration:**
- **Model:** ${model || MODELS.GPT_5 + " (default)"}
- **Approval:** ${approval || "untrusted (default)"}
- **Sandbox:** ${sandbox || "read-only (default)"}
- **Working Directory:** ${workingDir || "current directory"}

**Debug Steps:**
1. Verify Codex CLI installation: \`codex --version\`
2. Check authentication: \`codex login\` or set OPENAI_API_KEY
3. Test with simpler query: \`codex exec "Hello world"\`
4. Try different model or approval mode`;
    }
  },
};
