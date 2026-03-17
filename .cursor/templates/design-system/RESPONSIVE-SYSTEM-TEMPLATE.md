# Responsive System — {Project Name}

> **Document Type**: Responsive System
> **Project**: {Project Name}
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-020)
> **Interaction Design Reference**: `.cursor/rules/ux/interaction-design.mdc` (IXD-010)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Purpose

This document defines the responsive behavior of the {Project Name} interface. All breakpoint values, grid specifications, and component behavior rules in this document are the single source of truth. Do not define breakpoints in individual components — import them from here or from the shared Tailwind config.

The approach is **mobile-first**: base styles target the smallest viewport; breakpoint modifiers progressively enhance for larger screens.

---

## 1. Breakpoints

| Token | Value | Tailwind Key | Description |
|-------|-------|-------------|-------------|
| `--bp-xs` | 375px | `xs` | Small phones |
| `--bp-sm` | 640px | `sm` | Large phones, small tablets |
| `--bp-md` | 768px | `md` | Tablets, small laptops |
| `--bp-lg` | 1024px | `lg` | Laptops, desktops |
| `--bp-xl` | 1280px | `xl` | Wide desktops |
| `--bp-2xl` | 1536px | `2xl` | Ultra-wide (optional) |

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
}
```

### Design Zones

| Zone | Breakpoint Range | Description |
|------|-----------------|-------------|
| Mobile | < 640px | Touch-first, single column, compact |
| Mobile-Large | 640px–767px | Phones with landscape or large screen |
| Tablet | 768px–1023px | Two-column grid, sidebar optional |
| Desktop | 1024px–1279px | Full layout with sidebar |
| Wide | ≥ 1280px | Maximum layout width enforced |

---

## 2. Container

| Breakpoint | Max-Width | Horizontal Padding |
|-----------|----------|--------------------|
| Mobile (< sm) | 100% | `--space-4` (16px) |
| Mobile-Large (sm) | 100% | `--space-6` (24px) |
| Tablet (md) | 100% | `--space-8` (32px) |
| Desktop (lg) | 1024px | `--space-8` (32px) |
| Wide (xl) | 1280px | `--space-8` (32px) |
| Ultra-wide (2xl) | 1400px | `--space-8` (32px) |

```css
/* Container utility (if not using Tailwind container) */
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 640px) { .container { padding-inline: var(--space-6); } }
@media (min-width: 1024px) { .container { max-width: 1024px; padding-inline: var(--space-8); } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

---

## 3. Grid System

### 3.1 Base Grid

| Breakpoint | Columns | Gutter |
|-----------|---------|--------|
| Mobile (< sm) | 4 | `--space-4` (16px) |
| Mobile-Large (sm) | 8 | `--space-4` (16px) |
| Tablet (md) | 12 | `--space-6` (24px) |
| Desktop (lg+) | 12 | `--space-6` (24px) |

### 3.2 Common Column Spans

| Use Case | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Full width | 4/4 | 8/8 | 12/12 |
| Main + aside (2/3 · 1/3) | 4/4 stacked | 8/8 stacked | 8/12 + 4/12 |
| Two equal columns | 4/4 stacked | 4/8 + 4/8 | 6/12 + 6/12 |
| Stat cards (4-up) | 4/4 (1 col) | 4/8 (2 col) | 3/12 × 4 |
| Sidebar + content | 4/4 stacked | 3/8 + 5/8 | 3/12 + 9/12 |

### 3.3 Sidebar Widths

| Sidebar Type | Width (desktop) | Mobile Behavior |
|-------------|----------------|----------------|
| Primary navigation | 240px | Collapses to Sheet |
| Secondary navigation / TOC | 220px | Hidden or disclosure |
| Context panel / aside | 280px | Hidden or bottom sheet |

---

## 4. Z-Index Scale

> *Defined in `DESIGN-TOKENS.md`. Reproduced here for responsive context.*

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Normal document flow |
| `--z-raised` | 10 | Sticky elements, floating labels |
| `--z-dropdown` | 100 | Dropdowns, select menus |
| `--z-sticky` | 200 | Sticky headers, toolbars |
| `--z-overlay` | 300 | Modal / sheet backdrops |
| `--z-modal` | 400 | Modals, dialogs |
| `--z-toast` | 500 | Toast notifications |
| `--z-tooltip` | 600 | Tooltips |

---

## 5. Component Responsive Behavior

### 5.1 Navigation Bar

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Hamburger menu; nav items hidden; logo + hamburger + global actions visible |
| Tablet (md–lg) | Condensed nav; icon + label or icon-only |
| Desktop (> lg) | Full nav with labels; optional secondary actions |

Hamburger triggers a Sheet (full-height slide-out from left).

### 5.2 Sidebar

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< lg) | Hidden by default; opened as Sheet (slide from left, overlay backdrop) |
| Desktop (> lg) | Permanently visible; width: 240px |

On mobile, a Sheet has a minimum swipe-close gesture and a visible close button.

### 5.3 Buttons

| Breakpoint | Behavior |
|-----------|---------|
| Mobile | Minimum touch target 44×44px; full-width when stacked in forms |
| All | Minimum width 80px for text buttons; auto width in horizontal groups |

### 5.4 Tables

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Horizontal scroll container OR transform to card list with key-value rows |
| Tablet (md–lg) | Horizontal scroll if columns > 6 |
| Desktop | Full table, all columns |

Never truncate table content without a disclosure mechanism. If a column must be hidden on mobile, ensure the user can expand the row to see the hidden data.

### 5.5 Modals and Dialogs

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Bottom sheet: slides up from bottom edge; full viewport width; max-height 85vh |
| Desktop (> md) | Centered modal; max-width 480–600px; backdrop behind |

Bottom sheets have a drag handle at the top and can be dismissed by swiping down.

### 5.6 Tabs

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | If > 4 tabs: collapse to Select dropdown with current tab as label |
| Tablet (md–lg) | If > 6 tabs: show overflow menu ("+N more") |
| Desktop | All tabs visible in tab bar |

### 5.7 Forms

| Breakpoint | Behavior |
|-----------|---------|
| Mobile | Single column; full-width inputs and labels |
| Tablet | Single or two-column for short fields (zip, date, quantity) |
| Desktop | Two-column grid for complex forms; single column for focused flows |

### 5.8 Cards (Discovery Grid)

| Breakpoint | Columns |
|-----------|---------|
| Mobile (< sm) | 1 |
| Mobile-Large (sm–md) | 2 |
| Desktop (md–xl) | 3 |
| Wide (> xl) | 4 (optional) |

---

## 6. Touch Target Rules

All interactive elements on mobile must meet minimum touch target sizes:

| Element | Minimum Size |
|---------|-------------|
| Button | 44×44px |
| Icon button | 44×44px |
| Link in body text | 44px height |
| Checkbox / Radio | 44×44px hit area (visual may be smaller) |
| Select / Dropdown trigger | 44px height |
| Table row action | 44×44px |
| Tab item | 44px height |
| Navigation item | 44px height |

Touch targets may overlap visually but must not overlap in hit area. Use `padding` to extend hit area without affecting visual size.

---

## 7. Responsive Typography Adjustments

Only the following text styles adjust across breakpoints. All others remain constant.

| Token | Mobile | Desktop | Notes |
|-------|--------|---------|-------|
| `--text-display` | 36px | 48px | Hero headings only |
| `--text-h1` | 28px | 32px | Page titles |
| `--text-h2` | 22px | 24px | Section headings |
| All other tokens | Same | Same | Do not change |

Pillar body size (`--pillar-body-size`) does not change across breakpoints — it is a pillar-level constant.

---

## 8. Images and Media

| Element | Behavior |
|---------|---------|
| Images | `max-width: 100%`; `height: auto`; use `srcset` for responsive images |
| Video embeds | 16:9 aspect ratio preserved; `width: 100%` |
| Code blocks | Horizontal scroll on mobile; never line-wraps inside code |
| Data visualizations / charts | Minimum 320px wide; simplify on mobile if chart supports it |
| Embedded iframes | Responsive wrapper with aspect ratio preservation |

---

## 9. Performance Considerations

- **CSS mobile-first**: Base rules (no media query) = mobile. Desktop rules are additive via `@media (min-width: ...)`.
- **Font loading**: Use `font-display: swap` to prevent invisible text during font load.
- **Images**: Use `loading="lazy"` for below-the-fold images. Use Next.js `<Image>` or equivalent for automatic responsive images.
- **Sidebar and Sheet**: Use CSS transforms for show/hide (GPU-accelerated), not `display: none` toggling.
- **Reduced motion**: All transitions and animations must be conditioned on `prefers-reduced-motion: no-preference`.
