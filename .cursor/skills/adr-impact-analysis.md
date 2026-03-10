# ADR Impact Analysis Skill

## Skill Identity

| Property | Value |
|----------|-------|
| **Skill ID** | SKL-ADRIMP |
| **Location** | `.cursor/skills/adr-impact-analysis.md` |
| **Category** | Architecture Governance |
| **Invoked By** | Prompt 02 (`02-iterate-architecture.md`) for L2+ changes, Prompt 08a (`08a-evolve-architecture.md`) at the start of evolution, Evolution Coordinator Agent (`agents/evolution-coordinator.md`) |
| **Rules Governing This Skill** | `.cursor/rules/architecture/architecture-evolution.mdc` (EVO-001 through EVO-017), `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-006 through NAV-009) |
| **Produces** | ADR Impact Report (structured Markdown) |

## Purpose

When a new ADR is proposed or accepted, this skill analyzes its propagation effects across the system. It identifies:

- All architecture documents that reference the affected component, pattern, or technology
- All component records whose implementation plan may need updating
- All rule files (`.mdc`) that may need new rules or amendments
- All prompts and templates that may need updating due to the decision
- Source code components whose layer ownership, API contracts, or patterns are affected
- Other ADRs that may be superseded or become contradictory

This skill prevents **siloed ADR acceptance** — where a decision is recorded but its downstream effects are not propagated, leading to architecture-implementation drift.

---

## Prerequisites

| Input | Location | Required |
|-------|----------|----------|
| New or proposed ADR | `docs/architecture/decisions/ADR-*.md` | Required |
| Architecture root document | `docs/architecture/ARCHITECTURE.md` | Required |
| Domain architecture docs | `docs/architecture/domains/*/ARCHITECTURE.md` | Required |
| Existing ADR list | `docs/architecture/decisions/` | Required |
| Rule files | `.cursor/rules/**/*.mdc` | Required |
| Implementation Plan | `docs/implementation/IMPLEMENTATION-PLAN.md` | Required |
| Component records | `docs/implementation/components/*.md` | Optional (for impact on in-progress work) |

---

## Execution Steps

### Step 1 — Parse the ADR

Read the ADR under analysis. Extract:

- **ADR ID and title**
- **Status** (Proposed or Accepted)
- **Decision statement** (the "We will…" sentence)
- **Change classification level** (L1–L4) per EVO-001
- **Affected technologies, patterns, or components** (named explicitly in the ADR)
- **Alternatives rejected** (to understand what was NOT chosen)
- **Consequences** (positive, negative, neutral)

If the ADR has no explicit change classification, apply the EVO-001 decision tree and assign one, noting it as inferred.

### Step 2 — Build the impact surface map

For each item named in the ADR (components, patterns, technologies, data models, APIs):

1. Search the architecture documents for all references to that item.
2. Record the file, section heading, and a brief quote of the reference.
3. Classify the reference as:
   - **Owns**: The document is the authoritative source for this item.
   - **References**: The document depends on or mentions this item.
   - **Implements**: A component record or source file that implements this item.

Produce an internal map: `item → { owns: [...], references: [...], implements: [...] }`.

### Step 3 — Identify documents requiring updates

For each document in the impact surface map, evaluate whether the ADR decision requires the document to change:

| Document Type | Update Required If... |
|--------------|----------------------|
| Root `ARCHITECTURE.md` | ADR changes a system-wide principle, domain boundary, or technology standard |
| Domain `ARCHITECTURE.md` | ADR changes a pattern, component, or API within that domain |
| Other ADRs | ADR supersedes or contradicts an existing decision |
| Rule files (`.mdc`) | ADR establishes a new constraint, pattern, or convention that should be enforced |
| Component records | ADR changes the implementation approach for a registered component |
| Prompts | ADR changes how a workflow phase operates |
| Templates | ADR changes the structure of a generated artifact |
| Implementation Plan | ADR adds or removes work items |

For each document requiring an update, produce an entry in the impact report.

### Step 4 — Identify superseded or contradicted ADRs

Compare the new ADR against all existing ADRs. Flag any that:

- Make decisions about the same technology or pattern (potential contradiction)
- Are explicitly superseded by the new ADR
- Have consequences that are now invalidated

For each flagged ADR, recommend one of:
- **Supersede**: New ADR explicitly replaces this one (update old ADR status to Superseded)
- **Amend**: Old ADR needs a note about how the new decision modifies its scope
- **Compatible**: No conflict — document why they coexist without contradiction

### Step 5 — Assess implementation impact

For each component record in `docs/implementation/components/`:

1. Check whether the component is affected by the ADR decision.
2. If affected, determine the impact type:
   - **Breaking**: The component's existing implementation must be reworked
   - **Additive**: New work items must be added to the component
   - **Advisory**: No immediate change needed, but future work is constrained
3. Estimate the relative effort:
   - **Minimal** (XS–S): Terminology change, comment update, rename
   - **Moderate** (M): Pattern change in isolated files
   - **Significant** (L–XL): Restructuring of component internals or interfaces

### Step 6 — Check rule file coverage

For each rule file in `.cursor/rules/`:

1. Identify rules that reference the affected item or pattern.
2. Determine whether any rule needs to be created, updated, or deprecated.
3. Apply EVO-015: every accepted ADR should result in at least one rule update or creation.

### Step 7 — Produce the impact report

---

## Output Format

```markdown
# ADR Impact Analysis Report

> **Skill**: ADR Impact Analysis (SKL-ADRIMP)
> **Analysis Date**: {YYYY-MM-DD}
> **ADR Under Analysis**: [{ADR-ID}: {Title}](path/to/adr)
> **ADR Status**: {Proposed | Accepted}
> **Change Classification**: L{1|2|3|4} — {Rationale}

---

## Executive Summary

{2–3 sentences describing what the ADR decides and the overall scale of impact.}

**Impact Scale**: {Minimal | Moderate | Significant | Extensive}

| Impact Category | Count |
|----------------|-------|
| Architecture documents needing update | N |
| Component records affected | N |
| ADRs superseded or amended | N |
| Rule files needing update | N |
| Implementation work items to add | N |

---

## 1. Affected Architecture Documents

{For each document requiring update:}

### {Document Path}

- **Type of change**: {Owns / References / Implements}
- **Reason**: {Why this document is affected}
- **Required update**: {What specifically must change — section, diagram, table, etc.}
- **Priority**: {Must update before implementation | Should update | Optional}

---

## 2. Superseded or Contradicted ADRs

{If none: "No existing ADRs are superseded or contradicted."}

| ADR | Title | Relationship | Recommended Action |
|-----|-------|-------------|-------------------|
| ADR-XXX | … | Superseded | Update status to Superseded, add reference to this ADR |
| ADR-YYY | … | Contradicts | Amend ADR-YYY to note scope exclusion |

---

## 3. Component Records Requiring Updates

{If none: "No component records are directly affected."}

| Component | Component Name | Impact Type | Effort | Action Required |
|-----------|---------------|------------|--------|----------------|
| COMP-XXX | User Service | Breaking | Moderate | Update component record; add work item to rework auth pattern |
| COMP-YYY | Order Repository | Additive | Minimal | Add work item to adopt new query interface |

---

## 4. Rule File Updates Required

{If none: "No rule files require updates."}

| Rule File | Existing Rule | Action | Rationale |
|-----------|-------------|--------|-----------|
| `architecture/patterns.mdc` | PAT-004 | Update | Add new repository contract convention from this ADR |
| `architecture/constraints.mdc` | (none) | Create new rule | ADR introduces a new runtime constraint |

---

## 5. Implementation Plan Updates

{List of work items to add to the Implementation Plan if the ADR is accepted.}

{If none: "No new work items are required."}

| New Work Item | Component | Type | Estimated Size | Depends On |
|--------------|-----------|------|---------------|-----------|
| Update {Component} to use {new pattern} | COMP-XXX | Architecture Evolution | M | COMP-ZZZ (Done) |

---

## 6. Propagation Checklist

Use this checklist to ensure the ADR's effects are fully applied before closing the change.

- [ ] Architecture root document updated (if required)
- [ ] All affected domain docs updated
- [ ] Superseded ADRs marked with updated status
- [ ] Contradicted ADRs amended with scope notes
- [ ] Rule files updated or created
- [ ] Component records updated with new work items
- [ ] Implementation Plan updated
- [ ] ARCHITECTURE changelog entry added (EVO-011)
- [ ] New derived rules referenced in ADR (EVO-015)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| {e.g., Incomplete propagation leaves stale references} | Medium | High | Follow propagation checklist above |
| {e.g., Breaking change disrupts in-progress stages} | Low | High | Complete affected stages before accepting ADR |
```

---

## Verdict Criteria

| Scale | Condition |
|-------|-----------|
| **Minimal** | 0–1 documents needing update, no breaking component changes |
| **Moderate** | 2–5 documents needing update, advisory component changes only |
| **Significant** | 6+ documents or any breaking component changes |
| **Extensive** | Cross-domain impact, multiple breaking changes, or supersedes foundational ADRs |

---

## Integration Points

- **Prompt 02 (Iterate Architecture)**: Run this skill on any new ADR that is L2 or higher before marking the iteration complete. Present the impact report to the user before proceeding.
- **Prompt 08a (Evolve Architecture)**: Run this skill at the start of architecture evolution to understand the full blast radius before any documents are changed.
- **Evolution Coordinator Agent (AGT-EC)**: This agent leads multi-ADR evolutions and calls this skill for each new ADR in sequence to build a consolidated propagation plan.
