---
name: test
description: Write tests for a module or function by dispatching to the configured MCP agent (default: Codex).
---

When the user invokes `/test`, write tests via the configured MCP agent and then run them.

## Steps

1. **Read the system prompt**: Read `prompts/test-system.md`. This will be prepended to the agent's prompt.

2. **Read agent config**: Read `config/agents.yaml` and find the `test` entry. Note the `mcp_tool` and `options`.

3. **Identify target code**:
   - Read the source file(s) the user wants tested
   - Check for any existing test files for those modules to understand the testing style and framework in use
   - Note the test runner (Jest, Vitest, pytest, etc.) and any test utilities (factories, fixtures, mocks) already available

4. **Construct the prompt**: Combine:
   - Contents of `prompts/test-system.md`
   - A blank line separator
   - The user's request (what to test and any specific scenarios to cover)
   - The full source code of the target file(s), clearly labeled
   - Examples from existing test files showing the project's test conventions

5. **Call the MCP tool**: Invoke `mcp__codex-cli-mcp__ask-codex` (or the overridden tool) with:
   - `prompt`: the constructed prompt from step 4
   - `model`: from config options
   - `sandbox`: from config options

6. **Write test files**: Apply the generated tests to the appropriate test file. If the file exists, merge the new tests; if not, create it following the project's test file naming convention.

7. **Run the tests**: Execute the test suite for the new tests. Report the results (pass/fail/skipped). If tests fail, investigate and fix before reporting success.

8. **Confirm**: Report which test file was created or modified and how many tests were added.
