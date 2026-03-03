#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "./utils/logger.js";
import { PROTOCOL } from "./constants.js";
import {
  getToolDefinitions,
  getPromptDefinitions,
  executeTool,
  toolExists,
  getPromptMessage,
} from "./tools/index.js";

const server = new Server(
  {
    name: "gemini-cli-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      notifications: {},
      logging: {},
    },
  }
);

async function sendNotification(
  method: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    await server.notification({ method, params });
  } catch (error) {
    Logger.error("notification failed: ", error);
  }
}

/**
 * Send progress notification to keep MCP connection alive during long operations
 */
async function sendProgressNotification(
  progressToken: string | number | undefined,
  progress: number,
  total?: number,
  message?: string
): Promise<void> {
  if (!progressToken) return; // Only send if client requested progress
  try {
    const params: Record<string, unknown> = {
      progressToken,
      progress,
    };
    if (total !== undefined) params.total = total;
    if (message) params.message = message;

    await server.notification({
      method: PROTOCOL.NOTIFICATIONS.PROGRESS,
      params,
    });
  } catch (error) {
    Logger.error("Failed to send progress notification:", error);
  }
}

interface ProgressState {
  interval: NodeJS.Timeout;
  progressToken: string | number | undefined;
  operationName: string;
  isProcessing: boolean;
  latestOutput: string;
}

function startProgressUpdates(
  operationName: string,
  progressToken: string | number | undefined
): ProgressState {
  const state: ProgressState = {
    interval: undefined as unknown as NodeJS.Timeout,
    progressToken,
    operationName,
    isProcessing: true,
    latestOutput: "",
  };

  const progressMessages = [
    `${operationName} - Gemini is analyzing your request...`,
    `${operationName} - Processing and generating response...`,
    `${operationName} - Creating structured output for your review...`,
    `${operationName} - Complex analysis in progress (this is normal for large requests)...`,
    `${operationName} - Still working... Gemini takes time for quality results...`,
  ];

  let messageIndex = 0;
  let progress = 0;

  // Send immediate acknowledgment if progress requested
  if (progressToken) {
    sendProgressNotification(
      progressToken,
      0,
      undefined,
      `Starting ${operationName}`
    );
  }

  // Keep client alive with periodic updates
  state.interval = setInterval(async () => {
    if (state.isProcessing && state.progressToken) {
      progress += 1;
      const baseMessage = progressMessages[messageIndex % progressMessages.length];
      const outputPreview = state.latestOutput.slice(-150).trim(); // Last 150 chars
      const message = outputPreview
        ? `${baseMessage}\nOutput: ...${outputPreview}`
        : baseMessage;

      await sendProgressNotification(
        state.progressToken,
        progress,
        undefined,
        message
      );
      messageIndex++;
    } else if (!state.isProcessing) {
      clearInterval(state.interval);
    }
  }, PROTOCOL.KEEPALIVE_INTERVAL); // Every 25 seconds

  return state;
}

function stopProgressUpdates(
  state: ProgressState,
  success = true
): void {
  state.isProcessing = false;
  clearInterval(state.interval);

  // Send final progress notification if client requested progress
  if (state.progressToken) {
    sendProgressNotification(
      state.progressToken,
      100,
      100,
      success
        ? `${state.operationName} completed successfully`
        : `${state.operationName} failed`
    );
  }
}

// Handle tools/list requests
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
  Logger.mcpEvent("ListTools");
  return { tools: getToolDefinitions() };
});

// Handle tools/call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  Logger.mcpEvent("CallTool", { toolName });

  if (toolExists(toolName)) {
    // Check if client requested progress updates
    const progressToken = request.params._meta?.progressToken;

    // Start progress updates if client requested them
    const progressData = startProgressUpdates(toolName, progressToken);

    try {
      // Get arguments with proper typing
      const args = request.params.arguments || {};
      Logger.toolInvocation(toolName, request.params.arguments);

      // Execute the tool using the unified registry with progress callback
      const result = await executeTool(toolName, args, (newOutput: string) => {
        progressData.latestOutput = newOutput;
      });

      // Stop progress updates
      stopProgressUpdates(progressData, true);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
        isError: false,
      };
    } catch (error) {
      // Stop progress updates on error
      stopProgressUpdates(progressData, false);
      Logger.error(`Error in tool '${toolName}':`, error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolName}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  } else {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Handle prompts/list requests
server.setRequestHandler(ListPromptsRequestSchema, async (_request) => {
  Logger.mcpEvent("ListPrompts");
  return { prompts: getPromptDefinitions() };
});

// Handle prompts/get requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName = request.params.name;
  const args = request.params.arguments || {};
  Logger.mcpEvent("GetPrompt", { promptName });

  const promptMessage = getPromptMessage(promptName, args);
  if (!promptMessage) {
    throw new Error(`Unknown prompt: ${promptName}`);
  }

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptMessage,
        },
      },
    ],
  };
});

// Silence unused variable warning for sendNotification (kept for future use)
void sendNotification;

// Start the server
async function main(): Promise<void> {
  Logger.debug("init gemini-cli-mcp-tool");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  Logger.debug("gemini-cli-mcp-tool listening on stdio");
}

main().catch((error) => {
  Logger.error("Fatal error:", error);
  process.exit(1);
});
