---
name: review
description: Review code for bugs, security issues, and quality problems. Dispatches to the configured MCP agent (default: Gemini).
---

When the user invokes `/review`, perform a code review via the configured MCP agent.

## Steps

1. **Read the system prompt**: Read `prompts/review-system.md`. This will be prepended to the agent's prompt.

2. **Read agent config**: Read `config/agents.yaml` and find the `review` entry. Note the `mcp_tool`.

3. **Gather the code to review**:
   - If the user specified files, read those files
   - Otherwise, run `git diff HEAD` to get the current uncommitted changes
   - If reviewing a PR or branch, get the diff for that range
   - Include enough context (surrounding code) for meaningful review

4. **Construct the prompt**: Combine:
   - Contents of `prompts/review-system.md`
   - A blank line separator
   - The diff or file contents, clearly labeled
   - Any specific review focus the user requested (e.g., "focus on security")

5. **Call the MCP tool**: Invoke `mcp__gemini-cli__ask-gemini` (or the overridden tool) with the constructed prompt.

6. **Present findings**: Organize the agent's response by severity:
   - **Critical** findings first
   - **Important** findings second
   - **Minor** findings last
   - Include any positive observations at the end

7. **Suggest next steps**: After presenting the review, note which critical or important items should be addressed before the code is merged.
