**Generate all UX and design system documents from the confirmed UX Brief, then validate them.**

> **Run this prompt in Plan mode first, then switch to Agent mode to execute.** In Plan mode, read both required context files from disk, produce the full Execution Plan (document manifest with content outlines, key UX decisions), and await user confirmation. In Agent mode, generate all documents, run the UX Consistency Validation Skill, fix all Critical and High findings, and write the UX Generation Summary to disk.

### Context inputs

Before any analysis:

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify the current phase is Phase 2b and the last completed prompt was 01-D
2. Read `docs/context/ux-brief.md` — contains the confirmed execution path, interface types, documents to create, flows to design, and UX risks. **If missing, halt**: "Required context file `docs/context/ux-brief.md` is missing. Run Prompt 01-D first." (CTX-004)
3. Read `docs/context/generation-summary.md` — provides the architecture context, domain list, and interface types identified during architecture. **If missing, halt**: "Required context file `docs/context/generation-summary.md` is missing. Run Prompt 01-C first." (CTX-004)

No other user input is required. Do not ask the user to paste either document.

### Execution model

**In Plan mode (Execution Plan phase):**
1. Read all three context files listed above and `docs/vision/VISION.md`
2. Produce the full Execution Plan using the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md`
3. The Execution Plan must include: Context Loaded summary, Scope, Document Manifest with content outlines, Key UX Decisions, Assumptions, Execution Order
4. Present the plan and await explicit user confirmation (CTX-009)

**In Agent/Execute mode (creation phase):**
1. Execute Parts A, B, and C in sequence as specified
2. Run the UX Consistency Validation Skill after all documents are created
3. Fix all Critical and High findings
4. Write `docs/context/ux-generation-summary.md`
5. Update `docs/context/EXECUTION-STATE.md`
6. Present the UX Generation Summary

### Agent definitions — read both before proceeding

1. **UX Architect Agent** (`.cursor/agents/ux-architect.md`): leads Part A (UX Architecture); operates in UX system design mode
2. **Interaction Designer Agent** (`.cursor/agents/interaction-designer.md`): leads Part B (Interaction Design); operates in interaction flow design mode

Read both agent definitions before starting.

### Skill to invoke

- **UX Consistency Validation** (`.cursor/skills/ux-consistency-validation.md`): invoke in **design review mode** after Part C (or Part B if no design system), against all produced UX documents. Execute every check faithfully.

### Rules you must follow

**UX rules (always):**
- `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010)
- `.cursor/rules/ux/interaction-design.mdc` (IXD-001 through IXD-015)
- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001 through CTX-009)

**Design system rules (conditional — apply only if DS-001 gate in UX Brief is "Required"):**
- `.cursor/rules/design-system/design-system.mdc` (DS-002 through DS-015)

### Templates you must use

**UX templates (always):**
- **UX Principles**: `.cursor/templates/ux/UX-PRINCIPLES-TEMPLATE.md` → `docs/ux/UX-PRINCIPLES.md`
- **Interaction Design**: `.cursor/templates/ux/INTERACTION-DESIGN-TEMPLATE.md` → `docs/ux/INTERACTION-DESIGN.md`
- **Accessibility Requirements**: `.cursor/templates/ux/ACCESSIBILITY-REQUIREMENTS-TEMPLATE.md` → `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`

**Design system templates (conditional — web/dashboard systems only):**
- **Design System**: `.cursor/templates/design-system/DESIGN-SYSTEM-TEMPLATE.md` → `docs/design-system/DESIGN-SYSTEM.md`
- **Component Library**: `.cursor/templates/design-system/COMPONENT-LIBRARY-TEMPLATE.md` → `docs/design-system/COMPONENT-LIBRARY.md`

**Context output template:**
- **UX Generation Summary**: `.cursor/templates/context/UX-GENERATION-SUMMARY-TEMPLATE.md`

---

### What you must do (mandatory steps, in order)

#### Step 0 — Plan mode: read context and produce Execution Plan

Before creating any file, produce the full Execution Plan. Follow the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md`.

**Context Loaded** — summarize what you found:
- `docs/context/ux-brief.md`: execution path, DS-001 gate result, number of documents to create, flows to design, UX risks
- `docs/context/generation-summary.md`: domain list, architecture constraints that affect UX (latency, error propagation patterns)
- `docs/vision/VISION.md`: Vision Sections 3, 4, 8, 9 (needed to fill UX document templates)

**Scope** — document count (vary based on DS-001 gate), estimated duration.

**Document Manifest** — one row per document:
- `docs/ux/UX-PRINCIPLES.md` → content outline: user profiles (from Section 3), core UX principles derived from Section 9, interface-specific principles per execution path
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md` → content outline: compliance level (from Section 4 or WCAG 2.1 AA default), interface-specific requirements (keyboard navigation for web, color-safe output for CLI, structured errors for API)
- `docs/ux/INTERACTION-DESIGN.md` → content outline: information architecture for the confirmed execution path, [N] primary flows with happy and error paths, affordances and signifiers per interface type, feedback system with notification channels
- `docs/design-system/DESIGN-SYSTEM.md` _(if DS-001 Required)_ → content outline: color palette with semantic colors, type scale, spacing system, border and elevation tokens, aesthetic direction
- `docs/design-system/COMPONENT-LIBRARY.md` _(if DS-001 Required)_ → content outline: Button and Input components with all variants and states

**Key UX Decisions** — one entry per major decision:
- Information architecture choice for the primary interface (command hierarchy for CLI, navigation structure for Web)
- Accessibility compliance level
- Primary workflow to design first (most critical flow from the UX Brief)
- Notification and feedback patterns for async operations

**Assumptions** — any gaps in the UX Brief or Vision Document that require an assumption.

**Execution Order** — UX-PRINCIPLES.md first (establishes values that govern all other documents), then ACCESSIBILITY-REQUIREMENTS.md, then INTERACTION-DESIGN.md (depends on principles), then design system documents (depend on UX principles).

State: "Ready to create [N] documents. Execution path: [from UX Brief]. Confirm to proceed." Wait for confirmation (CTX-009).

---

#### Part A — UX Architecture
*(Adopt the UX Architect Agent's cognitive mode.)*

##### Step 1 — Extract UX requirements

From the Vision Document and UX Brief:
1. Read Vision Section 3 (Users and Actors): user types, technical levels, and primary goals
2. Read Vision Section 4 (Interface Preferences): interfaces, accessibility level, interaction style
3. Read Vision Section 8 (Workflows and Journeys): primary flows — these become the foundation of the information architecture
4. Read Vision Section 9 (Quality Priorities): UX-relevant quality priorities (performance, accessibility, usability)

Cross-reference with the UX risks from the UX Brief.

##### Step 2 — Define information architecture

Apply to the confirmed execution path from the UX Brief:

**For CLI systems:**
1. Define the top-level command hierarchy using noun-verb grammar (IXD-001)
2. Map each primary workflow from the UX Brief to commands
3. Define global options: `--version`, `--help`, `--output` format, verbosity flags

**For Web systems:**
1. Define the top-level navigation structure (maximum 7 items, per IXD-006)
2. Map each primary workflow from the UX Brief to a navigation section
3. Define page-level structure for the primary workflow entry points

**For API systems:**
1. Review endpoint resource naming from `docs/architecture/` against the user-task structure
2. Identify endpoints that need UX consideration: long operations, streaming, batch actions, destructive operations

##### Step 3 — Define accessibility requirements

1. Identify the compliance level from Vision Section 4, or default to WCAG 2.1 AA for web
2. Identify interface-specific requirements
3. Document any project-specific accessibility constraints from Vision Section 10

##### Step 4 — Create UX Architecture documents

1. Create `docs/ux/` directory if it does not exist
2. Create `docs/ux/UX-PRINCIPLES.md` using the UX Principles template
3. Create `docs/ux/ACCESSIBILITY-REQUIREMENTS.md` using the Accessibility Requirements template

---

#### Part B — Interaction Design
*(Switch to the Interaction Designer Agent's cognitive mode.)*

##### Step 5 — Design primary interaction flows

For each flow listed in the UX Brief as "Must" priority:

1. Map the **happy path** step by step: user action → system response → UI element or command output
2. Map the **primary error path**: user action or system state that triggers the error; system response; recovery option
3. Map **edge cases** for the most critical workflow: cancellation, concurrent use, timeout, empty state

##### Step 6 — Define affordances and signifiers

**For CLI:** output format conventions, exit code mapping per IXD-003, help text format.
**For Web:** interactive element states, state designs for all data views, confirmation pattern for destructive actions.

##### Step 7 — Define the feedback system

1. Map every major user action to a feedback response type: toast, inline message, modal, banner, redirect
2. Notification channels for async operations
3. Routing rules: when to use toast vs. inline vs. modal vs. banner

##### Step 8 — Define form interaction patterns (Web only)

If web is in the execution path: validation timing, error placement, required field indication, submit behavior.

##### Step 9 — Create Interaction Design document

Create `docs/ux/INTERACTION-DESIGN.md` using the Interaction Design template.

---

#### Part C — Design System Foundation
*(Conditional: apply only if DS-001 gate in UX Brief is "Required")*

##### Step 10 — Define design token system

1. **Color palette**: brand colors, semantic colors, neutral scale
2. **Type scale**: font families and sizes
3. **Spacing system**: base unit and scale
4. **Border and elevation tokens**

##### Step 11 — Create Design System and Component Library skeleton

1. Create `docs/design-system/DESIGN-SYSTEM.md` using the Design System template
2. Create `docs/design-system/COMPONENT-LIBRARY.md` using the Component Library template, with at minimum Button and Input components

---

#### Part D — Design Review and Context Outputs

##### Step 12 — Run UX Consistency Validation

Invoke the UX Consistency Validation Skill (`.cursor/skills/ux-consistency-validation.md`) in **design review mode** against all produced documents. Execute every check. Record all findings.

##### Step 13 — Fix Critical and High findings

For every Critical or High finding: identify the affected document, update it, verify the fix.

##### Step 14 — Write context outputs and present UX Generation Summary

1. Write `docs/context/ux-generation-summary.md` using `.cursor/templates/context/UX-GENERATION-SUMMARY-TEMPLATE.md`. Set `Status: Active`. Include the DS-001 gate result prominently — Prompt 01-F uses it to determine applicability.
2. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 2b — UX and Interaction Design (Complete)
   - `Last completed prompt`: 01-E — UX Generate and Validate
   - `Next prompt`: 01-F — Visual Direction and Image Prompts [if DS-001 gate Required] / 03 — Generate Implementation Docs [if Not Required]
   - `Context File Registry`: set `ux-brief.md` and `generation-summary.md` to `Delivered`; set `ux-generation-summary.md` to `Active` (CTX-006)
   - `Completed Phases`: add entry for 01-E completion with document count and validation verdict

3. Present the UX Generation Summary:

---

**UX Generation Summary**

**Interface Types in Scope** — [list with primary designation]

**Information Architecture** — [CLI: top-level commands / Web: navigation sections / API: resource naming review]

**Accessibility** — Compliance level: [WCAG 2.1 AA / other]; Interface-specific requirements: [list]

**Interaction Design** — Flows designed: [list]; Happy paths: [count]; Error paths: [count]; UI states defined: [list]; Feedback system: [channels]

**Design System** (if applicable) — Color tokens: [count]; Type scale: [levels]; Spacing: [values]; Components: [list]

**Design Review** — Verdict: [Pass / Issues found]; Critical findings addressed: [count]; High findings addressed: [count]

**Documents Created**
- `docs/ux/UX-PRINCIPLES.md`
- `docs/ux/INTERACTION-DESIGN.md`
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`
- `docs/design-system/DESIGN-SYSTEM.md` (if applicable)
- `docs/design-system/COMPONENT-LIBRARY.md` (if applicable)

**Next Steps**
- **If a design system was created** (DS-001 gate "Required"): proceed to **Prompt 01-F** (`.cursor/prompts/01f-visual-direction-and-image-prompts.md`) — no copy-paste needed
- **If no design system was created** (CLI-only or API-only): proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`) — no copy-paste needed

---

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/ux-generation-summary.md` | Complete UX Generation Summary with DS-001 gate result | After validation and fixes complete |
| `docs/context/EXECUTION-STATE.md` | Phase completion, next prompt routing, registry updates (ux-brief.md and generation-summary.md → Delivered; ux-generation-summary.md → Active) | After ux-generation-summary.md is written |

### Verification checklist (verify before completing this prompt)

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] `docs/context/ux-brief.md` confirmed present and Status: Active (CTX-004)
- [ ] `docs/context/generation-summary.md` confirmed present (CTX-004)
- [ ] Full Execution Plan produced in Plan mode with Document Manifest, Key UX Decisions, Assumptions, Execution Order (CTX-007, CTX-008)
- [ ] User confirmed the Execution Plan before any file was created (CTX-009)
- [ ] `docs/ux/UX-PRINCIPLES.md` created using UX Principles template
- [ ] `docs/ux/ACCESSIBILITY-REQUIREMENTS.md` created using Accessibility Requirements template
- [ ] Primary interaction flows designed: at minimum one happy path and one error path
- [ ] All required UI states designed: loading, empty, error, success
- [ ] Feedback system defined with notification channels
- [ ] `docs/ux/INTERACTION-DESIGN.md` created using Interaction Design template
- [ ] `docs/design-system/DESIGN-SYSTEM.md` created (if DS-001 gate Required)
- [ ] `docs/design-system/COMPONENT-LIBRARY.md` skeleton created with Button and Input (if applicable)
- [ ] UX Consistency Validation Skill invoked in design review mode; every check executed
- [ ] All Critical and High findings from design review addressed and verified
- [ ] `docs/context/ux-generation-summary.md` written with DS-001 gate result prominently included (Status: Active) (CTX-003)
- [ ] `docs/context/ux-brief.md` and `docs/context/generation-summary.md` status updated to Delivered (CTX-006)
- [ ] `docs/context/EXECUTION-STATE.md` updated with next prompt routing (CTX-002)
- [ ] User directed to next step with note that no copy-paste is needed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

