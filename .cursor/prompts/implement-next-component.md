# Implement Next Component (Reusable Session Prompt)

Use this prompt at the start of each implementation conversation. It instructs the assistant to implement the **next** work item from the implementation plan, with built-in tests and plan updates.

---

## Prompt (copy and use in each conversation)

**Based on [docs/implementation/IMPLEMENTATION-PLAN.md](docs/implementation/IMPLEMENTATION-PLAN.md), build a plan and implement the next component in the defined execution order.**

### Context and authority

- **Architecture is the system guide**: [docs/architecture](docs/architecture) describes in detail how the system works. Implementation is a consequence of that. Do not deviate from architecture unless you document and justify.
- **Implementation plan is the implementation authority**: [IMPLEMENTATION-PLAN.md](docs/implementation/IMPLEMENTATION-PLAN.md) is the single source of truth for *what* to build and *in what order*. Use it so each session implements one step.
- **Execution order**: Section **0** (Current focus and status) gives the **next** work item. Section **6** (Execution order) is the full ordered list. The next item is the first not-done in that list.
- **Component and work-item details**: Section **7** (Work items catalog) contains acceptance criteria, suggested steps, and architecture refs for each COMP-X.Y.

### Execution model: Plan first, then execute

Before making any file changes, you MUST first create a plan and present it to the user for review:

1. **Planning phase** (read-only): Read the Implementation Plan, architecture docs, and component records. Determine the next work item and produce a structured plan that includes:
   - The work item to implement (ID, title, acceptance criteria)
   - Files to create/modify with key classes/functions
   - Test approach and test level for each change
   - Architecture references that govern this item
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute it following the steps below

### What you must do this session

1. **Determine the next item**
   - Read IMPLEMENTATION-PLAN.md **section 0** (current focus) and the architecture refs listed there.
   - Identify the single work item (e.g. COMP-011.1) that is **next** in execution order (first not-done in section 6).
   - If section 0 is already up to date, use the “Next” item stated there.

2. **Build an implementation plan for that item**
   - Read the relevant **architecture** documents linked in section 0 or in section 7 for that COMP-X.Y (e.g. domain ARCHITECTURE.md, Agents ARCHITECTURE.md).
   - Read the **component record** for that component if it exists under [docs/implementation/components/](docs/implementation/components/).
   - Produce a short, ordered plan: steps to implement the item so that acceptance criteria are met, including which files to add/change and how tests will be added.

3. **Implement with built-in tests**
   - Implement the work item following:
     - [.cursor/rules/implementation](.cursor/rules/implementation) (implementation-workflow, coding-standards, progress-tracking).
     - [.cursor/templates/implementation](.cursor/templates/implementation) (e.g. component record template if creating/updating a component record).
   - **Every implementation must include tests** that:
     - Follow [.cursor/rules/tests](.cursor/rules/tests) (testing-strategy, unit-testing, integration-testing, and any other test rules that apply).
     - Use or align with [.cursor/templates/tests](.cursor/templates/tests) (e.g. TEST-STRATEGY-TEMPLATE for structure and pyramid).
     - Respect the **test pyramid**: choose the right level (unit / component / integration / E2E / real-world) for what is being implemented:
       - **Unit tests**: For domain logic, pure functions, entities, value objects (majority of tests; fast, isolated, mocked dependencies).
       - **Component tests**: For services/modules in isolation with internal collaborators real and boundaries mocked.
       - **Integration tests**: When the work item involves repositories, external services, or real DB/IO; test the integration point, not business logic already covered by unit tests.
       - **E2E / real-world**: Only when explicitly required for the item or for a complete, shippable component; do not add by default for a single COMP-X.Y unless the plan says so.
   - Add tests in the appropriate directories (e.g. `tests/unit/...`, `tests/integration/...`) and name them according to the test rules (e.g. `test_<unit>_<behavior>_<condition>`).

4. **Update the implementation plan when the item is done**
   - Apply the **update protocol** from IMPLEMENTATION-PLAN.md (section 1, “Update protocol (when you complete an item)”):
     1. Set the completed COMP-X.Y **Status** to **Done** in **section 7** (Work items catalog).
     2. Update **section 0** (Current focus): set “Next” to the first not-done item in section 6; copy that item’s acceptance criteria, suggested steps, and architecture refs into section 0.
     3. Update **section 8** (Progress and status): increment “items done” (e.g. 3/50 → 4/50), add one line under “Recent completions” with date and COMP-X.Y.
   - Optionally: update or create the **component record** in [docs/implementation/components/](docs/implementation/components/) per the implementation templates.

### Language and communication

- **Write everything in English**: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.
- **Thinking process**: Explain briefly how you determined the next item, how the plan maps to architecture and acceptance criteria, and how you chose test levels and locations.

### Summary checklist for the assistant

- [ ] Read IMPLEMENTATION-PLAN.md section 0 and relevant section 7 entry; confirmed next work item (COMP-X.Y).
- [ ] Read architecture docs and component record for that item; built implementation plan.
- [ ] Implemented the item; followed implementation rules and templates.
- [ ] Added tests per test rules and templates; respected test pyramid (unit/component/integration as appropriate).
- [ ] Updated IMPLEMENTATION-PLAN.md: section 7 (Done), section 0 (next item), section 8 (progress and recent completions).
- [ ] All in English (code, comments, documentation, planning, reasoning).

---

## How to use this prompt

1. Open a new conversation (or start a focused implementation session).
2. Paste the **Prompt** block above (from “Based on IMPLEMENTATION-PLAN.md…” through “All in English”).
3. Optionally add: “Start with the next item in section 0 of IMPLEMENTATION-PLAN.md.”
4. The assistant will identify the next COMP-X.Y, plan it, implement it with tests, and update the plan.

Use this same prompt in each new conversation to advance the system one work item at a time, always in execution order and with tests and plan updates applied consistently.
