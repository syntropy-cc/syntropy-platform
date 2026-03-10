# Design System — {Project Name}

> **Document Type**: Design System  
> **Project**: {Project Name}  
> **Applicability**: Web interface only (see `.cursor/rules/design-system/design-system.mdc`, Rule DS-001)  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **UX Architect**: (AGT-UXA if AI-generated)  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc`  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`

---

## 1. Design System Overview

### 1.1 Purpose

{One paragraph describing the purpose of this design system, the interfaces it governs, and the guiding aesthetic direction.}

### 1.2 Aesthetic Direction

{Describe the visual and experiential character of the system. Examples: "Professional and efficient, minimal decoration, high information density." / "Warm and approachable, generous whitespace, friendly typography." / "Technical and precise, monospace accents, developer-first."}

### 1.3 Design Tool

| Tool | File Location |
|------|--------------|
| {e.g., Figma} | {Link or file path} |

### 1.4 Token Output File

The canonical token file (exported from the design tool or maintained manually):

```
{tokens-file-path}  (e.g., src/styles/tokens.css or src/design-tokens.json)
```

---

## 2. Color System

> *Define all color tokens. All values are primitive tokens. Components use semantic tokens. See DS-002, DS-003.*

### 2.1 Brand Colors

| Token | Value | Preview | Usage |
|-------|-------|---------|-------|
| `--color-brand-primary` | {#hex} | {████} | Primary brand color |
| `--color-brand-secondary` | {#hex} | {████} | Secondary brand color |
| `--color-brand-accent` | {#hex} | {████} | Accent / highlight |

### 2.2 Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success-500` | {#hex} | Success states |
| `--color-success-100` | {#hex} | Success backgrounds |
| `--color-warning-500` | {#hex} | Warning states |
| `--color-warning-100` | {#hex} | Warning backgrounds |
| `--color-error-500` | {#hex} | Error states |
| `--color-error-100` | {#hex} | Error backgrounds |
| `--color-info-500` | {#hex} | Informational |
| `--color-info-100` | {#hex} | Info backgrounds |

### 2.3 Neutral / Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-neutral-950` | {#hex} | Darkest text |
| `--color-neutral-900` | {#hex} | Primary text |
| `--color-neutral-600` | {#hex} | Secondary text |
| `--color-neutral-400` | {#hex} | Disabled text |
| `--color-neutral-200` | {#hex} | Borders |
| `--color-neutral-100` | {#hex} | Subtle background |
| `--color-neutral-50` | {#hex} | Page background |
| `--color-neutral-0` | {#fff} | Surface (card, modal) |

### 2.4 Semantic Aliases (Level 2 Tokens)

| Token | Maps To | Usage |
|-------|---------|-------|
| `--text-primary` | `--color-neutral-900` | Body and heading text |
| `--text-secondary` | `--color-neutral-600` | Supporting text |
| `--text-disabled` | `--color-neutral-400` | Disabled states |
| `--text-inverse` | `--color-neutral-0` | Text on dark backgrounds |
| `--bg-page` | `--color-neutral-50` | Page/app background |
| `--bg-surface` | `--color-neutral-0` | Card, panel, modal background |
| `--bg-overlay` | `rgba(0,0,0,0.5)` | Modal backdrop |
| `--border-default` | `--color-neutral-200` | Default borders |
| `--color-action-primary` | `--color-brand-primary` | Primary interactive |
| `--color-action-primary-hover` | {darker shade} | Hover state |
| `--color-action-primary-active` | {even darker} | Active/pressed state |
| `--color-focus-ring` | {accessible contrast} | Keyboard focus ring |

### 2.5 Contrast Matrix

| Foreground Token | Background Token | Ratio | WCAG Level |
|-----------------|-----------------|-------|-----------|
| `--text-primary` | `--bg-page` | {16:1} | ✅ AAA |
| `--text-secondary` | `--bg-page` | {5.7:1} | ✅ AA |
| `--text-primary` | `--bg-surface` | {16:1} | ✅ AAA |
| `--color-action-primary` | `--bg-page` | {?:1} | ✅/❌ |

---

## 3. Typography

> *Define all typography tokens. See DS-004.*

### 3.1 Font Families

| Token | Font | Fallback | Usage |
|-------|------|---------|-------|
| `--font-sans` | {e.g., Inter, Geist} | system-ui, sans-serif | Default body text |
| `--font-mono` | {e.g., JetBrains Mono} | Consolas, monospace | Code, technical content |
| `--font-display` | {e.g., same as sans or distinct} | | Headings (optional) |

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 48px / 3rem | 1.1 | 700 | Hero headings |
| `--text-h1` | 32px / 2rem | 1.25 | 700 | Page title |
| `--text-h2` | 24px / 1.5rem | 1.3 | 600 | Section heading |
| `--text-h3` | 20px / 1.25rem | 1.4 | 600 | Subsection heading |
| `--text-h4` | 18px / 1.125rem | 1.4 | 600 | Minor heading |
| `--text-body-lg` | 18px / 1.125rem | 1.6 | 400 | Lead paragraph |
| `--text-body` | 16px / 1rem | 1.6 | 400 | Default body |
| `--text-body-sm` | 14px / 0.875rem | 1.5 | 400 | Supporting text |
| `--text-caption` | 12px / 0.75rem | 1.4 | 400 | Captions, footnotes |
| `--text-label` | 14px / 0.875rem | 1.2 | 500 | Form labels |
| `--text-code` | 14px / 0.875rem | 1.5 | 400 | Inline and block code |

---

## 4. Spacing System

> *All spacing derived from 4px base unit. See DS-005.*

| Token | Value | Common Usage |
|-------|-------|-------------|
| `--space-1` | 4px | Hairline gap |
| `--space-2` | 8px | Tight spacing (icon + text) |
| `--space-3` | 12px | Input padding |
| `--space-4` | 16px | Base unit (card padding) |
| `--space-5` | 20px | |
| `--space-6` | 24px | Section inner padding |
| `--space-8` | 32px | Component groups |
| `--space-10` | 40px | |
| `--space-12` | 48px | Large section gap |
| `--space-16` | 64px | Page section gap |
| `--space-24` | 96px | Page-level padding |

---

## 5. Border Radius, Shadows, and Elevation

### 5.1 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Input fields, small tags |
| `--radius-md` | 8px | Cards, dropdowns |
| `--radius-lg` | 12px | Modals, large panels |
| `--radius-xl` | 16px | Full-bleed sections |
| `--radius-full` | 9999px | Pills, avatars, circular buttons |

### 5.2 Elevation (Box Shadows)

| Token | Shadow Value | Usage |
|-------|-------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle lift, inline elements |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.12)` | Modals, overlays |
| `--shadow-focus` | `0 0 0 3px var(--color-focus-ring)` | Keyboard focus indicator |

---

## 6. Motion

> *Define animation tokens. All animations respect `prefers-reduced-motion`. See DS-009.*

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Micro-interactions, tooltips |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 400ms | Page transitions, complex animations |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Springy reveal |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Fade/exit |

---

## 7. Iconography

### 7.1 Icon Library

| Property | Value |
|----------|-------|
| Library name | {e.g., Lucide, Heroicons, Phosphor} |
| Library version | {Version pinned in package.json} |
| Icon size unit | {Spacing token, e.g., --space-5 (20px)} |

### 7.2 Usage Rules

- Never mix icons from different libraries
- All icons have accessible labels (`aria-label` or visually-hidden text when icon-only)
- Icon color uses semantic color tokens only
- Available icon sizes: {list: 16px / 20px / 24px / 32px}

---

## 8. Changelog

> *Track design system changes here (see DS-014, DS-015).*

### [Unreleased]

### [1.0.0] — {YYYY-MM-DD}
- Initial design system definition
