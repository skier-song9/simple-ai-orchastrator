---
name: design
description: Produce UI/UX designs, component layouts, or icon designs. Dispatches to the configured MCP agent (default: Gemini).
---

When the user invokes `/design`, produce design output via the configured MCP agent.

## Steps

1. **Read the system prompt**: Read `prompts/design-system.md`. This will be prepended to the agent's prompt.

2. **Read agent config**: Read `config/agents.yaml` and find the `design` entry. Note the `mcp_tool`.

3. **Gather design context**:
   - Read existing component files to understand the component structure and conventions
   - Look for a design system, theme file, or CSS variables that define colors, spacing, and typography
   - Note any screenshots or mockups the user has provided
   - Identify the framework in use (React, Vue, etc.) and styling approach (CSS modules, Tailwind, styled-components)

4. **Construct the prompt**: Combine:
   - Contents of `prompts/design-system.md`
   - A blank line separator
   - The user's design request
   - Relevant context: existing component examples, style tokens, and any constraints the agent should respect

5. **Call the MCP tool**: Invoke `mcp__gemini-cli__ask-gemini` (or the overridden tool) with the constructed prompt.

6. **Present design output**: Share the agent's response with the user. If the response includes:
   - Code (HTML/CSS/JSX): apply it to the appropriate files or present it for the user to apply
   - Design rationale: present it clearly so the user can evaluate the choices
   - Alternatives: list them if provided

7. **Confirm**: Report any files created or modified.
