# {Project Name} Design System — LLM Quick Reference

> **Include this file in every frontend generation prompt.**
> This is a derivative document. If anything here conflicts with the full design system documents, the full documents prevail.
> Last updated: {YYYY-MM-DD} — re-sync whenever `DESIGN-TOKENS.md` or `VISUAL-DIRECTION.md` changes.

---

## Stack

- **Framework**: Next.js {version} (App Router)
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Monorepo**: Turborepo — shared components in `packages/ui`
- **Icons**: {e.g., Lucide React}
- **Fonts**: {e.g., Inter (sans), JetBrains Mono (code)} via `next/font`

---

## Brand & Color

**Primary action color** (buttons, links, focus ring — same across all pillars):
- Token: `--action-primary` | Hex: `{#hex}` | Tailwind: `text-primary` / `bg-primary`

**Pillar accents** (contextual highlights, badges, sidebar active state — NOT buttons):

| Pillar | Token | Hex | Tailwind |
|--------|-------|-----|---------|
| {Pillar 1} | `--pillar-accent` when in this context | `{#hex}` | `bg-accent` / `text-accent` |
| {Pillar 2} | `--pillar-accent` when in this context | `{#hex}` | `bg-accent` / `text-accent` |
| {Pillar 3} | `--pillar-accent` when in this context | `{#hex}` | `bg-accent` / `text-accent` |

**Rule**: `--action-primary` = buttons, links, focus. `--pillar-accent` = indicators, badges, highlights.

---

## Semantic Colors

Always pair color with icon + text (never color alone for status):

| Status | Token | Usage |
|--------|-------|-------|
| Success | `--status-success` + `--status-success-bg` | Confirmation, completed states |
| Warning | `--status-warning` + `--status-warning-bg` | Caution, approaching limits |
| Error | `--status-error` + `--status-error-bg` | Failures, validation errors |
| Info | `--status-info` + `--status-info-bg` | Informational, tips |

---

## Surfaces

| Surface | Token | Tailwind | When |
|---------|-------|---------|------|
| Page background | `--bg-page` | `bg-bg-page` | App/layout root |
| Card / panel | `--bg-surface` | `bg-bg-surface` | Cards, modals, dropdowns |
| Sunken / inset | `--bg-sunken` | `bg-sunken` | Code blocks, input areas |
| Row hover | `--bg-hover` | `hover:bg-bg-hover` | List rows, table rows |
| Selected | `--bg-selected` | `bg-bg-selected` | Active sidebar item, selected row |

---

## Typography

**Fonts**: `--font-sans` (UI text), `--font-mono` (code)

**Only two weights**: 400 (regular) and 500 (medium). No 600, 700, or 300 anywhere.

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `--text-h1` | 32px | 500 | Page title |
| `--text-h2` | 24px | 500 | Section heading |
| `--text-h3` | 20px | 500 | Subsection heading |
| `--text-body-lg` | 18px | 400 | Lead paragraph |
| `--text-body` | 16px | 400 | Default UI text |
| `--text-body-sm` | 14px | 400 | Secondary text, labels |
| `--text-caption` | 12px | 400 | Captions, timestamps |
| `--text-label` | 14px | 500 | Form labels, nav items |
| `--text-code` | 14px | 400 | Inline code |

---

## Spacing

Base unit: 4px. Common values:

| Token | Value | Use |
|-------|-------|-----|
| `--space-2` | 8px | Icon + text gap |
| `--space-3` | 12px | Input padding, tight gaps |
| `--space-4` | 16px | Card padding (tight), default gap |
| `--space-6` | 24px | Card padding (default), section inner |
| `--space-8` | 32px | Component group spacing |
| `--space-12` | 48px | Section gap |
| `--space-16` | 64px | Page section gap |

**Pillar overrides**: use `--pillar-card-padding` and `--pillar-section-gap` instead of hardcoding.

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Tags, badges |
| `--radius-md` | 6px | Buttons, select |
| `--radius-default` | 8px | Cards, dropdowns, modals |
| `--radius-lg` | 12px | Large panels, sheets |
| `--radius-xl` | 16px | Feature cards |
| `--radius-full` | 9999px | Avatars, pills |

---

## Key Component Rules

**Button**:
- One `variant="primary"` per view maximum
- `variant="destructive"` only for delete/irreversible
- Loading state via `loading` prop; never blank during async
- Icon-only: must have `aria-label`

**Input / Form Field**:
- Always paired with a `<label>` (never placeholder-as-label)
- Validation: on blur + on submit; never on keystroke
- Error: `aria-invalid`, `aria-describedby` to error message

**Loading**:
- > 200ms: show Skeleton mirroring layout shape
- < 200ms: show nothing (no flash)
- Never: full-screen spinner without skeleton context

**Status indicators**:
- Always: icon + text label alongside color
- Never: color alone to communicate status

---

## Page Archetypes

Classify every new page before implementing:

1. **Dense List** — scannable rows; filter + pagination
2. **Long-Form Reading** — single centered column; 65ch max; 1.7 line-height
3. **Guided Flow** — centered card; step indicator; Back + Next
4. **Dashboard** — stat cards + charts + recent items
5. **Split Editor** — editor pane + preview pane; adjustable split
6. **Entity Detail** — entity header + tab bar + tab content
7. **Discovery Grid** — card grid; 3-col desktop / 2-col tablet / 1-col mobile

---

## Responsive Rules

| Breakpoint | Value |
|-----------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

- Mobile-first: base = mobile; modifiers add desktop behavior
- Modals → bottom sheets on mobile
- Sidebars → Sheet (slide-out) on mobile
- Touch targets: 44×44px minimum on all interactive elements
- Tables: horizontal scroll on mobile (never truncate without disclosure)
- Tabs: collapse to Select dropdown on mobile if > 4 tabs

---

## Anti-Patterns — NEVER Do These

1. Hardcode hex values in components — use tokens only
2. Use font weights other than 400 or 500
3. Use `--pillar-accent` for primary buttons or links — that's for highlights only
4. Communicate status with color alone — always icon + text
5. Show a blank content area during loading — use Skeleton
6. Put two `variant="primary"` buttons side by side on the same view
7. Use glass morphism (backdrop-filter blur) on functional UI elements
8. Validate form fields on every keystroke
9. Label a destructive confirm button "OK" or "Confirm" — name the action
10. Override `--action-primary` per pillar — it must be the same everywhere

---

## Decision Tree

### Which button variant?

```
Is it the most important action on this view?
└── Yes, and there is only one → primary
└── No / secondary action → secondary or ghost
└── Deletes or irreversibly removes something → destructive
└── Navigate to another page/section → link
```

### How to show status?

```
Always: color + icon + text label (3 signals)
Success → green + checkmark icon + label
Warning → amber + warning triangle + label  
Error → red + error circle + label
Info → blue + info circle + label
```

### Loading state?

```
Operation < 200ms → show nothing
Operation 200ms–2s → Skeleton (layout-matching)
Operation 2s–30s → Skeleton + progress indicator
Operation > 30s → Step-based progress ("Step 2 of 4")
Button loading → loading prop (spinner in button)
```

### Which page archetype?

```
Showing a list to scan/select from → Dense List
Reading long content → Long-Form Reading
Step-by-step flow → Guided Flow
Overview/metrics → Dashboard
Edit with preview → Split Editor
One entity with tabs → Entity Detail
Browsing a collection → Discovery Grid
```
