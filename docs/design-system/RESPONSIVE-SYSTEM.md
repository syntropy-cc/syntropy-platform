# Responsive System — Syntropy Ecosystem

> **Document Type**: Responsive System
> **Project**: Syntropy Ecosystem
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Page Archetypes Reference**: `docs/design-system/PAGE-ARCHETYPES.md`
> **Created**: 2026-03-16
> **Last Updated**: 2026-03-16

---

## Purpose

This document defines the responsive behavior of the Syntropy ecosystem. The platform must function equally on desktop and mobile. These are not suggestions — they are constraints that every page and component must satisfy.

---

## 1. Breakpoints

| Token | Value | Name | Description |
|-------|-------|------|-------------|
| `--breakpoint-sm` | 640px | Small | Large phones landscape |
| `--breakpoint-md` | 768px | Medium | Tablets portrait |
| `--breakpoint-lg` | 1024px | Large | Tablets landscape, small laptops |
| `--breakpoint-xl` | 1280px | Extra large | Standard desktops |
| `--breakpoint-2xl` | 1536px | 2x large | Large monitors |

These map directly to Tailwind's default breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).

**Design approach**: Mobile-first. Base styles target the smallest viewport. Breakpoint modifiers add complexity for larger screens.

---

## 2. Container

| Property | Value |
|----------|-------|
| Max-width | 1280px (`--container-max-width`) |
| Padding (horizontal) | 16px (<640px), 24px (640–1023px), 32px (≥1024px) |
| Centering | `margin: 0 auto` |

**Exceptions**: Split Editor archetype and Dense List archetype with sidebar use full viewport width (no max-width constraint).

Tailwind implementation:
```html
<div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
```

---

## 3. Grid System

The grid uses CSS Grid with Tailwind utilities. Column count adapts per breakpoint and page archetype.

### 3.1 Standard Content Grid

| Breakpoint | Columns | Gap | Usage |
|------------|---------|-----|-------|
| < 640px | 1 | 16px | Single column, everything stacked |
| 640–767px | 1–2 | 16px | Cards may go 2-up, content remains single |
| 768–1023px | 2–3 | 20px | Discovery grid 2 columns, stat cards 2 columns |
| 1024–1279px | 3–4 | 24px | Full grid layouts |
| ≥ 1280px | 3–4 | 24px | Same as 1024, wider container |

### 3.2 Stat Card Grid

| Breakpoint | Columns |
|------------|---------|
| < 640px | 1 |
| 640–767px | 2 |
| ≥ 768px | 3–4 (depending on number of stats) |

Tailwind: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

### 3.3 Sidebar + Main Layout

| Breakpoint | Sidebar | Main |
|------------|---------|------|
| < 768px | Hidden (Sheet on demand) | Full width |
| 768–1023px | Collapsed (64px, icon-only) | Fills remaining width |
| ≥ 1024px | Expanded (240px) | Fills remaining width |

Sidebar must be toggleable at all breakpoints. On mobile, the toggle opens a Sheet (slide-out overlay). On tablet, it toggles between 64px and 240px. On desktop, it can be collapsed to 64px.

---

## 4. Component Responsive Behavior

### 4.1 Navbar

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Horizontal links visible, user menu dropdown |
| < 768px | Hamburger menu icon; links move to Sheet (slide-out); logo always visible |

### 4.2 Buttons

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Inline, standard sizes |
| < 768px | Full-width for primary actions in Guided Flow and forms. Inline elsewhere but minimum touch target 44×44px. |

### 4.3 Tables

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Full table with all columns |
| < 768px | Option A: horizontal scroll wrapper. Option B: card layout (each row becomes a card with label-value pairs stacked vertically). Prefer Option B for data-sparse tables (≤6 columns), Option A for data-dense tables. |

### 4.4 Cards

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Grid layout (2–4 columns) |
| < 768px | Single column, full width, stacked |

Card content does not change between breakpoints — only the grid layout changes.

### 4.5 Modals / Dialogs

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Centered dialog with backdrop, max-width 480–640px |
| < 768px | Full-screen sheet sliding up from bottom, with close button and drag handle |

### 4.6 Tabs

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Horizontal tab bar, all tabs visible |
| < 768px | Horizontal scroll on tab bar (overflow-x: auto, no wrapping). Active tab scrolled into view. |

### 4.7 Forms

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Labels above inputs (standard). Multi-column layout possible (2 fields per row for short fields like first/last name). |
| < 768px | Single column always. Labels above inputs. Submit button full-width. |

---

## 5. Touch Target Rules

All interactive elements must meet minimum touch target sizes on mobile:

| Element | Minimum Size |
|---------|-------------|
| Buttons | 44 × 44px (including padding) |
| List rows | 44px height minimum |
| Icon buttons | 44 × 44px touch area (icon may be smaller, padding extends target) |
| Links in text | Sufficient line-height (1.6) to avoid accidental taps on adjacent lines |
| Checkboxes / Radio buttons | 44 × 44px touch area |

---

## 6. Typography Responsive Adjustments

The type scale (defined in `DESIGN-TOKENS.md`) does not change between breakpoints — the same 14px body text is used on mobile and desktop. The exceptions:

| Element | Desktop | Mobile (<768px) |
|---------|---------|-----------------|
| `--text-display` | 36px | 28px |
| `--text-h1` | 28px | 24px |
| Long-form content max-width | Per pillar profile | 100% with horizontal padding |

Tailwind implementation for display text:
```html
<h1 class="text-2xl md:text-4xl font-medium">Page Title</h1>
```

---

## 7. Image and Media Responsive Rules

| Rule | Implementation |
|------|----------------|
| Images in content | `max-width: 100%; height: auto` — always responsive |
| Embedded artifacts | Maintain aspect ratio, scale to container width |
| Code blocks | Horizontal scroll on overflow — never wrap code lines |
| Videos/iframes | 16:9 aspect ratio wrapper: `aspect-video` in Tailwind |

---

## 8. Performance Considerations

| Concern | Rule |
|---------|------|
| Mobile-first CSS | Base styles are for smallest viewport. Add complexity via breakpoint modifiers. This produces smaller CSS for mobile connections. |
| Image loading | Use `loading="lazy"` for images below the fold. Provide `width` and `height` attributes to prevent layout shift. |
| Font loading | Use `font-display: swap` for all custom fonts. Preload Inter (regular and medium weights only). |
| Sidebar | Render sidebar content lazily on mobile (only when Sheet is opened). |
