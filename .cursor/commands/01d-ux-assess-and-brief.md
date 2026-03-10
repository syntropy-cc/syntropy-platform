**Assess the user experience requirements for this system and produce a UX Brief.**

> **Run this prompt in Cursor's Plan mode.** This prompt performs analysis only — it does not create UX files. Its outputs are the confirmed UX Brief written to `docs/context/ux-brief.md` and an updated `docs/context/EXECUTION-STATE.md`. Prompt 01-E reads the brief from disk automatically — no copy-paste needed.

### Context inputs

Before any analysis:

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify the current phase and that Prompt 01-C was the last completed step
2. Read `docs/context/generation-summary.md` — provides the interface types identified during architecture and confirms the routing decision. **If missing, halt**: "Required context file `docs/context/generation-summary.md` is missing. Run Prompt 01-C first." (CTX-004)

**Applicability check**: Read the `## Routing Decision` section of `generation-summary.md`. If `User-facing interfaces present` is "No", state: "The Generation Summary confirms this system has no user-facing interface. Phase 2b is not applicable. Proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`)." Do not proceed further.

If the system has any user-facing interface, continue with this prompt.

### Execution model

This prompt operates in two phases:

1. **Assessment phase** (read-only): read the Generation Summary and Vision Document, identify interface types, apply the DS-001 gate, map workflows to interfaces, identify UX risks, and produce the UX Brief
2. **User confirmation and context write**: present the UX Brief, wait for user confirmation, then write the confirmed brief to `docs/context/ux-brief.md` and update `docs/context/EXECUTION-STATE.md`

No UX files are written at any point. The only files written are the two context files, and only after user confirmation.

### Agent definition — read before proceeding

Read the **UX Architect Agent** definition at `.cursor/agents/ux-architect.md`. Adopt its cognitive mode (UX system design — structure, principles, information architecture) for the duration of this session.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001, CTX-002, CTX-005, CTX-006)
- **UX principles**: `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010)
- **Interaction design**: `.cursor/rules/ux/interaction-design.mdc` (IXD-001 through IXD-015)
- **Design system**: `.cursor/rules/design-system/design-system.mdc` (DS-001 applicability gate; DS-002 through DS-015 if applicable)

### Templates to read (for reference only — do not create files)

Read these templates to understand the structure of documents that will be created in 01-E. This informs the file list in the UX Brief:

- **UX Principles**: `.cursor/templates/ux/UX-PRINCIPLES-TEMPLATE.md`
- **Interaction Design**: `.cursor/templates/ux/INTERACTION-DESIGN-TEMPLATE.md`
- **Accessibility Requirements**: `.cursor/templates/ux/ACCESSIBILITY-REQUIREMENTS-TEMPLATE.md`
- **Design System**: `.cursor/templates/design-system/DESIGN-SYSTEM-TEMPLATE.md` (conditional)
- **Component Library**: `.cursor/templates/design-system/COMPONENT-LIBRARY-TEMPLATE.md` (conditional)
- **UX Brief**: `.cursor/templates/context/UX-BRIEF-TEMPLATE.md` (the format for the context file you will write)

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read execution state and context

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001)
2. Read `docs/context/generation-summary.md` — extract interface types and routing decision
3. Perform the applicability check (see Context inputs above)

#### Step 2 — Read Vision Document UX inputs

Extract and quote the following sections from `docs/vision/VISION.md`:

- **Section 3** (Users and Actors): who are the users, what is their technical level, what are their primary goals?
- **Section 4** (Interface and Interaction Preferences): which interface types, what accessibility level, what interaction style?
- **Section 8** (Workflows and Journeys): what are the primary user workflows? These become the candidate flows for interaction design.
- **Section 9** (Quality Priorities): are there UX-relevant quality priorities (performance, accessibility, usability)?

If **Section 4 is absent or empty**, halt immediately and report: "Vision Document quality issue: Section 4 (Interface and Interaction Preferences) is missing or empty. UX design cannot proceed without delivery interface definitions. Please use Prompt 00 (`.cursor/prompts/00-refine-vision.md`) to add this section."

#### Step 3 — Identify interface types in scope

From Section 4 and the Generation Summary:

1. List every interface type the system exposes: CLI, Web, REST API, GraphQL API, Mobile, Dashboard, or other
2. Designate the primary interface (the one most used by most users)
3. For each interface type, note the specific actors from Section 3 who use it

Cross-check against the architecture outputs: if an interface type appears in platform documents from Prompt 01-B but was not mentioned in Section 4, note it as an observation for the UX Brief.

#### Step 4 — Apply the DS-001 gate

Read `.cursor/rules/design-system/design-system.mdc`, specifically rule DS-001 (design system applicability gate).

Apply the gate criteria:
- **Design system required**: Web, Dashboard, or Mobile interface in scope → produce DESIGN-SYSTEM.md and COMPONENT-LIBRARY.md skeleton
- **Design system not required**: CLI or API only → skip design system; note the reasoning

Document the gate result clearly.

#### Step 5 — Map workflows to interface types

From Vision Section 8:

1. List every primary workflow
2. For each workflow, identify which interface type(s) it uses
3. Identify the minimum set of flows that must be fully designed in Prompt 01-E (prioritize: the most important workflow, the most common error scenario)
4. Note any workflow that spans multiple interface types — these require special attention in interaction design

#### Step 6 — Identify UX risks from architecture

Read `docs/architecture/ARCHITECTURE.md` and each domain architecture document.

Identify UX risks that emerge from the architecture:
- Data latency risks: operations that may be slow and need loading states or async patterns
- Error propagation risks: domain errors that surface to users and need clear error messaging
- Complexity risks: workflows that cross many domain boundaries and may confuse users
- Consistency risks: multiple domains with different patterns for the same user action

#### Step 7 — Produce and present the UX Brief

Present the UX Brief to the user. It must contain all of the following sections:

---

**UX Brief**

**Interface Types in Scope**
| Interface | Primary/Secondary | Users (from Section 3) | Justification from Section 4 |
|---|---|---|---|
| [type] | [P/S] | [actor names] | [quote from Section 4] |

**Design System Decision**
- DS-001 gate result: [Required / Not Required]
- Reason: [cite the interface type and DS-001 criterion]

**Confirmed Execution Path**
- [The specific combination: e.g., "CLI + REST API", "Web UI + REST API", "CLI only"]

**Documents to Generate** (Prompt 01-E will create these)
- `docs/ux/UX-PRINCIPLES.md`
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`
- `docs/ux/INTERACTION-DESIGN.md`
- `docs/design-system/DESIGN-SYSTEM.md` [only if DS-001 gate requires]
- `docs/design-system/COMPONENT-LIBRARY.md` [only if DS-001 gate requires]

**Primary User Flows to Design**
| Flow Name | Interface | Source (Section 8) | Priority |
|---|---|---|---|
| [name] | [type] | [workflow reference] | Must / Recommended |

**Key UX Decisions to Make in 01-E**
- [Each decision that needs to be made, e.g., "Command noun hierarchy for CLI", "Navigation structure for Web"]

**UX Risks Identified**
| Risk | Source | Mitigation |
|---|---|---|
| [description] | [domain or architecture pattern] | [proposed approach] |

---

After presenting the UX Brief, state:

> "This is the UX Brief. Please review it, especially the confirmed execution path and the list of flows to design. If it looks correct, confirm and I will save it to `docs/context/ux-brief.md` — then open a new conversation and run **Prompt 01-E** (`.cursor/prompts/01e-ux-generate-and-validate.md`), which will read the brief automatically. If you'd like changes, tell me what to adjust."

#### Step 8 — Write confirmed outputs (after user confirmation)

After the user confirms the UX Brief (CTX-005):

1. Write the confirmed UX Brief to `docs/context/ux-brief.md` using `.cursor/templates/context/UX-BRIEF-TEMPLATE.md`. Set `Status: Active`.
2. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 2b — UX and Interaction Design
   - `Last completed prompt`: 01-D — UX Assess and Brief
   - `Next prompt`: 01-E — UX Generate and Validate
   - `Context File Registry`: set `ux-brief.md` to `Active` with today's date
   - `Completed Phases`: add entry for 01-D completion with execution path and DS-001 gate result
3. State: "UX Brief saved to `docs/context/ux-brief.md`. Open a new conversation and run **Prompt 01-E** — it will read the brief automatically."

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/ux-brief.md` | Complete confirmed UX Brief | After user confirmation |
| `docs/context/EXECUTION-STATE.md` | Phase update, next prompt, context file registry | After user confirmation |

### Verification checklist (verify before completing this prompt)

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] `docs/context/generation-summary.md` confirmed present and Status: Active (CTX-004)
- [ ] Applicability check performed; if no user-facing interfaces, prompt halted and user directed to Prompt 03
- [ ] Sections 3, 4, 8, and 9 of Vision Document read and quoted
- [ ] Section 4 confirmed non-empty; if empty, prompt halted and user redirected to Prompt 00
- [ ] All interface types identified and documented
- [ ] DS-001 gate applied and decision documented
- [ ] All primary workflows mapped to interface types
- [ ] Minimum required flows identified
- [ ] UX risks from architecture review documented
- [ ] UX Brief contains all required sections
- [ ] User confirmed the UX Brief before any file was written
- [ ] `docs/context/ux-brief.md` written with Status: Active (CTX-003, CTX-005)
- [ ] `docs/context/EXECUTION-STATE.md` updated (CTX-002)
- [ ] No UX files were created during this session
- [ ] User directed to Prompt 01-E with note that no copy-paste is needed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

