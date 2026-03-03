import { z } from "zod";
import { executeCommand } from "../utils/commandExecutor.js";
import { CLI, MODELS, APPROVAL_MODES, OUTPUT_FORMATS } from "../constants.js";

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
  execute: async (args: z.infer<typeof pingArgsSchema>): Promise<string> => {
    const { message } = args;
    const timestamp = new Date().toISOString();
    if (message) {
      return `Pong! "${message}" (${timestamp})`;
    }
    return `Pong! Gemini MCP server is running (${timestamp})`;
  },
};

// Help tool
const helpArgsSchema = z.object({});

export const helpTool = {
  name: "help",
  description: "Get information about available Gemini MCP tools and usage",
  zodSchema: helpArgsSchema,
  prompt: {
    description: "Show help information for Gemini MCP tools",
  },
  category: "utility",
  execute: async (): Promise<string> => {
    return `# Gemini CLI MCP Server Help

## Available Tools

### ask-gemini
Execute Google Gemini with comprehensive parameter support.
- **prompt** (required): Your query or instruction
- **model** (optional): ${Object.values(MODELS).join(", ")}
- **approvalMode** (optional): ${Object.values(APPROVAL_MODES).join(", ")}
- **yolo** (optional): Auto-approve all actions (boolean)
- **sandbox** (optional): Run in sandbox mode (boolean)
- **outputFormat** (optional): ${Object.values(OUTPUT_FORMATS).join(", ")}
- **workingDir** (optional): Working directory for execution
- **timeout** (optional): Maximum execution time in ms
- **includeDirectories** (optional): Additional workspace directories

### exec-gemini
Non-interactive Gemini execution for automation.
- **prompt** (required): Command or instruction
- **model** (optional): Model to use
- **sandbox** (optional): Sandbox mode (boolean)
- **timeout** (optional): Maximum execution time in ms
- **workingDir** (optional): Working directory

Always uses yolo mode and text output format.

### ping
Test MCP server connection.
- **message** (optional): Message to echo

### version
Show Gemini CLI and MCP server version information.

## Configuration

Set environment variables:
- \`GEMINI_API_KEY\`: Your Google Gemini API key
- \`GEMINI_MODEL\`: Default model override

## Examples

\`\`\`
ask-gemini "Review this code for security issues"
ask-gemini "Analyze and refactor this component" model="gemini-2.5-pro" yolo=true
exec-gemini "Generate unit tests for the auth module"
\`\`\`

## CLI Usage

The Gemini CLI is invoked with:
\`\`\`bash
gemini -p "your prompt" -m gemini-2.5-pro -o text
\`\`\`

For more information, visit: https://github.com/google-gemini/gemini-cli`;
  },
};

// Version tool
const versionArgsSchema = z.object({});

export const versionTool = {
  name: "version",
  description: "Get version information for Gemini CLI and MCP server",
  zodSchema: versionArgsSchema,
  category: "utility",
  execute: async (): Promise<string> => {
    try {
      // Get Gemini CLI version
      const geminiVersion = await executeCommand(CLI.COMMANDS.GEMINI, [
        CLI.FLAGS.VERSION,
      ]);
      return `# Version Information

## Gemini CLI
\`\`\`
${geminiVersion}
\`\`\`

## Gemini MCP Server
- Version: 1.0.0
- MCP SDK: @modelcontextprotocol/sdk ^0.5.0
- Node.js: ${process.version}
- Platform: ${process.platform}`;
    } catch (error) {
      return `# Version Information

## Gemini MCP Server
- Version: 1.0.0
- MCP SDK: @modelcontextprotocol/sdk ^0.5.0
- Node.js: ${process.version}
- Platform: ${process.platform}

## Gemini CLI
Error getting Gemini CLI version: ${error instanceof Error ? error.message : "Unknown error"}

Please ensure Gemini CLI is installed:
\`\`\`bash
brew install gemini-cli
# or
npm install -g @google/gemini-cli
\`\`\``;
    }
  },
};
