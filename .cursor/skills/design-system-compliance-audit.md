# Design System Compliance Audit Skill

## Skill Identity

| Property | Value |
|----------|-------|
| **Skill ID** | SKL-DSCOMP |
| **Location** | `.cursor/skills/design-system-compliance-audit.md` |
| **Category** | Design System Governance |
| **Invoked By** | Command `/08d` (`08d-evolve-design-system.md`) in pre/post-change modes; Command `/08e` (`08e-implement-design-system-evolution.md`) post-implementation; Command `/09` (`09-improve-frontend.md`) in analysis and verification modes; Command `/06` (`06-audit-quality.md`) for overall quality audit |
| **Rules Governing This Skill** | `.cursor/rules/design-system/design-system.mdc` (DS-001 through DS-022), `.cursor/rules/design-system/frontend-coding.mdc` (FE-001+), `.cursor/rules/ux/ux-principles.mdc` (UX-001 through UX-010) |
| **Produces** | Design System Compliance Report (structured Markdown) |

## Purpose

This skill audits frontend code against the design system documentation to verify that:

1. **Token usage is correct** — no hardcoded visual values; all colors, spacing, typography, and radii reference design tokens
2. **Component usage is correct** — components from the library are used as specified, with all required states
3. **Interaction patterns are followed** — standard patterns (loading, error, empty, confirmation) are applied consistently
4. **Accessibility standards are met** — WCAG 2.1 AA requirements satisfied in the implementation
5. **Design system documentation is internally consistent** — (when invoked in documentation audit mode) no contradictions between DS documents

This skill runs in four modes depending on the invoking command:

| Mode | Invoked In | What It Checks |
|---|---|---|
| **Pre-change (documentation)** | `/08d` start | Whether the current design system docs are internally consistent before the change |
| **Post-change (documentation)** | `/08d` end | Whether the updated design system docs are internally consistent after the change |
| **Analysis** | `/09` start | Whether the target element's code violates the design system |
| **Verification** | `/08e` end, `/09` end | Whether the modified code correctly reflects the design system |

---

## Prerequisites

| Input | Location | Required |
|-------|----------|----------|
| Design system documents | `docs/design-system/*.md` | Required |
| LLM Quick Reference | `docs/design-system/LLM-QUICKREF.md` | Required |
| Frontend code under audit | `src/` or `apps/` | Required for code modes |
| UX principles | `docs/ux/UX-PRINCIPLES.md` | Required |
| Interaction design | `docs/ux/INTERACTION-DESIGN.md` | Optional |

---

## Execution Steps

### Step 1 — Determine audit mode and scope

Identify the mode from the invoking context:
- **Documentation mode** (pre/post-change): scope is `docs/design-system/` documents only
- **Code analysis/verification mode**: scope is the specified frontend files

For code mode, identify the specific files to audit (the target element in `/09`, or all files modified in `/08e`).

### Step 2 — Load the design system reference

Read:
1. `docs/design-system/LLM-QUICKREF.md` — extract:
   - All CSS variable names for colors, spacing, typography, and radii
   - All component names and their documented variants
   - Anti-patterns list
   - Decision tree
2. `docs/design-system/DESIGN-TOKENS.md` — for detailed token definitions
3. `docs/design-system/COMPONENT-LIBRARY.md` — for component specs and all required states
4. `docs/design-system/VISUAL-DIRECTION.md` — for aesthetic archetype and anti-patterns

### Step 3 — Audit: Token compliance

For each file in scope, check:

**Color tokens**:
- [ ] No hardcoded hex values (`#RRGGBB`, `rgb()`, `hsl()`)
- [ ] No hardcoded color names (`red`, `blue`, `gray`)
- [ ] All color references use CSS variables from the design system token system
- [ ] No color contrast violations (WCAG 2.1 AA: 4.5:1 for body text, 3:1 for large text and interactive)

**Typography tokens**:
- [ ] Font families reference design system font stack
- [ ] No font weight other than 400 (regular) and 500 (medium) anywhere
- [ ] Font sizes reference design system type scale tokens
- [ ] Line heights and letter spacings reference design system values

**Spacing tokens**:
- [ ] No raw pixel values for margin/padding/gap that do not match the spacing scale
- [ ] All spacing references align to `--space-{N}` tokens or their Tailwind equivalents
- [ ] No arbitrary spacing classes (e.g., `p-[13px]`)

**Other visual tokens**:
- [ ] Border radii reference design system radius tokens
- [ ] Box shadows reference design system elevation tokens
- [ ] No glass morphism (`backdrop-filter: blur`, `background: rgba(..., 0.x)` without explicit DS approval)
- [ ] No gradients not defined in the design system

### Step 4 — Audit: Component compliance

For each component in scope, check:

**State coverage per DS-009**:
- [ ] Default state implemented
- [ ] Hover state with visible change
- [ ] Focus state with visible focus ring (min 2px, 3:1 contrast)
- [ ] Active/pressed state
- [ ] Disabled state (`aria-disabled`, visually distinct, not just `opacity: 0.5`)
- [ ] Loading state (skeleton matching content shape, prevents re-interaction)
- [ ] Error state (color + icon + text, not just color alone per DS-003)
- [ ] Success state (where applicable)
- [ ] Selected state using `--bg-selected` token (where applicable)

**Component usage**:
- [ ] Components from the library are used according to their specification
- [ ] No custom implementations of components that exist in the library
- [ ] Component variants match documented variants (no undocumented variants)
- [ ] Props and parameters match documented interface

### Step 5 — Audit: Interaction pattern compliance

Check for required patterns per DS-010:

- [ ] Form validation is present on all forms with user input — and triggers at the right time
- [ ] Loading state present for all async operations visible to the user
- [ ] Empty state present for all lists and data views that can be empty
- [ ] Error state present for any page, component, or form that can fail
- [ ] Confirmation dialog present for destructive or irreversible actions
- [ ] Notification/toast present for system-generated feedback
- [ ] Pagination present for lists exceeding 25 items
- [ ] Search and filter present for lists with > 10 expected items

### Step 6 — Audit: Accessibility compliance

- [ ] All images have alt text (or `aria-hidden="true"` if decorative)
- [ ] All interactive elements have accessible names
- [ ] Icons used as standalone interactive elements have `aria-label` or visually-hidden text
- [ ] Focus order follows visual reading order
- [ ] No information communicated by color alone (icon + text always accompanies color-coded states per DS-003)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Touch targets are at least 44×44px on mobile (DS-020)

### Step 7 — Documentation audit (documentation mode only)

For pre-change and post-change documentation audits, check the design system documents for internal consistency:

- [ ] `DESIGN-TOKENS.md` defines all three token layers (primitive, semantic, pillar)
- [ ] `LLM-QUICKREF.md` reflects the current token values from `DESIGN-TOKENS.md`
- [ ] `COMPONENT-LIBRARY.md` references only tokens that exist in `DESIGN-TOKENS.md`
- [ ] `VISUAL-DIRECTION.md` Anti-Patterns section contains ≥ 5 specific items
- [ ] `PILLAR-PROFILES.md` defines all pillars referenced in `DESIGN-TOKENS.md` (if pillar system in use)
- [ ] No contradiction between documents (e.g., component spec says use `--color-accent` but token does not exist)
- [ ] `IMAGE-PROMPTS.md` Base Style Specification is consistent with current palette in `DESIGN-TOKENS.md` (DS-017)

### Step 8 — Produce the compliance report

---

## Output Format

```markdown
# Design System Compliance Report

> **Skill**: Design System Compliance Audit (SKL-DSCOMP)
> **Audit Date**: {YYYY-MM-DD}
> **Audit Mode**: {Pre-change Documentation | Post-change Documentation | Analysis | Verification}
> **Scope**: {file list or "design system documents"}
> **Invoking Command**: {/08d | /08e | /09 | /06}

---

## Verdict

**{PASS | PASS WITH WARNINGS | FAIL}**

{One paragraph summary of overall compliance status.}

| Severity | Count |
|---|---|
| Critical | N |
| Major | N |
| Minor | N |
| Advisory | N |

---

## 1. Token Compliance

### Critical Violations
{If none: "No critical token violations."}

| File | Line | Issue | Rule | Severity |
|---|---|---|---|---|
| {path} | {line} | Hardcoded color `#3B82F6` | DS-002, FE-001 | Critical |

### Major Violations
{If none: "No major token violations."}

### Minor / Advisory
{If none: "No minor token violations."}

---

## 2. Component Compliance

### Missing States
{If none: "All implemented components have complete state coverage."}

| Component | File | Missing States | Rule |
|---|---|---|---|
| {name} | {path} | loading, error | DS-009 |

### Incorrect Usage
{If none: "No incorrect component usage found."}

---

## 3. Interaction Pattern Compliance

{If none: "All required interaction patterns are present."}

| Pattern | Context | Issue | Rule |
|---|---|---|---|
| Empty state | UserList | Missing — list can return 0 items | DS-010 |

---

## 4. Accessibility Compliance

{If none: "No accessibility violations found."}

| Issue | File | Element | WCAG Criterion | Severity |
|---|---|---|---|---|
| Missing aria-label | {path} | icon button | 4.1.2 | Critical |

---

## 5. Documentation Consistency (documentation mode only)

{If not documentation mode: skip this section.}

{If consistent: "Design system documents are internally consistent."}

| Document | Issue | Severity |
|---|---|---|
| `COMPONENT-LIBRARY.md` | References `--color-accent-3` which is not defined in DESIGN-TOKENS.md | Major |

---

## 6. Compliance Checklist

### Token and Values
- [ ] No hardcoded colors (DS-002, DS-003)
- [ ] No font weight other than 400/500 (DS-004)
- [ ] All spacing uses spacing scale tokens (DS-005)
- [ ] No glass morphism (DS-016 anti-pattern)

### Components
- [ ] All interactive states implemented (DS-009)
- [ ] All required patterns present (DS-010)
- [ ] Icons accessible (DS-011)

### Accessibility
- [ ] Color contrast ≥ 4.5:1 body, ≥ 3:1 large text (DS-003)
- [ ] Status not communicated by color alone (DS-003)
- [ ] Focus ring visible on all interactive elements
- [ ] Touch targets ≥ 44×44px mobile (DS-020)

---

## 7. Recommended Actions

{Ordered list of fixes, from Critical to Advisory. For each: what to fix, which file, which rule.}

1. [Critical] Fix hardcoded color in `{file}` — replace `#3B82F6` with `var(--action-primary)` (DS-002)
2. [Major] Add loading skeleton to `{component}` — should mirror content shape, not use generic spinner (DS-009, DS-010)
3. [Advisory] Consider adding empty state to `{list}` — currently shows nothing when data is absent (DS-010)
```

---

## Verdict Criteria

| Verdict | Condition |
|---|---|
| **PASS** | Zero Critical violations; zero Major violations |
| **PASS WITH WARNINGS** | Zero Critical violations; ≥ 1 Major violations |
| **FAIL** | ≥ 1 Critical violation |

**Critical violations** (always blocking):
- Hardcoded color values in code (breaks theming)
- Font weight other than 400 or 500
- Missing focus ring on interactive elements (accessibility blocker)
- Color contrast below WCAG 2.1 AA minimum
- Information communicated by color alone (accessibility blocker)
- Status indicator without icon + text
- Missing component state that would result in blank/broken UI (e.g., missing error state for a form)

**Major violations** (blocking for `/08e`, advisory for `/09` pre-existing issues):
- Missing loading state for async operations
- Missing empty state for data views
- Missing confirmation for destructive actions
- Missing interactive state (hover, active, disabled, selected)
- Incorrect component variant usage

**Minor / Advisory** (not blocking):
- Spacing values near but not exactly on the scale
- Documentation gaps (design system docs incomplete)
- Pattern present but inconsistently applied

---

## Integration Points

- **`/08d` (Evolve Design System)**: Run in pre-change documentation mode at start; run in post-change documentation mode at end. Both runs produce a report; the post-change report confirms the evolution is internally consistent.
- **`/08e` (Implement Design System Evolution)**: Run in verification mode after implementation. All Critical violations must be resolved before session is complete.
- **`/09` (Improve Frontend)**: Run in analysis mode at start to catalogue existing violations. Run in verification mode after implementation. Critical violations must be resolved.
- **`/06` (Quality Audit)**: Run as part of the overall quality audit across all frontend components. FAIL verdict blocks the quality gate.
