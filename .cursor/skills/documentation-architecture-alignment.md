# Documentation-Architecture Alignment Skill

## Skill Identity

| Property | Value |
|----------|-------|
| **Skill ID** | SKL-DOCAL |
| **Location** | `.cursor/skills/documentation-architecture-alignment.md` |
| **Category** | Documentation Quality |
| **Invoked By** | Prompt 07 (`07-generate-user-documentation.md`) before and after generation, Documentation Agent (`agents/documentation-agent.md`) |
| **Rules Governing This Skill** | `.cursor/rules/documentation/` (all rules), `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-004, NAV-005) |
| **Produces** | Documentation Alignment Report (structured Markdown) |

## Purpose

Verify that user-facing documentation accurately reflects the current state of the architecture and implementation. This skill detects:

- Documentation that describes components, features, or workflows that no longer exist in the architecture
- Architecture components or capabilities with no documentation coverage
- Terminology mismatches between documentation and architecture
- Tutorials or how-to guides that reference outdated APIs or workflows
- Reference documentation that contradicts the current API contracts
- Documentation structure that does not follow the Diataxis model (Tutorials, How-to, Reference, Explanation)

This skill runs in two modes:
1. **Pre-generation** (before Prompt 07 executes): Assess what documentation needs to be created based on architecture.
2. **Post-generation** (after Prompt 07 executes): Verify that generated documentation aligns with architecture.

---

## Prerequisites

| Input | Location | Required |
|-------|----------|----------|
| Architecture root document | `docs/architecture/ARCHITECTURE.md` | Required |
| Domain architecture docs | `docs/architecture/domains/*/ARCHITECTURE.md` | Required |
| Vision Document | `docs/vision/VISION.md` (or equivalent) | Required |
| Implementation Plan | `docs/implementation/IMPLEMENTATION-PLAN.md` | Required |
| User documentation | `docs/user/` (or documentation portal source) | Required for post-generation mode |
| Component records (for API details) | `docs/implementation/components/*.md` | Recommended |

---

## Execution Steps

### Step 1 — Determine operating mode

Check whether user documentation exists at the expected location:
- If `docs/user/` (or equivalent) is empty or absent → **Pre-generation mode**
- If documentation files exist → **Post-generation mode**

Report the mode at the start of output.

### Step 2 — Build the architecture content inventory

Read the architecture documents and extract every item that should be documentable:

| Item Type | Source | Documentation Need |
|-----------|--------|-------------------|
| Domain / bounded context | Root ARCHITECTURE.md | Explanation article |
| Component / service | Domain ARCHITECTURE.md | Reference article |
| Public API endpoint | Component spec or ADR | Reference article |
| Key workflow / use case | Architecture or Vision | Tutorial or how-to guide |
| Key concept / term | Vision Section 7 (Information and Concepts) | Explanation or glossary entry |
| CLI command | Component spec | Reference article |
| Configuration option | Component spec | Reference article |
| Integration point | Root or Domain ARCHITECTURE.md | How-to guide |

Produce an internal inventory: `item_id → { type, source_doc, documentation_need, current_doc_file }`.

### Step 3 — Map documentation to architecture (post-generation mode only)

For each documentation file under `docs/user/`:

1. Identify which architecture item(s) the file covers.
2. Classify the file by Diataxis quadrant:
   - **Tutorial**: Step-by-step learning-oriented guide
   - **How-to**: Goal-oriented practical instructions
   - **Reference**: Accurate description of facts (APIs, config, commands)
   - **Explanation**: Concept-oriented understanding
3. Flag files whose Diataxis classification is inconsistent with their content.

Produce a map: `doc_file → { diataxis_type, covered_items: [...] }`.

### Step 4 — Detect coverage gaps

Compare the architecture content inventory against the documentation map.

Flag items in the inventory that have no corresponding documentation file as **Undocumented**.

Apply the following minimum coverage expectations:

| Item Type | Minimum Documentation |
|-----------|-----------------------|
| Public API endpoint | One Reference article |
| Key workflow | One Tutorial OR one How-to guide |
| Core concept | One Explanation article |
| CLI command | One Reference entry (may be grouped) |
| Configuration option | One Reference entry (may be grouped) |
| Integration point | One How-to guide |

### Step 5 — Detect stale or phantom documentation

In post-generation mode: for each documentation file, check whether its covered architecture items still exist in the architecture documents.

Flag files that document items that:
- No longer appear in the architecture (deleted component, removed API) → **Phantom Documentation**
- Exist but have changed their signature, behavior, or location → **Stale Documentation**

For stale documentation, quote the conflict:
- Architecture says: `{current architecture statement}`
- Documentation says: `{conflicting doc statement}`

### Step 6 — Detect terminology mismatches

Extract the glossary of terms from the architecture documents (especially the Vision Document Section 7 and any GLOSSARY.md).

Scan documentation for uses of:
- Terms not in the glossary (potentially undocumented vocabulary)
- Synonyms used inconsistently (e.g., "job" vs "task" vs "pipeline step")
- Technical names that differ from the architecture's canonical names

Flag terminology mismatches with their location.

### Step 7 — Assess Diataxis structure compliance

Check the overall documentation structure against the Diataxis model:

1. Is there at least one Tutorial for each major user workflow?
2. Are How-to guides result-oriented (not just descriptive)?
3. Does Reference documentation avoid explanations (which belong in Explanation articles)?
4. Are Explanation articles conceptual (not step-by-step)?

Flag structural violations.

### Step 8 — Produce the alignment report

---

## Output Format

```markdown
# Documentation-Architecture Alignment Report

> **Skill**: Documentation-Architecture Alignment (SKL-DOCAL)
> **Report Date**: {YYYY-MM-DD}
> **Mode**: {Pre-generation | Post-generation}
> **Architecture Source**: {path to ARCHITECTURE.md}
> **Documentation Source**: {path to docs/user/ or "Not yet generated"}

---

## Executive Summary

| Category | Count |
|----------|-------|
| Architecture items requiring documentation | N |
| Undocumented items (coverage gap) | N |
| Phantom documentation files | N |
| Stale documentation conflicts | N |
| Terminology mismatches | N |
| Diataxis structure violations | N |

**Overall Alignment**: {ALIGNED / MINOR GAPS / SIGNIFICANT GAPS / MISALIGNED}

---

## 1. Architecture Content Inventory

> All items from architecture that require documentation coverage.

| Item ID | Item Name | Type | Source Doc | Documentation Need | Current Doc File |
|---------|-----------|------|------------|-------------------|-----------------|
| … | UserService | Component | domains/users/ARCH.md | Reference article | `user-service.md` ✅ |
| … | Create Order workflow | Workflow | Vision Section 8 | Tutorial | (none) ❌ |

**Summary**: {N} of {M} items have documentation coverage ({X}%).

---

## 2. Coverage Gaps (Undocumented Items)

> Architecture items with no documentation. These must be documented before release.

{If none: "All architecture items have documentation coverage."}

| Item | Type | Priority | Suggested Documentation |
|------|------|----------|------------------------|
| PaymentService | Component | High | Reference article: `payment-service.md` |
| Configure API keys | Integration | Medium | How-to guide: `configure-api-keys.md` |

---

## 3. Phantom Documentation

> Documentation files that describe items no longer present in the architecture.

{If none: "No phantom documentation found."}

| File | Describes | Issue | Action |
|------|-----------|-------|--------|
| `docs/user/legacy-auth.md` | Legacy auth flow | Removed in ADR-012 | Delete or archive |

---

## 4. Stale Documentation Conflicts

> Documentation that contradicts the current architecture.

{If none: "No stale documentation conflicts found."}

| File | Section | Architecture Says | Documentation Says | Severity |
|------|---------|-------------------|--------------------|----------|
| `docs/user/api-reference.md` | Create User endpoint | Returns `201 Created` | Claims returns `200 OK` | High |

---

## 5. Terminology Mismatches

{If none: "Terminology is consistent across documentation and architecture."}

| Documentation File | Term Used | Canonical Term | Location |
|-------------------|-----------|----------------|----------|
| `docs/user/getting-started.md` | "job" | "pipeline" | Line ~23 |

---

## 6. Diataxis Structure Issues

{If none: "Documentation structure follows Diataxis model correctly."}

| File | Classified As | Issue | Recommendation |
|------|--------------|-------|----------------|
| `docs/user/concepts.md` | Explanation | Contains step-by-step instructions | Move steps to a How-to guide |
| `docs/user/quickstart.md` | Tutorial | No clear learning objective stated | Add "By the end of this tutorial, you will…" |

---

## 7. Recommended Actions

### Pre-generation Mode — What to Document

{Ordered list of documentation to create, by priority.}

1. **{Item Name}** — {Type} — {Rationale}
   - Suggested file: `docs/user/{category}/{filename}.md`
   - Diataxis type: {Tutorial | How-to | Reference | Explanation}

### Post-generation Mode — What to Fix

#### Must Fix (before release)
1. {Action}

#### Should Fix (before next release)
1. {Action}

#### Consider
1. {Action}

---

## 8. Documentation Coverage Summary

| Domain / Component | Items | Documented | Coverage |
|-------------------|-------|-----------|---------|
| User Management | 4 | 4 | 100% ✅ |
| Order Processing | 6 | 3 | 50% ⚠️ |
| **Total** | **10** | **7** | **70%** |
```

---

## Verdict Criteria

| Verdict | Condition |
|---------|-----------|
| **ALIGNED** | ≥ 90% coverage, zero phantom docs, zero High stale conflicts |
| **MINOR GAPS** | 75–89% coverage, or 1–2 stale conflicts |
| **SIGNIFICANT GAPS** | 50–74% coverage, or 3+ stale conflicts |
| **MISALIGNED** | < 50% coverage, or phantom docs present, or fundamental terminology mismatch |

---

## Integration Points

- **Prompt 07 (Generate User Documentation) — Pre-generation**: Run in pre-generation mode to produce the content inventory and documentation plan before any writing occurs. Use the inventory to guide what documentation to generate.
- **Prompt 07 (Generate User Documentation) — Post-generation**: Run in post-generation mode after the documentation portal is populated. The report becomes the quality gate before user documentation is published.
- **Documentation Agent (AGT-DA)**: This agent runs this skill and uses its output to guide both generation priorities and post-generation quality verification.
- **Prompt 08c (Evolve User Documentation)**: Run in post-generation mode on existing documentation before evolution begins, to establish a baseline alignment score.
