// Tool Registry Index - Registers all tools
import { toolRegistry } from "./registry.js";
import { askGeminiTool } from "./ask-gemini.tool.js";
import { execGeminiTool } from "./exec-gemini.tool.js";
import { pingTool, helpTool, versionTool } from "./simple-tools.js";
// Register all tools
toolRegistry.push(askGeminiTool, execGeminiTool, pingTool, helpTool, versionTool);
// Export everything from registry
export * from "./registry.js";
