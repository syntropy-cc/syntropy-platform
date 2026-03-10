**Based on the Implementation Plan, implement the next stage (or continue the current stage) following all architecture and implementation rules.**

> This prompt requires no additional user input. It reads `docs/implementation/IMPLEMENTATION-PLAN.md` to determine what to implement next. Just paste this prompt into a new Cursor conversation and send.

### Context and authority

- **Architecture is the system guide**: `docs/architecture/` describes how the system works. Implementation is a consequence of architecture. Do not deviate from architecture unless you document and justify.
- **Implementation Plan is the implementation authority**: `docs/implementation/IMPLEMENTATION-PLAN.md` is the single source of truth for what to build and in what order.
- **Stages define session scope**: Section 5 defines pre-grouped stages. Each stage should complete in 1–3 sessions.
- **Execution order**: Section 0 gives the current focus. Section 6 is the full ordered list. The next item is the first not-done in that list.
- **Work item details**: Section 7 contains acceptance criteria, suggested steps, and architecture refs for each COMP-X.Y.

### Rules you must follow

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

### Templates you may need

- **Component record**: `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md` (for updating records)
- **Test strategy**: `.cursor/templates/tests/TEST-STRATEGY-TEMPLATE.md` (for reference)

### Execution model: Plan first, then execute

Before making any file changes, you MUST first create a plan and present it to the user for review:

1. **Planning phase** (read-only): Read the Implementation Plan, architecture docs, and component records. Determine the current stage and produce a structured plan that includes:
   - Current stage identification and status
   - Work items to implement this session (with IDs and titles)
   - For each work item: files to create/modify, key classes/functions, test approach and test level
   - Dependency order within the session
   - Estimated file count: new files, modified files
   - Architecture references that govern this stage
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute it following the mandatory steps below

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

#### Step 6 — Session summary

Present to the user:

1. **Items completed**: list with IDs
2. **Files created/modified**: list
3. **Tests written**: count by type (unit/integration/etc.)
4. **Stage progress**: X/Y items done in current stage
5. **Overall progress**: X/Y total items done
6. **Next session**: what will be implemented next
7. **Issues found**: any architecture inconsistencies, blockers, or technical debt noted

### Verification checklist

- [ ] Implementation Plan Section 0 read and next item identified
- [ ] Architecture docs and component records read for context
- [ ] Session plan produced before coding
- [ ] Code follows coding standards and architecture patterns
- [ ] Tests written at appropriate level per test pyramid
- [ ] All tests pass
- [ ] Implementation Plan updated: Section 7 (status), Section 0 (next), Section 8 (progress)
- [ ] All work in English (code, comments, documentation, planning, reasoning)

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.