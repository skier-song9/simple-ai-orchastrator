# Agent Orchestrator

A multi-agent orchestration plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Routes development tasks to **Claude**, **Codex**, or **Gemini** through a unified skill-based interface, leveraging each agent's strengths via MCP (Model Context Protocol).

## Introduction

Agent Orchestrator lets you dispatch work to the right AI agent without leaving Claude Code. Each development task type — coding, reviewing, testing, designing, planning, refactoring — is mapped to a default agent, and every mapping is configurable.

| Capability | Default Agent | Why |
|------------|---------------|-----|
| **Plan** | Claude | Deep reasoning and architecture design |
| **Code** | Codex | Code generation with sandbox execution |
| **Review** | Gemini | Broad code analysis and quality checks |
| **Design** | Gemini | UI/UX and visual component design |
| **Test** | Codex | Test generation with sandbox execution |
| **Refactor** | Codex | Safe code transformations in sandbox |

The plugin ships with two in-repo MCP servers (`codex-cli-mcp-tool` and `gemini-cli-mcp-tool`) so you don't need to install external MCP tools separately.

### Project Structure

```
config/agents.yaml              # Agent-to-capability mapping
skills/                         # Skill definitions
prompts/                        # System prompts for downstream agents
packages/codex-cli-mcp-tool/    # MCP server wrapping Codex CLI
packages/gemini-cli-mcp-tool/   # MCP server wrapping Gemini CLI
```

## Installation

### Prerequisites

Install both CLI tools:

```bash
# Codex CLI
npm install -g @openai/codex

# Gemini CLI
brew install gemini-cli
```

Make sure each CLI is authenticated:

```bash
codex login            # or export OPENAI_API_KEY=...
gemini auth            # or export GEMINI_API_KEY=...
```

### Setup

1. **Clone the repository** into your project (or add as a submodule):

```bash
git clone https://github.com/skier-song9/simple-ai-orchastrator.git .claude/plugins/agent-orchestrator
```

2. **Build the MCP server packages:**

```bash
cd packages/codex-cli-mcp-tool && npm install && npm run build && cd -
cd packages/gemini-cli-mcp-tool && npm install && npm run build && cd -
```

3. **Register the MCP servers with Claude Code:**

```bash
claude mcp add codex-cli-mcp node packages/codex-cli-mcp-tool/dist/index.js
claude mcp add gemini-cli-mcp node packages/gemini-cli-mcp-tool/dist/index.js
```

4. **Restart Claude Code** to pick up the new MCP servers.

## How to Use

### Basic Commands

```bash
/orchestrate code "implement user login with JWT"
/orchestrate review
/orchestrate test "write tests for the auth module"
/orchestrate design "create a dashboard layout"
/orchestrate plan "design a REST API for task management"
/orchestrate refactor "simplify the auth middleware"
```

### Override the Default Agent

Any capability can be routed to a different agent with `--agent`:

```bash
/orchestrate code --agent=gemini "implement search"
/orchestrate review --agent=codex
```

Valid agents: `claude`, `codex`, `gemini`

### Direct Skill Invocation

Each capability also has its own shorthand skill:

```bash
/code "implement user login"
/review
/test "write tests for auth module"
/design "create a dashboard layout"
/plan "design a REST API"
/refactor "simplify the auth middleware"
```

### Configuration

Agent assignments live in `config/agents.yaml`. Edit to change which agent handles each capability:

```yaml
agents:
  code:
    provider: codex          # claude | codex | gemini
    mcp_tool: mcp__codex-cli-mcp__ask-codex
    options:
      model: gpt-5
      sandbox: workspace-write
  review:
    provider: gemini
    mcp_tool: mcp__gemini-cli-mcp__ask-gemini
```

### How It Works

1. You invoke a skill (e.g., `/orchestrate code "implement search"`)
2. The orchestrator reads `config/agents.yaml` to find the assigned agent
3. It loads the system prompt from `prompts/<capability>-system.md`
4. It dispatches the task to the agent via MCP (or handles it directly for Claude)
5. The agent's response is presented back to you
