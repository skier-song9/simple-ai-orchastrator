---
name: code
description: Generate or implement code by dispatching to the configured MCP agent (default: Codex).
---

When the user invokes `/code`, implement the requested functionality via the configured MCP agent.

## Steps

1. **Read the system prompt**: Read `prompts/code-system.md`. This will be prepended to the agent's prompt.

2. **Read agent config**: Read `config/agents.yaml` and find the `code` entry. Note the `mcp_tool` and `options` (model, sandbox).

3. **Gather context**: Identify files relevant to the request. Read key files to extract:
   - Existing interfaces, types, and data structures the new code must work with
   - Patterns already established in the project (naming conventions, error handling style, module structure)
   - Any entry points or callers the new code must integrate with

4. **Construct the prompt**: Combine:
   - Contents of `prompts/code-system.md`
   - A blank line separator
   - The user's request
   - Relevant context (file contents or excerpts) labeled clearly

5. **Call the MCP tool**: Invoke `mcp__codex-cli-mcp__ask-codex` (or the overridden tool) with:
   - `prompt`: the constructed prompt from step 4
   - `model`: from config options
   - `sandbox`: from config options

6. **Apply changes**: Review the agent's response. If it includes code, apply it to the appropriate files. Prefer editing existing files over creating new ones.

7. **Confirm**: Report to the user which files were created or modified.
