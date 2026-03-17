# Design Tokens — Syntropy Ecosystem

> **Document Type**: Design Tokens (Implementation Reference)
> **Project**: Syntropy Ecosystem
> **Applicability**: Web Application and Dashboard/Admin
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-16
> **Visual Direction Reference**: `docs/design-system/VISUAL-DIRECTION.md`
> **Canonical CSS File**: `packages/ui/src/styles/tokens.css`

---

## Purpose

This file is the single source of truth for all design token values. Tokens are organized in three layers: Primitive (raw values), Semantic (functional mappings), and Pillar (contextual overrides). No component may use hardcoded hex, px, or font-family values. Every visual value traces to a token defined here.

**For rationale behind these choices**, see `VISUAL-DIRECTION.md`.
**For pillar-specific application rules**, see `PILLAR-PROFILES.md`.
**For Tailwind class mapping**, see Section 7 of this document.

---

## 1. Primitive Tokens — Color Scales

> *Raw color values. Components never reference these directly — they reference semantic tokens (Section 2) which point here.*

### 1.1 Primary Scale — Teal-Esmeralda

| Token | Hex | Usage Context |
|-------|-----|---------------|
| `--color-primary-50` | #E0F5F0 | Subtle backgrounds, hover states |
| `--color-primary-100` | #B3E8DB | Light fills, selected row bg |
| `--color-primary-200` | #80D9C4 | Progress bar track, light accents |
| `--color-primary-300` | #4DCAAD | — |
| `--color-primary-400` | #26BD9A | Hover state for primary buttons |
| `--color-primary-500` | #0FA87F | **Primary action color** — buttons, links, active states |
| `--color-primary-600` | #0D8F6C | Primary button hover (dark mode) |
| `--color-primary-700` | #0A7358 | Text on primary-50 backgrounds |
| `--color-primary-800` | #075A44 | Heading text on primary-tinted surfaces |
| `--color-primary-900` | #04402F | Darkest primary — text in high-contrast contexts |

### 1.2 Neutral Scale

| Token | Hex | Role |
|-------|-----|------|
| `--color-neutral-0` | #FFFFFF | Pure white — card surfaces (light mode) |
| `--color-neutral-50` | #FAFAFA | Page background (light mode) |
| `--color-neutral-100` | #F4F4F5 | Subtle bg, disabled input bg |
| `--color-neutral-200` | #E4E4E7 | Borders (light mode) |
| `--color-neutral-300` | #D4D4D8 | Stronger borders, dividers |
| `--color-neutral-400` | #A1A1AA | Placeholder text, disabled text |
| `--color-neutral-500` | #71717A | Secondary icons |
| `--color-neutral-600` | #52525B | Secondary text (light mode) |
| `--color-neutral-700` | #3F3F46 | — |
| `--color-neutral-800` | #27272A | Primary text (light mode) |
| `--color-neutral-850` | #1A1D27 | Card surfaces (dark mode) |
| `--color-neutral-900` | #141419 | Elevated surface (dark mode) |
| `--color-neutral-950` | #0F1117 | Page background (dark mode) |

### 1.3 Semantic Color Scales

**Success (Green)**

| Token | Hex |
|-------|-----|
| `--color-success-50` | #EAF3DE |
| `--color-success-100` | #C0DD97 |
| `--color-success-500` | #639922 |
| `--color-success-700` | #3B6D11 |
| `--color-success-900` | #173404 |

**Error (Red)**

| Token | Hex |
|-------|-----|
| `--color-error-50` | #FCEBEB |
| `--color-error-100` | #F7C1C1 |
| `--color-error-500` | #E24B4A |
| `--color-error-700` | #A32D2D |
| `--color-error-900` | #501313 |

**Warning (Amber)**

| Token | Hex |
|-------|-----|
| `--color-warning-50` | #FAEEDA |
| `--color-warning-100` | #FAC775 |
| `--color-warning-500` | #EF9F27 |
| `--color-warning-700` | #854F0B |
| `--color-warning-900` | #412402 |

**Info (Blue)**

| Token | Hex |
|-------|-----|
| `--color-info-50` | #E6F1FB |
| `--color-info-100` | #B5D4F4 |
| `--color-info-500` | #378ADD |
| `--color-info-700` | #185FA5 |
| `--color-info-900` | #042C53 |

### 1.4 Pillar Accent Scales

**Learn — Amber/Gold**

| Token | Hex |
|-------|-----|
| `--color-learn-50` | #FFF8E7 |
| `--color-learn-100` | #FEEAB5 |
| `--color-learn-200` | #FDDA82 |
| `--color-learn-300` | #FCC94F |
| `--color-learn-400` | #FBBD2E |
| `--color-learn-500` | #F5A623 |
| `--color-learn-600` | #D4891A |
| `--color-learn-700` | #A66B14 |
| `--color-learn-800` | #7A4F0E |
| `--color-learn-900` | #4E3309 |

**Hub — Slate**

| Token | Hex |
|-------|-----|
| `--color-hub-50` | #F0F2F5 |
| `--color-hub-100` | #D5DAE1 |
| `--color-hub-200` | #B8C0CC |
| `--color-hub-300` | #9AA5B5 |
| `--color-hub-400` | #8290A4 |
| `--color-hub-500` | #6B7B93 |
| `--color-hub-600` | #576680 |
| `--color-hub-700` | #44516A |
| `--color-hub-800` | #333D52 |
| `--color-hub-900` | #222A3A |

**Labs — Indigo**

| Token | Hex |
|-------|-----|
| `--color-labs-50` | #EBF0FA |
| `--color-labs-100` | #C5D4F2 |
| `--color-labs-200` | #9EB7E9 |
| `--color-labs-300` | #779AE0 |
| `--color-labs-400` | #5A83D8 |
| `--color-labs-500` | #3D6BCF |
| `--color-labs-600` | #2F55B3 |
| `--color-labs-700` | #234192 |
| `--color-labs-800` | #1A3170 |
| `--color-labs-900` | #11204E |

---

## 2. Semantic Tokens — Functional Mappings

> *Components reference these tokens. Each maps to a primitive and adapts between light and dark mode.*

### 2.1 Text

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--text-primary` | `--color-neutral-800` (#27272A) | `--color-neutral-100` (#F4F4F5) | Body text, headings |
| `--text-secondary` | `--color-neutral-600` (#52525B) | `--color-neutral-400` (#A1A1AA) | Supporting text, labels |
| `--text-tertiary` | `--color-neutral-400` (#A1A1AA) | `--color-neutral-500` (#71717A) | Hints, placeholders, timestamps |
| `--text-disabled` | `--color-neutral-400` (#A1A1AA) | `--color-neutral-600` (#52525B) | Disabled states |
| `--text-inverse` | `--color-neutral-0` (#FFFFFF) | `--color-neutral-0` (#FFFFFF) | Text on filled primary buttons |
| `--text-link` | `--color-primary-600` (#0D8F6C) | `--color-primary-400` (#26BD9A) | Hyperlinks |

### 2.2 Surfaces

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-page` | `--color-neutral-50` (#FAFAFA) | `--color-neutral-950` (#0F1117) | Page/app background |
| `--bg-surface` | `--color-neutral-0` (#FFFFFF) | `--color-neutral-850` (#1A1D27) | Cards, panels, modals |
| `--bg-surface-raised` | `--color-neutral-0` (#FFFFFF) | `--color-neutral-900` (#141419) | Elevated cards, popovers |
| `--bg-surface-sunken` | `--color-neutral-100` (#F4F4F5) | `--color-neutral-950` (#0F1117) | Inset sections, code blocks |
| `--bg-overlay` | rgba(0, 0, 0, 0.5) | rgba(0, 0, 0, 0.6) | Modal backdrop |
| `--bg-hover` | `--color-neutral-100` (#F4F4F5) | rgba(255, 255, 255, 0.06) | Row/item hover |
| `--bg-selected` | `--color-primary-50` (#E0F5F0) | rgba(15, 168, 127, 0.12) | Selected row/item |

### 2.3 Borders

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--border-default` | `--color-neutral-200` (#E4E4E7) | rgba(255, 255, 255, 0.10) | Default borders |
| `--border-strong` | `--color-neutral-300` (#D4D4D8) | rgba(255, 255, 255, 0.16) | Emphasized borders |
| `--border-focus` | `--color-primary-500` (#0FA87F) | `--color-primary-400` (#26BD9A) | Focus ring border |
| `--border-error` | `--color-error-500` (#E24B4A) | `--color-error-500` (#E24B4A) | Error state border |

### 2.4 Actions

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--action-primary` | `--color-primary-500` (#0FA87F) | `--color-primary-500` (#0FA87F) | Primary button fill |
| `--action-primary-hover` | `--color-primary-600` (#0D8F6C) | `--color-primary-400` (#26BD9A) | Primary button hover |
| `--action-primary-active` | `--color-primary-700` (#0A7358) | `--color-primary-300` (#4DCAAD) | Primary button pressed |
| `--action-destructive` | `--color-error-500` (#E24B4A) | `--color-error-500` (#E24B4A) | Destructive button fill |
| `--action-destructive-hover` | `--color-error-700` (#A32D2D) | `--color-error-700` (#A32D2D) | Destructive hover |

### 2.5 Focus

| Token | Value | Usage |
|-------|-------|-------|
| `--focus-ring` | 0 0 0 3px rgba(15, 168, 127, 0.4) | Keyboard focus indicator |
| `--focus-ring-error` | 0 0 0 3px rgba(226, 75, 74, 0.4) | Focus on error-state input |

---

## 3. Pillar Semantic Tokens

> *These tokens are overridden per app (`apps/learn`, `apps/hub`, `apps/labs`). They control contextual identity without breaking the unified system.*

| Token | Learn | Hub | Labs | Usage |
|-------|-------|-----|------|-------|
| `--pillar-accent` | `--color-learn-500` | `--color-hub-500` | `--color-labs-500` | Pillar badges, section headers, category icons |
| `--pillar-accent-subtle` | `--color-learn-50` | `--color-hub-50` | `--color-labs-50` | Pillar-tinted backgrounds |
| `--pillar-accent-text` | `--color-learn-800` | `--color-hub-800` | `--color-labs-800` | Text on pillar-tinted backgrounds |
| `--pillar-body-size` | 16px | 14px | 14px | Default body text size |
| `--pillar-card-padding` | `--space-6` (24px) | `--space-4` (16px) | `--space-5` (20px) | Card inner padding |
| `--pillar-section-gap` | `--space-12` (48px) | `--space-8` (32px) | `--space-10` (40px) | Gap between page sections |
| `--pillar-content-max-width` | 720px | 100% | 680px | Max width of main content column |

---

## 4. Typography

### 4.1 Font Families

| Token | Value | Fallback | Usage |
|-------|-------|----------|-------|
| `--font-sans` | 'Inter' | system-ui, -apple-system, sans-serif | All UI text |
| `--font-mono` | 'JetBrains Mono' | 'Fira Code', 'Consolas', monospace | Code, IDs, technical content |
| `--font-serif` | 'Source Serif 4' | 'Georgia', serif | Labs article body (optional) |

### 4.2 Type Scale (ratio 1.25 — Major Third)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 36px | 1.15 | 500 | Hero headings, landing page |
| `--text-h1` | 28px | 1.25 | 500 | Page titles |
| `--text-h2` | 22px | 1.3 | 500 | Section headings |
| `--text-h3` | 18px | 1.4 | 500 | Subsection headings |
| `--text-body-lg` | 16px | 1.6 | 400 | Learn body text, lead paragraphs |
| `--text-body` | 14px | 1.6 | 400 | Hub/Labs body text, default |
| `--text-body-sm` | 13px | 1.5 | 400 | Secondary information, labels |
| `--text-caption` | 11px | 1.4 | 400 | Metadata, timestamps, footnotes |
| `--text-label` | 13px | 1.2 | 500 | Form labels, table headers |
| `--text-code` | 14px | 1.5 | 400 | Inline and block code |

**Weight rules**: Only two weights are permitted — 400 (regular) and 500 (medium). 400 for body text, 500 for headings and labels. No other weights.

---

## 5. Spacing

> *Base unit: 4px. All spacing values are multiples of 4.*

| Token | Value | Common Usage |
|-------|-------|--------------|
| `--space-0.5` | 2px | Hairline adjustments |
| `--space-1` | 4px | Icon-text gap (tight) |
| `--space-1.5` | 6px | Badge padding |
| `--space-2` | 8px | Icon-text gap (standard), inline element gaps |
| `--space-3` | 12px | Input padding, compact card padding |
| `--space-4` | 16px | Standard card padding (Hub), base gap |
| `--space-5` | 20px | Card padding (Labs) |
| `--space-6` | 24px | Card padding (Learn), section inner padding |
| `--space-8` | 32px | Component group gaps (Hub) |
| `--space-10` | 40px | Section gaps (Labs) |
| `--space-12` | 48px | Large section gaps (Learn) |
| `--space-16` | 64px | Page section gaps |
| `--space-20` | 80px | Hero padding |
| `--space-24` | 96px | Page-level top/bottom padding |

---

## 6. Border Radius, Shadows, and Elevation

### 6.1 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inline code, small tags |
| `--radius-md` | 6px | Inputs, selects, small interactive elements |
| `--radius-default` | 8px | Buttons, standard containers, default |
| `--radius-lg` | 12px | Cards, modals, dropdowns, large panels |
| `--radius-xl` | 16px | Full-bleed hero sections |
| `--radius-full` | 9999px | Pills, avatars, circular icon buttons |

### 6.2 Box Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0, 0, 0, 0.05) | Subtle lift — card default |
| `--shadow-md` | 0 4px 12px rgba(0, 0, 0, 0.08) | Clear elevation — dropdown, popover |
| `--shadow-lg` | 0 12px 32px rgba(0, 0, 0, 0.12) | Strong elevation — modal |
| `--shadow-focus` | 0 0 0 3px rgba(15, 168, 127, 0.4) | Focus ring (same as `--focus-ring`) |

### 6.3 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Normal flow |
| `--z-dropdown` | 10 | Dropdowns, popovers |
| `--z-sticky` | 20 | Sticky headers, sidebars |
| `--z-overlay` | 30 | Modal backdrop |
| `--z-modal` | 40 | Modal content |
| `--z-toast` | 50 | Toast notifications |
| `--z-tooltip` | 60 | Tooltips (always on top) |

---

## 7. Tailwind Configuration Mapping

> *How tokens connect to Tailwind utility classes via `tailwind.config.ts`. This enables developers to use `className="bg-primary text-primary-foreground"` and have it resolve to the correct token.*

### 7.1 Color Mapping

```typescript
// tailwind.config.ts (excerpt)
const config = {
  theme: {
    extend: {
      colors: {
        // Primary scale
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',    // DEFAULT
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-500)',
          foreground: 'var(--text-inverse)',
        },

        // Pillar accent (overridden per app)
        pillar: {
          DEFAULT: 'var(--pillar-accent)',
          subtle: 'var(--pillar-accent-subtle)',
          text: 'var(--pillar-accent-text)',
        },

        // Semantic surfaces
        background: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        'surface-raised': 'var(--bg-surface-raised)',
        'surface-sunken': 'var(--bg-surface-sunken)',

        // Semantic text
        foreground: 'var(--text-primary)',
        'muted-foreground': 'var(--text-secondary)',

        // Semantic states
        success: { DEFAULT: 'var(--color-success-500)', light: 'var(--color-success-50)' },
        error: { DEFAULT: 'var(--color-error-500)', light: 'var(--color-error-50)' },
        warning: { DEFAULT: 'var(--color-warning-500)', light: 'var(--color-warning-50)' },
        info: { DEFAULT: 'var(--color-info-500)', light: 'var(--color-info-50)' },

        // Border
        border: 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
      },
    },
  },
};
```

### 7.2 shadcn/ui Variable Mapping

shadcn/ui expects specific CSS variable names. Map them in `tokens.css`:

```css
:root {
  /* shadcn/ui expected variables → Syntropy tokens */
  --background: var(--bg-page);
  --foreground: var(--text-primary);
  --card: var(--bg-surface);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-surface-raised);
  --popover-foreground: var(--text-primary);
  --primary: var(--action-primary);
  --primary-foreground: var(--text-inverse);
  --secondary: var(--bg-surface-sunken);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-surface-sunken);
  --muted-foreground: var(--text-secondary);
  --accent: var(--bg-hover);
  --accent-foreground: var(--text-primary);
  --destructive: var(--action-destructive);
  --destructive-foreground: var(--text-inverse);
  --border: var(--border-default);
  --input: var(--border-default);
  --ring: var(--color-primary-500);
  --radius: 8px;
}
```

### 7.3 Usage Examples

```tsx
// Primary button (resolves to teal-esmeralda)
<Button className="bg-primary text-primary-foreground hover:bg-primary-600">
  Publish artifact
</Button>

// Card with pillar accent
<div className="bg-surface border border-border rounded-lg p-4">
  <Badge className="bg-pillar-subtle text-pillar-text">Learn</Badge>
</div>

// Error state input
<Input className="border-error focus:ring-error" />

// Secondary text
<p className="text-muted-foreground text-sm">Last updated 2 hours ago</p>
```

---

## 8. Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Micro-interactions: tooltip, toggle, focus ring |
| `--duration-normal` | 200ms | Standard: dropdown, tab switch, hover |
| `--duration-slow` | 400ms | Significant: modal, page transition, collectible assembly |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing for all transitions |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Positive outcomes: achievement, completion |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Fade-out, exit animations |

**Rule**: All motion respects `prefers-reduced-motion`. Wrap all CSS transitions and animations:
```css
@media (prefers-reduced-motion: no-preference) {
  .animated-element { transition: transform var(--duration-normal) var(--ease-default); }
}
```

---

## 9. Iconography

| Property | Value |
|----------|-------|
| Library | **Lucide React** (single library — do not mix) |
| Version | Pinned in `package.json` |
| Default size | 16px (`--space-4`) |
| Sizes available | 16px, 20px, 24px, 32px |
| Color | Inherits `currentColor` — set via text color tokens |
| Stroke width | 2px (Lucide default) |

**Rules**: One icon library only. All icon-only buttons require `aria-label`. Status icons always accompanied by text.

---

## 10. Contrast Matrix

> *Minimum contrast ratios (WCAG 2.1 AA). Validate in both modes.*

| Foreground | Background | Min Ratio | Status |
|------------|------------|-----------|--------|
| `--text-primary` | `--bg-page` | ≥ 4.5:1 | Required |
| `--text-secondary` | `--bg-page` | ≥ 4.5:1 | Required |
| `--text-primary` | `--bg-surface` | ≥ 4.5:1 | Required |
| `--text-inverse` | `--action-primary` | ≥ 4.5:1 | Required |
| `--text-inverse` | `--action-destructive` | ≥ 4.5:1 | Required |
| `--border-focus` | Adjacent background | Visible (≥ 3:1) | Required |
| `--text-link` | `--bg-page` | ≥ 4.5:1 | Required |
| `--text-link` | `--bg-surface` | ≥ 4.5:1 | Required |

**Non-negotiable**: All status and progress indicators use icon + text. Color alone never communicates state.
