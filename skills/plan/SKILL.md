---
name: plan
description: Analyze a request and produce a structured implementation plan with actionable tasks. Handled directly by Claude.
---

When the user invokes `/plan`, produce a structured implementation plan. Claude handles this directly — no MCP tool is needed.

## Steps

1. **Understand the request**: Read the user's goal carefully. Ask a clarifying question if the scope is ambiguous.

2. **Analyze the codebase**: Explore relevant parts of the project to understand the current structure, existing patterns, and constraints. Read files that will be affected.

3. **Produce a structured plan** with these sections:

   ### Goal
   One-sentence summary of what will be built or changed.

   ### Files to create
   List each new file with a one-line description of its purpose.

   ### Files to modify
   List each existing file and describe what changes are needed.

   ### Implementation steps
   Break the work into small, ordered, actionable tasks. Each step should be completable independently. Number them.

   ### Edge cases and error scenarios
   List the failure modes, edge cases, and validation concerns to address during implementation.

   ### Testing considerations
   Identify what should be tested: unit tests, integration tests, and any manual verification steps.

4. **Keep the plan concise**: Avoid prose padding. Use bullet points and short sentences. The plan is a working document, not an essay.
