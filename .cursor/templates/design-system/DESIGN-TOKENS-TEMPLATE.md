# Design Tokens — {Project Name}

> **Document Type**: Design Tokens
> **Project**: {Project Name}
> **Applicability**: Web interface only (see `.cursor/rules/design-system/design-system.mdc`, Rule DS-001)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}
> **UX Architect**: (AGT-UXA if AI-generated)
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-002 to DS-005, DS-018)
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`

---

## 1. Overview

### 1.1 Purpose

{One paragraph describing the purpose of this design token document, the interfaces it governs, and the guiding aesthetic direction.}

### 1.2 Aesthetic Direction

{Describe the visual and experiential character of the system in one sentence. Example: "Trustworthy and intelligent — a professional tool that communicates credibility through restraint, precision, and considered use of color."}

### 1.3 Token Architecture

This document defines tokens in three layers:

| Layer | Description | Example |
|-------|-------------|---------|
| **Layer 1: Primitives** | Raw values — never used directly in components | `--color-teal-500: #0FA87F` |
| **Layer 2: Semantics** | Purpose-driven aliases — what components reference | `--action-primary: var(--color-teal-500)` |
| **Layer 3: Pillar** | Context-specific overrides per app/pillar | `--pillar-accent: var(--color-amber-500)` |

### 1.4 Technology Mapping

| Token Layer | Tailwind Config | shadcn/ui Config | CSS Custom Properties |
|-------------|----------------|-----------------|----------------------|
| Primitives | `theme.colors.*` | Not used directly | `:root { --color-* }` |
| Semantics | `theme.extend.colors.*` | `theme.extend.colors.*` | `:root { --action-* --bg-* }` |
| Pillar | Per-app CSS class or data attribute | N/A | `.pillar-learn { --pillar-* }` |

### 1.5 Token Output File

The canonical token file (exported or maintained manually):

```
{tokens-file-path}  (e.g., packages/ui/src/styles/tokens.css or apps/platform/src/styles/tokens.css)
```

---

## 2. Layer 1 — Primitive Tokens

> *Raw values. Never referenced directly from components. All values are here; semantic and pillar layers alias these.*

### 2.1 Color Primitives — Brand

| Token | Value | Preview |
|-------|-------|---------|
| `--color-primary-50` | {#hex} | Lightest tint |
| `--color-primary-100` | {#hex} | |
| `--color-primary-200` | {#hex} | |
| `--color-primary-300` | {#hex} | |
| `--color-primary-400` | {#hex} | |
| `--color-primary-500` | {#hex} | Base — primary action color |
| `--color-primary-600` | {#hex} | Hover state |
| `--color-primary-700` | {#hex} | Active/pressed state |
| `--color-primary-800` | {#hex} | |
| `--color-primary-900` | {#hex} | Darkest shade |

### 2.2 Color Primitives — Pillar Accents

> *One scale per pillar. Each pillar uses its own accent scale for contextual emphasis.*

| Token | Value | Pillar |
|-------|-------|--------|
| `--color-{pillar1}-500` | {#hex} | {Pillar 1 name} base accent |
| `--color-{pillar1}-100` | {#hex} | {Pillar 1 name} subtle background |
| `--color-{pillar2}-500` | {#hex} | {Pillar 2 name} base accent |
| `--color-{pillar2}-100` | {#hex} | {Pillar 2 name} subtle background |
| `--color-{pillar3}-500` | {#hex} | {Pillar 3 name} base accent |
| `--color-{pillar3}-100` | {#hex} | {Pillar 3 name} subtle background |

### 2.3 Color Primitives — Semantic

| Token | Value | Role |
|-------|-------|------|
| `--color-success-500` | {#hex} | Success base |
| `--color-success-100` | {#hex} | Success background |
| `--color-warning-500` | {#hex} | Warning base |
| `--color-warning-100` | {#hex} | Warning background |
| `--color-error-500` | {#hex} | Error base |
| `--color-error-100` | {#hex} | Error background |
| `--color-info-500` | {#hex} | Info base |
| `--color-info-100` | {#hex} | Info background |

### 2.4 Color Primitives — Neutral

| Token | Value | Role |
|-------|-------|------|
| `--color-neutral-950` | {#hex} | Deepest text/bg |
| `--color-neutral-900` | {#hex} | Primary text |
| `--color-neutral-700` | {#hex} | Secondary text |
| `--color-neutral-500` | {#hex} | Tertiary / placeholder text |
| `--color-neutral-400` | {#hex} | Disabled text |
| `--color-neutral-300` | {#hex} | Strong border |
| `--color-neutral-200` | {#hex} | Default border |
| `--color-neutral-150` | {#hex} | Subtle border |
| `--color-neutral-100` | {#hex} | Hover background |
| `--color-neutral-50` | {#hex} | Sunken background |
| `--color-neutral-0` | #ffffff | Surface (card, modal) |

### 2.5 Typography Primitives

| Token | Value |
|-------|-------|
| `--font-sans` | {e.g., "Inter", "Geist"}, system-ui, sans-serif |
| `--font-mono` | {e.g., "JetBrains Mono"}, Consolas, monospace |
| `--font-serif` | {e.g., "Source Serif 4"}, Georgia, serif — optional, for long-form reading only |
| `--font-size-12` | 0.75rem |
| `--font-size-14` | 0.875rem |
| `--font-size-16` | 1rem |
| `--font-size-18` | 1.125rem |
| `--font-size-20` | 1.25rem |
| `--font-size-24` | 1.5rem |
| `--font-size-32` | 2rem |
| `--font-size-48` | 3rem |

### 2.6 Spacing Primitives

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-24` | 96px |

---

## 3. Layer 2 — Semantic Tokens

> *Purpose-driven aliases. Components always reference these — never Layer 1 directly.*

### 3.1 Text Colors

| Semantic Token | Maps To | Usage |
|----------------|---------|-------|
| `--text-primary` | `--color-neutral-900` | Body and heading text |
| `--text-secondary` | `--color-neutral-700` | Supporting text, labels |
| `--text-tertiary` | `--color-neutral-500` | Placeholder, timestamps |
| `--text-disabled` | `--color-neutral-400` | Disabled states |
| `--text-inverse` | `--color-neutral-0` | Text on dark/colored backgrounds |
| `--text-on-accent` | {white or dark per contrast} | Text on accent-colored surfaces |

### 3.2 Background / Surface Colors

| Semantic Token | Maps To | Usage |
|----------------|---------|-------|
| `--bg-page` | `--color-neutral-50` | App/page background |
| `--bg-surface` | `--color-neutral-0` | Card, panel, modal background |
| `--bg-sunken` | `--color-neutral-50` | Inset area within a surface |
| `--bg-hover` | `--color-neutral-100` | Row or item hover state |
| `--bg-selected` | {accent tint, ~5–8% opacity} | Selected row, active sidebar item |
| `--bg-overlay` | rgba(0,0,0,0.5) | Modal backdrop |

### 3.3 Border Colors

| Semantic Token | Maps To | Usage |
|----------------|---------|-------|
| `--border-default` | `--color-neutral-200` | Default borders |
| `--border-strong` | `--color-neutral-300` | Emphasized borders |
| `--border-subtle` | `--color-neutral-150` | Dividers, hairlines |
| `--border-focus` | `--color-primary-500` | Focus ring border |

### 3.4 Interactive / Action Colors

| Semantic Token | Maps To | Usage |
|----------------|---------|-------|
| `--action-primary` | `--color-primary-500` | Primary buttons, links, active states |
| `--action-primary-hover` | `--color-primary-600` | Primary button hover |
| `--action-primary-active` | `--color-primary-700` | Primary button active/pressed |
| `--action-primary-disabled` | `--color-neutral-300` | Disabled button background |
| `--color-focus-ring` | `--color-primary-500` | Keyboard focus ring (all pillars) |

### 3.5 Semantic State Colors

| Semantic Token | Maps To | Usage |
|----------------|---------|-------|
| `--status-success` | `--color-success-500` | Success indicator |
| `--status-success-bg` | `--color-success-100` | Success background |
| `--status-warning` | `--color-warning-500` | Warning indicator |
| `--status-warning-bg` | `--color-warning-100` | Warning background |
| `--status-error` | `--color-error-500` | Error indicator |
| `--status-error-bg` | `--color-error-100` | Error background |
| `--status-info` | `--color-info-500` | Info indicator |
| `--status-info-bg` | `--color-info-100` | Info background |

### 3.6 Typography Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 48px / 3rem | 1.1 | 500 | Hero headings |
| `--text-h1` | 32px / 2rem | 1.25 | 500 | Page title |
| `--text-h2` | 24px / 1.5rem | 1.3 | 500 | Section heading |
| `--text-h3` | 20px / 1.25rem | 1.4 | 500 | Subsection heading |
| `--text-h4` | 18px / 1.125rem | 1.4 | 500 | Minor heading |
| `--text-body-lg` | 18px / 1.125rem | 1.6 | 400 | Lead paragraph |
| `--text-body` | 16px / 1rem | 1.6 | 400 | Default body |
| `--text-body-sm` | 14px / 0.875rem | 1.5 | 400 | Supporting text |
| `--text-caption` | 12px / 0.75rem | 1.4 | 400 | Captions, footnotes |
| `--text-label` | 14px / 0.875rem | 1.2 | 500 | Form labels, UI labels |
| `--text-code` | 14px / 0.875rem | 1.5 | 400 | Inline and block code |

> Only two weights are used across the entire system: **400 (regular)** and **500 (medium)**.

### 3.7 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Tags, badges, small inputs |
| `--radius-md` | 6px | Buttons, select fields |
| `--radius-default` | 8px | Cards, dropdowns, modals |
| `--radius-lg` | 12px | Large panels, sheets |
| `--radius-xl` | 16px | Feature cards, hero areas |
| `--radius-full` | 9999px | Pills, avatars, circular buttons |

### 3.8 Elevation (Box Shadows)

| Token | Shadow Value | Usage |
|-------|-------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle lift, inline elements |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.10)` | Modals, overlays |
| `--shadow-focus` | `0 0 0 3px var(--color-focus-ring)` | Keyboard focus indicator |

> Elevation is expressed through shadows only — no glass morphism (blur/transparency) on functional UI elements.

### 3.9 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Normal document flow |
| `--z-raised` | 10 | Sticky elements, floating labels |
| `--z-dropdown` | 100 | Dropdowns, select menus |
| `--z-sticky` | 200 | Sticky headers, toolbars |
| `--z-overlay` | 300 | Modal backdrops |
| `--z-modal` | 400 | Modals, dialogs |
| `--z-toast` | 500 | Toast notifications |
| `--z-tooltip` | 600 | Tooltips |

### 3.10 Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Micro-interactions, tooltips |
| `--duration-normal` | 200ms | Standard transitions, mode switch |
| `--duration-slow` | 400ms | Page transitions, complex animations |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Springy reveal |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Fade/exit |

---

## 4. Layer 3 — Pillar Tokens

> *Context-specific overrides. Each pillar app sets these on its root element. Components read pillar tokens; they never inspect which pillar they are in.*

### 4.1 Platform Defaults (Baseline)

These values apply when no pillar context is active:

| Pillar Token | Default Value | Notes |
|--------------|--------------|-------|
| `--pillar-accent` | `var(--action-primary)` | Default: primary brand color |
| `--pillar-accent-subtle` | {5–8% tint of accent} | Subtle highlight background |
| `--pillar-accent-text` | {white or dark for contrast} | Text on accent backgrounds |
| `--pillar-body-size` | `var(--text-body)` | Default: 16px |
| `--pillar-card-padding` | `var(--space-6)` | Default: 24px |
| `--pillar-section-gap` | `var(--space-8)` | Default: 32px |
| `--pillar-content-max-width` | 768px | Default content column width |

### 4.2 {Pillar 1} Token Overrides

```css
/* Applied on: .pillar-{name}, [data-pillar="{name}"], or per-app root */
.pillar-{pillar1-name} {
  --pillar-accent: var(--color-{pillar1}-500);
  --pillar-accent-subtle: var(--color-{pillar1}-100);
  --pillar-accent-text: {white or dark};
  --pillar-body-size: {e.g., var(--text-body)};
  --pillar-card-padding: {e.g., var(--space-6)};
  --pillar-section-gap: {e.g., var(--space-8)};
  --pillar-content-max-width: {e.g., 768px};
}
```

### 4.3 {Pillar 2} Token Overrides

```css
.pillar-{pillar2-name} {
  --pillar-accent: var(--color-{pillar2}-500);
  --pillar-accent-subtle: var(--color-{pillar2}-100);
  --pillar-accent-text: {white or dark};
  --pillar-body-size: {e.g., var(--text-body-sm)};
  --pillar-card-padding: {e.g., var(--space-4)};
  --pillar-section-gap: {e.g., var(--space-6)};
  --pillar-content-max-width: {e.g., 1200px};
}
```

*(Add one section per pillar. See `docs/design-system/PILLAR-PROFILES.md` for full specifications.)*

---

## 5. Tailwind CSS Configuration Mapping

> *How the token system maps to Tailwind utility classes and `tailwind.config.ts`.*

```typescript
// tailwind.config.ts (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        // Semantic tokens exposed as Tailwind colors
        primary: {
          DEFAULT: 'var(--action-primary)',
          hover: 'var(--action-primary-hover)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-page': 'var(--bg-page)',
        'bg-hover': 'var(--bg-hover)',
        'bg-selected': 'var(--bg-selected)',
        border: 'var(--border-default)',
        // Semantic status colors
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        error: 'var(--status-error)',
        info: 'var(--status-info)',
        // Pillar accent (resolves per-context)
        accent: 'var(--pillar-accent)',
        'accent-subtle': 'var(--pillar-accent-subtle)',
        'accent-text': 'var(--pillar-accent-text)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',       // 4px
        md: 'var(--radius-md)',       // 6px
        DEFAULT: 'var(--radius-default)', // 8px
        lg: 'var(--radius-lg)',       // 12px
        xl: 'var(--radius-xl)',       // 16px
        full: 'var(--radius-full)',   // 9999px
      },
      spacing: {
        // Extend with named spacing tokens if needed
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)',
      },
      zIndex: {
        raised: '10',
        dropdown: '100',
        sticky: '200',
        overlay: '300',
        modal: '400',
        toast: '500',
        tooltip: '600',
      },
    },
  },
}
```

---

## 6. shadcn/ui Configuration Mapping

> *How semantic tokens map to shadcn/ui CSS variable names in `globals.css`.*

```css
/* globals.css — shadcn/ui variable mapping */
:root {
  --background: var(--bg-page);
  --foreground: var(--text-primary);
  --card: var(--bg-surface);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-surface);
  --popover-foreground: var(--text-primary);
  --primary: var(--action-primary);
  --primary-foreground: var(--text-inverse);
  --secondary: var(--bg-hover);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-sunken);
  --muted-foreground: var(--text-secondary);
  --accent: var(--pillar-accent-subtle);
  --accent-foreground: var(--pillar-accent-text);
  --destructive: var(--status-error);
  --destructive-foreground: var(--text-inverse);
  --border: var(--border-default);
  --input: var(--border-default);
  --ring: var(--color-focus-ring);
  --radius: var(--radius-default);
}

.dark {
  /* Same token names, different underlying primitive values */
  --background: var(--bg-page); /* Dark mode bg-page points to dark primitive */
  /* ... */
}
```

---

## 7. Contrast Matrix

> *Verify WCAG 2.1 AA compliance for key foreground/background combinations.*

| Foreground Token | Background Token | Ratio | WCAG Level |
|-----------------|-----------------|-------|-----------|
| `--text-primary` | `--bg-page` | {:1} | ✅/❌ |
| `--text-secondary` | `--bg-page` | {:1} | ✅/❌ |
| `--text-primary` | `--bg-surface` | {:1} | ✅/❌ |
| `--text-inverse` | `--action-primary` | {:1} | ✅/❌ |
| `--text-on-accent` | `--pillar-accent` (per pillar) | {:1} | ✅/❌ |
| `--status-error` | `--bg-surface` | {:1} | ✅/❌ |

*Minimum required: 4.5:1 for normal text, 3:1 for large text and UI components.*

---

## 8. Iconography

### 8.1 Icon Library

| Property | Value |
|----------|-------|
| Library name | {e.g., Lucide, Heroicons, Phosphor} |
| Library version | {Version pinned in package.json} |
| Icon size unit | {Spacing token, e.g., --space-5 (20px)} |

### 8.2 Usage Rules

- Never mix icons from different libraries
- All icons have accessible labels (`aria-label` or visually-hidden text when icon-only)
- Icon color uses semantic color tokens only — never hardcoded hex
- Available icon sizes: {list: 16px / 20px / 24px / 32px}

---

## 9. Changelog

> *Track design token changes here (see DS-014, DS-015).*

### [Unreleased]

### [1.0.0] — {YYYY-MM-DD}
- Initial design token definition
