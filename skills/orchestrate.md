---
name: orchestrate
description: Main entry point for multi-agent orchestration. Routes tasks to the appropriate agent (Claude, Codex, or Gemini) based on capability configuration.
---

You are the orchestrator. When the user invokes `/orchestrate`, follow these steps precisely.

## Step 1: Parse the request

Extract from the user's command:
- **capability**: the first word after `/orchestrate` (one of: `plan`, `code`, `review`, `design`, `test`, `refactor`)
- **agent override**: the value of `--agent=<agent>` if present in the command (e.g., `--agent=gemini`)
- **task description**: the remaining text (the user's actual request)

If no capability is specified, ask the user which type of task they want to perform.

Examples of valid invocations:
- `/orchestrate code "implement user login"` — capability: code, task: implement user login
- `/orchestrate review` — capability: review, task: review current git changes
- `/orchestrate test "write tests for auth module"` — capability: test, task: write tests for auth module
- `/orchestrate design "create a dashboard layout"` — capability: design, task: create a dashboard layout
- `/orchestrate code --agent=gemini "implement search"` — capability: code, agent override: gemini, task: implement search

## Step 2: Read agent configuration

Read `config/agents.yaml` to determine which agent handles the capability.

```yaml
# Example structure:
agents:
  code:
    provider: codex
    mcp_tool: mcp__codex-cli__ask-codex
    options:
      model: gpt-5
      sandbox: workspace-write
  review:
    provider: gemini
    mcp_tool: mcp__gemini-cli__ask-gemini
```

If the user passed `--agent=<agent>`, use that provider instead of the configured one. Map the override to the correct MCP tool:
- `claude` → handle directly (no MCP call)
- `codex` → `mcp__codex-cli__ask-codex`
- `gemini` → `mcp__gemini-cli__ask-gemini`

## Step 3: Read the system prompt

Read `prompts/<capability>-system.md`. This is the instruction set for the downstream agent.

## Step 4: Dispatch to the agent

### If provider is `claude`:
Handle the task directly without calling an MCP tool. Use the system prompt from Step 3 to guide your own response. Apply the instructions as your working guidelines.

### If provider is `codex`:
Call `mcp__codex-cli__ask-codex` with:
- `prompt`: the content of `prompts/<capability>-system.md`, followed by a blank line, followed by the user's task description and any relevant context you gathered
- `model`: the model value from the config options (e.g., `gpt-5`)
- `sandbox`: the sandbox value from the config options (e.g., `workspace-write`)

### If provider is `gemini`:
Call `mcp__gemini-cli__ask-gemini` with:
- `prompt`: the content of `prompts/<capability>-system.md`, followed by a blank line, followed by the user's task description and any relevant context you gathered

## Step 5: Present results

- Show the agent's response to the user clearly
- If the agent produced code changes, confirm which files were modified
- If the agent produced a review, present findings organized by severity (Critical, Important, Minor)
- If there were errors, report them and suggest next steps

## Context gathering tips

Before dispatching, gather relevant context to include in the prompt:
- For `code`: identify the files most relevant to the request; include key interfaces, types, or existing patterns
- For `review`: run `git diff` or read specified files; include the full diff in the prompt
- For `test`: read the source file(s) to be tested; include the code in the prompt
- For `refactor`: read the target file(s); include the code in the prompt
- For `design`: note existing component patterns, style conventions, or screenshots if available
- For `plan`: analyze the codebase structure and current state
