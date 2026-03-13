# Design System — Syntropy Ecosystem

> **Document Type**: Design System  
> **Project**: Syntropy Ecosystem  
> **Applicability**: Web Application and Dashboard/Admin (see `.cursor/rules/design-system/design-system.mdc`, Rule DS-001)  
> **Created**: 2026-03-12  
> **Last Updated**: 2026-03-12  
> **UX Architect**: AGT-UXA  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc`  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`

---

## 1. Design System Overview

### 1.1 Purpose

This design system defines the unified visual language for the Syntropy ecosystem Web Application and Dashboard/Admin interfaces. It ensures consistency across the three pillars (Learn, Hub, Labs) and platform surfaces (portfolio, search, planning) while allowing small contextual adjustments per pillar. All components and tokens are shared; pillar-specific usage is expressed through semantic aliases (pillar tokens) and copy, not separate component sets. The system supports accessibility (WCAG 2.1 AA) and the non-negotiable rule that status and progress are never conveyed by color alone.

### 1.2 Aesthetic Direction

**Unified character**: Professional, clear, and purposeful. The ecosystem feels like one product: readable typography, sufficient contrast, and a consistent spatial system. Decoration is minimal; emphasis is on content and progression.

**Pillar variations** (Vision Section 4 — "variations of the ecosystem's unified design language"):

- **Learn**: Emphasizes readability and progression clarity. Slightly more whitespace and a spatial/exploration metaphor (e.g. track map, steps). Softer secondary surfaces where appropriate.
- **Hub**: Emphasizes information density and developer familiarity. Denser lists and tables; monospace for code and IDs; clear hierarchy for issues and projects.
- **Labs**: Emphasizes structured documentation and academic precision. Clear heading hierarchy, citation-friendly typography, and precise alignment for equations and references.

These are applied via pillar semantic tokens (e.g. `--pillar-learn-bg-subtle`, `--pillar-hub-font-code`) and layout choices, not separate palettes or component libraries.

### 1.3 Design Tool

| Tool | File Location |
|------|----------------|
| (To be defined) | Figma / other — TBD |

### 1.4 Token Output File

The canonical token file (to be implemented in code):

```
packages/web-app/src/styles/tokens.css   (or design-tokens.json)
```

Tokens must be the single source of truth; no hardcoded hex, px, or font names in components (DS-002).

---

## 2. Color System

> *All values are primitive tokens. Components use semantic tokens only. See DS-002, DS-003.*

### 2.1 Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | #2563eb | Primary brand (e.g. primary buttons, key links) |
| `--color-brand-secondary` | #475569 | Secondary brand (e.g. secondary buttons, accents) |
| `--color-brand-accent` | #0ea5e9 | Accent / highlight (e.g. focus accent, highlights) |

*Note: Replace with final brand palette when defined; ensure contrast ratios meet AA.*

### 2.2 Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success-500` | #16a34a | Success states (always with icon + text) |
| `--color-success-100` | #dcfce7 | Success backgrounds |
| `--color-warning-500` | #ca8a04 | Warning states (always with icon + text) |
| `--color-warning-100` | #fef9c3 | Warning backgrounds |
| `--color-error-500` | #dc2626 | Error states |
| `--color-error-100` | #fee2e2 | Error backgrounds |
| `--color-info-500` | #0284c7 | Informational |
| `--color-info-100` | #e0f2fe | Info backgrounds |

### 2.3 Neutral / Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-neutral-950` | #0a0a0a | Darkest text |
| `--color-neutral-900` | #171717 | Primary text |
| `--color-neutral-600` | #525252 | Secondary text |
| `--color-neutral-400` | #a3a3a3 | Disabled text |
| `--color-neutral-200` | #e5e5e5 | Borders |
| `--color-neutral-100` | #f5f5f5 | Subtle background |
| `--color-neutral-50` | #fafafa | Page background |
| `--color-neutral-0` | #ffffff | Surface (card, modal) |

### 2.4 Semantic Aliases (Level 2 Tokens)

| Token | Maps To | Usage |
|-------|---------|-------|
| `--text-primary` | `--color-neutral-900` | Body and heading text |
| `--text-secondary` | `--color-neutral-600` | Supporting text |
| `--text-disabled` | `--color-neutral-400` | Disabled states |
| `--text-inverse` | `--color-neutral-0` | Text on dark backgrounds |
| `--bg-page` | `--color-neutral-50` | Page/app background |
| `--bg-surface` | `--color-neutral-0` | Card, panel, modal background |
| `--bg-overlay` | rgba(0,0,0,0.5) | Modal backdrop |
| `--border-default` | `--color-neutral-200` | Default borders |
| `--color-action-primary` | `--color-brand-primary` | Primary button, primary links |
| `--color-action-primary-hover` | (darker shade of brand-primary) | Hover state |
| `--color-action-primary-active` | (even darker) | Active/pressed state |
| `--color-focus-ring` | #2563eb at 40% opacity or equivalent | Keyboard focus ring (visible on all focusable elements) |

### 2.5 Pillar Semantic Tokens (Contextual Overrides)

| Token | Learn | Hub | Labs |
|-------|-------|-----|------|
| `--pillar-bg-subtle` | Slightly warmer neutral | Same as neutral | Same as neutral |
| `--pillar-font-code` | `--font-mono` | `--font-mono` (emphasized in UI) | `--font-mono` |
| (Optional) | Progression accent | — | Citation/accent |

*Implementation may start with shared tokens and add pillar overrides in a second pass.*

### 2.6 Contrast Matrix

| Foreground Token | Background Token | Minimum Ratio | WCAG Level |
|------------------|-----------------|---------------|------------|
| `--text-primary` | `--bg-page` | ≥ 4.5:1 | AA |
| `--text-secondary` | `--bg-page` | ≥ 4.5:1 | AA |
| `--text-primary` | `--bg-surface` | ≥ 4.5:1 | AA |
| `--color-action-primary` (text on button) | `--color-action-primary` (bg) | ≥ 4.5:1 | AA |
| `--color-focus-ring` | Adjacent background | Visible | AA |

All status and progress use icon + text; color is supplementary (Vision Section 4).

---

## 3. Typography

> *See DS-004.*

### 3.1 Font Families

| Token | Font | Fallback | Usage |
|-------|------|----------|-------|
| `--font-sans` | Inter, Geist, or similar | system-ui, sans-serif | Default body and UI |
| `--font-mono` | JetBrains Mono, Fira Code, or similar | Consolas, monospace | Code, technical content, IDs |
| `--font-display` | Same as sans or distinct display font | — | Optional hero/marketing |

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

> *Base unit 4px. See DS-005.*

| Token | Value | Common Usage |
|-------|-------|--------------|
| `--space-1` | 4px | Hairline gap |
| `--space-2` | 8px | Icon + text, tight padding |
| `--space-3` | 12px | Input padding |
| `--space-4` | 16px | Card padding, base gap |
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
|-------|--------------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.06) | Subtle lift |
| `--shadow-md` | 0 4px 8px rgba(0,0,0,0.1) | Cards, dropdowns |
| `--shadow-lg` | 0 12px 24px rgba(0,0,0,0.12) | Modals, overlays |
| `--shadow-focus` | 0 0 0 3px var(--color-focus-ring) | Keyboard focus indicator |

---

## 6. Motion

> *All animations respect `prefers-reduced-motion`. See DS-009.*

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Micro-interactions, tooltips |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 400ms | Page transitions, modals |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Springy reveal |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Fade/exit |

---

## 7. Iconography

### 7.1 Icon Library

| Property | Value |
|----------|-------|
| Library name | Lucide, Heroicons, or Phosphor (single choice) |
| Version | Pinned in package.json |
| Icon size unit | --space-4 (16px), --space-5 (20px), --space-6 (24px), --space-8 (32px) |

### 7.2 Usage Rules

- One icon library only; do not mix (DS-011).
- All icon-only buttons or status icons have accessible labels (`aria-label` or visible text).
- Status and progress: always icon + text; never color alone (Vision Section 4).
- Icon color: use semantic tokens only (e.g. `--color-success-500`, `--color-error-500`, `--text-secondary`).

---

## 8. Changelog

### [Unreleased]

### [1.0.0] — 2026-03-12
- Initial design system definition for Syntropy Ecosystem
- Unified palette, type scale, spacing, elevation, motion
- Pillar token placeholders (Learn, Hub, Labs)
- WCAG 2.1 AA contrast and focus requirements documented
