import { z } from "zod";
import { executeCommand } from "../utils/commandExecutor.js";
import { CLI, MODELS, APPROVAL_MODES, SANDBOX_MODES } from "../constants.js";
// Ping tool for testing MCP connection
const pingArgsSchema = z.object({
    message: z.string().default("").describe("Optional message to echo back"),
});
export const pingTool = {
    name: "ping",
    description: "Test MCP connection and server responsiveness",
    zodSchema: pingArgsSchema,
    prompt: {
        description: "Test the MCP server connection",
    },
    category: "utility",
    execute: async (args) => {
        const { message } = args;
        const timestamp = new Date().toISOString();
        if (message) {
            return `Pong! "${message}" (${timestamp})`;
        }
        return `Pong! Codex MCP server is running (${timestamp})`;
    },
};
// Help tool
const helpArgsSchema = z.object({});
export const helpTool = {
    name: "help",
    description: "Get information about available Codex MCP tools and usage",
    zodSchema: helpArgsSchema,
    prompt: {
        description: "Show help information for Codex MCP tools",
    },
    category: "utility",
    execute: async () => {
        return `# Codex CLI MCP Server Help

## Available Tools

### ask-codex
Execute OpenAI Codex with comprehensive parameter support.
- **prompt** (required): Your query or instruction
- **model** (optional): ${Object.values(MODELS).join(", ")}
- **approval** (optional): ${Object.values(APPROVAL_MODES).join(", ")}
- **sandbox** (optional): ${Object.values(SANDBOX_MODES).join(", ")}
- **workingDir** (optional): Working directory for execution
- **timeout** (optional): Maximum execution time in ms
- **image** (optional): Image file path(s) to include
- **config** (optional): Configuration overrides (key=value)
- **profile** (optional): Configuration profile name
- **includeMetadata** (optional): Include config metadata in response (default: true)
- **includeThinking** (optional): Include reasoning section (default: true)

### exec-codex
Non-interactive Codex execution for automation.
- **prompt** (required): Command or instruction
- **model** (optional): Model to use
- **sandbox** (optional): Sandbox mode
- **timeout** (optional): Maximum execution time in ms
- **workingDir** (optional): Working directory

Always uses approval: "never" for non-interactive execution.

### ping
Test MCP server connection.
- **message** (optional): Message to echo

### version
Show Codex CLI and MCP server version information.

## Configuration

Set environment variables:
- \`OPENAI_API_KEY\`: Your OpenAI API key
- Or run \`codex login\` to authenticate

## Examples

\`\`\`
ask-codex "Review this code for security issues"
ask-codex "Implement user authentication" model="gpt-5" sandbox="workspace-write"
exec-codex "Generate unit tests for the auth module"
\`\`\`

## CLI Usage

The Codex CLI is invoked with:
\`\`\`bash
codex exec -m gpt-5 -s read-only -a untrusted "your prompt"
\`\`\`

For more information, visit: https://github.com/openai/codex`;
    },
};
// Version tool
const versionArgsSchema = z.object({});
export const versionTool = {
    name: "version",
    description: "Get version information for Codex CLI and MCP server",
    zodSchema: versionArgsSchema,
    category: "utility",
    execute: async () => {
        try {
            // Get Codex CLI version
            const codexVersion = await executeCommand(CLI.COMMANDS.CODEX, [
                CLI.FLAGS.VERSION,
            ]);
            return `# Version Information

## Codex CLI
\`\`\`
${codexVersion}
\`\`\`

## Codex MCP Server
- Version: 1.0.0
- MCP SDK: @modelcontextprotocol/sdk ^0.5.0
- Node.js: ${process.version}
- Platform: ${process.platform}`;
        }
        catch (error) {
            return `# Version Information

## Codex MCP Server
- Version: 1.0.0
- MCP SDK: @modelcontextprotocol/sdk ^0.5.0
- Node.js: ${process.version}
- Platform: ${process.platform}

## Codex CLI
Error getting Codex CLI version: ${error instanceof Error ? error.message : "Unknown error"}

Please ensure Codex CLI is installed:
\`\`\`bash
npm install -g @openai/codex
\`\`\``;
        }
    },
};
