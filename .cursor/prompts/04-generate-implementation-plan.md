# Generate Implementation Plan (Prompt 04)

Use this prompt to generate the single "backbone" implementation plan document with pre-defined stages, execution order, and session sizing. This is **Phase 5** of the Vision-to-System Framework.

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Generate the implementation plan document that will govern all implementation sessions. Group work items into stages, define execution order, and create the backbone document.**

> This prompt requires no additional user input. It reads your architecture from `docs/architecture/` and component records from `docs/implementation/components/`. Just paste this prompt into a new Cursor conversation and send.

### Context inputs

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify Phase 4 (implementation docs) is complete. If the file does not exist, proceed — the implementation documents are the authoritative source.

### Context and authority

- **Architecture drives implementation**: `docs/architecture/ARCHITECTURE.md` is the system blueprint.
- **Component records define what to build**: `docs/implementation/components/COMP-*.md` contain all work items.
- **Backlog is the item inventory**: `docs/implementation/BACKLOG.md` lists everything.
- **The Implementation Plan is the backbone**: the single document that every implementation session starts by reading. It maintains history, tracks progress, defines execution order, and groups work into stages.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001, CTX-002, CTX-007, CTX-008, CTX-009)
- **Implementation workflow**: `.cursor/rules/implementation/implementation-workflow.mdc` (IMPL-001 through IMPL-014)
- **Progress tracking**: `.cursor/rules/implementation/progress-tracking.mdc` (TRACK-001 through TRACK-016)
- **Architecture navigation**: `.cursor/rules/architecture/architecture-navigation.mdc` (for understanding document structure)

### Templates you must use

- **Roadmap**: `.cursor/templates/implementation/_ROADMAP-TEMPLATE.md`
- **Progress summary**: `.cursor/templates/implementation/_PROGRESS-SUMMARY-TEMPLATE.md`

### Execution model: Plan first, then execute

Before making any file changes, produce the full Execution Plan using the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md` (CTX-007):

**Context Loaded** — summarize what you found: component count from BACKLOG.md, total work items, existing dependency map, critical path.

**Scope** — 3 files to create: IMPLEMENTATION-PLAN.md, ROADMAP.md, PROGRESS-SUMMARY.md.

**File Manifest:**
- `docs/implementation/IMPLEMENTATION-PLAN.md`: content outline — 9 sections (0 = current focus, 1 = how to use, 2 = vision, 3 = baseline, 4 = milestones, 5 = stage definitions, 6 = execution order, 7 = work item catalog, 8 = progress); Section 0 will point to the first work item in Section 6
- `docs/implementation/ROADMAP.md`: content outline — milestones with deliverables and success criteria
- `docs/implementation/PROGRESS-SUMMARY.md`: content outline — initialized at 0% with all metric fields empty

**Key Decisions** — proposed milestones (names and groupings), proposed stages (count and items per stage), critical path through the dependency graph.

**Assumptions** — any work items without clear dependencies that required judgment on ordering.

**Execution Order** — IMPLEMENTATION-PLAN.md first (complete), then ROADMAP.md (derives from milestones in plan), then PROGRESS-SUMMARY.md (derives from totals).

Present the plan and wait for explicit user confirmation before proceeding (CTX-009).

### What you must do (mandatory steps, in order)

#### Step 1 — Read all inputs

1. Read `docs/architecture/ARCHITECTURE.md` for the system overview, domain list, and principles
2. Read every component record in `docs/implementation/components/COMP-*.md`
3. Read `docs/implementation/BACKLOG.md` for the complete work item inventory
4. Note all dependencies between components

#### Step 2 — Build the dependency graph

1. Create a directed acyclic graph of component dependencies
2. Identify which components have no dependencies (can start immediately)
3. Identify the critical path (longest chain of dependencies)
4. Detect any circular dependencies and flag them as errors

#### Step 3 — Define milestones

Group components into milestones that represent significant, demonstrable progress:

- **Milestone 1 (Foundation)**: Core infrastructure, base entities, project setup
- **Milestone 2 (Core)**: Primary business domains, core functionality
- **Milestone 3 (Integration)**: Cross-domain workflows, integration points
- **Milestone 4 (Delivery)**: Platform/UI, end-to-end workflows
- **Milestone 5 (Polish)**: Observability, optimization, documentation

Adjust milestone names and count based on the project's actual structure.

#### Step 4 — Define stages within milestones

Break each milestone into stages where each stage:

- Contains **3–8 work items** from related components
- Touches **5–15 files** (enough to be productive, small enough to fit in context)
- Can be completed in **1–3 Cursor sessions**
- Produces a **testable, verifiable increment** (something you can run or test after completing)
- Respects **dependency order** (no stage depends on a later stage)

For each stage, define:

| Field | Description |
|-------|-------------|
| **Stage ID** | S1, S2, S3, ... |
| **Name** | Descriptive name (e.g., "Core Entity Models", "Pipeline Phase 1") |
| **Milestone** | Which milestone this stage belongs to |
| **Components** | COMP-XXX IDs included |
| **Work Items** | COMP-XXX.Y IDs included |
| **Dependencies** | Previous stages that must be complete |
| **Estimated Sessions** | 1–3 |
| **Verification** | How to know the stage is done (tests pass, endpoint works, etc.) |

#### Step 5 — Define execution order

Create a flat, numbered list of all work items in the order they should be implemented. This list must:
- Respect all dependency constraints
- Follow the stage groupings
- Place foundation/infrastructure items first
- Place integration and E2E items last

#### Step 6 — Generate the Implementation Plan document

Create `docs/implementation/IMPLEMENTATION-PLAN.md` with these sections:

**Section 0 — Current focus and status**
- Progress: 0/{total} items done
- Next stage: S1
- Next item: first item in execution order
- Copy that item's acceptance criteria, suggested steps, and architecture refs

**Section 1 — Purpose and how to use**
- This document is the single source of truth for implementation context
- Chunking hints: what to read when implementing (section 0 for next step, section 5 for stages, section 7 for item details)
- Update protocol: what to update when completing an item (status in section 7, next in section 0, progress in section 8)

**Section 2 — Strategic vision**
- Summary from architecture (system purpose, key capabilities)

**Section 3 — Current state baseline**
- Starting state: greenfield or existing code inventory

**Section 4 — Milestones**
- Each milestone with deliverables, success criteria, and component mapping

**Section 5 — Stages definition**
- All stages with their components, work items, dependencies, and verification criteria

**Section 6 — Execution order**
- Flat numbered list of all work items in implementation order

**Section 7 — Work items catalog**
- Every COMP-X.Y with: status, priority, size, architecture reference, acceptance criteria, suggested implementation steps

**Section 8 — Progress and status**
- Items done count, recent completions log, blocked items

#### Step 7 — Generate supporting documents

1. Create `docs/implementation/ROADMAP.md` using `.cursor/templates/implementation/_ROADMAP-TEMPLATE.md` with milestones populated
2. Create `docs/implementation/PROGRESS-SUMMARY.md` using `.cursor/templates/implementation/_PROGRESS-SUMMARY-TEMPLATE.md` initialized at 0%

#### Step 8 — Update execution state and produce summary

1. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 5 — Implementation Planning (Complete)
   - `Last completed prompt`: 04 — Generate Implementation Plan
   - `Next prompt`: 05 — Implement Stage (first stage, first item in execution order)
   - `Completed Phases`: add entry for Phase 5 completion with stage count, total work item count, and first item name

2. Present to the user:

   1. **Milestones defined**: count and names
   2. **Stages defined**: count, with items per stage
   3. **Total work items**: count in execution order
   4. **Estimated total sessions**: sum of stage session estimates
   5. **Critical path**: longest dependency chain
   6. **First stage**: S1 details (what will be built first)
   7. **Next steps**: proceed to **Prompt 05** (`.cursor/prompts/05-implement-stage.md`) — no copy-paste needed

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/EXECUTION-STATE.md` | Phase 5 completion, next prompt = 05 | After all plan documents are created |

### Verification checklist

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] Full Execution Plan produced in Plan mode with File Manifest, Key Decisions (proposed stages and milestones), Execution Order (CTX-007, CTX-008)
- [ ] User confirmed the Execution Plan before any file was created (CTX-009)
- [ ] IMPLEMENTATION-PLAN.md exists with all 9 sections (0 through 8)
- [ ] Every work item from the backlog appears in the execution order
- [ ] No work item appears before its dependencies
- [ ] Every stage has 3–8 work items
- [ ] Every stage has verification criteria
- [ ] Section 0 points to the correct first item
- [ ] ROADMAP.md exists with milestones populated
- [ ] PROGRESS-SUMMARY.md exists initialized at 0%
- [ ] All architecture references in work items resolve to actual documents
- [ ] `docs/context/EXECUTION-STATE.md` updated with Phase 5 completion (CTX-002)

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Ensure implementation docs are generated (Phase 4 / Prompt 03 done)
2. Open a **new** Cursor conversation — no copy-paste needed
3. Copy everything from the "Prompt" section above
4. **Start in Plan mode**: the AI will read components and backlog, produce the Execution Plan with proposed stages and milestones, and await confirmation
5. Review the proposed stages and execution order; confirm when satisfied
6. Switch to Agent mode to execute
7. Proceed to **Prompt 05** (`.cursor/prompts/05-implement-stage.md`) to start building — no copy-paste needed
