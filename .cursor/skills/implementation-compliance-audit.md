# Implementation Compliance Audit Skill

## Skill Identity

| Property | Value |
|----------|-------|
| **Skill ID** | SKL-IMPLCOMP |
| **Location** | `.cursor/skills/implementation-compliance-audit.md` |
| **Category** | Architecture Governance |
| **Invoked By** | Prompt 05 (`05-implement-stage.md`) post-session, Prompt 06 (`06-audit-quality.md`), Architecture Compliance Auditor Agent (`agents/architecture-compliance-auditor.md`), Implementation Engineer Agent (`agents/implementation-engineer.md`) |
| **Rules Governing This Skill** | `.cursor/rules/architecture/architecture.mdc` (ARCH-001 through ARCH-010), `.cursor/rules/architecture/patterns.mdc`, `.cursor/rules/architecture/conventions.mdc` |
| **Produces** | Implementation Compliance Report (structured Markdown) |

## Purpose

Verify that implemented source code files match their corresponding component records and architecture specifications. This skill detects:

- Source files that do not correspond to any documented component
- Implemented components that deviate from their architecture specification
- Layer boundary violations (e.g., domain layer importing infrastructure)
- Missing or incorrect dependency injection patterns
- Undocumented public APIs that contradict architecture contracts
- Patterns used in code that are prohibited by architecture rules

This skill is a post-implementation gate. Run it after each implementation stage (Prompt 05) and as part of the Quality Audit (Prompt 06).

---

## Prerequisites

Before executing, confirm the following inputs exist and are readable:

| Input | Location | Required |
|-------|----------|----------|
| Architecture root document | `docs/architecture/ARCHITECTURE.md` | Required |
| Domain/component architecture docs | `docs/architecture/domains/*/ARCHITECTURE.md` | Required |
| Component records | `docs/implementation/components/*.md` | Required |
| ADRs | `docs/architecture/decisions/ADR-*.md` | Required |
| Source code tree | `src/` (or equivalent) | Required |
| Implementation Plan | `docs/implementation/IMPLEMENTATION-PLAN.md` | Required |

If any required input is missing, halt and report the gap. Do not produce a partial audit.

---

## Execution Steps

### Step 1 — Build the component registry

Read all component records under `docs/implementation/components/`. For each record, extract:

- Component ID (e.g., `COMP-001`)
- Component name
- Architecture reference (link to architecture doc section)
- Status (`Done`, `In Progress`, etc.)
- List of owned source files (if documented)
- Layer assignment (Domain, Application, Infrastructure, Presentation)

Produce an internal registry: `component_id → { layer, arch_ref, files, status }`.

### Step 2 — Map source files to components

Walk the source tree (`src/` or equivalent). For each source file:

1. Check if the file path or module name maps to a component in the registry.
2. If no mapping exists, flag the file as **Unregistered File**.
3. If a mapping exists, record it as `file → component_id`.

Produce an internal map: `file_path → component_id | UNREGISTERED`.

### Step 3 — Audit layer boundary compliance (Rule ARCH-001, ARCH-002)

For each source file mapped to a component:

1. Identify its declared layer (Domain, Application, Infrastructure, Presentation).
2. Parse import/require statements.
3. For each import, determine the layer of the imported module.
4. Flag any import where a lower layer imports from a higher layer (e.g., Domain importing Infrastructure).
5. Flag any direct import of an infrastructure implementation where an interface/protocol should be used instead (Rule ARCH-002).

Severity:
- Domain → Infrastructure import: **Critical**
- Application → Presentation import: **High**
- Skipping interface in favor of concrete class: **High**

### Step 4 — Audit dependency injection compliance (Rule PAT-001, CODE-016)

For each class or service in the source:

1. Check whether external dependencies are received via constructor or factory injection.
2. Flag any class that instantiates its own dependencies directly (e.g., `self.repo = PostgresRepo()`).
3. Flag any use of global variables or singletons for mutable state (Rule PAT-003).

Severity:
- Hard-coded dependency instantiation: **High**
- Singleton misuse: **Medium**

### Step 5 — Audit API contract compliance (Rule ARCH-004)

For each public API surface documented in architecture:

1. Locate the implementing code.
2. Compare the function/method signature against the architecture specification.
3. Flag mismatches in:
   - Parameter names or types
   - Return types
   - Exception contracts (raised errors)
4. Flag any public function not mentioned in architecture (undocumented public API).

Severity:
- Signature mismatch: **High**
- Undocumented public API: **Medium**

### Step 6 — Audit prohibited patterns (Rule PAT-010, CODE-018)

Scan the source for prohibited patterns:

| Pattern | Detection Signal | Severity |
|---------|-----------------|----------|
| God Object | Class with > 500 lines or > 15 public methods | High |
| Magic numbers | Unassigned numeric literals in logic | Medium |
| String typing | String literals used as type discriminators in conditionals | Medium |
| Deep nesting | Nesting depth > 3 in function body | Medium |
| Mutable default argument | `def f(x=[])` or equivalent | High |
| Wildcard import | `from x import *` | Medium |

### Step 7 — Check traceability markers

For each source file:

1. Verify that traceability markers exist (e.g., `# Architecture: COMP-XXX` comment or equivalent convention for the project language).
2. If a file belongs to a registered component but has no traceability marker, flag it as **Missing Traceability**.

Severity: **Low** (informational).

### Step 8 — Compile the compliance report

Structure the report using the sections below. Count findings by severity.

---

## Output Format

```markdown
# Implementation Compliance Audit Report

> **Generated By**: Implementation Compliance Audit Skill (SKL-IMPLCOMP)
> **Audit Date**: {YYYY-MM-DD}
> **Scope**: {stage name or "full system"}
> **Source Tree Root**: {path}

---

## Executive Summary

| Finding Category | Critical | High | Medium | Low |
|-----------------|----------|------|--------|-----|
| Unregistered files | N | — | — | — |
| Layer boundary violations | N | N | — | — |
| Dependency injection violations | — | N | N | — |
| API contract mismatches | — | N | N | — |
| Prohibited patterns | — | N | N | — |
| Missing traceability | — | — | — | N |
| **Total** | **N** | **N** | **N** | **N** |

**Overall Verdict**: {COMPLIANT / MINOR VIOLATIONS / MAJOR VIOLATIONS / CRITICAL VIOLATIONS}

---

## 1. Unregistered Files

> Files present in the source tree with no corresponding component record.

{If none: "No unregistered files found."}

| File Path | Likely Component | Action Required |
|-----------|-----------------|----------------|
| `src/...` | COMP-XXX (guess) | Create component record or remove file |

---

## 2. Layer Boundary Violations

> Imports that violate the strict downward dependency rule (ARCH-001, ARCH-002).

{If none: "No layer boundary violations found."}

| File | Layer | Imports | Imported Layer | Violation | Severity |
|------|-------|---------|----------------|-----------|----------|
| `src/domain/user.py` | Domain | `src/infra/db.py` | Infrastructure | Domain → Infra | Critical |

---

## 3. Dependency Injection Violations

> Classes that create their own dependencies instead of receiving them.

{If none: "No dependency injection violations found."}

| File | Class/Function | Violation Description | Severity |
|------|---------------|----------------------|----------|

---

## 4. API Contract Mismatches

> Public API surfaces that differ from their architecture specification.

{If none: "No API contract mismatches found."}

| File | Function/Method | Architecture Spec | Actual Implementation | Severity |
|------|----------------|-------------------|-----------------------|----------|

---

## 5. Prohibited Patterns

> Anti-patterns flagged by architecture rules.

{If none: "No prohibited patterns found."}

| File | Line (approx.) | Pattern | Rule Reference | Severity |
|------|---------------|---------|----------------|----------|

---

## 6. Missing Traceability

> Source files without traceability markers linking them to architecture components.

{If none: "All source files have traceability markers."}

| File | Expected Component | Action |
|------|--------------------|--------|
| `src/...` | COMP-XXX | Add `# Architecture: COMP-XXX` comment |

---

## 7. Recommended Actions

### Must Fix (Critical + High)

{Ordered list of required actions before the system can be considered architecturally compliant.}

1. {Action}
2. {Action}

### Should Fix (Medium)

{Ordered list of recommended improvements.}

### Consider (Low)

{Optional improvements for long-term maintainability.}

---

## 8. Component Coverage Summary

| Component | Layer | Files Mapped | Traceability | Status |
|-----------|-------|-------------|-------------|--------|
| COMP-001 | Domain | 3 | ✅ | Clean |
| COMP-002 | Application | 2 | ⚠️ Missing | 1 violation |
```

---

## Verdict Criteria

| Verdict | Condition |
|---------|-----------|
| **COMPLIANT** | Zero Critical findings, zero High findings |
| **MINOR VIOLATIONS** | Zero Critical, one or more High, all Medium or lower elsewhere |
| **MAJOR VIOLATIONS** | One or more Critical findings OR five or more High findings |
| **CRITICAL VIOLATIONS** | Three or more Critical findings or fundamental layer breakdown detected |

A verdict of **MAJOR VIOLATIONS** or **CRITICAL VIOLATIONS** must block release and be escalated.

---

## Integration Points

- **After Prompt 05**: Run this skill on the just-completed stage. Present summary to the user. If Major or Critical, halt further implementation until resolved.
- **During Prompt 06 (Quality Audit)**: Run this skill on the full system. The Architecture Compliance Auditor Agent (AGT-ACA) leads this execution and integrates results into the combined audit report.
- **During Prompt 08a (Evolve Architecture)**: Run this skill before architecture evolution begins to establish a baseline compliance state. Any existing violations should be noted in the evolution plan.
