---
name: refactor
description: Refactor code to improve quality without changing behavior. Dispatches to the configured MCP agent (default: Codex).
---

When the user invokes `/refactor`, improve code quality via the configured MCP agent without altering behavior.

## Steps

1. **Read the system prompt**: Read `prompts/refactor-system.md`. This will be prepended to the agent's prompt.

2. **Read agent config**: Read `config/agents.yaml` and find the `refactor` entry. Note the `mcp_tool` and `options`.

3. **Identify target code**:
   - Read the file(s) the user wants refactored
   - Note existing tests that cover the code — these are the safety net for verifying no regression
   - Run the existing tests before making changes to confirm they pass

4. **Construct the prompt**: Combine:
   - Contents of `prompts/refactor-system.md`
   - A blank line separator
   - The user's refactoring goal (e.g., "reduce duplication", "simplify the validation logic")
   - The full source code of the target file(s), clearly labeled
   - Any constraints (e.g., "do not change the public API")

5. **Call the MCP tool**: Invoke `mcp__codex-cli__ask-codex` (or the overridden tool) with:
   - `prompt`: the constructed prompt from step 4
   - `model`: from config options
   - `sandbox`: from config options

6. **Apply changes**: Review the agent's refactored output. Apply changes to the target file(s). Do not apply any behavioral changes or new features — flag them instead.

7. **Run existing tests**: Execute the test suite to verify no regression was introduced. If any tests fail, investigate and revert or fix the change.

8. **Report**: Tell the user:
   - Which files were modified
   - A summary of what was improved
   - Any issues discovered but intentionally left out of scope
   - Test results (pass count before and after)
