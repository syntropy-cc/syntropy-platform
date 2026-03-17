# Design System Evolution Impact Plan

> **Change Request**: Refactor `packages/ui` to full design system compliance — introduce canonical token file, align existing components, and implement all 21 missing components.
> **ADR**: [ADR-013](../../architecture/decisions/ADR-013-design-system-ui-library-compliance.md)
> **Classification**: L2 — Minor
> **Date**: 2026-03-17

---

## Summary

The design system is fully specified in `docs/design-system/` but the shared UI library (`packages/ui`) does not implement it. The primary color is wrong, 21 components are missing, and all existing components use non-spec variants and tokens. This impact plan is the handoff from the design system documentation phase to the implementation phase: it maps every change required in `packages/ui` and specifies the new work items in `docs/implementation/` (COMP-041, Stage S58).

---

## 1. Token Changes Required

### 1.1 New File: `packages/ui/src/styles/tokens.css`

This file must be created as the canonical CSS file declared in `DESIGN-TOKENS.md`. It replaces the content of `packages/ui/src/theme.css` (which is retained as a re-export shim for backward compatibility with `@syntropy/ui/styles` imports).

**Structure**:
```
tokens.css
├── :root / [data-theme="light"]
│   ├── Primitive tokens (Section 1: color scales)
│   ├── Semantic tokens (Section 2: text, surfaces, borders, actions, focus)
│   └── Pillar tokens (Section 3: --pillar-accent etc.)
├── [data-theme="dark"] overrides
│   └── Semantic tokens for dark mode values
├── Motion tokens (Section 8)
├── Typography tokens (Section 4)
├── Spacing tokens (Section 5)
├── Radius/shadow tokens (Section 6)
└── shadcn/ui bridge (Section 7.2: --background → var(--bg-page), etc.)
```

### 1.2 Token Migration Map

Variables that currently exist in `theme.css` and their correct equivalents in `tokens.css`:

| Current (theme.css) | Value | New (tokens.css) | Notes |
|---------------------|-------|------------------|-------|
| `--background` (light: `0 0% 100%`) | #FFFFFF | `--bg-surface: var(--color-neutral-0)` | Wrong semantic — this is card/panel bg |
| `--background` (dark: `222.2 84% 4.9%`) | #0C0F1A | `--bg-page: var(--color-neutral-950)` | Current dark bg is wrong hex |
| `--primary` (light: `222.2 47.4% 11.2%`) | #131C2E | **Remove** | Wrong — was dark blue, not teal |
| `--primary` (dark: `217.2 91.2% 59.8%`) | #3B82F6 | **Remove** | Wrong — was blue, not teal |
| `--muted` | `210 40% 96.1%` | `--bg-surface-sunken: var(--color-neutral-100)` | — |
| `--muted-foreground` | — | `--text-secondary: var(--color-neutral-600)` | — |
| `--accent` | same as --muted | `--bg-hover: var(--color-neutral-100)` | — |
| `--border` (light: `214.3 31.8% 91.4%`) | — | `--border-default: var(--color-neutral-200)` | — |
| `--radius: 0.5rem` | 8px | `--radius-default: 8px` (keep alias) | — |
| `--radius-full: 9999px` | — | `--radius-full: 9999px` | Keep |
| `--glass-bg` | rgba(255,255,255,0.1) | **Remove** | Glass morphism deprecated |
| `--glass-blur` | 10px | **Remove** | Glass morphism deprecated |
| `--glass-border` | rgba(255,255,255,0.2) | **Remove** | Glass morphism deprecated |
| `--gradient-hero` | — | **Remove** | Not in design system token spec |
| `--gradient-accent` | — | **Remove** | Not in design system token spec |
| `--shadow-focus` | `0 0 0 3px hsl(221.2 83.2% 53.3% / 0.4)` | `--focus-ring: 0 0 0 3px rgba(15,168,127,0.4)` | Correct to teal |
| `--shadow-nav-active` | blue shadow | **Remove** | Not in design system |
| `--bg-section-alt` | — | `--bg-surface-sunken: var(--color-neutral-100)` | — |

**New tokens added (not in current theme.css)**:

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--color-primary-50` through `--color-primary-900` | Per DESIGN-TOKENS §1.1 | Same (primitive) |
| `--color-neutral-0` through `--color-neutral-950` | Per DESIGN-TOKENS §1.2 | Same (primitive) |
| `--color-success-*`, `--color-error-*`, `--color-warning-*`, `--color-info-*` | Per DESIGN-TOKENS §1.3 | Same (primitive) |
| `--color-learn-*`, `--color-hub-*`, `--color-labs-*` | Per DESIGN-TOKENS §1.4 | Same (primitive) |
| `--text-primary` | `#27272A` | `#F4F4F5` |
| `--text-secondary` | `#52525B` | `#A1A1AA` |
| `--text-tertiary` | `#A1A1AA` | `#71717A` |
| `--text-disabled` | `#A1A1AA` | `#52525B` |
| `--text-inverse` | `#FFFFFF` | `#FFFFFF` |
| `--text-link` | `#0D8F6C` | `#26BD9A` |
| `--bg-page` | `#FAFAFA` | `#0F1117` |
| `--bg-surface` | `#FFFFFF` | `#1A1D27` |
| `--bg-surface-raised` | `#FFFFFF` | `#141419` |
| `--bg-surface-sunken` | `#F4F4F5` | `#0F1117` |
| `--bg-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.6)` |
| `--bg-hover` | `#F4F4F5` | `rgba(255,255,255,0.06)` |
| `--bg-selected` | `#E0F5F0` | `rgba(15,168,127,0.12)` |
| `--border-default` | `#E4E4E7` | `rgba(255,255,255,0.10)` |
| `--border-strong` | `#D4D4D8` | `rgba(255,255,255,0.16)` |
| `--border-focus` | `#0FA87F` | `#26BD9A` |
| `--border-error` | `#E24B4A` | `#E24B4A` |
| `--action-primary` | `#0FA87F` | `#0FA87F` |
| `--action-primary-hover` | `#0D8F6C` | `#26BD9A` |
| `--action-primary-active` | `#0A7358` | `#4DCAAD` |
| `--action-destructive` | `#E24B4A` | `#E24B4A` |
| `--action-destructive-hover` | `#A32D2D` | `#A32D2D` |
| `--focus-ring` | `0 0 0 3px rgba(15,168,127,0.4)` | Same |
| `--focus-ring-error` | `0 0 0 3px rgba(226,75,74,0.4)` | Same |
| `--pillar-accent` | (per-app override) | — |
| `--pillar-accent-subtle` | (per-app override) | — |
| `--pillar-accent-text` | (per-app override) | — |
| `--font-sans`, `--font-mono`, `--font-serif` | Per §4.1 | — |
| `--text-display` through `--text-code` | Per §4.2 | — |
| `--space-0.5` through `--space-24` | Per §5 | — |
| `--radius-sm` through `--radius-full` | Per §6.1 | — |
| `--shadow-sm` through `--shadow-focus` | Per §6.2 | — |
| `--z-base` through `--z-tooltip` | Per §6.3 | — |
| `--duration-fast` through `--ease-exit` | Per §8 | — |

### 1.3 Tailwind Config Migration

**Current** (`tailwind.config.ts`): extends only 5 aliases via `hsl(var(...))`.

**Required** (DESIGN-TOKENS Section 7.1): full color map. Key additions:

```typescript
// Add to theme.extend.colors:
primary: {
  50: 'var(--color-primary-50)',
  // ...through 900
  DEFAULT: 'var(--color-primary-500)',
  foreground: 'var(--text-inverse)',
},
pillar: {
  DEFAULT: 'var(--pillar-accent)',
  subtle: 'var(--pillar-accent-subtle)',
  text: 'var(--pillar-accent-text)',
},
background: 'var(--bg-page)',
surface: 'var(--bg-surface)',
'surface-raised': 'var(--bg-surface-raised)',
'surface-sunken': 'var(--bg-surface-sunken)',
foreground: 'var(--text-primary)',
'muted-foreground': 'var(--text-secondary)',
success: { DEFAULT: 'var(--color-success-500)', light: 'var(--color-success-50)' },
error: { DEFAULT: 'var(--color-error-500)', light: 'var(--color-error-50)' },
warning: { DEFAULT: 'var(--color-warning-500)', light: 'var(--color-warning-50)' },
info: { DEFAULT: 'var(--color-info-500)', light: 'var(--color-info-50)' },
border: 'var(--border-default)',
'border-strong': 'var(--border-strong)',
```

---

## 2. Component Changes Required

### 2.1 Existing Components — Refactor

| Component | Change Type | Key Changes | Breaking? |
|-----------|-------------|-------------|-----------|
| **Button** | Updated | Rename `default` → `primary`; rename `outline` → `secondary`; add `destructive`, `link`, `icon-only`; add `loading` prop with `aria-busy`; fix focus ring to `--focus-ring`; fix sizes to 32/40/48px | Yes — variant names |
| **Card** | Updated | Remove `glass` variant; remove `pillar` variant and `pillarHeader` prop; add `elevated`, `interactive`, `sunken`; remove hover lift from `default` (only `interactive` lifts); fix `CardTitle` to `font-medium` (500); replace all Tailwind utility classes with token-based classes | Yes — variants and props |
| **Badge** | Updated | Remove `learn`, `hub`, `labs`, `contribute`, `portfolio` variants; add `primary`, `info`; replace all Tailwind utility opacity classes with token-based classes; fix typography to 11px / weight 500; fix padding to 3px 10px | Yes — variants |
| **Sheet** | Updated | Replace `bg-black/50` backdrop with `var(--bg-overlay)`; replace `bg-background` panel with `var(--bg-surface)`; replace `border-border` with `var(--border-default)`; add entrance/exit animation (200ms slide + fade); fix z-index to `var(--z-overlay)` for backdrop, `var(--z-modal)` for panel | No — API unchanged |
| **Navbar** | Updated | Replace all token references to use new token names; active state uses `var(--text-primary)` + teal bottom border | No — API unchanged |
| **Footer** | Updated | Replace token references; links use `var(--text-secondary)`, hover `var(--text-primary)` | No — API unchanged |
| **AppLayout** | Updated | Replace token references; background uses `var(--bg-page)` | No — API unchanged |
| **ThemeToggle** | Updated | Replace token references | No — API unchanged |
| **Logo** | Updated | Replace any hardcoded colors with token references | No — API unchanged |

### 2.2 Missing Components — Create

Ordered by implementation priority (dependencies and cross-pillar usage):

**Priority: Critical (needed for basic pages)**

| Component | Level | shadcn Base | Key DS Spec Points |
|-----------|-------|-------------|-------------------|
| `Input` | Atom | `input.tsx` | 40px height, `--radius-md`, `--border-default`, focus → `--border-focus` + `--focus-ring`, error state |
| `Textarea` | Atom | `textarea.tsx` | Same as Input; min-height 80px; `resize: vertical` |
| `Select` | Atom | `select.tsx` | Same as Input; chevron icon; dropdown uses `--bg-surface-raised` + `--shadow-md` + `--radius-lg` |
| `FormField` | Molecule | Custom | Label (`--text-label`, 500) → optional helper text → Input → error message (icon + `--color-error-500`) |
| `Skeleton` | Atom | `skeleton.tsx` | `--bg-surface-sunken`; shimmer animation; `prefers-reduced-motion` respected |

**Priority: High (needed for pillar features)**

| Component | Level | shadcn Base | Key DS Spec Points |
|-----------|-------|-------------|-------------------|
| `Checkbox` | Atom | `checkbox.tsx` | 20×20px; `--radius-sm`; checked → `--action-primary`; focus ring |
| `Switch` | Atom | `switch.tsx` | 40×24px track; off → `--color-neutral-300`; on → `--action-primary`; white thumb |
| `Avatar` | Atom | `avatar.tsx` | Sizes sm/md/lg/xl; `--radius-full`; fallback initials on `--pillar-accent-subtle` |
| `PillarBadge` | Organism | Custom | Learn amber, Hub slate, Labs indigo; token-based; replaces Card pillarHeader prop |
| `Tooltip` | Atom | `tooltip.tsx` | `--radius-md`; `--shadow-md`; 300ms delay; dismiss on Escape; `aria-describedby` |
| `ProgressBar` | Atom | Custom | 8px height; `--bg-surface-sunken` track; `--action-primary` fill; `role="progressbar"` |

**Priority: Medium (needed for complete UI)**

| Component | Level | shadcn Base | Key DS Spec Points |
|-----------|-------|-------------|-------------------|
| `Dialog` | Molecule | `dialog.tsx` | Max-width 480/640/800px; `--shadow-lg`; `--bg-overlay` backdrop; entrance animation; focus trap |
| `Toast` | Molecule | `sonner` | Bottom-right desktop, bottom-center mobile; 5s auto-dismiss; success/error/warning/info variants; `aria-live` |
| `DropdownMenu` | Molecule | `dropdown-menu.tsx` | `--bg-surface-raised`; `--shadow-md`; `--radius-lg`; 36px item height; `--bg-hover` |
| `TabBar` | Molecule | `tabs.tsx` | Active: `--text-primary` + 2px `--action-primary` border; 44px height; keyboard nav |
| `StatCard` | Molecule | Custom | `--bg-surface-sunken`; `--radius-lg`; label `--text-caption`; value `--text-h3` |
| `EmptyState` | Molecule | Custom | Centered; max-width 400px; title `--text-h3`; description `--text-secondary`; optional action |
| `Breadcrumb` | Molecule | Custom | Parent pages `--text-link`; current `--text-primary` 500; `--text-body-sm` |
| `PageHeader` | Organism | Custom | h1 `--text-h1`; description `--text-secondary`; action button right-aligned |
| `EntityHeader` | Organism | Custom | Name h1 + type badge + 3–4 inline stats + primary action |
| `ListRow` | Organism | Custom | 44–56px height; status dot + title + metadata; hover `--bg-hover`; selected `--bg-selected` |

### 2.3 Components with No Changes Required

| Component | Notes |
|-----------|-------|
| `ThemeProvider` | Token-independent; no changes needed |
| `MonacoEditor` | IDE component; not a design system component |
| `IdeReconnectionIndicator` | IDE-specific; not a design system component |
| `IdeWorkspaceRestoreIndicator` | IDE-specific; not a design system component |

---

## 3. Consuming App Changes Required

### apps/platform

| File | Change | Pattern |
|------|--------|---------|
| `src/app/learn/page.tsx` | `Badge variant="learn"` → `<PillarBadge pillar="learn">` or `Badge variant="pillar"` | Find-replace |
| `src/app/learn/page.tsx` | `Card variant="pillar" pillarHeader="learn"` → `Card variant="default"` | Find-replace |
| `src/app/hub/page.tsx` | Same as learn for hub | Find-replace |
| `src/app/labs/page.tsx` | Same as learn for labs | Find-replace |
| `src/app/portfolio/page.tsx` | `Card` usage — verify no deprecated variants | Review |
| `src/app/contribute/page.tsx` | `Card` usage — verify no deprecated variants | Review |
| `src/app/page.tsx` | `Card` usage — verify no deprecated variants | Review |
| `src/components/UserMenu.tsx` | Inline `className` for button-style elements → `<Button>` | Refactor |
| All pages | Inline `className="...h-10 px-4 py-2 bg-primary..."` anchor/link styled as button → `<Button asChild><Link>` | Find-replace |

### apps/learn, apps/hub, apps/labs

| Pattern | Change |
|---------|--------|
| `import { ThemeProvider, AppLayout, ThemeToggle } from "@syntropy/ui"` | No change needed — API unchanged |
| App globals importing `@syntropy/ui/styles` (theme.css) | Verify tokens.css is picked up; no code change needed if re-export shim is in place |

---

## 4. Accessibility Impact

| Change | Impact | WCAG Criterion |
|--------|--------|----------------|
| Focus ring corrected from `ring-2 ring-offset-2` to `--focus-ring` (3px teal) | Positive: consistent 3:1 contrast focus indicator on all interactive elements | 2.4.7 |
| Button `loading` state with `aria-busy="true"` | Positive: screen readers announce loading state | 4.1.3 |
| Button `disabled` with `aria-disabled` (not native `disabled`) | Positive: allows focus and announces state; prevents accidental clicks | 4.1.2 |
| Badge status variants always require icon + text companion | Positive: status not conveyed by color alone | 1.4.1 |
| `FormField` error text linked via `aria-describedby` | Positive: error announced by screen reader | 3.3.1 |
| Touch targets minimum 44×44px enforced in Button sizes | Positive: meets mobile accessibility requirement | 2.5.5 |
| Removal of glass morphism (low-contrast overlaid text) | Positive: eliminates a known contrast risk | 1.4.3 |

---

## 5. Migration Guide for Apps

### Step 1 — Update token import (all apps)

After `COMP-041.1` is complete, apps automatically receive the new tokens when they import `@syntropy/ui/styles`. No code change needed unless an app imports specific variables from `theme.css`.

Verify: all apps use `@syntropy/ui/styles` and not `@syntropy/ui/src/theme.css` directly.

### Step 2 — Fix Card usage (COMP-041.18)

```bash
# Find all non-spec Card usages
grep -rn 'variant="glass"' apps/
grep -rn 'variant="pillar"' apps/
grep -rn 'pillarHeader=' apps/
```

Replace:
- `<Card variant="glass">` → `<Card variant="elevated">`
- `<Card variant="pillar" pillarHeader="learn">` → `<Card variant="default">` (add `<PillarBadge pillar="learn">` inside if pillar label is needed)

### Step 3 — Fix Badge usage (COMP-041.18)

```bash
grep -rn 'variant="learn"' apps/
grep -rn 'variant="hub"' apps/
grep -rn 'variant="labs"' apps/
grep -rn 'variant="contribute"' apps/
grep -rn 'variant="portfolio"' apps/
```

Replace:
- `<Badge variant="learn">` → `<PillarBadge pillar="learn">` (if identifying pillar) or `<Badge variant="primary">` (if using as generic badge)
- `<Badge variant="hub">` → `<PillarBadge pillar="hub">`
- `<Badge variant="labs">` → `<PillarBadge pillar="labs">`
- `<Badge variant="contribute">` → `<Badge variant="primary">`
- `<Badge variant="portfolio">` → `<Badge variant="default">`

### Step 4 — Fix Button usage (COMP-041.18)

```bash
grep -rn 'variant="default"' apps/
grep -rn 'variant="outline"' apps/
```

Replace:
- `<Button variant="default">` → `<Button variant="primary">`
- `<Button variant="outline">` → `<Button variant="secondary">`

### Step 5 — Replace inline button-style anchors (COMP-041.18)

```bash
grep -rn 'className="inline-flex items-center justify-center rounded-md h-10' apps/
```

Replace inline Tailwind button class strings on `<a>` and `<Link>` elements with:
```tsx
<Button variant="primary" asChild>
  <Link href="...">Label</Link>
</Button>
```

---

## 6. Implementation Work Items

These work items are tracked in `docs/implementation/` as **COMP-041** and **Stage S58**:

| ID | Title | Size | Priority | Dependencies |
|----|-------|------|----------|-------------|
| COMP-041.1 | Create `tokens.css` (primitive + semantic + pillar + shadcn bridge) | M | Critical | — |
| COMP-041.2 | Update `tailwind.config.ts` (DESIGN-TOKENS Section 7.1) | S | Critical | COMP-041.1 |
| COMP-041.3 | Refactor Button (variants, loading, focus ring, sizes) | S | Critical | COMP-041.1 |
| COMP-041.4 | Refactor Card (remove glass/pillar, add elevated/interactive/sunken, fix typography) | S | Critical | COMP-041.1 |
| COMP-041.5 | Refactor Badge (token-based variants, remove non-spec, fix typography) | S | Critical | COMP-041.1 |
| COMP-041.6 | Refactor Sheet (overlay token, animation, z-index) | S | High | COMP-041.1 |
| COMP-041.7 | Refactor Navbar/Footer/AppLayout to use new token names | S | High | COMP-041.1 |
| COMP-041.8 | Create Input + Textarea + Select | M | High | COMP-041.1 |
| COMP-041.9 | Create Checkbox + Switch | S | High | COMP-041.1 |
| COMP-041.10 | Create Avatar + PillarBadge | S | High | COMP-041.1 |
| COMP-041.11 | Create Skeleton + ProgressBar | S | High | COMP-041.1 |
| COMP-041.12 | Create Tooltip + FormField | M | High | COMP-041.8 |
| COMP-041.13 | Create Dialog | M | Medium | COMP-041.1 |
| COMP-041.14 | Create Toast (Sonner with DS tokens) | S | Medium | COMP-041.1 |
| COMP-041.15 | Create DropdownMenu + Breadcrumb | S | Medium | COMP-041.1 |
| COMP-041.16 | Create StatCard + EmptyState | S | Medium | COMP-041.1 |
| COMP-041.17 | Create TabBar + PageHeader + EntityHeader | M | Medium | COMP-041.1 |
| COMP-041.18 | Create ListRow | S | Medium | COMP-041.1 |
| COMP-041.19 | Migrate consuming apps (find-replace deprecated variants + inline buttons) | M | High | COMP-041.3 COMP-041.4 COMP-041.5 COMP-041.10 |
| COMP-041.20 | Unit tests for all new and refactored components | L | Medium | COMP-041.3–COMP-041.18 |

**Total new work items**: 20 (COMP-041.1 through COMP-041.20)

---

## 7. Handoff to Implementation

**New component record**: `docs/implementation/components/COMP-041-design-system-ui-library.md`

**New stage**: S58 — Design System UI Library Compliance (M6 or extension of M5)

**Total new work items**: 20

**Next step**: After this Impact Plan and the implementation docs (COMP-041 component record, IMPLEMENTATION-PLAN.md S58, BACKLOG.md) are in place, run **`/08e`** to begin code implementation starting with COMP-041.1.

---

## 8. Post-Change Compliance Verification

After implementation is complete (all COMP-041 items Done), verify:

- [ ] `packages/ui/src/styles/tokens.css` exists and implements all DESIGN-TOKENS sections
- [ ] Primary color `#0FA87F` renders in browser (light and dark mode)
- [ ] All 28 components from COMPONENT-LIBRARY.md are present in `packages/ui`
- [ ] No `font-semibold` or `font-bold` classes anywhere in `packages/ui`
- [ ] No hardcoded hex colors in component files
- [ ] No `glass` Card variant in codebase
- [ ] No `learn`/`hub`/`labs`/`contribute`/`portfolio` Badge variants in component file
- [ ] Button `loading` prop tested and `aria-busy` verified
- [ ] Focus rings pass 3:1 contrast check in both modes
- [ ] All apps build successfully post-migration
