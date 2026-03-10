# Implement Stage (Prompt 05)

Use this prompt at the start of each implementation session. It advances the system one stage (or one work item within a stage) at a time. This is **Phase 6** of the Vision-to-System Framework.

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Based on the Implementation Plan, implement the next stage (or continue the current stage) following all architecture and implementation rules.**

> This prompt requires no additional user input. It reads `docs/implementation/IMPLEMENTATION-PLAN.md` to determine what to implement next. Just paste this prompt into a new Cursor conversation and send.

### Context inputs

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify that Phase 5 (implementation planning) is complete and check the current progress note. If the file does not exist, proceed — the IMPLEMENTATION-PLAN.md is the authoritative source.

### Context and authority

- **Architecture is the system guide**: `docs/architecture/` describes how the system works. Implementation is a consequence of architecture. Do not deviate from architecture unless you document and justify.
- **Implementation Plan is the implementation authority**: `docs/implementation/IMPLEMENTATION-PLAN.md` is the single source of truth for what to build and in what order.
- **Stages define session scope**: Section 5 defines pre-grouped stages. Each stage should complete in 1–3 sessions.
- **Execution order**: Section 0 gives the current focus. Section 6 is the full ordered list. The next item is the first not-done in that list.
- **Work item details**: Section 7 contains acceptance criteria, suggested steps, and architecture refs for each COMP-X.Y.

### Rules you must follow

**Context management rules**:
- `.cursor/rules/framework/context-management.mdc` (CTX-001, CTX-002, CTX-007, CTX-008, CTX-009)

**Implementation rules**:
- `.cursor/rules/implementation/implementation-workflow.mdc` (IMPL-001 through IMPL-014)
- `.cursor/rules/implementation/coding-standards.mdc` (CODE-001 through CODE-021)
- `.cursor/rules/implementation/progress-tracking.mdc` (TRACK-001 through TRACK-016)

**Architecture rules** (respect during implementation):
- `.cursor/rules/architecture/architecture.mdc` (layer boundaries, dependency inversion, error handling)
- `.cursor/rules/architecture/conventions.mdc` (naming, file organization, API conventions)
- `.cursor/rules/architecture/patterns.mdc` (approved patterns, anti-patterns to avoid)

**Testing rules**:
- `.cursor/rules/tests/testing-strategy.mdc` (test pyramid, test naming, AAA pattern)
- `.cursor/rules/tests/unit-testing.mdc` (unit test boundaries, fixtures)
- `.cursor/rules/tests/integration-testing.mdc` (real dependencies, test isolation)
- `.cursor/rules/tests/mocking-test-doubles.mdc` (mock at boundaries, prefer fakes)
- `.cursor/rules/tests/test-data-fixtures.mdc` (factories, fixtures, test data patterns)
- `.cursor/rules/tests/e2e-contract-testing.mdc` (E2E only when required)

**Diagram rules** (flag if implementation reveals diagram issues):
- `.cursor/rules/diagrams/diagrams.mdc`

### Agent definition — read before proceeding

Read the **Implementation Engineer Agent** definition at `.cursor/agents/implementation-engineer.md`. Adopt its cognitive mode (structured implementation — architecture-conformant code production with built-in quality) for the duration of this session.

### Skills to invoke

After completing the session (at the end of Step 6), invoke the following skill:

- **Implementation Compliance Audit** (`.cursor/skills/implementation-compliance-audit.md`) — run in the scope of the just-completed stage to verify that implemented code matches component records and architecture specifications. Present the audit verdict to the user as part of the session summary.

If the audit returns **Major Violations** or **Critical Violations**, present the required fixes before marking items as Done. Do not advance to the next stage until violations are resolved.

### Templates you may need

- **Component record**: `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md` (for updating records)
- **Test strategy**: `.cursor/templates/tests/TEST-STRATEGY-TEMPLATE.md` (for reference)

### Execution model: Plan first, then execute

Before making any file changes, produce the full Execution Plan using the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md` (CTX-007):

**Context Loaded** — summarize what you found in the Implementation Plan: current stage, items to implement this session (with IDs), architecture docs read for context.

**Scope** — new files to create, existing files to modify.

**File Manifest** — one row per file to create or modify:
- For each source file: content outline describes the class/module name, key functions/methods, which entities or use cases from the architecture it implements
- For each test file: content outline describes test scope, test level (unit/integration), key behaviors being tested

**Key Decisions** — architecture patterns to apply for this stage (Repository pattern for data layer, Command for use cases, etc.), test level selection for each component.

**Assumptions** — any gaps in the architecture docs or component records that require judgment.

**Execution Order** — implementation order within the stage with dependency reasoning.

Present the plan and wait for explicit user confirmation before proceeding (CTX-009).

### What you must do (mandatory steps, in order)

#### Step 1 — Determine the current stage and next items

1. Read `docs/implementation/IMPLEMENTATION-PLAN.md` **Section 0** (current focus and status)
2. Read **Section 5** (stages) to understand the current stage scope
3. Read **Section 6** (execution order) to confirm the next work item
4. Identify all work items in the current stage that are not yet Done

If all items in the current stage are Done, advance to the next stage.

#### Step 2 — Load context

1. For each work item to implement this session, read:
   - The **architecture documents** referenced in the work item (Section 7)
   - The **component record** for that component (`docs/implementation/components/COMP-XXX-name.md`)
   - Any **related component records** for dependencies
2. Understand the component's file structure, key interfaces, and test locations

#### Step 3 — Build a session plan

Produce a short, ordered plan before writing any code:

1. Which work items will be implemented this session (ideally all remaining in the current stage, or a logical subset)
2. For each item: files to add/change, key classes/functions, test approach
3. Test level selection per item (following the test pyramid):
   - **Unit tests**: for domain logic, pure functions, entities, value objects (majority of tests)
   - **Component tests**: for services/modules with internal collaborators real and boundaries mocked
   - **Integration tests**: when the item involves repositories, external services, or real DB/IO
   - **E2E tests**: only when explicitly required for a complete, shippable component
4. Dependency order: which items must be done first within the session

#### Step 4 — Implement with built-in tests

For each work item, in order:

1. Implement the production code following:
   - Coding standards (CODE-001 through CODE-021)
   - Architecture patterns (PAT-001 through PAT-010)
   - Layer boundaries (ARCH-001, ARCH-002)
2. Write tests following:
   - Testing strategy (TEST-001 through TEST-018)
   - Appropriate test level from Step 3
   - Test naming: `test_<unit>_<behavior>_<condition>`
   - AAA pattern (Arrange-Act-Assert)
3. Verify tests pass
4. If implementation reveals that an architecture diagram is inaccurate, note it but do not modify architecture docs (use Prompt 08 for that)

#### Step 5 — Update the Implementation Plan

Apply the update protocol from IMPLEMENTATION-PLAN.md Section 1:

1. Set completed COMP-X.Y **Status** to **Done** in **Section 7**
2. Update **Section 0**: set "Next" to the first not-done item in Section 6; if the stage is complete, advance to the next stage; copy the next item's acceptance criteria, suggested steps, and architecture refs into Section 0
3. Update **Section 8**: increment items done count, add one line under "Recent completions" with date and COMP-X.Y
4. Optionally: update the **component record** in `docs/implementation/components/` with implementation decisions, files created, and test coverage

#### Step 6 — Post-session compliance audit

Run the **Implementation Compliance Audit** skill (`.cursor/skills/implementation-compliance-audit.md`) scoped to the files created or modified in this session.

Present the audit summary:
- Verdict: COMPLIANT / MINOR VIOLATIONS / MAJOR VIOLATIONS / CRITICAL VIOLATIONS
- List of any Critical or High findings

If the verdict is **Major Violations** or **Critical Violations**:
1. Present the specific findings to the user
2. Fix the violations before marking items as Done
3. Re-run the audit after fixes

#### Step 7 — Update execution state and present session summary

1. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 6 — Implementation (Stage [N], in progress or complete)
   - `Last completed prompt`: 05 — Implement Stage (Stage [N], item [COMP-X.Y])
   - `Next prompt`: 05 — Implement Stage (next session) [or 06 — Quality Audit if all stages done]
   - `Completed Phases`: add entry for this session with items completed, compliance verdict, and overall progress percentage

2. Present to the user:

   1. **Items completed**: list with IDs
   2. **Files created/modified**: list
   3. **Tests written**: count by type (unit/integration/etc.)
   4. **Stage progress**: X/Y items done in current stage
   5. **Overall progress**: X/Y total items done
   6. **Compliance audit verdict**: COMPLIANT / MINOR VIOLATIONS (details if applicable)
   7. **Next session**: what will be implemented next
   8. **Issues found**: any architecture inconsistencies, blockers, or technical debt noted

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/EXECUTION-STATE.md` | Session completion, current stage progress, overall progress | After compliance audit completes |

### Verification checklist

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] Full Execution Plan produced in Plan mode with File Manifest (content outlines for source and test files), Key Decisions, Execution Order (CTX-007, CTX-008)
- [ ] User confirmed the Execution Plan before any file was created (CTX-009)
- [ ] Implementation Plan Section 0 read and next item identified
- [ ] Architecture docs and component records read for context
- [ ] Code follows coding standards and architecture patterns
- [ ] Tests written at appropriate level per test pyramid
- [ ] All tests pass
- [ ] Post-session Implementation Compliance Audit run — verdict COMPLIANT or MINOR VIOLATIONS
- [ ] Any Major/Critical violations fixed before marking items Done
- [ ] Implementation Plan updated: Section 7 (status), Section 0 (next), Section 8 (progress)
- [ ] `docs/context/EXECUTION-STATE.md` updated with session progress (CTX-002)
- [ ] All work in English (code, comments, documentation, planning, reasoning)

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Open a **new** Cursor conversation for each implementation session — no copy-paste needed
2. Copy everything from the "Prompt" section above
3. **Start in Plan mode**: the AI will identify the current stage/items, produce the Execution Plan with file manifest and test approach, and await confirmation
4. Review the plan; confirm when satisfied
5. Switch to Agent mode to execute
6. Repeat with a new conversation for the next session
7. When all stages are done, the implementation is complete (v1)
8. When all stages are complete, run **Prompt 06** (`.cursor/prompts/06-audit-quality.md`) for the full Quality Audit
9. After the Quality Audit passes, use **Prompt 07** (`.cursor/prompts/07-generate-user-documentation.md`) to generate user documentation
10. For post-v1 changes, use **Prompt 08a** (`.cursor/prompts/08a-evolve-architecture.md`)
