# Execution State

> **Purpose**: Single index of current framework execution state. Every prompt reads this file first and updates it last.
> **Created by**: Prompt 01-A (first write)
> **Updated by**: Every prompt upon completion
> **Lifecycle**: Project-scoped — rolling-update pattern; never deleted
> **Last updated**: {YYYY-MM-DD} by Prompt {ID}

---

## Current Phase

| Field | Value |
|-------|-------|
| **Active phase** | {e.g., Phase 2 — Architecture Generation} |
| **Last completed prompt** | {e.g., 01-A — Assess and Brief} |
| **Next prompt** | {e.g., 01-B — Generate Architecture} |
| **Blocked on** | _(empty if execution is proceeding normally)_ |

---

## Context File Registry

| File | Status | Written by | Last updated |
|------|--------|------------|--------------|
| `docs/context/architecture-brief.md` | Not created / Active / Delivered | — | — |
| `docs/context/architecture-file-list.md` | Not created / Active / Delivered | — | — |
| `docs/context/generation-summary.md` | Not created / Active / Delivered | — | — |
| `docs/context/ux-brief.md` | Not created / Active / Delivered | — | — |
| `docs/context/ux-generation-summary.md` | Not created / Active / Delivered | — | — |

---

## Project Summary

{One-paragraph summary of the project being built. Written by Prompt 01-A. Updated only when the project scope changes significantly.}

---

## Completed Phases

> This section accumulates as the project progresses. Each completed phase is added here and never removed.

<!-- Example entry:
### Phase 0 — Vision Refinement
- Completed: {YYYY-MM-DD}
- Outcome: Vision Document quality: {verdict} ({N}/55)
- Quality report: `docs/vision/VISION-QUALITY-REPORT.md`
-->
