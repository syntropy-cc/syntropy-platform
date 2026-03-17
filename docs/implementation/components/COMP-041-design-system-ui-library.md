# Design System UI Library Implementation Record

> **Component ID**: COMP-041
> **Architecture Reference**: [DESIGN-TOKENS.md](../../design-system/DESIGN-TOKENS.md) · [COMPONENT-LIBRARY.md](../../design-system/COMPONENT-LIBRARY.md)
> **Design System Reference**: [VISUAL-DIRECTION.md](../../design-system/VISUAL-DIRECTION.md) · [PILLAR-PROFILES.md](../../design-system/PILLAR-PROFILES.md)
> **Stage Assignment**: S58 — Design System UI Library Compliance
> **Status**: ⬜ Not Started
> **Created**: 2026-03-17
> **Last Updated**: 2026-03-17
> **ADR**: [ADR-013](../../architecture/decisions/ADR-013-design-system-ui-library-compliance.md)
> **DS Evolution Impact Plan**: [ds-impact-ADR-013.md](../../design-system/evolution/ds-impact-ADR-013.md)

---

## Component Overview

### Architecture Summary

COMP-041 is the implementation of the Syntropy design system as a shared React UI library at `packages/ui` (published as `@syntropy/ui`). It is the single source for all UI components consumed by the three pillar apps (`apps/learn`, `apps/hub`, `apps/labs`) and the platform app (`apps/platform`).

The design system specification is fully defined in `docs/design-system/` and was produced during Phase 2b (UX/Interaction Design). COMP-041 bridges the specification to executable code: canonical CSS token file, Tailwind configuration, and all 28 components from `COMPONENT-LIBRARY.md`.

This component was not tracked separately prior to ADR-013. Before this record, `packages/ui` was treated as an unnamed dependency of COMP-032 (Web Application). ADR-013 formalizes it as a first-class architectural component that all pillar apps depend on, and identifies the gap between the current implementation and the design system specification.

**Responsibilities**:
- Implement `packages/ui/src/styles/tokens.css` as the canonical CSS token file (all three token layers from `DESIGN-TOKENS.md`)
- Expose all 28 components from `COMPONENT-LIBRARY.md` via `@syntropy/ui`
- Maintain WCAG 2.1 AA accessibility for all components
- Support light and dark mode via CSS token overrides
- Support pillar-level contextual theming via `--pillar-accent` token overrides

**Key Interfaces**:
- `@syntropy/ui` — named exports for all components
- `@syntropy/ui/styles` — CSS import for `tokens.css` (must be added to each app's root layout)
- Tailwind config preset exportable to consuming apps (optional)

### Implementation Scope

**In Scope**:
- `packages/ui/src/styles/tokens.css` — canonical CSS file with primitive, semantic, pillar tokens, and shadcn/ui bridge
- `packages/ui/tailwind.config.ts` — extended to implement DESIGN-TOKENS Section 7.1 full color map
- Refactored components: Button, Card, Badge, Sheet, Navbar, Footer, AppLayout (token-aligned)
- New components: Input, Textarea, Select, Checkbox, Switch, Avatar, PillarBadge, Skeleton, ProgressBar, Tooltip, FormField, Dialog, Toast, DropdownMenu, TabBar, StatCard, EmptyState, Breadcrumb, PageHeader, EntityHeader, ListRow (21 missing components from COMPONENT-LIBRARY)
- Consumer migration: update apps to use new component API

**Out of Scope**:
- IDE-specific components (MonacoEditor, IdeReconnectionIndicator, IdeWorkspaceRestoreIndicator) — they are in `packages/ui` but not part of the design system
- ThemeProvider — token-independent, no changes needed
- Design system specification itself (`docs/design-system/`) — the spec is correct and is not modified by COMP-041
- App-level page composition (COMP-032) — COMP-041 provides primitives; COMP-032 composes them into pages

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 5 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 15 |
| **Total** | **20** |

**Component Coverage**: 25% (5/20 items complete)

### Item List

#### [COMP-041.1] Create `tokens.css` — canonical design token file

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Size** | M |
| **Priority** | Critical |
| **Dependencies** | — |

**Description**: Create `packages/ui/src/styles/tokens.css` implementing all token layers from `DESIGN-TOKENS.md`. This is the foundation for all subsequent work — no component can be correctly implemented without this file.

**Acceptance Criteria**:
- [ ] File exists at `packages/ui/src/styles/tokens.css`
- [ ] `:root / [data-theme="light"]` block defines all primitive tokens (color scales §1.1–1.4), semantic tokens (§2.1–2.5), pillar tokens (§3), typography tokens (§4), spacing tokens (§5), border radius and shadow tokens (§6), and motion tokens (§8)
- [ ] `[data-theme="dark"]` block overrides all semantic tokens with correct dark-mode values
- [ ] shadcn/ui variable bridge implemented (§7.2): `--background → var(--bg-page)`, `--foreground → var(--text-primary)`, `--card → var(--bg-surface)`, `--primary → var(--action-primary)`, etc.
- [ ] `packages/ui/src/theme.css` is replaced by or becomes a re-export shim: `@import './styles/tokens.css'`
- [ ] Primary color `#0FA87F` (teal-esmeralda) renders as the button and link color in light and dark modes
- [ ] Glass morphism variables (`--glass-bg`, `--glass-border`) removed
- [ ] Gradient variables (`--gradient-hero`, `--gradient-accent`) removed
- [ ] `packages/ui` builds without errors

**Files to Create/Modify**:
- `packages/ui/src/styles/tokens.css` — Create
- `packages/ui/src/theme.css` — Replace content with `@import './styles/tokens.css'`
- `packages/ui/src/index.ts` — Export styles path if needed

---

#### [COMP-041.2] Update `tailwind.config.ts` — full DESIGN-TOKENS Section 7.1 mapping

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Size** | S |
| **Priority** | Critical |
| **Dependencies** | COMP-041.1 |

**Description**: Extend `packages/ui/tailwind.config.ts` to implement the full color mapping from `DESIGN-TOKENS.md` Section 7.1. This enables components to use semantic Tailwind classes (`bg-surface`, `text-muted-foreground`, `bg-pillar-subtle`) that resolve to correct CSS variables.

**Acceptance Criteria**:
- [ ] `primary` scale (50–900, DEFAULT, foreground) mapped to `var(--color-primary-N)` and `var(--text-inverse)`
- [ ] `pillar` (DEFAULT, subtle, text) mapped to pillar tokens
- [ ] `background` → `var(--bg-page)`, `surface` → `var(--bg-surface)`, `surface-raised` → `var(--bg-surface-raised)`, `surface-sunken` → `var(--bg-surface-sunken)`
- [ ] `foreground` → `var(--text-primary)`, `muted-foreground` → `var(--text-secondary)`
- [ ] `success`, `error`, `warning`, `info` (DEFAULT + light) mapped to semantic state tokens
- [ ] `border` → `var(--border-default)`, `border-strong` → `var(--border-strong)`
- [ ] Border radius aliases: `rounded-sm` → 4px, `rounded-md` → 6px, `rounded-lg` → 8px (button), `rounded-xl` → 12px (card), `rounded-full` → 9999px
- [ ] `tailwind.config.ts` in consuming apps (if they extend packages/ui config) can inherit these mappings

**Files to Modify**:
- `packages/ui/tailwind.config.ts`

---

#### [COMP-041.3] Refactor Button to DS compliance

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Size** | S |
| **Priority** | Critical |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Align Button to `COMPONENT-LIBRARY.md` Button spec. This is a breaking change — variant names change.

**Acceptance Criteria**:
- [ ] Variants: `primary` (filled teal), `secondary` (border + surface bg), `ghost` (no border, subtle hover), `destructive` (filled error), `link` (underline on hover, `--text-link`), `icon-only` (icon only, `aria-label` required)
- [ ] Sizes: `sm` (32px height, padding 12px), `md` (40px height, padding 16px, default), `lg` (48px height, padding 24px)
- [ ] `loading` prop: spinner replaces label; `aria-busy="true"`; interaction disabled
- [ ] `disabled` state: `aria-disabled`; `opacity-50`; `cursor-not-allowed`
- [ ] Focus ring: `box-shadow: var(--focus-ring)` (not `ring-2 ring-offset-2`)
- [ ] Hover: `--action-primary-hover` for primary; `--bg-hover` for secondary/ghost
- [ ] Active/pressed: `scale(0.98)` transform
- [ ] Mobile: primary buttons in forms are full-width (requires `fullWidth` prop or caller responsibility via `w-full`)
- [ ] `aria-label` is required when `variant="icon-only"` (enforced via TypeScript)
- [ ] All existing component tests updated and passing
- [ ] **Breaking change documented**: old `default` → new `primary`; old `outline` → new `secondary`

**Files to Modify**:
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/button.test.tsx`

---

#### [COMP-041.4] Refactor Card to DS compliance

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Size** | S |
| **Priority** | Critical |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Align Card to `COMPONENT-LIBRARY.md` Card spec. Remove deprecated variants; add correct ones.

**Acceptance Criteria**:
- [ ] Variants: `default` (`--bg-surface`, `--border-default`, `--radius-lg` 12px, `--shadow-sm`), `elevated` (`--bg-surface-raised`, `--shadow-md`, no border), `interactive` (default + hover `translateY(-2px)` + `--shadow-md`), `sunken` (`--bg-surface-sunken`, `--border-default`)
- [ ] Variant `glass` removed
- [ ] Variant `pillar` and prop `pillarHeader` removed
- [ ] `CardTitle` font weight changed from 600 (`font-semibold`) to 500 (`font-medium`)
- [ ] Hover lift animation only applies to `interactive` variant
- [ ] Padding: `--pillar-card-padding` token (16px default; can be overridden per pillar context)
- [ ] All hardcoded hex values replaced with token references
- [ ] **Breaking changes documented**: `glass` → `elevated`; `pillar` + `pillarHeader` → `default` + `PillarBadge`

**Files to Modify**:
- `packages/ui/src/components/card.tsx`

---

#### [COMP-041.5] Refactor Badge to DS compliance

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Size** | S |
| **Priority** | Critical |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Align Badge to `COMPONENT-LIBRARY.md` Badge spec. Token-based colors; correct typography; remove non-spec variants.

**Acceptance Criteria**:
- [ ] Variants: `default` (`--bg-surface-sunken`, `--text-primary`), `primary` (`--color-primary-50`, `--color-primary-800`), `success` (`--color-success-50`, `--color-success-700`), `error` (`--color-error-50`, `--color-error-700`), `warning` (`--color-warning-50`, `--color-warning-700`), `info` (`--color-info-50`, `--color-info-700`), `pillar` (`--pillar-accent-subtle`, `--pillar-accent-text`)
- [ ] Variants `learn`, `hub`, `labs`, `contribute`, `portfolio` removed
- [ ] No Tailwind opacity-slash syntax (`emerald-500/15`) — all token-based
- [ ] Typography: `--text-caption` (11px), weight 500
- [ ] Padding: 3px 10px (`py-[3px] px-[10px]` or equivalent)
- [ ] Shape: `--radius-full` (pill)
- [ ] **Breaking changes documented**: see migration guide in ds-impact-ADR-013.md

**Files to Modify**:
- `packages/ui/src/components/badge.tsx`

---

#### [COMP-041.6] Refactor Sheet to DS compliance

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Align Sheet to `COMPONENT-LIBRARY.md` Sheet spec. Correct overlay token; add animation.

**Acceptance Criteria**:
- [ ] Backdrop uses `--bg-overlay` (not `bg-black/50`)
- [ ] Panel background uses `--bg-surface`; border uses `--border-default`
- [ ] Panel `box-shadow: var(--shadow-lg)`
- [ ] Z-index: backdrop `var(--z-overlay)`; panel `var(--z-modal)`
- [ ] Entrance animation: 200ms slide from left + fade; respects `prefers-reduced-motion`
- [ ] Exit animation: 150ms slide + fade
- [ ] Width: 300px (side sheet); auto-height (bottom sheet, for mobile)
- [ ] Existing Sheet API (props: `open`, `onClose`, `children`, `className`) unchanged

**Files to Modify**:
- `packages/ui/src/components/sheet.tsx`

---

#### [COMP-041.7] Refactor Navbar, Footer, AppLayout to use new token names

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Update Navbar, Footer, and AppLayout to reference new token-based class names after the Tailwind config is updated. No functional or API changes.

**Acceptance Criteria**:
- [ ] Navbar height: 56px; `--bg-surface`; bottom border `--border-default`
- [ ] Navbar active link: `--text-primary` + weight 500 + 2px `--action-primary` bottom border
- [ ] Navbar inactive link: `--text-secondary`; hover `--bg-hover`
- [ ] Footer: column headers `--text-label`; links `--text-secondary`; hover `--text-primary`; copyright `--text-caption --text-tertiary`
- [ ] AppLayout: page background `--bg-page`
- [ ] All components build and existing tests pass

**Files to Modify**:
- `packages/ui/src/components/navbar.tsx`
- `packages/ui/src/components/footer.tsx`
- `packages/ui/src/components/app-layout.tsx`

---

#### [COMP-041.8] Create Input + Textarea + Select

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | M |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Input, Textarea, and Select as per `COMPONENT-LIBRARY.md`. These are required for all forms across pillar apps.

**Acceptance Criteria**:
- [ ] **Input**: height 40px; padding `--space-3` (12px); `--radius-md` (6px); default state `--border-default`; focus `--border-focus` + `box-shadow: var(--focus-ring)`; error `--border-error` + `box-shadow: var(--focus-ring-error)`; disabled: opacity 0.5, `--bg-surface-sunken`; read-only: `--bg-surface-sunken` no focus
- [ ] **Input**: types: `text`, `password`, `email`, `search`, `number`, `url`; `aria-invalid` on error; never placeholder-only (label required)
- [ ] **Textarea**: same styles as Input; min-height 80px; `resize: vertical`; line-height 1.6
- [ ] **Select**: same height/border as Input; chevron icon right-aligned; dropdown panel `--bg-surface-raised` + `--shadow-md` + `--radius-lg`; keyboard navigation via Radix Select
- [ ] All exported from `packages/ui/src/index.ts`
- [ ] Component tests for default, focus, error, disabled states

**Files to Create**:
- `packages/ui/src/components/input.tsx`
- `packages/ui/src/components/textarea.tsx`
- `packages/ui/src/components/select.tsx`

---

#### [COMP-041.9] Create Checkbox + Switch

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Checkbox and Switch as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] **Checkbox**: 20×20px; `--radius-sm` (4px); unchecked `--border-default`; checked `--action-primary` fill + white checkmark; indeterminate state; focus ring; label right with `--space-2` gap; `aria-checked`
- [ ] **Switch**: 40×24px track; off `--color-neutral-300` (light) / `--color-neutral-600` (dark); on `--action-primary`; thumb: white circle 20px; transition 200ms; `aria-checked`; `role="switch"`
- [ ] Both use Radix primitives for accessibility
- [ ] Exported from `packages/ui/src/index.ts`
- [ ] Tests for checked, unchecked, disabled states

**Files to Create**:
- `packages/ui/src/components/checkbox.tsx`
- `packages/ui/src/components/switch.tsx`

---

#### [COMP-041.10] Create Avatar + PillarBadge

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Avatar and PillarBadge. PillarBadge replaces the deprecated Card `pillar`/`pillarHeader` pattern and the non-spec Badge `learn`/`hub`/`labs` variants.

**Acceptance Criteria**:
- [ ] **Avatar**: sizes `sm` (24px) / `md` (32px) / `lg` (40px) / `xl` (64px); `--radius-full`; image fills circle; fallback: initials on `--pillar-accent-subtle` background; border `--border-default` 1px
- [ ] **PillarBadge**: props `pillar: "learn" | "hub" | "labs"`; Learn: `--color-learn-50` bg, `--color-learn-800` text; Hub: `--color-hub-50` bg, `--color-hub-800` text; Labs: `--color-labs-50` bg, `--color-labs-800` text; same shape/typography as Badge
- [ ] Both exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/avatar.tsx`
- `packages/ui/src/components/pillar-badge.tsx`

---

#### [COMP-041.11] Create Skeleton + ProgressBar

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | High |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Skeleton and ProgressBar as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] **Skeleton**: `--bg-surface-sunken`; shimmer animation (1.5s gradient sweep, infinite); `@media (prefers-reduced-motion: reduce)` disables animation; accepts `className` for shape/size matching
- [ ] **ProgressBar**: 8px height; `--bg-surface-sunken` track; `--action-primary` fill; `--radius-full`; `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"`; label text nearby
- [ ] Both exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/skeleton.tsx`
- `packages/ui/src/components/progress-bar.tsx`

---

#### [COMP-041.12] Create Tooltip + FormField

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | M |
| **Priority** | High |
| **Dependencies** | COMP-041.8, COMP-041.1, COMP-041.2 |

**Description**: Implement Tooltip and FormField as per `COMPONENT-LIBRARY.md`. FormField is the standard wrapper for all form inputs.

**Acceptance Criteria**:
- [ ] **Tooltip**: `--radius-md`; `--shadow-md`; `--text-caption` (11px); padding `--space-1.5 --space-2`; dark bg in light mode / light bg in dark mode; 300ms delay on hover; dismiss on Escape; `role="tooltip"`; `aria-describedby` on trigger
- [ ] **FormField**: renders Label (500 weight, `--text-label`, 13px) → optional helper text (`--text-caption`, `--text-secondary`) → input slot → optional error message (`--text-caption`, `--color-error-500`, error icon from Lucide); required fields show " *" asterisk in `--color-error-500`; label `htmlFor` links to input `id`; error text has `id` referenced by input `aria-describedby`
- [ ] FormField wraps Input, Textarea, Select, Checkbox (via `asChild` or children pattern)
- [ ] Both exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/tooltip.tsx`
- `packages/ui/src/components/form-field.tsx`

---

#### [COMP-041.13] Create Dialog

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | M |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Dialog as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] Centered; max-width sizes: 480px (sm), 640px (md, default), 800px (lg)
- [ ] `--bg-surface`; `--radius-lg` (12px); `--shadow-lg`; backdrop `--bg-overlay`; padding `--space-6`
- [ ] Close button (X icon) top-right corner
- [ ] Entrance: 200ms fade + `scale(0.95→1)`; Exit: 150ms fade + `scale(1→0.95)`; `prefers-reduced-motion` respected
- [ ] Mobile (<768px): full-screen sheet sliding up from bottom with drag handle
- [ ] Focus trapped inside; close on Escape; `aria-modal`; `aria-labelledby` (title element); `aria-describedby` (description element)
- [ ] Built on Radix Dialog
- [ ] Exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/dialog.tsx`

---

#### [COMP-041.14] Create Toast

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement Toast notifications as per `COMPONENT-LIBRARY.md` using Sonner.

**Acceptance Criteria**:
- [ ] Variants: `success` (green icon), `error` (red icon), `warning` (amber icon), `info` (blue icon), `default` (no icon)
- [ ] Position: bottom-right (desktop); bottom-center (mobile)
- [ ] `--bg-surface`; `--border-default`; `--radius-lg`; `--shadow-md`
- [ ] Success/info: auto-dismiss after 5s; error/warning: persist until dismissed
- [ ] Dismiss button (X)
- [ ] `role="status"` for success/info; `aria-live="assertive"` for error/warning
- [ ] Exported from `packages/ui/src/index.ts`
- [ ] Includes `<Toaster>` provider component

**Files to Create**:
- `packages/ui/src/components/toast.tsx`

---

#### [COMP-041.15] Create DropdownMenu + Breadcrumb

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement DropdownMenu and Breadcrumb as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] **DropdownMenu**: `--bg-surface-raised`; `--shadow-md`; `--radius-lg`; items 36px height; hover `--bg-hover`; dividers `--border-default`; icons 16px `--text-secondary`; `role="menu"` + `role="menuitem"`; arrow key navigation; close on Escape; built on Radix DropdownMenu
- [ ] **Breadcrumb**: items separated by chevron icon; current page `--text-primary` weight 500; parent pages `--text-link` (clickable links); font-size `--text-body-sm` (13px)
- [ ] Both exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/dropdown-menu.tsx`
- `packages/ui/src/components/breadcrumb.tsx`

---

#### [COMP-041.16] Create StatCard + EmptyState

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement StatCard and EmptyState as per `COMPONENT-LIBRARY.md`. EmptyState is required for every list/grid that can be empty.

**Acceptance Criteria**:
- [ ] **StatCard**: `--bg-surface-sunken`; `--radius-lg`; no border; label `--text-caption` `--text-secondary` weight 400; value `--text-h3` (18px) weight 500; optional trend line `--text-caption` with directional icon
- [ ] **EmptyState**: centered layout; max-width 400px; padding `--space-12`; optional illustration max-height 160px; title `--text-h3` `--text-primary`; description `--text-body` `--text-secondary`; optional primary action button
- [ ] Both exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/stat-card.tsx`
- `packages/ui/src/components/empty-state.tsx`

---

#### [COMP-041.17] Create TabBar + PageHeader + EntityHeader

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | M |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement TabBar, PageHeader, and EntityHeader as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] **TabBar**: `role="tablist"`/`role="tab"`/`role="tabpanel"`; active `--text-primary` weight 500 + 2px `--action-primary` bottom border; inactive `--text-secondary`; hover `--text-primary`; 44px height; arrow key navigation; horizontal scroll on mobile
- [ ] **PageHeader**: h1 `--text-h1` (28px) weight 500; description `--text-body` `--text-secondary`; action button right-aligned (desktop) / below title (mobile); padding-bottom `--space-6`
- [ ] **EntityHeader**: name (h1) + type badge + 3–4 inline stats (label `--text-body-sm --text-secondary` + value `--text-primary`) + primary action button; `--bg-surface`; padding `--space-6`; bottom `--border-default`
- [ ] All exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/tab-bar.tsx`
- `packages/ui/src/components/page-header.tsx`
- `packages/ui/src/components/entity-header.tsx`

---

#### [COMP-041.18] Create ListRow

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | S |
| **Priority** | Medium |
| **Dependencies** | COMP-041.1, COMP-041.2 |

**Description**: Implement ListRow as per `COMPONENT-LIBRARY.md`.

**Acceptance Criteria**:
- [ ] Height: 44–56px (configurable); padding `--space-3` vertical, `--space-4` horizontal
- [ ] Structure: optional status dot/icon + ID (monospace, optional) + title + metadata (right-aligned)
- [ ] Default border-bottom `--border-default`
- [ ] Hover: `--bg-hover`; Selected: `--bg-selected`; both via `data-state` or props
- [ ] Mobile (<768px): metadata wraps below title
- [ ] Exported from `packages/ui/src/index.ts`

**Files to Create**:
- `packages/ui/src/components/list-row.tsx`

---

#### [COMP-041.19] Migrate consuming apps to new component API

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | M |
| **Priority** | High |
| **Dependencies** | COMP-041.3, COMP-041.4, COMP-041.5, COMP-041.10 |

**Description**: Update all consuming apps to use the new component API, replacing all deprecated variants and inline Tailwind button styles.

**Acceptance Criteria**:
- [ ] No `Card variant="glass"` anywhere in `apps/`
- [ ] No `Card variant="pillar"` or `pillarHeader` prop anywhere in `apps/`
- [ ] No `Badge variant="learn"` / `"hub"` / `"labs"` / `"contribute"` / `"portfolio"` anywhere in `apps/`
- [ ] No `Button variant="default"` or `Button variant="outline"` anywhere in `apps/`
- [ ] No inline Tailwind `className="...h-10 px-4 py-2 bg-primary..."` patterns on `<a>` or `<Link>` elements — replaced with `<Button asChild>`
- [ ] All four apps (`apps/platform`, `apps/learn`, `apps/hub`, `apps/labs`) build successfully with no TypeScript errors
- [ ] Visual regression check: key pages (home, learn landing, hub landing, labs landing) render correctly with teal primary color

**Files to Modify**:
- `apps/platform/src/app/page.tsx`
- `apps/platform/src/app/learn/page.tsx`
- `apps/platform/src/app/hub/page.tsx`
- `apps/platform/src/app/labs/page.tsx`
- `apps/platform/src/app/portfolio/page.tsx`
- `apps/platform/src/app/contribute/page.tsx`
- `apps/platform/src/components/UserMenu.tsx`
- Any other files identified during migration

---

#### [COMP-041.20] Unit tests for all new and refactored components

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Size** | L |
| **Priority** | Medium |
| **Dependencies** | COMP-041.3 through COMP-041.18 |

**Description**: Comprehensive unit test suite for all 7 refactored and 21 new components in `packages/ui`.

**Acceptance Criteria**:
- [ ] Each component has a `.test.tsx` file in `packages/ui/src/components/`
- [ ] Button: tests for all 6 variants, 3 sizes, loading state (aria-busy), disabled state, icon-only (aria-label)
- [ ] Card: tests for all 4 variants, no glass or pillar variants
- [ ] Badge: tests for all 7 variants, typography
- [ ] Each form component (Input, Textarea, Select, Checkbox, Switch): tests for default, focus, error, disabled states
- [ ] FormField: tests for required asterisk, error message display, aria-describedby linkage
- [ ] EmptyState: renders title, description, action
- [ ] All existing tests (ThemeProvider, AppLayout, Sheet, etc.) still pass
- [ ] `packages/ui` test coverage ≥ 80% on component files
- [ ] Vitest + React Testing Library; no snapshot-only tests

**Files to Create**:
- `packages/ui/src/components/input.test.tsx`
- `packages/ui/src/components/select.test.tsx`
- `packages/ui/src/components/checkbox.test.tsx`
- `packages/ui/src/components/switch.test.tsx`
- `packages/ui/src/components/avatar.test.tsx`
- `packages/ui/src/components/pillar-badge.test.tsx`
- `packages/ui/src/components/skeleton.test.tsx`
- `packages/ui/src/components/progress-bar.test.tsx`
- `packages/ui/src/components/tooltip.test.tsx`
- `packages/ui/src/components/form-field.test.tsx`
- `packages/ui/src/components/dialog.test.tsx`
- `packages/ui/src/components/toast.test.tsx`
- `packages/ui/src/components/dropdown-menu.test.tsx`
- `packages/ui/src/components/breadcrumb.test.tsx`
- `packages/ui/src/components/stat-card.test.tsx`
- `packages/ui/src/components/empty-state.test.tsx`
- `packages/ui/src/components/tab-bar.test.tsx`
- `packages/ui/src/components/page-header.test.tsx`
- `packages/ui/src/components/entity-header.test.tsx`
- `packages/ui/src/components/list-row.test.tsx`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| DESIGN-TOKENS.md | Design System Spec | ✅ Available | Canonical token values |
| COMPONENT-LIBRARY.md | Design System Spec | ✅ Available | Component specs and acceptance criteria |
| Radix UI primitives | External Library | ✅ Available | Select, Checkbox, Switch, Dialog, DropdownMenu, Tooltip, TabBar |
| Sonner | External Library | ⬜ To Install | Toast notifications |
| Lucide React | External Library | ✅ Available | Icons (per DESIGN-TOKENS §9) |
| class-variance-authority (CVA) | External Library | ✅ Available | Variant management |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-032 (Web Application) | Consumes all UI components | All pillar UI pages blocked |
| apps/platform | Direct consumer | Platform pages render incorrect design |
| apps/learn | Direct consumer | Learn pillar UI blocked |
| apps/hub | Direct consumer | Hub pillar UI blocked |
| apps/labs | Direct consumer | Labs pillar UI blocked |

---

## Technical Details

### File Structure

```
packages/ui/
├── src/
│   ├── styles/
│   │   └── tokens.css              ← NEW: canonical token file
│   ├── components/
│   │   ├── button.tsx              ← REFACTOR
│   │   ├── card.tsx                ← REFACTOR
│   │   ├── badge.tsx               ← REFACTOR
│   │   ├── sheet.tsx               ← REFACTOR
│   │   ├── navbar.tsx              ← UPDATE (token names)
│   │   ├── footer.tsx              ← UPDATE (token names)
│   │   ├── app-layout.tsx          ← UPDATE (token names)
│   │   ├── input.tsx               ← NEW
│   │   ├── textarea.tsx            ← NEW
│   │   ├── select.tsx              ← NEW
│   │   ├── checkbox.tsx            ← NEW
│   │   ├── switch.tsx              ← NEW
│   │   ├── avatar.tsx              ← NEW
│   │   ├── pillar-badge.tsx        ← NEW (replaces Card pillar / Badge learn|hub|labs)
│   │   ├── skeleton.tsx            ← NEW
│   │   ├── progress-bar.tsx        ← NEW
│   │   ├── tooltip.tsx             ← NEW
│   │   ├── form-field.tsx          ← NEW
│   │   ├── dialog.tsx              ← NEW
│   │   ├── toast.tsx               ← NEW
│   │   ├── dropdown-menu.tsx       ← NEW
│   │   ├── tab-bar.tsx             ← NEW
│   │   ├── stat-card.tsx           ← NEW
│   │   ├── empty-state.tsx         ← NEW
│   │   ├── breadcrumb.tsx          ← NEW
│   │   ├── page-header.tsx         ← NEW
│   │   ├── entity-header.tsx       ← NEW
│   │   └── list-row.tsx            ← NEW
│   ├── theme.css                   ← REPLACE with @import './styles/tokens.css'
│   └── index.ts                    ← ADD all new component exports
└── tailwind.config.ts              ← EXTEND with full Section 7.1 mapping
```

### Key Design Decisions

All components use `class-variance-authority` (CVA) for variant management, consistent with the existing approach in `button.tsx`. Token references use CSS variables via Tailwind config (e.g. `bg-primary` → `var(--action-primary)`) rather than inline CSS variables, to maintain Tailwind IDE tooling compatibility.

Components that require complex interaction (Select, Dialog, DropdownMenu, Tooltip, Checkbox, Switch) are built on Radix UI primitives to ensure accessibility compliance without reimplementing keyboard navigation from scratch.

---

## Implementation Log

### 2026-03-17 — COMP-041.1–041.5 implemented

- **COMP-041.1**: Created `packages/ui/src/styles/tokens.css` with primitive (color scales), semantic (text, surfaces, borders, actions, focus), pillar defaults, typography, spacing, radius, shadow, z-index, motion; shadcn bridge (§7.2); dark mode overrides. Replaced `theme.css` with `@import './styles/tokens.css'`. No glass/gradient vars.
- **COMP-041.2**: Extended `tailwind.config.ts` with full Section 7.1: primary 50–900 + DEFAULT + foreground, pillar, surfaces, foreground/muted-foreground, success/error/warning/info (50/500/700), border/border-strong, borderRadius sm–full, boxShadow focus/focus-error.
- **COMP-041.3**: Button refactored to variants primary (default), secondary, ghost, destructive, link, icon-only; sizes sm (32px), md (40px), lg (48px), icon; `loading` prop with Loader2 spinner and aria-busy; focus ring `var(--focus-ring)`; active scale 0.98. Tests updated (8 tests).
- **COMP-041.4**: Card refactored to variants default, elevated, interactive, sunken; removed glass, pillar, pillarHeader; CardTitle font-medium (500); hover lift only on interactive.
- **COMP-041.5**: Badge refactored to 7 variants (default, primary, success, error, warning, info, pillar); token-based classes; 11px/500, py-[3px] px-[10px], rounded-full; removed learn/hub/labs/contribute/portfolio and size prop.
- **Fix**: app-layout.test.tsx updated to expect "Home" instead of "Platform" (ADR-012 IA).

### 2026-03-17 — Component Created

- Created COMP-041 implementation record based on ADR-013
- Extracted 20 work items from DESIGN-TOKENS.md and COMPONENT-LIBRARY.md gap analysis
- Identified dependencies: Radix UI (existing), Sonner (to install), Lucide React (existing)
- Stage S58 added to IMPLEMENTATION-PLAN.md

---

## References

### Architecture Documents

- [Design Tokens](../../design-system/DESIGN-TOKENS.md)
- [Component Library Specification](../../design-system/COMPONENT-LIBRARY.md)
- [Visual Direction](../../design-system/VISUAL-DIRECTION.md)
- [Pillar Profiles](../../design-system/PILLAR-PROFILES.md)
- [DS Evolution Impact Plan — ADR-013](../../design-system/evolution/ds-impact-ADR-013.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-013](../../architecture/decisions/ADR-013-design-system-ui-library-compliance.md) | Design System UI Library Compliance Refactor | Originating decision for this component |
| [ADR-001](../../architecture/decisions/ADR-001-modular-monolith.md) | Modular Monolith | Establishes `packages/ui` as shared library in Turborepo |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-032](./COMP-032-web-application.md) | Primary consumer — Web Application uses all @syntropy/ui components |
