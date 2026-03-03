# Agent Orchestrator

Multi-agent orchestration plugin for Claude Code. Routes development tasks to Claude, Codex, or Gemini via MCP.

## Quick Start

```
/orchestrate code "implement user login"
/orchestrate review
/orchestrate test "write tests for auth module"
/orchestrate design "create a dashboard layout"
/orchestrate plan "design a REST API"
/orchestrate refactor "simplify the auth middleware"
```

Override the default agent for any capability:
```
/orchestrate code --agent=gemini "implement search"
```

## Skills

| Skill | Description | Default Agent |
|-------|-------------|---------------|
| `/orchestrate` | Main dispatcher - routes to the right agent | - |
| `/plan` | Planning & architecture | Claude |
| `/code` | Code generation & implementation | Codex |
| `/review` | Code review & quality analysis | Gemini |
| `/design` | UI/UX and icon design | Gemini |
| `/test` | Test writing & execution | Codex |
| `/refactor` | Code refactoring | Codex |

## Configuration

Agent assignments are in `config/agents.yaml`. Edit to change which agent handles each capability:

```yaml
agents:
  code:
    provider: codex          # claude | codex | gemini
    mcp_tool: mcp__codex-cli__ask-codex
    options:
      model: gpt-5
      sandbox: workspace-write
```

## Project Structure

```
config/agents.yaml          # Agent-to-capability mapping
skills/                     # Skill definitions (orchestrate, plan, code, review, design, test, refactor)
prompts/                    # System prompts passed to downstream agents
packages/gemini-cli-mcp-tool/  # MCP server wrapping gemini-cli
packages/codex-cli-mcp-tool/   # MCP server wrapping codex-cli
```

## Prerequisites

- **codex-cli**: `npm install -g @openai/codex`
- **gemini-cli**: `brew install gemini-cli`
- Register MCP servers:
  ```bash
  claude mcp add codex-cli-mcp node packages/codex-cli-mcp-tool/dist/index.js
  claude mcp add gemini-cli-mcp node packages/gemini-cli-mcp-tool/dist/index.js
  ```
