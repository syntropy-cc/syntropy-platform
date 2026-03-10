# UX Brief

> **Purpose**: Confirmed UX Brief produced by Prompt 01-D. Governs all work in Prompt 01-E.
> **Created by**: Prompt 01-D — UX Assess and Brief
> **Consumed by**: Prompt 01-E — UX Generate and Validate
> **Status**: Active
> **Last updated**: {YYYY-MM-DD}

---

## Interface Types in Scope

| Interface | Primary / Secondary | Users (from Section 3) | Justification from Section 4 |
|-----------|--------------------|-----------------------|------------------------------|
| {type} | {P/S} | {actor names} | {quote from Section 4} |

---

## Design System Decision

| Field | Value |
|-------|-------|
| **DS-001 gate result** | Required / Not Required |
| **Reason** | {cite the interface type and DS-001 criterion} |

---

## Confirmed Execution Path

{The specific combination — e.g., "CLI + REST API", "Web UI + REST API", "CLI only"}

---

## Documents to Generate

> Prompt 01-E will create these files.

- `docs/ux/UX-PRINCIPLES.md`
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`
- `docs/ux/INTERACTION-DESIGN.md`
- `docs/design-system/DESIGN-SYSTEM.md` _(only if DS-001 gate is Required)_
- `docs/design-system/COMPONENT-LIBRARY.md` _(only if DS-001 gate is Required)_

---

## Primary User Flows to Design

| Flow Name | Interface | Source (Section 8) | Priority |
|-----------|-----------|-------------------|----------|
| {name} | {type} | {workflow reference} | Must / Recommended |

---

## Key UX Decisions to Make in 01-E

- {Each decision that needs to be made, e.g., "Command noun hierarchy for CLI", "Navigation structure for Web"}

---

## UX Risks Identified

| Risk | Source | Mitigation |
|------|--------|------------|
| {description} | {domain or architecture pattern} | {proposed approach} |
