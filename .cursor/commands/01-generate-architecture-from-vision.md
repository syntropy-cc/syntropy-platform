> **This file is a landing page.** The architecture and UX design phase has been refactored into five focused prompts. Use the individual command files below instead of this file.

---

# Phase 2: Architecture and UX Design — Five-Prompt Sequence

The architecture and UX design phase (Phase 2) is executed through five sequential prompts. Each runs in a new Cursor conversation with the prior prompt's output as context.

## Architecture Phase

| Prompt | Command File | Mode | Input | Output |
|---|---|---|---|---|
| 01-A: Assess and Brief | `.cursor/commands/01a-assess-and-brief.md` | Plan mode only | None | Architecture Brief |
| 01-B: Generate | `.cursor/commands/01b-generate-architecture.md` | Plan → Agent | Architecture Brief | All docs in `docs/architecture/` |
| 01-C: Decisions + Validation | `.cursor/commands/01c-decisions-and-validation.md` | Plan → Agent | Brief + file list | ADRs, changelog, Generation Summary |

## UX and Interaction Design Phase (conditional)

Run only if the system has a user-facing interface. Skip to Prompt 03 if not.

| Prompt | Command File | Mode | Input | Output |
|---|---|---|---|---|
| 01-D: UX Assess and Brief | `.cursor/commands/01d-ux-assess-and-brief.md` | Plan mode only | Generation Summary | UX Brief |
| 01-E: UX Generate + Validate | `.cursor/commands/01e-ux-generate-and-validate.md` | Plan → Agent | UX Brief + Generation Summary | All docs in `docs/ux/` and `docs/design-system/` |

## How to use

1. Open a new Cursor conversation
2. For **01-A** and **01-D**: paste the command file content and run in Plan mode
3. For **01-B**, **01-C**, and **01-E**: paste the prior output at the top, then the command file content below it; start in Plan mode to verify inputs, then switch to Agent mode
