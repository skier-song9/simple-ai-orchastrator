// Tool Registry Index - Registers all tools
import { toolRegistry } from "./registry.js";
import { askCodexTool } from "./ask-codex.tool.js";
import { execCodexTool } from "./exec-codex.tool.js";
import { pingTool, helpTool, versionTool } from "./simple-tools.js";
// Register all tools
toolRegistry.push(askCodexTool, execCodexTool, pingTool, helpTool, versionTool);
// Export everything from registry
export * from "./registry.js";
