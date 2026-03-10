# Architecture: Generate (Prompt 01-B)

Use this prompt to generate all architecture documents and diagrams from the confirmed Architecture Brief. This is **Step 2 of 3** in the architecture generation phase (Phase 2) of the Vision-to-System Framework.

**This prompt reads the Architecture Brief from `docs/context/architecture-brief.md` automatically.** No copy-paste from the previous session is needed. If that file does not exist, the prompt will halt and direct you to run Prompt 01-A first.

After completing this prompt, proceed to **Prompt 01-C** (`.cursor/prompts/01c-decisions-and-validation.md`).

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Generate all architecture documents and diagrams for this project from the confirmed Architecture Brief.**

> **Run this prompt in Plan mode first, then switch to Agent mode to execute.** In Plan mode, read the Architecture Brief from disk, produce a full Execution Plan (file manifest with content outlines, key decisions, execution order), and await user confirmation. In Agent mode, create all the files. ADRs, the changelog, and validation are handled by Prompt 01-C — do not create them here.

### Context inputs

Before any analysis:

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify the current phase is Phase 2 and the last completed prompt was 01-A
2. Read `docs/context/architecture-brief.md` — this is the Architecture Brief that governs this session. **If this file does not exist or its `Status` is not `Active`, halt immediately**: "Required context file `docs/context/architecture-brief.md` is missing or not Active. Run Prompt 01-A first to produce the Architecture Brief." (CTX-004)

No other user input is required. Do not ask the user to paste the Architecture Brief.

### Execution model

**In Plan mode (Execution Plan phase):**
1. Read both context files listed above
2. Produce the full Execution Plan using the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md`
3. The Execution Plan must include: Context Loaded summary, Scope, File Manifest with content outlines, Key Decisions, Assumptions, Execution Order
4. Present the plan and await explicit user confirmation (CTX-009)

**In Agent/Execute mode (creation phase):**
1. Create all architecture documents and diagrams per the confirmed plan
2. Write `docs/context/architecture-file-list.md` upon completion
3. Update `docs/context/EXECUTION-STATE.md`
4. Report the complete list of created files

No ADRs, no changelog, no validation in this prompt — those belong to Prompt 01-C.

### Agent definition — read before proceeding

Read the **System Architect Agent** definition at `.cursor/agents/system-architect.md`. Adopt its cognitive mode for the duration of this session.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001 through CTX-009)
- **Architecture generation**: `.cursor/rules/architecture/architecture-generation.mdc` (GEN-004 mandatory document set, GEN-005 minimum diagram set, GEN-006 quality gates)
- **Architecture principles**: `.cursor/rules/architecture/architecture.mdc`
- **Architecture navigation**: `.cursor/rules/architecture/architecture-navigation.mdc`
- **Conventions**: `.cursor/rules/architecture/conventions.mdc`
- **Patterns**: `.cursor/rules/architecture/patterns.mdc`
- **Constraints**: `.cursor/rules/architecture/constraints.mdc` (fill in from vision)
- **Diagrams**: `.cursor/rules/diagrams/diagrams.mdc` (DIAG-019 through DIAG-022: descriptive diagrams with concrete names)

### Templates you must use

Use these templates as the base for each document:

- **Root architecture**: `.cursor/templates/architecture/ARCHITECTURE.md`
- **Domain architecture**: `.cursor/templates/architecture/domains/_DOMAIN-TEMPLATE.md`
- **Cross-cutting concern**: `.cursor/templates/architecture/cross-cutting/_CONCERN-TEMPLATE.md`
- **Platform service**: `.cursor/templates/architecture/platform/_PLATFORM-TEMPLATE.md`
- **Diagram index**: `.cursor/templates/diagrams/_DIAGRAM-INDEX.md`
- **Diagram templates**: `.cursor/templates/diagrams/` (context-system, component, sequence, activity, ERD, class, state-machine, deployment, use-case)
- **Architecture File List**: `.cursor/templates/context/ARCHITECTURE-FILE-LIST-TEMPLATE.md` (for the context output)

---

### What you must do (mandatory steps, in order)

#### Step 0 — Plan mode: read context and produce Execution Plan

Before creating any file, produce the full Execution Plan. Follow the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md`.

**Context Loaded** — summarize what you found in each file:
- `docs/context/architecture-brief.md`: domain count, layer style, number of documents to generate, ADR titles, any significant ambiguities
- `docs/vision/VISION.md`: confirm you have read it for Vision sections needed to fill templates

**Scope** — total files to create, estimated execution duration.

**File Manifest** — one row per file, including:
- `docs/architecture/ARCHITECTURE.md` → content outline: system purpose (from Vision §1–2), domain overview table, layer definitions, system-wide principles, technology radar, navigation guide; inline diagrams: context diagram, layer overview, domain relationships
- `docs/architecture/domains/{name}/ARCHITECTURE.md` (one per domain) → content outline: business capability traced to Section 6, ubiquitous language, component architecture, data architecture with named entities, API design, event contracts, integration points, vision traceability; diagrams: ERD, component diagram, sequence diagram for primary workflow
- `docs/architecture/cross-cutting/{concern}/ARCHITECTURE.md` (one per concern) → content outline: concern scope, patterns applied, enforcement points
- `docs/architecture/platform/{interface}/ARCHITECTURE.md` (one per interface) → content outline: interface type, delivery mechanism, integration with domain APIs
- `docs/architecture/diagrams/README.md` → content outline: index of all diagrams with descriptions and links

**Key Decisions** — for each domain: preliminary entity model, primary workflow to sequence-diagram, naming decisions; for root document: which actors appear in context diagram, which inter-domain flows to show.

**Assumptions** — any gaps in the Architecture Brief that require an assumption during generation.

**Execution Order** — root document first (establishes shared vocabulary), then domain docs in dependency order, then cross-cutting, then platform, then diagram index.

State: "Ready to generate [N] documents and [N] diagrams. Confirm to proceed." Wait for confirmation (CTX-009).

#### Step 1 — Generate the Root Architecture Document

Create `docs/architecture/ARCHITECTURE.md` using the root template.

Fill in every section:
- **System Purpose**: derived from Vision Sections 1 (Problem Statement) and 2 (Ideal Future State)
- **Document Map**: reflects the exact domains, cross-cutting docs, and platform docs you will create — must match reality when complete
- **Domain Overview**: table with each domain, its one-line responsibility, and a link to its ARCHITECTURE.md
- **Layer Definitions**: from the layer structure chosen in the Architecture Brief
- **System-Wide Principles**: derived from vision quality priorities and domain relationship patterns
- **Technology Radar**: from vision constraints and the architecture choices made
- **Navigation Guide**: tailored to this project's actual structure

Generate these inline diagrams — all must use concrete names (no "Component A" or "Service 1"):
- **Context/System diagram**: system boundary, all actors from Vision Section 3, all external systems from Section 10
- **Layer/Component overview**: all layers with their key components named explicitly
- **Domain Relationships**: how all domains interact (events, APIs, shared data) with named flows

Verify each diagram against the DIAG-022 checklist before moving on.

#### Step 2 — Generate Domain Architecture Documents

For each domain in the Architecture Brief, create `docs/architecture/domains/{domain-name}/ARCHITECTURE.md` using the domain template.

Fill in every section:
- **Business Capability**: traced to specific vision capabilities from Section 6 — quote the capability name
- **Ubiquitous Language**: key terms used within this domain with definitions
- **Component Architecture**: named services, data stores, caches within the domain
- **Data Architecture**: named entities with attributes, relationships, and data lifecycle; data shared with other domains explicitly called out
- **API Design**: named endpoints (if applicable); request/response shapes
- **Event Contracts**: named events published and consumed (if applicable), with payload structure
- **Integration Points**: named upstream dependencies and downstream dependents
- **Vision Traceability**: explicit list of which vision capabilities and information concepts this domain implements

Generate these per-domain diagrams — all with concrete names:
- **ERD**: entities, attributes, relationships within the domain
- **Component diagram**: internal services and data stores with named connections
- **Sequence diagram**: at least one, for the domain's most important workflow — name the actors and messages explicitly

#### Step 3 — Generate Cross-Cutting Concern Documents

For each concern in the Architecture Brief, create `docs/architecture/cross-cutting/{concern-name}/ARCHITECTURE.md` using the cross-cutting template.

#### Step 4 — Generate Platform Documents

For each delivery interface in the Architecture Brief, create `docs/architecture/platform/{interface-name}/ARCHITECTURE.md` using the platform template.

#### Step 5 — Generate the Diagram Index and Shared Diagram Files

1. Create `docs/architecture/diagrams/README.md` using the diagram index template
2. Create shared diagram files in `docs/architecture/diagrams/` as needed
3. Verify every diagram against the DIAG-022 checklist

#### Step 6 — Write context outputs and report

1. Write `docs/context/architecture-file-list.md` using `.cursor/templates/context/ARCHITECTURE-FILE-LIST-TEMPLATE.md`. List every file created, organized by category. Set `Status: Active`.
2. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 2 — Architecture Generation
   - `Last completed prompt`: 01-B — Generate Architecture
   - `Next prompt`: 01-C — Decisions and Validation
   - `Context File Registry`: set `architecture-file-list.md` to `Active` with today's date
   - `Completed Phases`: add entry for 01-B completion with file counts
3. Present the complete list of all created files, organized by category
4. State: "Architecture documents and diagrams are complete. ADRs and validation are handled by Prompt 01-C — open a new conversation and run it now. No copy-paste needed."

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/architecture-file-list.md` | Complete list of all files created, by category | After all files are created |
| `docs/context/EXECUTION-STATE.md` | Phase update, file list registry entry | After context file is written |

### Verification checklist (verify before completing this prompt)

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] `docs/context/architecture-brief.md` confirmed present and Status: Active before any file was created (CTX-004)
- [ ] Full Execution Plan produced in Plan mode with File Manifest, Key Decisions, Assumptions, Execution Order (CTX-007, CTX-008)
- [ ] User confirmed the Execution Plan before any file was created (CTX-009)
- [ ] `docs/architecture/ARCHITECTURE.md` created with all sections filled
- [ ] Document Map in root matches all domain, cross-cutting, and platform files actually created
- [ ] One `docs/architecture/domains/{name}/ARCHITECTURE.md` per domain in the Architecture Brief
- [ ] Every domain document has at least 3 diagrams: ERD + component + at least one sequence
- [ ] Root document has at least 3 diagrams: context, component overview, domain relationships
- [ ] Every domain traces to at least one vision capability; every vision capability maps to at least one domain
- [ ] All diagrams use concrete names — no "Component A", "Service 1", or similar placeholders
- [ ] All cross-cutting concern documents created
- [ ] All platform documents created
- [ ] `docs/architecture/diagrams/README.md` created
- [ ] Every diagram verified against DIAG-022
- [ ] No ADRs, no changelog, no validation runs in this prompt
- [ ] `docs/context/architecture-file-list.md` written with Status: Active (CTX-003)
- [ ] `docs/context/EXECUTION-STATE.md` updated (CTX-002)
- [ ] User directed to Prompt 01-C with note that no copy-paste is needed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Complete **Prompt 01-A** and confirm the Architecture Brief (it is saved automatically)
2. Open a **new** Cursor conversation
3. Copy everything from the "Prompt" section above into the conversation — no pasting of the Architecture Brief needed
4. **Start in Plan mode**: the AI will read the brief from disk, produce the full Execution Plan, and await confirmation
5. Review the Execution Plan (file manifest with content outlines, key decisions) — confirm when satisfied
6. Switch to Agent mode to execute
7. After all files are created, proceed to **Prompt 01-C** — no copy-paste needed
