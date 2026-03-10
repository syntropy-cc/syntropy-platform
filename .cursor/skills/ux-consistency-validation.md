# UX Consistency Validation Skill

## Skill Identity

| Property | Value |
|----------|-------|
| **Skill ID** | SKL-UXVAL |
| **Location** | `.cursor/skills/ux-consistency-validation.md` |
| **Category** | UX Quality |
| **Invoked By** | Prompt 01-E (`01e-ux-generate-and-validate.md`) for design review, Prompt 06 (`06-audit-quality.md`) for implementation audit, UX Architect Agent (AGT-UXA), Interaction Designer Agent (AGT-IXD) |
| **Rules Governing This Skill** | `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010), `.cursor/rules/ux/interaction-design.mdc` (IXD-001 through IXD-015), `.cursor/rules/design-system/design-system.mdc` (DS-001 through DS-015, conditional on web systems) |
| **Produces** | UX Audit Report (structured Markdown) |

## Purpose

Validate that the system's user-facing interfaces — CLI, Web, API — comply with the UX principles, interaction design standards, and (for web systems) design system conventions defined for the project.

This skill runs in two modes:

1. **Design review mode** (Prompt 01b): Evaluate UX and Interaction Design documents against rules before committing them. Catch problems in design before implementation begins.
2. **Implementation audit mode** (Prompt 06): Evaluate the implemented system against UX documents and rules. Catch deviations between design and implementation.

---

## Prerequisites

| Input | Location | Required |
|-------|----------|----------|
| UX Principles document | `docs/ux/UX-PRINCIPLES.md` | Required |
| Interaction Design document | `docs/ux/INTERACTION-DESIGN.md` | Required |
| Accessibility Requirements | `docs/ux/ACCESSIBILITY-REQUIREMENTS.md` | Required |
| Architecture documents | `docs/architecture/ARCHITECTURE.md` + domains | Required |
| Vision Document | `docs/VISION.md` | Required |
| Source code / CLI | `src/` (audit mode only) | Required in audit mode |
| Design System | `docs/design-system/DESIGN-SYSTEM.md` | Conditional (web systems) |

---

## Execution Steps

### Step 1 — Determine mode and interface types

1. Check for `docs/ux/UX-PRINCIPLES.md`:
   - If absent or empty → halt and report: UX Principles document must be created first using `UX-PRINCIPLES-TEMPLATE.md`
2. Check which interfaces the system exposes (Vision Document Section 4 / UX Principles Section 1.1)
3. Determine operating mode:
   - If Interaction Design document exists but implementation is incomplete → **design review mode**
   - If implementation is complete → **implementation audit mode**
4. Check whether design system rules apply (DS-001 applicability gate)

### Step 2 — Assess UX Principles compliance

For each of UX-001 through UX-008, evaluate:
- In **design review mode**: Does the UX Principles document and Interaction Design document demonstrate compliance?
- In **implementation audit mode**: Does the implemented interface demonstrate compliance?

Score each principle: 1 = Not met, 2 = Partially met, 3 = Fully met.

| Principle | Rule | Scoring Criteria |
|-----------|------|-----------------|
| User goals over capabilities | UX-001 | Naming, organization, and error messages centered on user perspective |
| Progressive disclosure | UX-002 | Complexity hidden by default; revealed on demand |
| Feedback | UX-003 | Every action has a response; progress shown for > 2s operations |
| Error prevention | UX-004 | Destructive actions confirmed; input validated early |
| Consistency | UX-005 | Same terms, same patterns throughout |
| Accessibility | UX-006 | Interface type requirements met |
| User context | UX-007 | Resumable flows; undo/cancel available |
| System type fit | UX-008 | Patterns appropriate for the interface type |

### Step 3 — Audit CLI compliance (if CLI interface exists)

Apply IXD-001 through IXD-005:

| Check | Rule | Evidence Required |
|-------|------|------------------|
| Noun-verb command grammar | IXD-001 | List 3–5 commands and verify grammar |
| Output formats defined for all scenarios | IXD-002 | Check help text, error messages, list output |
| Exit codes documented | IXD-003 | Check CLI reference documentation |
| Help text on every command | IXD-004 | Sample `--help` output for 3+ commands |
| Interactive prompts only in appropriate contexts | IXD-005 | Check whether prompts are used in piped contexts |

For each check: PASS / FAIL / NOT_TESTED (with justification).

### Step 4 — Audit web compliance (if web interface exists)

Apply IXD-006 through IXD-010:

| Check | Rule | Evidence Required |
|-------|------|------------------|
| Navigation ≤ 7 items | IXD-006 | Count top-level nav items |
| Forms have proper labels, validation, error placement | IXD-007 | Review 2–3 forms |
| All states designed | IXD-008 | Verify loading/empty/error/success for data views |
| Keyboard accessible | IXD-009 | Attempt primary flow via keyboard only |
| Responsive | IXD-010 | Check at 375px and 768px viewport |

### Step 5 — Audit API compliance (if API interface exists)

Apply IXD-011 through IXD-013:

| Check | Rule | Evidence Required |
|-------|------|------------------|
| Request/response conventions | IXD-011 | Check 3–5 endpoints |
| Error message quality | IXD-012 | Check error responses: are they human-readable and specific? |
| Pagination on list endpoints | IXD-013 | Check endpoints that return collections |

### Step 6 — Terminology consistency audit (IXD-014)

1. Extract all user-visible terms from:
   - CLI command names, argument names, output labels
   - Web UI: navigation labels, button text, form labels, headings
   - API: endpoint paths, field names, error codes
   - Documentation
2. Cross-reference against the Architecture glossary and Vision Document Section 7
3. Flag any term that appears in multiple forms (synonyms) or that differs from the canonical term

### Step 7 — State coverage verification (IXD-008)

In **audit mode only**: for each interactive component or view:
1. Identify all states that should exist per IXD-008
2. Check whether each state is implemented
3. Flag missing states

### Step 8 — Design system compliance (conditional: web systems with design system)

Apply DS-002 through DS-015:
1. Check for hardcoded values (hex colors, px spacing) in component definitions
2. Check that all interactive components have states defined
3. Check that required patterns (DS-010) are implemented
4. Check icon library consistency (DS-011)
5. Run contrast matrix validation for critical color pairs (DS-003)

### Step 9 — Compile the audit report

Use `.cursor/templates/ux/UX-AUDIT-REPORT-TEMPLATE.md` structure:
- One section per rule category (UX Principles, CLI, Web, API, Terminology, States, Design System)
- Finding table: Critical / High / Medium / Low
- Strengths section
- Recommended actions

---

## Scoring Model

### UX Principles Score (0–10)

Sum of scores for UX-001 through UX-008 (each 0–3, but weighted):
- UX-001, UX-003, UX-004, UX-005: Critical — failure counts double
- UX-002, UX-006, UX-007, UX-008: Standard

Map to 0–10 by scaling total.

### Interface Standards Score (0–10 per interface type)

Count PASS/FAIL/NOT_TESTED:
- Each PASS: +1
- Each FAIL: 0
- FAIL on items marked as Critical in rule files: -0.5 (can go below floor only to 0)

Average across applicable interface types.

### Overall Verdict

| Score | Condition | Verdict |
|-------|-----------|---------|
| ≥ 40/50 | No Critical findings | **COMPLIANT** |
| 30–39/50 | OR 1–2 Critical findings | **MINOR ISSUES** |
| 20–29/50 | OR 3–5 Critical findings | **SIGNIFICANT ISSUES** |
| < 20/50 | OR > 5 Critical findings | **NON-COMPLIANT** |

---

## Output Format

Produce the report using the structure in `.cursor/templates/ux/UX-AUDIT-REPORT-TEMPLATE.md`.

The report is saved to:
- **Design review mode**: `docs/ux/UX-DESIGN-REVIEW-{date}.md`
- **Implementation audit mode**: `docs/ux/UX-AUDIT-{date}.md`

---

## Integration Points

- **Prompt 01b (UX/Interaction Design)**: Run in design review mode after UX and Interaction Design documents are drafted. Present findings before finalizing the documents.
- **Prompt 06 (Quality Audit)**: Run in implementation audit mode as part of the combined quality audit. The UX Architect Agent (AGT-UXA) leads this execution and integrates results into the Quality Audit Report.
- **Prompt 08a (Evolve Architecture)**: When architecture evolution affects user-facing interfaces, run in audit mode post-evolution to verify that UX design is still consistent with the updated architecture.
