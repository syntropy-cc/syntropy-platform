# Syntropy Design System — LLM Quick Reference

> **Include this file in every frontend generation prompt.** It is the condensed, high-signal reference for generating correct Syntropy UI code. For full details, see the complete design system docs in `docs/design-system/`.

---

## Stack

Next.js + shadcn/ui + Tailwind CSS. Components in `packages/ui`. Pillar apps in `apps/learn`, `apps/hub`, `apps/labs`.
- **Canonical token file**: `packages/ui/src/styles/tokens.css` — all apps must import `@syntropy/ui/styles`. No hardcoded values anywhere.

## Brand & Color

- **Primary**: Teal-esmeralda `#0FA87F` → Tailwind `bg-primary`, `text-primary`.
- **Learn accent**: Amber `#F5A623` → `bg-pillar-subtle` / `text-pillar-text` in Learn context.
- **Hub accent**: Slate `#6B7B93` → same pillar tokens in Hub context.
- **Labs accent**: Indigo `#3D6BCF` → same pillar tokens in Labs context.
- **Pillar accents are NEVER used for buttons, links, or active states.** Only for badges, category labels, and decorative icons. Primary teal handles all actions.

## Semantic Colors

- Success: `#639922` / bg `#EAF3DE` → `text-success`, `bg-success-light`
- Error: `#E24B4A` / bg `#FCEBEB` → `text-error`, `bg-error-light`
- Warning: `#EF9F27` / bg `#FAEEDA` → `text-warning`, `bg-warning-light`
- Info: `#378ADD` / bg `#E6F1FB` → `text-info`, `bg-info-light`
- **Rule**: Status is NEVER communicated by color alone. Always icon + text.

## Surfaces (Light / Dark)

- Page bg: `#FAFAFA` / `#0F1117` → `bg-background`
- Card/panel: `#FFFFFF` / `#1A1D27` → `bg-surface`
- Sunken (code blocks, insets): `#F4F4F5` / `#0F1117` → `bg-surface-sunken`
- Hover: `#F4F4F5` / `rgba(255,255,255,0.06)` → `bg-hover` (custom) or `hover:bg-accent`
- Selected: `#E0F5F0` / `rgba(15,168,127,0.12)` → `bg-selected` (custom)

## Typography

- Font: Inter (sans), JetBrains Mono (code), Source Serif 4 (Labs article body only).
- **Only two weights: 400 (regular) and 500 (medium).** No 600, 700, 300.
- Scale: Display 36px, H1 28px, H2 22px, H3 18px, Body 14–16px, Caption 11px.
- Learn uses 16px body. Hub and Labs use 14px body.

## Spacing (4px base)

Key values: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px.
- Learn card padding: 24px. Hub: 16px. Labs: 20px.
- Learn section gap: 48px. Hub: 32px. Labs: 40px.

## Border Radius

- Inputs: 6px (`rounded-md`). Buttons: 8px (`rounded-lg`). Cards/modals: 12px (`rounded-xl`). Pills/avatars: 9999px (`rounded-full`).

## Shadows

- `shadow-sm`: subtle card default. `shadow-md`: dropdown/popover. `shadow-lg`: modal.
- Focus ring: `box-shadow: var(--focus-ring)` = `0 0 0 3px rgba(15,168,127,0.4)`. Use `focus-visible:shadow-focus` or `focus-visible:[box-shadow:var(--focus-ring)]`.

## Components (key rules)

- **Button**: One primary per viewport. Sizes: sm(32px), md(40px), lg(48px). Loading state disables interaction.
- **Card**: Default (border + surface bg), Interactive (hover lift), Sunken (inset bg).
- **Badge**: Pill shape. Semantic variants: primary, success, error, warning, info, pillar.
- **FormField**: Label above input. Error below with icon. Required = asterisk. Validate on blur + submit.
- **Toast**: Bottom-right desktop, bottom-center mobile. Success auto-dismisses (5s). Errors persist.
- **EmptyState**: Every empty list/grid must have one. Title + description + optional action.
- **ListRow**: 44–56px height. Status dot + title + metadata (right). Hover: bg-hover.

## Page Archetypes (pick one per page)

1. **Dense List**: Sidebar + list rows. Hub issues, Labs search results.
2. **Long-Form Reading**: Centered column (680–720px). Labs articles, Learn fragments.
3. **Guided Flow**: Centered narrow (560–640px) + stepper. Onboarding, wizards.
4. **Dashboard**: Stat card grid + content sections. Portfolio, admin.
5. **Split Editor**: Two panels, toolbar, no footer. IDE, article editor.
6. **Entity Detail**: Entity header + tabs. Institution, project, lab, profile.
7. **Discovery Grid**: Search + filter + card grid. Public square, track browser.

## Responsive Rules

- Mobile-first CSS. Breakpoints: sm(640), md(768), lg(1024), xl(1280).
- Sidebar: hidden <768px (Sheet), collapsed 768–1023px, expanded ≥1024px.
- Cards: single column <768px, 2-col 768–1023px, 3-col ≥1024px.
- Modals become bottom sheets on mobile.
- Min touch target: 44×44px.
- Primary buttons full-width on mobile in forms.

## 10 Anti-Patterns (NEVER do these)

1. **Hardcoded colors.** Every color must come from a token/Tailwind class.
2. **Two primary buttons in one view.** One primary, rest secondary/ghost.
3. **Color-only status.** Always add icon + text alongside color.
4. **Pillar accent on buttons.** Amber/slate/indigo are identity markers, not action colors.
5. **Font weight 600 or 700.** Only 400 and 500 exist.
6. **Border radius > 12px on containers.** 9999px is only for pills/avatars.
7. **Animation without purpose.** No confetti, no decorative bounces, no mascots.
8. **Placeholder as the only label.** Always include a visible `<label>`.
9. **Blank empty states.** Every empty list needs title + description + action.
10. **Full-screen spinners.** Show skeleton matching the page archetype during loading.

## Decision Tree for Common Patterns

```
Need a button?
  → Main action of the page? → primary variant
  → Cancel/back? → secondary variant
  → "See more"? → ghost or link variant
  → Delete/reject? → destructive variant

Need to show status?
  → Active/Published/Accepted → success badge (green) + check icon
  → In Review/Pending → warning badge (amber) + clock icon
  → Rejected/Failed → error badge (red) + x icon
  → Draft/Inactive → default badge (neutral)
  → Pillar identifier → pillar badge (pillar color)

Need loading state?
  → Page loading → skeleton matching page archetype
  → Button action → button loading state (spinner + disabled)
  → Section loading → skeleton for that section only
  → Optimistic action → update UI immediately, revert on error

Need to show an error?
  → Form field error → inline below input + red border
  → Action failed → toast (error variant, persists)
  → Section failed → inline error + retry button
  → Page failed → full-page EmptyState with guidance

What page archetype?
  → Scanning a list → Dense List
  → Reading content → Long-Form Reading
  → Step-by-step → Guided Flow
  → Overview with stats → Dashboard
  → Code/text editing → Split Editor
  → Viewing an entity → Entity Detail
  → Browsing a collection → Discovery Grid
```
