# Improve Frontend (Prompt 09)

Use this prompt to improve an existing frontend element — a page, component, layout, or interaction flow — without requiring a prior design system evolution. This is **Phase 11** of the Vision-to-System Framework lifecycle.

This prompt is standalone: it does not require `/08d` or any architecture change. You identify what to improve; the AI analyzes the current state, produces an Improvement Brief, awaits your confirmation, and implements.

**Analogy**: This prompt has no direct analogy in the backend framework. The closest concept is `/02` (iterate architecture) for the frontend, but more focused on quality and UX refinement of existing code rather than structural change.

**When to use this prompt vs. `/08d` → `/08e`**:
- Use `/09` when you want to improve existing frontend code that already exists (fix UX issues, correct design system violations, polish layout, improve interactions) — no design system documentation changes needed
- Use `/08d` → `/08e` when the design system itself must change to properly address the improvement (e.g., a new component is needed, a token is missing, visual direction needs updating)

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Improve the specified frontend element (page, component, layout, or flow) following the design system and UX principles. This command does NOT require prior design system or architecture evolution.**

### Agent definition — read before proceeding

Read the **Frontend Engineer Agent** definition at `.cursor/agents/frontend-engineer.md`. Adopt its cognitive mode (design-system-faithful implementation with UX quality focus) for the duration of this session. This command activates the agent's **improvement analysis mode**: analyze the current state first, then propose, then execute.

### Skills to invoke

1. **Design System Compliance Audit** (`.cursor/skills/design-system-compliance-audit.md`) — run in **analysis mode** during Step 2 to identify current violations in the target element
2. **Design System Compliance Audit** again in **verification mode** after implementation — confirm violations are resolved and no new ones were introduced

### Context and authority

- **Design system documentation governs all visual decisions**: `docs/design-system/LLM-QUICKREF.md` is the primary reference for all code decisions. When in doubt, consult it first.
- **UX principles govern all interaction decisions**: `docs/ux/UX-PRINCIPLES.md` and `docs/ux/INTERACTION-DESIGN.md` define what constitutes correct user experience.
- **This command is standalone**: it does not require a prior `/08d` or architecture evolution. The user identifies what to improve; the AI analyzes, proposes, and executes.
- **Do not modify design system documentation**: if the improvement reveals that the design system itself needs to change, note it but do not modify it in this session. The user should run `/08d` separately.
- **Do not modify architecture documents**: frontend improvements do not alter system architecture.

### Rules you must follow

**Design system rules** (the implementation authority):
- `.cursor/rules/design-system/design-system.mdc` (DS-001 through DS-022)
- `.cursor/rules/design-system/frontend-coding.mdc` (FE-001+: token usage, component structure, responsive patterns, anti-patterns)

**UX rules** (the UX quality authority):
- `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010: user goals, progressive disclosure, feedback, error prevention, consistency, accessibility)
- `.cursor/rules/ux/interaction-design.mdc` (IXD-006 through IXD-010: web navigation, forms, states, keyboard, motion)

**Implementation rules** (for code quality):
- `.cursor/rules/implementation/coding-standards.mdc` (CODE-001 through CODE-021)

### Templates you may need

- **Component record** (if updating implementation tracking): `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md`

---

### What I want to improve

> **Write the target element and improvement goal below.** Be as specific or as broad as you need. Examples:
> - "The home page — it feels heavy and the hierarchy is unclear"
> - "The DataTable component — lacks empty state, loading skeleton is missing"
> - "The onboarding flow (3 steps) — transitions between steps are abrupt and the progress indicator is unclear"
> - "The sidebar navigation — active state is too subtle and collapsed state on mobile is broken"
> - "The form validation feedback across all forms — errors appear too late and are inconsistently styled"

```
{DESCRIBE WHAT TO IMPROVE HERE}
```

---

### Execution model: Analyze first, then plan, then execute

This command follows a three-phase approach:

1. **Analysis phase** (read-only): Read the target element's current code and all relevant design system and UX documents. Identify what is working, what violates the design system, and what UX opportunities exist.
2. **Improvement Brief**: Produce a structured brief with diagnosis and proposed improvements. Present it to the user for review and confirmation.
3. **Execution phase**: After confirmation, implement the improvements and run the compliance audit.

Do not write any code before the user confirms the Improvement Brief.

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read the design system and UX reference documents

Before reading any code, load the reference documents that define what "correct" looks like:

1. `docs/design-system/LLM-QUICKREF.md` — primary token, component, and pattern reference
2. `docs/design-system/VISUAL-DIRECTION.md` — aesthetic archetype, anti-patterns, extension guidelines
3. `docs/design-system/COMPONENT-LIBRARY.md` — component specifications and all required states
4. `docs/design-system/INTERACTION-PATTERNS.md` (if it exists) — required interaction patterns
5. `docs/design-system/PAGE-ARCHETYPES.md` (if it exists) — page layout templates
6. `docs/ux/UX-PRINCIPLES.md` — user experience principles
7. `docs/ux/INTERACTION-DESIGN.md` (if it exists) — interaction flow specifications

#### Step 2 — Read the target element's current code

Read all files that make up the element described by the user:
- The page, component, or layout file(s)
- Any sub-components or related files
- Any CSS/style files specific to this element

Then run the Design System Compliance Audit in analysis mode on the target element:
- Identify token violations (hardcoded values, wrong font weights, raw px)
- Identify component violations (missing states, incorrect variants)
- Identify UX issues (missing feedback, inconsistent patterns, accessibility gaps)

#### Step 3 — Produce the Improvement Brief

The Improvement Brief is the execution plan for this command. It goes beyond a file manifest: it is a diagnosis of what is wrong and a proposal for what to fix.

Present the following to the user:

---

**Improvement Brief**

**Target Element**: {page / component / flow identified by the user}

**Current State Assessment**
- Design system compliance: {Pass / Warnings / Violations} — {N} issues found
- UX principle alignment: {list any violated principles with brief explanation}
- Accessibility status: {issues found or "No violations found"}

**Design System Violations** (if any)
| Issue | Location | Severity | Rule Violated |
|---|---|---|---|
| {description} | {file:line} | Critical / Major / Minor | {DS-XXX or FE-XXX} |

**UX Improvement Opportunities**
| Opportunity | Why | Expected Impact |
|---|---|---|
| {description} | {reference to principle or pattern} | {user experience improvement} |

**Proposed Improvements**
{For each proposed change: what, why, and how it aligns with the design system or UX principles. Be specific — reference tokens, components, states, and patterns by name.}

**File Manifest**
| File | Change Type | What Changes |
|---|---|---|
| {path} | Modify / Create | {specific changes} |

**Out of Scope** (issues noticed but not part of this improvement)
{List any design system gaps or architecture issues that would require `/08d` or `/08a` instead}

---

State: "This is the Improvement Brief. Review the proposed changes and confirm to proceed with implementation. After confirming, switch to Agent mode."

Wait for user confirmation before writing any code.

#### Step 4 — Implement the improvements

After confirmation, implement each proposed change in the order listed in the File Manifest:

**For design system violations**:
- Replace hardcoded values with semantic tokens per `frontend-coding.mdc`
- Add missing interactive states per DS-009
- Fix accessibility issues per DS-003 (color contrast, icon labels, focus rings)
- Apply correct responsive behavior per DS-020

**For UX improvements**:
- Implement missing feedback states (loading skeletons, empty states, error states per DS-010)
- Add or improve confirmation patterns for destructive actions (UX-004)
- Improve information hierarchy per the page archetype (DS-019)
- Implement progressive disclosure where appropriate (UX-002)
- Improve keyboard navigation and focus management (UX-006, IXD-007)

**For visual refinements**:
- Apply typography tokens correctly (DS-004) — heading levels, body, captions
- Align spacing to the spacing scale (DS-005) — no manual pixel values
- Ensure the visual result is consistent with the aesthetic archetype from VISUAL-DIRECTION.md

#### Step 5 — Run Design System Compliance Audit (verification)

Run the Design System Compliance Audit in verification mode on the modified files.

Report:
- **Issues resolved**: list what was fixed
- **Remaining issues**: any pre-existing issues in non-modified areas (not blocking this session)
- **New issues**: any violations introduced by the improvement (must be resolved before completing)

#### Step 6 — Session summary

Present to the user:

1. **Element improved**: name and path
2. **Design system violations resolved**: count and list
3. **UX improvements applied**: list with brief description of each
4. **Files modified**: complete list
5. **Compliance audit**: before → after comparison
6. **Design system gaps noted** (if any): issues that require `/08d` to properly address
7. **Recommended follow-up**: any related elements that would benefit from the same treatment

### Verification checklist

- [ ] LLM-QUICKREF.md and VISUAL-DIRECTION.md read before analyzing code
- [ ] COMPONENT-LIBRARY.md and UX-PRINCIPLES.md read before analyzing code
- [ ] Target element code read completely
- [ ] Pre-improvement compliance audit run (violations catalogued)
- [ ] Improvement Brief produced with diagnosis, opportunities, and file manifest
- [ ] User confirmed the Improvement Brief before code was written
- [ ] All proposed improvements implemented
- [ ] No hardcoded hex values, raw pixel values, or font weights > 500 in modified files (FE-001)
- [ ] All interactive states implemented for modified components (DS-009)
- [ ] Post-improvement compliance audit run and result reported
- [ ] No design system documentation files modified in this session
- [ ] No architecture documents modified in this session

### Language

Write everything in English: all code, comments, documentation, planning, and reasoning.

---

## How to use this prompt

1. Identify the frontend element you want to improve — be as specific as possible (file path, page name, component name)
2. Open a **new** Cursor conversation in **Plan mode** (for the Improvement Brief phase)
3. Copy everything from the "Prompt" section above into the conversation
4. **Replace** `{DESCRIBE WHAT TO IMPROVE HERE}` with your improvement description
5. The AI will read the design system and UX reference documents, analyze the current code, and produce an Improvement Brief
6. Review the Improvement Brief — check the diagnosis, proposed changes, and anything marked "Out of Scope"; confirm when satisfied
7. Switch to **Agent mode** to execute the implementation
8. After the compliance audit, review the before/after comparison and any "design system gaps noted" — if the gaps are significant, run `/08d` to address them properly

**Tips**:
- You can run this prompt repeatedly on different elements in separate conversations
- If the AI notes that a proper fix requires a design system change, use `/08d` first, then run `/08e` for the token/component updates, and then (if needed) `/09` for any remaining UX polish
- This prompt works best with a specific target ("the checkout flow" or "the user profile page") rather than a vague directive ("improve the frontend")
