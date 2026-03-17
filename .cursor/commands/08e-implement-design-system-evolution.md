**Implement the frontend code changes defined by the Design System Evolution. Read the DS Impact Plan automatically — no additional input required.**

> This command requires no additional user input. It reads the most recent DS Impact Plan from `docs/design-system/evolution/` to determine what code to update. Just run this command in a new Cursor conversation after completing `/08d`.

### Context and authority

- **DS Impact Plan is the implementation authority**: `docs/design-system/evolution/ds-impact-{id}.md` (produced by `/08d`) defines exactly what frontend code changes are required.
- **Design system documentation is the source of truth**: `docs/design-system/LLM-QUICKREF.md`, `docs/design-system/DESIGN-TOKENS.md`, and `docs/design-system/COMPONENT-LIBRARY.md` are the reference for all code decisions.
- **Do not modify design system documentation in this session**: the design system docs were updated in `/08d`. This session implements their reflection in code only.
- **Do not modify architecture documents**: design system changes are not architecture-level decisions unless explicitly noted in the DS Impact Plan's ADR.

### Agent definition — read before proceeding

Read the **Frontend Engineer Agent** definition at `.cursor/agents/frontend-engineer.md`. Adopt its cognitive mode (design-system-faithful implementation) for the duration of this session.

### Skills to invoke

1. **Design System Compliance Audit** (`.cursor/skills/design-system-compliance-audit.md`) — run **after implementation** to verify that all code changes correctly reflect the updated design system. Report any remaining non-compliant patterns.

### Rules you must follow

**Design system rules** (the implementation authority):
- `.cursor/rules/design-system/design-system.mdc` (DS-001 through DS-022)
- `.cursor/rules/design-system/frontend-coding.mdc` (FE-001+: token usage in code, component structure, responsive patterns)

**UX rules**:
- `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010)
- `.cursor/rules/ux/interaction-design.mdc` (IXD-006 through IXD-010: web interaction standards)

**Implementation rules** (for code quality):
- `.cursor/rules/implementation/coding-standards.mdc` (CODE-001 through CODE-021)

### Templates you may need

- **Component record** (if updating implementation records): `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md`

---

### Execution model: Plan first, then execute

Before making any code changes, you MUST first create a plan and present it to the user for review:

1. **Planning phase** (read-only): Read the DS Impact Plan and all referenced design system documents. Produce a structured plan that includes:
   - DS Impact Plan reference and change classification
   - Token changes: list of CSS variables / Tailwind classes to update with file estimates
   - Component changes: list of components to update with file paths
   - Pattern changes: list of interaction patterns to update
   - Complete file manifest: every file to create or modify
   - Test approach: what needs visual/functional verification
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute following the mandatory steps below

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read the DS Impact Plan

1. List all files in `docs/design-system/evolution/` and identify the most recent DS Impact Plan (by date or ADR ID)
2. Read that DS Impact Plan completely
3. Extract:
   - Token changes (old → new mappings)
   - Component changes (added / updated / removed / renamed)
   - Pattern changes
   - Migration guide (if L3/L4 change)
   - Accessibility impact

If no DS Impact Plan exists, halt and state: "No DS Impact Plan found in `docs/design-system/evolution/`. Run `/08d` first to evolve the design system and produce the impact plan."

#### Step 2 — Load design system context

Read:
1. `docs/design-system/LLM-QUICKREF.md` — primary reference for implementation decisions
2. `docs/design-system/DESIGN-TOKENS.md` — current token definitions after `/08d`
3. `docs/design-system/COMPONENT-LIBRARY.md` — current component specs after `/08d`
4. `docs/design-system/INTERACTION-PATTERNS.md` (if it exists and is relevant)
5. `docs/design-system/VISUAL-DIRECTION.md` — for aesthetic validation of any new UI elements

#### Step 3 — Build the implementation plan

Produce an ordered plan before writing any code:

1. Which token changes are required and which files they affect
2. Which component implementations need updating and in what order
3. Which patterns need updating
4. For each file: what specifically changes (CSS variable rename, component prop update, etc.)
5. Any migration steps for deprecated tokens/components (DS-015)
6. Estimated file count: modified files, new files

#### Step 4 — Implement the changes

For each change in the DS Impact Plan, in order:

**Token changes**:
- Replace old token references with new ones throughout all frontend files
- Verify no hardcoded hex values, font weights > 500, or raw pixel values remain per `frontend-coding.mdc`
- Update Tailwind configuration or CSS variables file if the token system changes structurally

**Component changes (additions)**:
- Create new components following the spec in `COMPONENT-LIBRARY.md`
- All interactive states must be implemented per DS-009 (default, hover, focus, active, disabled, loading, error, success)
- Apply responsive behavior following DS-020 and `RESPONSIVE-SYSTEM.md`

**Component changes (updates/renames/removals)**:
- Update all usages of the changed component across the codebase
- For removals: migrate all usages to the replacement component per the migration guide
- Add deprecation warnings in development mode per DS-015

**Pattern changes**:
- Update all instances of the changed interaction pattern
- Verify consistency: same pattern applied everywhere the trigger condition exists

#### Step 5 — Run Design System Compliance Audit

Run the Design System Compliance Audit (`.cursor/skills/design-system-compliance-audit.md`).

Report findings to the user:
- **Pass**: All DS Impact Plan changes implemented correctly
- **Warnings**: Non-critical issues found; list them for the user to decide
- **Fail**: Critical violations remain; do not mark this session complete until resolved

#### Step 6 — Session summary

Present to the user:

1. **DS Impact Plan implemented**: path and change classification
2. **Token changes applied**: count and list
3. **Components updated**: list with brief description
4. **Files modified**: complete list
5. **Compliance audit result**: Pass / Warnings / Fail
6. **Remaining issues**: any items not yet implemented or deferred

### Verification checklist

- [ ] DS Impact Plan read and all changes identified
- [ ] LLM-QUICKREF.md and DESIGN-TOKENS.md read for current token reference
- [ ] Implementation plan produced before writing code
- [ ] All token changes applied — no old token references remain
- [ ] No hardcoded hex values, raw pixel values, or font weights > 500 in modified files
- [ ] All component changes applied per component library spec
- [ ] All required interactive states implemented (DS-009)
- [ ] Migration guide applied for any removed/renamed tokens or components (DS-015)
- [ ] Design System Compliance Audit run and result reported
- [ ] No design system documentation files modified in this session

### Language

Write everything in English: all code, comments, documentation, planning, and reasoning.

---
