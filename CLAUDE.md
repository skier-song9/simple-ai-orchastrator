# Agent Orchestrator

A Claude Code plugin for multi-agent orchestration using MCP.

## Overview

This plugin coordinates multiple AI agents (Claude, Codex, Gemini) via MCP tools to handle specialized tasks such as planning, coding, review, design, testing, and refactoring.

## Agents

- **codex-cli** — Code generation, test writing, and refactoring via `mcp__codex-cli__ask-codex`
- **gemini-cli** — Code review, quality analysis, and UI/UX design via `mcp__gemini-cli__ask-gemini`
- **claude** — Planning, architecture, and orchestration (built-in)

## Available Skills

- `orchestrate` — Main entry point; routes tasks to the appropriate agent
- `plan` — Planning and architecture design (Claude)
- `code` — Code generation and implementation (Codex)
- `review` — Code review and quality analysis (Gemini)
- `design` — UI/UX and icon design (Gemini)
- `test` — Test writing and execution (Codex)
- `refactor` — Code refactoring and optimization (Codex)

## Configuration

Agent configuration is defined in `config/agents.yaml`. Each capability maps to a provider and MCP tool.

## Usage

Use `/orchestrate` as the main entry point skill. It will analyze the task and delegate to the appropriate agent.

Example: `/orchestrate implement a login form with validation`
