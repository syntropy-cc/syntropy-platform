# Phase 2: Architecture and UX Design

> **This file is a landing page.** The architecture and UX design phase has been refactored into five focused prompts. Use the individual prompts below instead of this file.

This is **Phase 2** of the Vision-to-System Framework. It consists of five sequential prompts that together produce the complete architecture, UX design, and design system foundation for the system.

---

## The Five-Prompt Sequence

```
Prompt 01-A          Prompt 01-B          Prompt 01-C
Architecture    →    Architecture    →    Architecture
Assess + Brief       Generate             Decisions +
(Plan mode only,     (Plan → Execute)     Validation
no files)                                 (Plan → Execute)
     │
     ↓ (if user-facing interface exists)

Prompt 01-D          Prompt 01-E
UX              →    UX
Assess + Brief       Generate +
(Plan mode only,     Validate
no files)            (Plan → Execute)
```

Each prompt must be run in a new Cursor conversation with the prior prompt's output included as context.

---

## Architecture Phase (Prompts 01-A, 01-B, 01-C)

### Prompt 01-A — Architecture: Assess and Brief
**File:** `.cursor/prompts/01a-assess-and-brief.md`

Evaluates the Vision Document quality, extracts and quotes key sections verbatim, analyzes domains and layer structure, and produces the **Architecture Brief** — a confirmed specification for all subsequent architecture generation. No files created.

**Run in:** Cursor's Plan mode (entirely read-only)
**Output:** Architecture Brief (text in conversation)
**Input required:** None

---

### Prompt 01-B — Architecture: Generate
**File:** `.cursor/prompts/01b-generate-architecture.md`

Generates all architecture documents and diagrams from the confirmed Architecture Brief: root architecture document, one domain document per domain, cross-cutting concern documents, platform documents, and all diagrams.

**Run in:** Plan mode to verify, then Agent mode to execute
**Output:** All files in `docs/architecture/` (excluding ADRs and changelog)
**Input required:** Architecture Brief from Prompt 01-A

---

### Prompt 01-C — Architecture: Decisions and Validation
**File:** `.cursor/prompts/01c-decisions-and-validation.md`

Creates all ADRs, initializes the architecture changelog, runs the Architecture Validation Skill, and produces the **Generation Summary**.

**Run in:** Plan mode to outline, then Agent mode to execute
**Output:** ADRs in `docs/architecture/decisions/`, changelog, Generation Summary
**Input required:** Architecture Brief (01-A) + file list (01-B)

---

## UX and Interaction Design Phase (Prompts 01-D, 01-E)

**Conditional:** Run only if the system exposes any user-facing interface (CLI, Web, Dashboard, Mobile). Pure internal libraries or API-only systems skip to Prompt 03.

### Prompt 01-D — UX and Interaction Design: Assess and Brief
**File:** `.cursor/prompts/01d-ux-assess-and-brief.md`

Identifies interface types in scope, applies the DS-001 design system gate, maps workflows to interfaces, identifies UX risks from the architecture, and produces the **UX Brief**. No files created.

**Run in:** Cursor's Plan mode (entirely read-only)
**Output:** UX Brief (text in conversation)
**Input required:** Generation Summary from Prompt 01-C

---

### Prompt 01-E — UX and Interaction Design: Generate and Validate
**File:** `.cursor/prompts/01e-ux-generate-and-validate.md`

Generates all UX and design system documents from the confirmed UX Brief: UX Principles, Accessibility Requirements, Interaction Design, and (if applicable) Design System and Component Library skeleton. Runs the UX Consistency Validation Skill and addresses all Critical and High findings.

**Run in:** Plan mode to verify, then Agent mode to execute
**Output:** All files in `docs/ux/` and `docs/design-system/`
**Input required:** UX Brief (01-D) + Generation Summary (01-C)

---

## How to Run This Phase

1. Open a **new** Cursor conversation
2. Open the first applicable prompt file
3. For Prompts 01-A and 01-D: run in **Plan mode** — they are analysis-only and produce no files
4. For Prompts 01-B, 01-C, and 01-E: start in Plan mode to verify inputs and list files, then switch to Agent mode to create them
5. Each prompt's output becomes the next prompt's required input — paste it at the top of the next conversation

## Prerequisites

- Vision Document exists at `docs/vision/VISION.md`
- Optionally, run **Prompt 00** (`.cursor/prompts/00-refine-vision.md`) first to assess and improve the Vision Document

## After This Phase

- Use **Prompt 02** (`.cursor/prompts/02-iterate-architecture.md`) to revise the architecture if needed
- Proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`) to generate implementation documentation
