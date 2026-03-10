# Accessibility Requirements — {Project Name}

> **Document Type**: Accessibility Requirements  
> **Project**: {Project Name}  
> **Compliance Target**: {WCAG 2.1 AA / Custom (see Section 2)}  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **UX Architect**: (AGT-UXA if AI-generated)  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`  
> **Rules Reference**: `.cursor/rules/ux/ux-principles.mdc` (UX-006)

---

## 1. Scope and Applicability

> *Which interfaces does this document cover?*

| Interface | In Scope | Standard Applied | Rationale |
|-----------|---------|-----------------|----------|
| {Web Dashboard} | {Yes / No} | {WCAG 2.1 AA} | {Reason: public-facing, regulatory, etc.} |
| {CLI} | {Yes / No} | {Output accessibility guidelines} | |
| {REST API} | {Yes / No} | {Error message clarity standards} | |
| {Email notifications} | {Yes / No} | {Plain text alternative required} | |

---

## 2. Compliance Requirements

### 2.1 Web Interface Standards

| Category | Requirement | Level | Test Method |
|----------|------------|-------|------------|
| **Color contrast** | Normal text: ≥ 4.5:1 contrast ratio | AA | Automated (axe-core) + manual |
| **Color contrast** | Large text (18pt+): ≥ 3:1 contrast ratio | AA | Automated + manual |
| **Color contrast** | Interactive elements: ≥ 3:1 against adjacent colors | AA | Manual |
| **Keyboard navigation** | All interactive elements reachable via Tab | AA | Manual |
| **Focus indicator** | Visible focus ring on all focusable elements | AA | Manual |
| **Focus order** | Tab order follows visual reading order | AA | Manual |
| **Images** | All informative images have `alt` text | A | Automated + manual |
| **Images** | Decorative images have `alt=""` | A | Automated |
| **Form labels** | All inputs have associated `<label>` | A | Automated |
| **Error identification** | Errors described in text (not only by color) | A | Manual |
| **Resize** | Content usable at 200% zoom without horizontal scroll | AA | Manual |
| **Motion** | Animations respect `prefers-reduced-motion` | AA | Manual |
| **Language** | `lang` attribute set on `<html>` | A | Automated |
| **Page titles** | Unique, descriptive `<title>` per page | A | Automated |
| **Heading structure** | Logical heading hierarchy (no skipped levels) | A | Automated + manual |
| **Link purpose** | Links describe their destination in context | A | Manual |

### 2.2 CLI Interface Standards

| Category | Requirement | Test Method |
|----------|------------|------------|
| **Color-only signals** | No information conveyed by color alone; also use icons or text prefixes | Manual |
| **Structured output** | Machine-readable format available (`--output json`) | Automated |
| **Screen reader** | Plain text output readable by screen readers without interpretation | Manual |
| **Verbose mode** | `--verbose` or similar flag available for additional context | Manual |

### 2.3 API Interface Standards

| Category | Requirement | Test Method |
|----------|------------|------------|
| **Error messages** | Human-readable text in all error responses | Manual |
| **Error codes** | Machine-readable error codes in all error responses | Automated |
| **Localization** | `Accept-Language` header respected for user-facing messages | Manual |

---

## 3. Assistive Technology Support

> *Which assistive technologies are explicitly supported?*

| Technology | Platform | Support Level |
|-----------|---------|--------------|
| NVDA | Windows | {Full / Partial / Not Tested} |
| JAWS | Windows | {Full / Partial / Not Tested} |
| VoiceOver | macOS / iOS | {Full / Partial / Not Tested} |
| TalkBack | Android | {Full / Partial / Not Tested} |

**Minimum**: VoiceOver on macOS with Safari for web interfaces.

---

## 4. ARIA Usage Guidelines

### 4.1 When to Use ARIA

Use ARIA only when native HTML semantics are insufficient:

| Scenario | Native HTML | ARIA Alternative |
|---------|-------------|-----------------|
| {Interactive disclosure} | `<details>` / `<summary>` | `aria-expanded`, `aria-controls` |
| {Tab panel} | (no native equivalent) | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| {Live region for status} | `<output>` | `aria-live="polite"` |
| {Loading state} | `<progress>` | `aria-busy="true"` |

**Rule**: Prefer native HTML elements over ARIA. A `<button>` is always better than `<div role="button">`.

### 4.2 Required ARIA for Custom Components

| Component Type | Required ARIA |
|---------------|--------------|
| {Modal / Dialog} | `role="dialog"`, `aria-labelledby`, `aria-modal="true"`, focus trap |
| {Toast / Alert} | `role="alert"` (urgent) or `aria-live="polite"` (non-urgent) |
| {Data table with sort} | `aria-sort` on sortable column headers |
| {Icon button} | `aria-label` (when no visible text) |
| {Combobox / Autocomplete} | `role="combobox"`, `aria-autocomplete`, `aria-expanded`, `aria-owns` |

---

## 5. Accessible Color Palette

> *List all color combinations used in the interface and their contrast ratios.*

| Foreground | Background | Contrast Ratio | Usage | Pass |
|-----------|-----------|---------------|-------|------|
| {--text-primary: #1F2937} | {--bg-page: #FFFFFF} | {16.1:1} | Body text | ✅ AA |
| {--text-secondary: #6B7280} | {--bg-page: #FFFFFF} | {5.7:1} | Supporting text | ✅ AA |
| {--text-disabled: #9CA3AF} | {--bg-page: #FFFFFF} | {2.9:1} | Disabled — for reference only | ⚠️ (disabled exempt) |
| {--color-error: #DC2626} | {--bg-page: #FFFFFF} | {5.9:1} | Error text | ✅ AA |

---

## 6. Keyboard Interaction Patterns

### 6.1 Standard Controls

| Control | Keys | Behavior |
|---------|------|---------|
| Button | `Enter`, `Space` | Activate |
| Link | `Enter` | Navigate |
| Checkbox | `Space` | Toggle |
| Radio group | Arrow keys | Move selection |
| Select/Dropdown | `Enter` to open, Arrow keys to navigate, `Enter`/`Escape` to select/close | |
| Modal | `Escape` | Close; focus returns to trigger |
| Tab panel | Arrow keys (horizontal) | Switch tabs |

### 6.2 Custom Keyboard Shortcuts

*(List any keyboard shortcuts defined for this system.)*

| Shortcut | Action | Context |
|---------|--------|---------|
| {Ctrl+K / Cmd+K} | {Open command palette} | {Global} |
| {?} | {Open keyboard shortcuts reference} | {Global} |

All custom shortcuts must be documented in the user documentation and discoverable via help UI.

---

## 7. Testing Plan

### 7.1 Automated Testing

| Tool | Scope | When Run |
|------|-------|---------|
| axe-core | All web pages | CI/CD on every PR |
| Pa11y | Critical user flows | Weekly |
| Lighthouse | Full audit | Before each release |

### 7.2 Manual Testing

| Test | Tester | Frequency |
|------|--------|----------|
| Keyboard-only navigation of all primary flows | QA | Before each release |
| VoiceOver walkthrough of primary flows | QA | Before each release |
| 200% zoom usability | QA | Before each release |
| High contrast mode compatibility | QA | Before each release |

### 7.3 Acceptance Criteria

A component or page is considered accessible when:
- [ ] All automated checks pass (zero violations at AA level)
- [ ] All primary flows completable via keyboard only
- [ ] Screen reader announces all interactive elements correctly
- [ ] All text content readable at 200% zoom
- [ ] All color combinations meet contrast requirements

---

## 8. Known Issues and Remediation Plan

> *Document known accessibility issues not yet resolved.*

| Issue | Component | Severity | Target Fix Date | Status |
|-------|-----------|---------|----------------|--------|
| {Description} | {Component name} | {Critical / Major / Minor} | {Date} | {Open / In Progress / Fixed} |

---

## 9. Revision History

| Date | Change | Author |
|------|--------|--------|
| {YYYY-MM-DD} | {Initial version} | {Author} |
