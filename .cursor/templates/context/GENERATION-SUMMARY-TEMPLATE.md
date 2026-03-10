# Architecture Generation Summary

> **Purpose**: Complete summary of the architecture generation phase. Produced by Prompt 01-C after ADRs and validation are complete. Used by Prompts 01-D and 01-E to understand what was built and what routing decision was made.
> **Created by**: Prompt 01-C — Decisions and Validation
> **Consumed by**: Prompt 01-D (UX Assess and Brief), Prompt 01-E (UX Generate and Validate)
> **Status**: Active
> **Last updated**: {YYYY-MM-DD}

---

## Vision Quality

| Field | Value |
|-------|-------|
| **Verdict** | Ready / Needs Improvement / Insufficient |
| **Score** | {N}/55 |
| **Assumptions carried from gaps** | {list, or "none"} |

---

## Documents Created

| Category | Files |
|----------|-------|
| Root | `docs/architecture/ARCHITECTURE.md` |
| Domains | {list each domain document with path} |
| Cross-cutting | {list each concern document with path} |
| Platform | {list each platform document with path} |
| Diagrams | {diagram index + key shared files} |
| Decisions | {list each ADR with title} |
| Changelog | `docs/architecture/evolution/CHANGELOG.md` |
| **Total** | **{N} files** |

---

## Domains Identified

| Domain | Responsibility |
|--------|---------------|
| {name} | {one-line responsibility} |

---

## Diagrams Generated

| Metric | Value |
|--------|-------|
| **Total diagrams** | {N} |
| ERD diagrams | {N} |
| Component diagrams | {N} |
| Sequence diagrams | {N} |
| Context/system diagrams | {N} |
| Other | {N} |

---

## Assumptions Made

| Assumption | Location in docs |
|------------|-----------------|
| {description} | {file path and section} |

---

## Architecture Validation

| Field | Value |
|-------|-------|
| **Result** | Pass / Fail |
| **Critical issues** | {list, or "none"} |
| **High issues** | {list, or "none"} |

---

## Routing Decision

| Field | Value |
|-------|-------|
| **User-facing interfaces present** | Yes / No |
| **Interface types** | {list, or "none"} |
| **Next step** | Proceed to Prompt 01-D (UX design) / Proceed to Prompt 03 (implementation docs) |
