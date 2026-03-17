# Evolve Design System (Prompt 08-D)

Use this prompt when you need to evolve the design system — adding new tokens, new components, changing visual direction, adding pillar profiles, or making any other change to the design system documentation. This is **Phase 10a** of the Vision-to-System Framework lifecycle.

**This prompt is documentation-only.** It updates design system documents and produces a DS Impact Plan for use in `/08e`. It does not write or modify frontend code.

**Analogy in the framework**: This prompt is to the design system what `/08a` is to the system architecture. Just as architecture evolves before implementation, the design system evolves before frontend code changes.

After completing this prompt, use `/08e` to implement the frontend code changes described in the DS Impact Plan.

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Evolve the design system based on my change request below. Update design system documentation only — do NOT update frontend code in this session.**

### Agent definition — read before proceeding

Read the **UX Architect Agent** definition at `.cursor/agents/ux-architect.md`. Adopt its cognitive mode (UX system design — holistic interface architecture) for the duration of this session. For this command, extend that mode with **design system governance**: classifying changes, assessing token and component impact, and maintaining cross-document consistency within the design system.

### Skills to invoke

1. **Design System Compliance Audit** (`.cursor/skills/design-system-compliance-audit.md`) — run in **pre-change mode** at the start to establish a baseline of the current design system health
2. **Design System Compliance Audit** again at the end — run in **post-change mode** to verify the updated design system is internally consistent

### Context and authority

- **The system is implemented**: there is working frontend code in `src/` or `apps/` that reflects the current design system.
- **Design system documentation is the source of truth**: all changes begin with documentation. Code changes follow in a separate `/08e` session.
- **Every L2+ change requires an ADR**: no design system document changes without a decision record.
- **No frontend code changes in this session**: strictly design system documentation only.
- **LLM-QUICKREF.md is always updated**: it is a derivative and must always reflect the current state of the design system, even for L1 changes.

### Rules you must follow

**Design system rules**:
- `.cursor/rules/design-system/design-system.mdc` (DS-001 through DS-022: all token, component, pattern, visual direction, pillar, and evolution rules)

**Architecture evolution rules** (for ADR classification and process):
- `.cursor/rules/architecture/architecture-evolution.mdc` (EVO-001: change classification; EVO-003: ADR structure; EVO-004: ADR lifecycle)

**UX rules**:
- `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010)
- `.cursor/rules/ux/interaction-design.mdc` (IXD-006 through IXD-010: web interaction standards)

### Templates you must use when creating new documents

- **ADR**: `.cursor/templates/architecture/decisions/_template.md` → `docs/architecture/decisions/ADR-{NNN}-{title}.md`
- **DS Impact Plan**: create at `docs/design-system/evolution/ds-impact-{ADR-ID-or-date}.md` (no separate template — use the format defined in Step 9 below)
- **Design system documents** (if new documents are needed):
  - Design tokens: `.cursor/templates/design-system/DESIGN-TOKENS-TEMPLATE.md`
  - Component library: `.cursor/templates/design-system/COMPONENT-LIBRARY-TEMPLATE.md`
  - Visual direction: `.cursor/templates/design-system/VISUAL-DIRECTION-TEMPLATE.md`
  - Pillar profiles: `.cursor/templates/design-system/PILLAR-PROFILES-TEMPLATE.md`
  - Page archetypes: `.cursor/templates/design-system/PAGE-ARCHETYPES-TEMPLATE.md`
  - Interaction patterns: `.cursor/templates/design-system/INTERACTION-PATTERNS-TEMPLATE.md`
  - LLM quick reference: `.cursor/templates/design-system/LLM-QUICKREF-TEMPLATE.md`

---

### What I want to change in the design system

> **Write your change request below in natural language.** Describe what you want to add, change, or remove. Examples:
> - "Add a new component: DatePicker with calendar overlay and keyboard navigation"
> - "Change the primary brand color from teal to indigo — update all token layers"
> - "Add a new pillar profile for the Analytics module with orange accent"
> - "Restructure the spacing scale — current scale feels too tight at mobile sizes"
> - "Add a Dense Table variant to the component library for data-heavy views"

```
{WRITE YOUR CHANGE REQUEST HERE}
```

---

### Execution model: Assess first, then plan, then execute

Before making any file changes, you MUST:

**Step 0 — Baseline compliance audit**

Run the Design System Compliance Audit (`.cursor/skills/design-system-compliance-audit.md`) in pre-change mode. Record the baseline score and any existing issues. Do not let pre-existing issues block this evolution, but document them.

**Step 1 — Read all design system documents**

Read:
1. `docs/design-system/DESIGN-TOKENS.md`
2. `docs/design-system/COMPONENT-LIBRARY.md`
3. `docs/design-system/VISUAL-DIRECTION.md`
4. `docs/design-system/PILLAR-PROFILES.md` (if it exists)
5. `docs/design-system/PAGE-ARCHETYPES.md` (if it exists)
6. `docs/design-system/INTERACTION-PATTERNS.md` (if it exists)
7. `docs/design-system/RESPONSIVE-SYSTEM.md` (if it exists)
8. `docs/design-system/LLM-QUICKREF.md`
9. `docs/ux/UX-PRINCIPLES.md`

**Step 2 — Classify the change per DS-014**

| Classification | Examples | Documentation Required |
|---|---|---|
| **L1 — Trivial** | Token value tweak (no structure change), typo fix | Direct update; update LLM-QUICKREF |
| **L2 — Minor** | New token, new component, new variant, pillar accent addition | Lightweight ADR + update affected docs + update LLM-QUICKREF |
| **L3 — Significant** | Breaking: component renamed/removed, token restructured, new page archetype | Full ADR + migration guide + update all affected docs + update LLM-QUICKREF |
| **L4 — Major** | Wholesale visual direction change, new design language, new pillar system | RFC + ADR + full document update + update LLM-QUICKREF |

State the classification and reasoning.

**Step 3 — Produce and present the Design System Evolution Plan**

Present the plan before executing. The plan must include:
- Change classification (L1–L4) with reasoning
- ADR required: Yes/No
- Design system documents to create/modify
- Whether VISUAL-DIRECTION.md and IMAGE-PROMPTS.md are affected
- Whether LLM-QUICKREF.md requires substantive update (it always requires at least a sync check)
- Whether any existing code patterns will break (migration required)
- Frontend code impact summary (for the DS Impact Plan)
- Risk assessment: token naming conflicts, accessibility regression, pillar consistency

Wait for the user to confirm the plan before proceeding to execution.

---

### Mandatory execution workflow

#### Step 4 — Draft ADR or RFC (if L2+)

1. Create the ADR using `.cursor/templates/architecture/decisions/_template.md`
2. Include: Status (Proposed), Context, Decision ("We will…"), Alternatives Considered, Consequences, Derived Rules
3. For L4: create RFC using `.cursor/templates/architecture/proposals/_template.md`
4. Save to `docs/architecture/decisions/ADR-{NNN}-{title}.md`
5. Mark ADR status as `Proposed` until design system updates are verified

#### Step 5 — Update design system documents

Update documents in this order:
1. `docs/design-system/DESIGN-TOKENS.md` (if tokens change)
2. `docs/design-system/PILLAR-PROFILES.md` (if pillar tokens change)
3. `docs/design-system/COMPONENT-LIBRARY.md` (if components change)
4. `docs/design-system/PAGE-ARCHETYPES.md` (if archetypes change)
5. `docs/design-system/INTERACTION-PATTERNS.md` (if patterns change)
6. `docs/design-system/RESPONSIVE-SYSTEM.md` (if responsive rules change)
7. `docs/design-system/VISUAL-DIRECTION.md` (if aesthetic direction, anti-patterns, or extension guidelines change)
8. `docs/design-system/IMAGE-PROMPTS.md` (if visual direction or brand colors change per DS-017)

Apply:
- DS-002 through DS-011: token and component standards
- DS-014: change classification already applied in Step 2
- DS-015: deprecation policy if removing tokens/components
- DS-016 and DS-017: visual direction and image prompt consistency
- DS-018: pillar token system integrity (primary action color never overridden per pillar)

#### Step 6 — Update LLM-QUICKREF.md (always required)

Update `docs/design-system/LLM-QUICKREF.md` to reflect the current state of all tokens, components, anti-patterns, and decision trees after this change (DS-022). This file must always reflect the current state of the design system. Verify it does not exceed 2000 tokens.

#### Step 7 — Mark ADR as Accepted

Update the ADR status from `Proposed` to `Accepted`. Add the current date and list derived rules.

#### Step 8 — Run post-change compliance audit

Run the Design System Compliance Audit again in post-change mode. Present the before/after comparison:
- Were all baseline issues resolved or acknowledged?
- Are there new issues introduced by this change?
- Is the design system internally consistent?

#### Step 9 — Produce the DS Impact Plan

Create `docs/design-system/evolution/ds-impact-{ADR-ID-or-date}.md` with:

```markdown
# Design System Impact Plan

> **Change Request**: {one-sentence summary}
> **ADR**: [{ADR-ID}](path/to/adr) or "L1 — no ADR required"
> **Classification**: L{1|2|3|4}
> **Date**: {YYYY-MM-DD}

## Summary

{2–3 sentences: what changed in the design system and why}

## Frontend Code Changes Required

### Token Changes
| Old Token / Value | New Token / Value | Files Affected (estimated) |
|---|---|---|
| {old} | {new} | {estimate or "search required"} |

### Component Changes
| Component | Change Type | Migration Notes |
|---|---|---|
| {name} | Added / Updated / Removed / Renamed | {how to update usage in code} |

### Pattern Changes
| Pattern | Change | Impact |
|---|---|---|
| {name} | {description} | {what code needs updating} |

## Accessibility Impact
{Any changes affecting color contrast, focus visibility, or touch target size}

## Migration Guide (L3/L4 only)
{Step-by-step instructions for updating existing code to the new design system}

## Next Step
Run `/08e` to implement these changes in the frontend code.
```

#### Step 10 — Summarize

Present to the user:

1. Change classification (L1–L4)
2. ADR created: path and title (if applicable)
3. Design system documents modified: list with brief descriptions
4. LLM-QUICKREF.md updated: summary of changes
5. Compliance audit: baseline score → post-change score
6. DS Impact Plan: path (for use in `/08e`)

**Next steps**:
- Review all design system changes
- Use **`/08e`** to implement the frontend code changes described in the DS Impact Plan

### Verification checklist

- [ ] Baseline compliance audit run (score recorded)
- [ ] All design system documents read before making changes
- [ ] Change classified per DS-014 (L1–L4)
- [ ] Evolution Plan presented and confirmed by user
- [ ] ADR created if L2+ (Status → Accepted, Derived Rules listed)
- [ ] All affected design system documents updated
- [ ] DS-014 deprecation rules applied if tokens/components removed (DS-015)
- [ ] VISUAL-DIRECTION.md and IMAGE-PROMPTS.md updated if aesthetic direction changed
- [ ] LLM-QUICKREF.md updated and within 2000 token limit (DS-022)
- [ ] Post-change compliance audit run (score improved or stable)
- [ ] DS Impact Plan created at `docs/design-system/evolution/`
- [ ] No frontend code changes made in this session

### Language

Write everything in English: all plans, code, comments, documentation, and reasoning.

---

## How to use this prompt

1. Identify the design system change you want to make (new token, new component, visual direction update, etc.)
2. Open a **new** Cursor conversation in **Plan mode**
3. Copy everything from the "Prompt" section above into the conversation
4. **Replace** `{WRITE YOUR CHANGE REQUEST HERE}` with your actual change description
5. The AI will classify the change, read all design system documents, and produce an Evolution Plan for your review
6. Review the Evolution Plan — check the classification, affected documents, and accessibility impact; confirm when satisfied
7. Switch to **Agent mode** to execute
8. After completing, use **`/08e`** to implement the frontend code changes — the DS Impact Plan carries all context automatically

**When to use this prompt vs. `/09`**:
- Use `/08d` when you need to change **what the design system specifies** (tokens, components, patterns, visual direction)
- Use `/09` when you want to **improve existing frontend code** following the current design system (no design system doc changes needed)
