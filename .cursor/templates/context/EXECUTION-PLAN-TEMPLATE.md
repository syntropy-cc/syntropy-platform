# Execution Plan: Prompt {ID} — {Name}

> **Template for**: Standard Plan mode output produced by all execute prompts (Type B and C).
> **Usage**: Fill this structure when in Plan mode. Present it to the user. Wait for confirmation. Do not create any file until the user confirms.
> **Rule reference**: CTX-007, CTX-008, CTX-009 in `.cursor/rules/framework/context-management.mdc`

---

## Context Loaded

| File or document | Key findings |
|-----------------|-------------|
| `docs/context/{file}` | {one-sentence summary of what was found — domain count, key decisions, constraints} |
| `docs/vision/VISION.md` | {relevant sections read and what they contain} |
| `docs/architecture/{file}` | {relevant content found} |

---

## Scope

| Metric | Value |
|--------|-------|
| **Files to create** | {N} |
| **Files to modify** | {N} |
| **Estimated Agent mode duration** | Brief (< 5 files) / Moderate (5–15 files) / Extensive (> 15 files) |

---

## File Manifest

> Every file to be created or significantly modified. Each row must have a content outline — not just the path.

| # | Path | Template used | Content outline (what will go in each section) |
|---|------|---------------|-----------------------------------------------|
| 1 | `{path}` | `{template path or "none"}` | {1-2 sentences: key sections and what they will contain, key decisions embedded} |
| 2 | `{path}` | `{template path or "none"}` | {1-2 sentences} |

---

## Key Decisions

> Decisions that will be made during execution, with preliminary conclusions based on inputs already loaded. The user should review these and raise any disagreements before confirming.

- **{Decision 1}**: {what will be decided} → Preliminary conclusion: {based on inputs, the decision will be X because Y}
- **{Decision 2}**: {what will be decided} → Preliminary conclusion: {…}

---

## Assumptions

> Gaps in the input context that require an assumption to proceed. If any assumption here is wrong, the user should say so before confirming.

- **{Assumption 1}**: {what is assumed; why; what to do if this is wrong}
- _{none — if all inputs are complete}_

---

## Execution Order

> The order in which files will be created, with dependency reasoning.

1. {First file or task} — {reason: foundation for all others / no dependencies}
2. {Second file or task} — {reason: depends on #1}
3. {Third file or task} — {reason: can run after #2}

---

## Risks and Attention Items

> Anything the user should review carefully before confirming. Empty if no concerns.

- **{Risk or attention item}**: {what it is and why it matters}
- _{none — if no risks identified}_

---

**Ready to execute. Confirm to switch to Agent mode.**

> After confirmation, this prompt will create all files listed in the File Manifest above, then write its outputs to the appropriate context files in `docs/context/`.
