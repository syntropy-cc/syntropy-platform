# Architecture Validation Skill

## Skill Identity

| Property | Value |
|---|---|
| **Skill ID** | SKL-ARCHVAL |
| **Location** | `.cursor/skills/architecture-validation.md` |
| **Category** | Architecture Governance |
| **Invoked By** | Prompt 01 (end), Prompt 02 (end of each iteration), Prompt 03 (beginning), Prompt 08a (end), Architecture Compliance Auditor Agent, Evolution Coordinator Agent |
| **Rules Governing This Skill** | `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-001–NAV-014), `.cursor/rules/architecture/architecture-generation.mdc` (GEN-009) |

---

## Purpose

Validate that the architecture documentation tree is internally consistent, complete, and correctly traces to the Vision Document. Detect structural problems before they propagate to implementation.

This skill is a structural auditor, not a design critic — it checks facts (does this file exist? do these references resolve? does every domain trace to a vision capability?) not architectural quality judgments.

---

## Trigger Conditions

Invoke this skill when:
- Architecture generation (Prompt 01) is complete — before presenting the generation summary to the user
- Architecture iteration (Prompt 02) is complete — at the end of each iteration session
- Implementation documentation generation (Prompt 03) begins — to verify the architecture it will read from is valid
- Architecture evolution (Prompt 08a) is complete — to verify the evolved architecture
- The Architecture Compliance Auditor Agent is running a quality audit

---

## Input Contract

| Input | Location | Required | Notes |
|---|---|---|---|
| Root architecture document | `docs/architecture/ARCHITECTURE.md` | Required | Must exist; Document Map is validated against actual files |
| Vision Document | `docs/VISION.md` | Required | Used for vision traceability checks |
| Domain architecture documents | `docs/architecture/domains/*/ARCHITECTURE.md` | Required if domains exist | Each domain doc validated |
| Cross-cutting documents | `docs/architecture/cross-cutting/*/ARCHITECTURE.md` | If referenced | Each cross-cutting doc validated |
| Platform documents | `docs/architecture/platform/*/ARCHITECTURE.md` | If referenced | Each platform doc validated |
| ADRs | `docs/architecture/decisions/ADR-*.md` | If referenced | Each ADR validated for required sections |
| Diagram index | `docs/architecture/diagrams/README.md` | If exists | Validated against actual diagram files |
| Navigation rules | `.cursor/rules/architecture/architecture-navigation.mdc` | Required | Governs hierarchy and consistency rules |

---

## Execution Steps

### Step 1 — Read the root architecture document

1. Read `docs/architecture/ARCHITECTURE.md`
2. Extract the Document Map section — this is the list of all architecture documents that should exist
3. Extract the Domain Overview table — this lists all domains
4. Extract the Vision Traceability section — maps vision capabilities to domains

### Step 2 — Verify Document Map completeness

For each file listed in the Document Map of `docs/architecture/ARCHITECTURE.md`:

1. Check that the file exists at the stated path
2. Check that the file is not empty (placeholder content only)
3. Check that each domain file listed has the expected section structure (Business Capability, Component Architecture, Data Architecture sections)

Report:
- Missing files (listed in map but do not exist)
- Empty files (exist but contain only template placeholders)
- Undocumented files (exist but not listed in the Document Map)

### Step 3 — Verify vision traceability (bidirectional)

**Forward check** (Vision → Architecture):
1. Read all capabilities from `docs/VISION.md` Section 6 (Key Capabilities)
2. For each vision capability: verify it is referenced in at least one domain architecture document's Vision Traceability section
3. Report capabilities with no corresponding domain (architecture gap)

**Reverse check** (Architecture → Vision):
1. For each domain architecture document: read its Vision Traceability section
2. Verify that each cited vision capability actually exists in `docs/VISION.md`
3. Report domain references to non-existent vision capabilities (stale references)

### Step 4 — Verify domain architecture documents

For each domain architecture document:

1. Verify presence of required sections: Business Capability, Ubiquitous Language, Component Architecture, Data Architecture
2. Verify at least one diagram is referenced or embedded (GEN-004 requirement)
3. Verify Vision Traceability section exists and is not empty
4. Check for cross-references to other domains: verify the referenced domain documents exist
5. If the domain defines an API: verify API contract section is present

### Step 5 — Verify ADRs and cross-references

1. For each ADR referenced in any architecture document: verify the file exists
2. For each ADR file: verify it contains Status, Context, Decision, and Alternatives Considered sections
3. Check that ADR-001 exists (architecture style decision — required per GEN-009)
4. Verify Architecture Changelog exists at `docs/architecture/evolution/CHANGELOG.md`

### Step 6 — Run the DIAG-022 structural checklist on referenced diagrams

For each diagram referenced in any architecture document:

1. Verify the diagram file exists at the referenced path
2. Verify the diagram uses concrete names (not "Component A", "Service 1", "Database")
3. Verify the diagram has a title
4. Verify the diagram includes at least one data or artifact flow (not just a static box diagram)

Report diagrams failing any check.

### Step 7 — Compile the validation report

Produce a structured report:

```
## Architecture Validation Report

**Validation Date**: {date}
**Architecture Documents Validated**: {N}
**Overall Status**: PASS / FAIL / PASS WITH WARNINGS

### Document Map Completeness
- Missing files: {list or "None"}
- Undocumented files: {list or "None"}

### Vision Traceability
- Vision capabilities without domain coverage: {list or "None"}
- Stale domain references: {list or "None"}

### Domain Architecture Quality
- Domains missing required sections: {list or "None"}
- Domains missing diagrams: {list or "None"}
- Domains with unresolved cross-references: {list or "None"}

### ADR and Changelog Status
- ADR-001 exists: {Yes / No}
- Architecture Changelog exists: {Yes / No}
- ADRs with missing required sections: {list or "None"}

### Diagram Quality
- Diagrams with generic names: {list or "None"}
- Diagrams without data flows: {list or "None"}

### Summary
{N} critical failures, {N} warnings, {N} items passing
```

### Step 8 — Apply verdict action

**If critical failures exist** (missing files, missing vision coverage, absent ADR-001):
- Report failures prominently
- Block advancement to the next phase
- Provide specific instructions for resolving each failure

**If warnings only** (generic diagram names, missing optional sections):
- Present warnings without blocking
- Recommend addressing before implementation begins

**If all pass**:
- Confirm: "Architecture validation: PASS"
- List count of validated documents and diagrams

---

## Output Contract

| Output | Format | Notes |
|---|---|---|
| Validation report | Presented in conversation | Structured report with pass/fail per check |
| Phase gate decision | Pass / Fail / Pass with Warnings | Used by invoking prompt to decide whether to proceed |

---

## Failure Modes

| Failure | Response |
|---|---|
| `docs/architecture/ARCHITECTURE.md` does not exist | Halt; report "Root architecture document not found"; direct user to run Prompt 01 |
| Architecture exists but vision document does not | Run structural validation only; skip traceability checks; note that traceability cannot be verified |
| Very large architecture (15+ domains) | Process all; do not truncate validation |
| Domain document exists but is entirely template placeholders | Score it as empty; report as "empty domain document" |
