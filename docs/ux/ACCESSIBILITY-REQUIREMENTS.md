# Accessibility Requirements — Syntropy Ecosystem

> **Document Type**: Accessibility Requirements  
> **Project**: Syntropy Ecosystem  
> **Compliance Target**: WCAG 2.1 AA (Web and Dashboard)  
> **Created**: 2026-03-12  
> **Last Updated**: 2026-03-12  
> **UX Architect**: AGT-UXA  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`  
> **Rules Reference**: `.cursor/rules/ux/ux-principles.mdc` (UX-006)

---

## 1. Scope and Applicability

> *Which interfaces does this document cover?*

| Interface | In Scope | Standard Applied | Rationale |
|-----------|----------|------------------|------------|
| Web Application | Yes | WCAG 2.1 AA | Primary interface; educational and professional use; Vision Section 4 mandates WCAG 2.1 AA |
| Dashboard / Admin | Yes | WCAG 2.1 AA | Same app, protected routes; moderators and admins need full access |
| REST API | Yes | Error clarity standards | Human-readable messages; machine-readable codes; CONV-017 envelope |
| Embedded IDE | Yes | WCAG 2.1 AA (as part of Web) | Keyboard, focus, screen reader; in-context editing |
| CLI | No | — | Not a user-facing interface in scope |
| Email / notifications | Yes (content) | Plain text alternative | Notifications and emails must not rely on color or image alone for meaning |

---

## 2. Compliance Requirements

### 2.1 Web Interface Standards

| Category | Requirement | Level | Test Method |
|----------|-------------|-------|-------------|
| **Color contrast** | Normal text: ≥ 4.5:1 contrast ratio | AA | Automated (axe-core) + manual |
| **Color contrast** | Large text (18pt+ or 14pt+ bold): ≥ 3:1 contrast ratio | AA | Automated + manual |
| **Color contrast** | Interactive elements: ≥ 3:1 against adjacent colors | AA | Manual |
| **Keyboard navigation** | All interactive elements reachable via Tab | AA | Manual |
| **Focus indicator** | Visible focus ring on all focusable elements (design token `--shadow-focus`) | AA | Manual |
| **Focus order** | Tab order follows visual reading order | AA | Manual |
| **Images** | All informative images have `alt` text | A | Automated + manual |
| **Images** | Decorative images have `alt=""` | A | Automated |
| **Form labels** | All inputs have associated `<label>` or `aria-label` | A | Automated |
| **Error identification** | Errors described in text (not only by color); icon + text for status | A | Manual |
| **Resize** | Content usable at 200% zoom without horizontal scroll | AA | Manual |
| **Motion** | Animations respect `prefers-reduced-motion` | AA | Manual |
| **Language** | `lang` attribute set on `<html>` | A | Automated |
| **Page titles** | Unique, descriptive `<title>` per page | A | Automated |
| **Heading structure** | Logical heading hierarchy (no skipped levels) | A | Automated + manual |
| **Link purpose** | Links describe their destination in context | A | Manual |
| **Status not by color alone** | Gamification, governance, notifications: icon + text always (Vision Section 4) | Project | Manual |

### 2.2 CLI Interface Standards

CLI is not in scope for this project. If a CLI is added later, apply: no color-only signals; structured output option; screen reader–friendly plain text; verbose mode.

### 2.3 API Interface Standards

| Category | Requirement | Test Method |
|----------|-------------|-------------|
| **Error messages** | Human-readable `message` (or equivalent) in all error responses | Manual |
| **Error codes** | Machine-readable `code` (e.g. VALIDATION_ERROR, DOMAIN_ERROR, CONFLICT, SERVICE_UNAVAILABLE) in error envelope | Automated |
| **Structure** | Consistent envelope per CONV-017 (error object with code, message, optional details) | Manual |
| **Localization** | `Accept-Language` header respected for user-facing messages where supported | Manual |

---

## 3. Assistive Technology Support

| Technology | Platform | Support Level |
|------------|----------|---------------|
| VoiceOver | macOS / iOS (Safari) | Full — minimum target for primary flows |
| NVDA | Windows | Full — target for primary flows |
| JAWS | Windows | Partial — tested for critical paths |
| TalkBack | Android | Partial — mobile-responsive surfaces |
| Zoom / magnification | All | Content usable at 200% zoom |

**Minimum**: VoiceOver on macOS with Safari for web interfaces. Primary flows (onboarding, learning-to-contribution, contribution submit, institution creation, article publish) must be completable with keyboard and screen reader.

---

## 4. ARIA Usage Guidelines

### 4.1 When to Use ARIA

Use ARIA only when native HTML semantics are insufficient:

| Scenario | Native HTML | ARIA Alternative |
|----------|-------------|------------------|
| Interactive disclosure (expand/collapse) | `<details>` / `<summary>` | `aria-expanded`, `aria-controls` if custom |
| Tab panel (e.g. fragment Problem/Theory/Artifact) | — | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Live region for status (toast, async status) | `<output>` where appropriate | `aria-live="polite"` or `role="status"`; urgent errors `aria-live="assertive"` |
| Loading state | `<progress>` where applicable | `aria-busy="true"`, `aria-label` describing activity |
| Status (e.g. XP, level, achievement) | — | Icon + visible text; `aria-label` on icon if needed |

**Rule**: Prefer native HTML. Use `<button>` not `<div role="button">`. Use `<label>` with `<input>`.

### 4.2 Required ARIA for Custom Components

| Component Type | Required ARIA |
|----------------|---------------|
| Modal / Dialog | `role="dialog"`, `aria-labelledby` (or `aria-label`), `aria-modal="true"`, focus trap, `Escape` to close |
| Toast / Snackbar | `role="status"` or `role="alert"` (errors); `aria-live="polite"` (or `assertive` for errors) |
| Confirmation (destructive) | Same as Modal; clearly state consequence |
| Icon-only button | `aria-label` describing action |
| Combobox / Autocomplete (e.g. search) | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` when applicable |
| Progress / loading (custom) | `aria-busy="true"`, `aria-label` (e.g. "Anchoring artifact…") |
| Gamification (XP, level, badge) | Never rely on color alone; text or `aria-label` with icon |

---

## 5. Accessible Color Palette

> *Design tokens must meet contrast requirements. See `docs/design-system/DESIGN-SYSTEM.md` for token definitions. This table is a compliance checkpoint.*

| Foreground | Background | Contrast Ratio | Usage | Pass |
|------------|------------|----------------|-------|------|
| Primary text token | Page background | ≥ 4.5:1 | Body text | AA |
| Secondary text token | Page background | ≥ 4.5:1 | Supporting text | AA |
| Primary button text | Primary button background | ≥ 4.5:1 | Button label | AA |
| Error text | Page background | ≥ 4.5:1 | Error messages | AA |
| Focus ring | Adjacent background | Visible (design token) | Focus indicator | AA |
| Status (success/warning/error) | Always paired with icon + text | — | Gamification, notifications | Project |

Disabled elements may use reduced contrast; they must be clearly non-interactive (cursor, aria-disabled). All status and progress must have icon + text; color is supplementary.

---

## 6. Keyboard Interaction Patterns

### 6.1 Standard Controls

| Control | Keys | Behavior |
|---------|------|----------|
| Button | `Enter`, `Space` | Activate |
| Link | `Enter` | Navigate |
| Checkbox | `Space` | Toggle |
| Radio group | Arrow keys | Move selection |
| Select/Dropdown | `Enter` or `Space` to open; Arrow keys to navigate; `Enter` to select, `Escape` to close | |
| Modal | `Escape` | Close; focus returns to trigger |
| Tab panel | Arrow keys (horizontal) or Tab | Switch tabs; focus trapped in panel when open |
| Embedded IDE | Standard editor shortcuts (e.g. Ctrl+S) | Per IDE component; focus management on open/close |

### 6.2 Custom Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| (To be defined) | Open search / command palette | Global (optional) |
| (To be defined) | Open keyboard shortcuts help | Global (optional) |

All custom shortcuts must be documented and discoverable (e.g. help panel or `?`). Avoid conflicts with browser and assistive technology.

---

## 7. Testing Plan

### 7.1 Automated Testing

| Tool | Scope | When Run |
|------|-------|----------|
| axe-core (or equivalent) | All web pages / critical routes | CI on every PR (where feasible) |
| Lighthouse (accessibility audit) | Critical user flows | Before each release |

### 7.2 Manual Testing

| Test | Tester | Frequency |
|------|--------|-----------|
| Keyboard-only navigation of primary flows (onboarding, contribution, institution create, article publish) | QA | Before each release |
| VoiceOver (or NVDA) walkthrough of primary flows | QA | Before each release |
| 200% zoom usability | QA | Before each release |
| Status and progress: verify icon + text (no color-only) | QA | Before each release |

### 7.3 Acceptance Criteria

A page or flow is considered accessible when:
- [ ] Automated checks pass (zero AA-level violations for that page)
- [ ] All primary flows completable via keyboard only
- [ ] Screen reader announces interactive elements and status changes correctly
- [ ] Content readable and operable at 200% zoom
- [ ] All status and progress use icon + text (no color-only information)
- [ ] Focus order and focus visibility are correct

---

## 8. Known Issues and Remediation Plan

| Issue | Component | Severity | Target Fix Date | Status |
|-------|-----------|----------|-----------------|--------|
| (None at document creation) | — | — | — | — |

---

## 9. Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-12 | Initial version | AGT-UXA |
