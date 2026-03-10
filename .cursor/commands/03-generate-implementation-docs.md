**Generate all implementation documentation from the architecture. Extract every architectural component into implementation records with work items, dependencies, and acceptance criteria.**

> This prompt requires no additional user input. It reads your architecture from `docs/architecture/`. Just paste this prompt into a new Cursor conversation and send.

### Context inputs

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify the current phase confirms architecture is complete (Phase 2 or 2b done). If the file does not exist, proceed — the architecture documents are the authoritative source.

### Context and authority

- **Architecture is the source of truth**: `docs/architecture/ARCHITECTURE.md` is the root. Every domain, cross-cutting, and platform doc linked from it defines what must be built.
- **Implementation documents are derived from architecture**: every component record must trace back to an architecture document. No implementation item exists without architecture backing.
- **What is in the architecture must be implemented**: extract all domains, entities, services, integrations, and cross-cutting concerns into implementable work items.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001, CTX-002, CTX-007, CTX-008, CTX-009)
- **Implementation workflow**: `.cursor/rules/implementation/implementation-workflow.mdc` (IMPL-001 through IMPL-014)
- **Progress tracking**: `.cursor/rules/implementation/progress-tracking.mdc` (TRACK-001 through TRACK-016)
- **Coding standards**: `.cursor/rules/implementation/coding-standards.mdc` (for defining file structures and interfaces)
- **Architecture principles**: `.cursor/rules/architecture/architecture.mdc` (respect layer boundaries in file layout)
- **Conventions**: `.cursor/rules/architecture/conventions.mdc` (naming conventions for files, directories, modules)
- **Patterns**: `.cursor/rules/architecture/patterns.mdc` (implementation must use approved patterns)

### Templates you must use

- **Component record**: `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md`
- **Backlog**: `.cursor/templates/implementation/_BACKLOG-TEMPLATE.md`

### Execution model: Plan first, then execute

Before making any file changes, produce the full Execution Plan using the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md` (CTX-007):

**Context Loaded** — summarize what you found in `docs/architecture/ARCHITECTURE.md`: domain count, component count, cross-cutting concerns, platform documents.

**Scope** — total component records to create plus the backlog file.

**File Manifest** — one row per file to create, including:
- `docs/implementation/components/COMP-XXX-{name}.md` for each component: content outline describes the architecture document it traces to, the estimated work item count, and the key dependencies
- `docs/implementation/BACKLOG.md`: content outline describes the dependency graph, priority matrix, and total work item count

**Key Decisions** — component ordering (which components have no dependencies and go first), work item sizing guidelines, any architecture ambiguities that affect scope.

**Assumptions** — any architecture gaps that require assumptions.

**Execution Order** — core domain components first, then application/service components, then platform and cross-cutting.

Present the plan and wait for explicit user confirmation before proceeding (CTX-009).

### What you must do (mandatory steps, in order)

#### Step 1 — Read the complete architecture

1. Read `docs/architecture/ARCHITECTURE.md` (root document)
2. Read every domain ARCHITECTURE.md linked from the root
3. Read every cross-cutting and platform ARCHITECTURE.md linked from the root
4. Read the architecture diagrams index and key diagrams
5. Read all ADRs in `docs/architecture/decisions/`

#### Step 2 — Extract components

For each architectural domain, cross-cutting concern, and platform service, create a Component Record:

1. **Assign a component ID**: COMP-001, COMP-002, etc., ordered by layer (Core domains first, then Execution/Application, then Platform, then Cross-cutting)
2. **For each component**, use `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md` and fill in:
   - **Architecture Summary**: copied/adapted from the domain's ARCHITECTURE.md
   - **Implementation Scope**: what is in and out of scope
   - **Work Items**: break the component into work items (COMP-XXX.1, COMP-XXX.2, etc.) where each item:
     - Can be completed in 1–3 prompts/sessions
     - Has clear acceptance criteria (what must be true when done)
     - Has an estimated size (XS/S/M/L/XL per TRACK-003)
     - References the specific architecture section it implements
   - **Dependencies**: what other components must exist for this one to work
   - **File Structure**: proposed directory layout in `src/` and `tests/`
   - **Key Classes/Functions**: outline of the public interface
3. Save each component record to `docs/implementation/components/COMP-XXX-{name}.md`

#### Step 3 — Define the file structure

For each component, define:
- Where in `src/` the production code lives
- Where in `tests/` the test code lives (unit, integration, e2e subdirectories as applicable)
- Key files that will be created

Follow conventions from `.cursor/rules/architecture/conventions.mdc`:
- Directories: kebab-case
- Files/modules: snake_case
- One responsibility per module

#### Step 4 — Identify cross-cutting implementation tasks

Create additional work items for tasks that span multiple components:

- **TASK-XXX**: Technical tasks (e.g., "Set up project structure", "Configure testing framework", "Set up CI/CD")
- **DOC-XXX**: Documentation tasks (e.g., "Create API documentation", "Write developer setup guide")

#### Step 5 — Generate the implementation backlog

1. Create `docs/implementation/BACKLOG.md` using `.cursor/templates/implementation/_BACKLOG-TEMPLATE.md`
2. Include all components with their work items, organized by component
3. Include the cross-cutting tasks from Step 4
4. Include a dependency graph showing component ordering
5. Include a priority matrix

#### Step 6 — Update execution state and produce summary

1. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 4 — Implementation Documentation
   - `Last completed prompt`: 03 — Generate Implementation Docs
   - `Next prompt`: 04 — Generate Implementation Plan
   - `Completed Phases`: add entry for Phase 4 completion with component count and work item count

2. Present to the user:
   1. **Components created**: count and list with IDs and names
   2. **Total work items**: count, broken down by size
   3. **Dependencies identified**: key dependency chains
   4. **Cross-cutting tasks**: count and list
   5. **Estimated total scope**: rough assessment based on work item sizes
   6. **Next steps**: proceed to **Prompt 04** (`.cursor/prompts/04-generate-implementation-plan.md`) — no copy-paste needed

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/EXECUTION-STATE.md` | Phase update, next prompt = 04 | After all component records and backlog are created |

### Verification checklist

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] Full Execution Plan produced in Plan mode with File Manifest (content outlines), Key Decisions, Execution Order (CTX-007, CTX-008)
- [ ] User confirmed the Execution Plan before any file was created (CTX-009)
- [ ] One component record per architectural domain/concern/platform
- [ ] Every component traces to an architecture document
- [ ] Every work item has: ID, title, acceptance criteria, size estimate, architecture reference
- [ ] Dependencies between components are documented in both directions (requires / required by)
- [ ] File structure follows naming conventions
- [ ] BACKLOG.md contains all components and cross-cutting tasks
- [ ] Dependency graph is consistent (no circular dependencies)
- [ ] Work items are sized appropriately (none larger than XL; XL items should be broken down)
- [ ] `docs/context/EXECUTION-STATE.md` updated with Phase 4 completion (CTX-002)

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

