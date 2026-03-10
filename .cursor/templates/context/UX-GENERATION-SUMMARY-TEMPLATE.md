# UX Generation Summary

> **Purpose**: Complete summary of the UX and interaction design generation phase. Produced by Prompt 01-E. Used by Prompt 01-F to determine applicability and load design system context.
> **Created by**: Prompt 01-E — UX Generate and Validate
> **Consumed by**: Prompt 01-F — Visual Direction and Image Prompts
> **Status**: Active
> **Last updated**: {YYYY-MM-DD}

---

## Interface Types in Scope

| Interface | Primary / Secondary |
|-----------|---------------------|
| {type} | {P/S} |

---

## Design System Decision

| Field | Value |
|-------|-------|
| **DS-001 gate result** | Required / Not Required |
| **Reason** | {cite the interface type and DS-001 criterion} |

> **Note for Prompt 01-F**: If DS-001 gate result is "Not Required", Prompt 01-F is not applicable. State: "Phase 2b is complete. Proceed to Prompt 03."

---

## Information Architecture

{CLI: top-level commands with count / Web: navigation sections / API: resource naming review result}

---

## Accessibility

| Field | Value |
|-------|-------|
| **Compliance level** | WCAG 2.1 AA / other |
| **Interface-specific requirements** | {list} |

---

## Interaction Design

| Metric | Value |
|--------|-------|
| Flows designed | {list with names} |
| Happy paths designed | {count} |
| Error paths designed | {count} |
| UI states defined | {loading, empty, error, success — which apply} |
| Feedback system | {notification channels defined} |

---

## Design System

> Applicable only when DS-001 gate result is "Required".

| Metric | Value |
|--------|-------|
| Color tokens defined | {count} |
| Type scale defined | {levels} |
| Spacing scale defined | {values} |
| Components defined | {list} |

---

## Design Review

| Metric | Value |
|--------|-------|
| UX Consistency Validation verdict | Pass / Issues found |
| Critical findings addressed | {count, list} |
| High findings addressed | {count, list} |
| Medium/Low findings noted | {count} |

---

## Documents Created

- `docs/ux/UX-PRINCIPLES.md`
- `docs/ux/INTERACTION-DESIGN.md`
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`
- `docs/design-system/DESIGN-SYSTEM.md` _(if applicable)_
- `docs/design-system/COMPONENT-LIBRARY.md` _(if applicable)_
