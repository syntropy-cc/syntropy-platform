# Component Library — Syntropy Ecosystem

> **Document Type**: Component Library
> **Project**: Syntropy Ecosystem
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Interaction Patterns Reference**: `docs/design-system/INTERACTION-PATTERNS.md`
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-16

---

## Purpose

This document specifies every reusable component in the Syntropy design system. Components live in `packages/ui` and are consumed by all pillar apps. Implementation uses **shadcn/ui** as the base, customized with Syntropy design tokens.

**Atomic Design Levels**: Atom (single element), Molecule (composed of atoms), Organism (section-level composition).

---

## Component Index

| Component | Level | Status | shadcn Base |
|-----------|-------|--------|-------------|
| [Button](#button) | Atom | ✅ Defined | `button.tsx` |
| [Input](#input) | Atom | ✅ Defined | `input.tsx` |
| [Textarea](#textarea) | Atom | ✅ Defined | `textarea.tsx` |
| [Select](#select) | Atom | ✅ Defined | `select.tsx` |
| [Checkbox](#checkbox) | Atom | ✅ Defined | `checkbox.tsx` |
| [Switch](#switch) | Atom | ✅ Defined | `switch.tsx` |
| [Badge](#badge) | Atom | ✅ Defined | `badge.tsx` |
| [Avatar](#avatar) | Atom | ✅ Defined | `avatar.tsx` |
| [Card](#card) | Atom | ✅ Defined | `card.tsx` |
| [Skeleton](#skeleton) | Atom | ✅ Defined | `skeleton.tsx` |
| [ProgressBar](#progressbar) | Atom | ✅ Defined | Custom |
| [Tooltip](#tooltip) | Atom | ✅ Defined | `tooltip.tsx` |
| [FormField](#formfield) | Molecule | ✅ Defined | Custom |
| [StatCard](#statcard) | Molecule | ✅ Defined | Custom |
| [Navbar](#navbar) | Molecule | ✅ Defined | Custom |
| [Sidebar](#sidebar) | Molecule | ✅ Defined | Custom |
| [TabBar](#tabbar) | Molecule | ✅ Defined | `tabs.tsx` |
| [Dialog](#dialog) | Molecule | ✅ Defined | `dialog.tsx` |
| [Sheet](#sheet) | Molecule | ✅ Defined | `sheet.tsx` |
| [Toast](#toast) | Molecule | ✅ Defined | `sonner` or `toast.tsx` |
| [DropdownMenu](#dropdownmenu) | Molecule | ✅ Defined | `dropdown-menu.tsx` |
| [Breadcrumb](#breadcrumb) | Molecule | ✅ Defined | Custom |
| [EmptyState](#emptystate) | Molecule | ✅ Defined | Custom |
| [PageHeader](#pageheader) | Organism | ✅ Defined | Custom |
| [EntityHeader](#entityheader) | Organism | ✅ Defined | Custom |
| [ListRow](#listrow) | Organism | ✅ Defined | Custom |
| [PillarBadge](#pillarbadge) | Atom | ✅ Defined | Custom |
| [Footer](#footer) | Organism | ✅ Defined | Custom |

---

## Atom Components

### Button

**Purpose**: Triggers an action or event.

**Variants**:
| Variant | When to Use | Style |
|---------|-------------|-------|
| `primary` | Main action (one per view): "Publish," "Submit," "Create" | Filled `--action-primary`, white text |
| `secondary` | Secondary actions: "Cancel," "Back," "Skip" | `--border-default`, `--bg-surface`, `--text-primary` |
| `ghost` | Tertiary: "View all," "Learn more" | No border, subtle hover `--bg-hover` |
| `destructive` | Irreversible: "Delete," "Reject" | Filled `--action-destructive`, white text |
| `link` | Navigate to another page | Underline on hover, `--text-link` color |
| `icon-only` | Space-constrained; text in tooltip | Icon only; `aria-label` required |

**Sizes**: `sm` (32px height), `md` (40px height), `lg` (48px height).

**States**: Default, Hover (darker shade), Focus (`--focus-ring`), Active (scale 0.98), Disabled (opacity 0.5, cursor not-allowed), Loading (spinner replaces label, `aria-busy`).

**Accessibility**: Native `<button>`. `aria-disabled` when disabled. `aria-busy` when loading. `aria-label` required for icon-only.

**Responsive**: On mobile (<768px), primary buttons in forms and Guided Flow are full-width.

**Rules**:
- One primary button per viewport.
- Loading state must disable interaction.
- Minimum touch target 44×44px on mobile.

```tsx
<Button variant="primary" onClick={handlePublish} loading={isPublishing}>
  Publish artifact
</Button>

<Button variant="destructive" onClick={handleReject}>
  Reject contribution
</Button>

<Button variant="icon-only" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

---

### Input

**Purpose**: Single-line text entry.

**Types**: `text`, `password`, `email`, `search`, `number`, `url`.

**States**: Default (`--border-default`), Focus (`--border-focus` + `--focus-ring`), Error (`--border-error` + `--focus-ring-error`), Disabled (opacity 0.5, `--bg-surface-sunken`), Read-only (`--bg-surface-sunken`, no focus ring).

**Specs**: Height 40px, padding `--space-3` (12px), border-radius `--radius-md` (6px), font-size `--text-body` (14px).

**Accessibility**: Always paired with `<label>` via `id`/`htmlFor`. `aria-invalid` when error. `aria-describedby` pointing to error text. Never use placeholder as the sole label.

---

### Textarea

**Purpose**: Multi-line text entry. Used for descriptions, comments, article excerpts.

**Specs**: Same styling as Input. Min-height 80px. Resizable vertically (`resize: vertical`). Line-height 1.6.

---

### Select

**Purpose**: Choose from a list of options.

**Specs**: Same height and border as Input (40px). Chevron icon right-aligned. Dropdown panel uses `--bg-surface-raised`, `--shadow-md`, `--radius-lg`.

**Accessibility**: Use shadcn Select (Radix) for keyboard navigation. `aria-expanded`, `aria-activedescendant`.

---

### Checkbox

**Purpose**: Toggle a boolean option. Used in filters, settings, multi-select.

**Specs**: 20×20px box, `--radius-sm` (4px). Checked: `--action-primary` fill with white checkmark. Focus ring on keyboard focus. Label positioned to the right with `--space-2` (8px) gap.

**Accessibility**: Native `<input type="checkbox">` or Radix Checkbox. Label always present.

---

### Switch

**Purpose**: Toggle on/off for immediate effect (e.g., notification preference, dark mode).

**Specs**: 40×24px track. Off: `--color-neutral-300` (light), `--color-neutral-600` (dark). On: `--action-primary`. Thumb: white circle, 20px, with shadow.

**When to use Switch vs Checkbox**: Switch for immediate effect (no submit button needed). Checkbox for form submissions (batched with other fields).

---

### Badge

**Purpose**: Tags, status labels, pillar identifiers.

**Variants**:
| Variant | Background | Text Color | Usage |
|---------|------------|------------|-------|
| `default` | `--bg-surface-sunken` | `--text-primary` | Generic tags |
| `primary` | `--color-primary-50` | `--color-primary-800` | Primary status |
| `success` | `--color-success-50` | `--color-success-700` | Accepted, Active, Published |
| `error` | `--color-error-50` | `--color-error-700` | Rejected, Failed |
| `warning` | `--color-warning-50` | `--color-warning-700` | In Review, Pending |
| `info` | `--color-info-50` | `--color-info-700` | Informational |
| `pillar` | `--pillar-accent-subtle` | `--pillar-accent-text` | Pillar identifier |

**Specs**: Padding 3px 10px, `--radius-full`, font-size `--text-caption` (11px), weight 500.

**Accessibility**: Badges conveying status must pair with icon or text; color alone never communicates state.

---

### Avatar

**Purpose**: User or institution identity.

**Sizes**: `sm` (24px), `md` (32px), `lg` (40px), `xl` (64px).

**Specs**: Circular (`--radius-full`). Image fills circle. Fallback: initials on `--pillar-accent-subtle` background with `--pillar-accent-text` color. Border: `--border-default` (1px).

---

### Card

**Purpose**: Container for content blocks.

**Variants**:
| Variant | When to Use | Style |
|---------|-------------|-------|
| `default` | Standard content container | `--bg-surface`, `--border-default`, `--radius-lg` (12px) |
| `elevated` | Popovers, dropdowns, hover cards | `--bg-surface-raised`, `--shadow-md`, `--radius-lg` |
| `interactive` | Clickable cards (discovery grid, track browser) | Default + hover: `translateY(-2px)` + `--shadow-md` |
| `sunken` | Inset sections, code block containers | `--bg-surface-sunken`, `--border-default`, `--radius-lg` |

**Padding**: Per pillar token `--pillar-card-padding`. Default: `--space-4` (16px).

**Responsive**: Cards stack to single column on mobile. Padding does not change.

---

### Skeleton

**Purpose**: Loading placeholder for content that is being fetched.

**Specs**: Rounded rectangle matching the content it replaces. Background: `--bg-surface-sunken`. Shimmer animation: subtle left-to-right gradient sweep, 1.5s duration, infinite loop. Respects `prefers-reduced-motion` (no animation when reduced).

**Usage**: Match the shape and size of the content being loaded. A StatCard skeleton has the same dimensions as a StatCard. A ListRow skeleton has the same height as a ListRow.

---

### ProgressBar

**Purpose**: Visual progress indication.

**Specs**: Track: 8px height, `--bg-surface-sunken`, `--radius-full`. Fill: `--action-primary` (teal), `--radius-full`. Width proportional to progress percentage.

**Accessibility**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, text label nearby (e.g., "35% complete").

---

### Tooltip

**Purpose**: Supplementary information on hover/focus.

**Specs**: `--bg-neutral-800` (light) / `--bg-neutral-100` (dark), `--text-inverse` / `--text-primary`, `--radius-md` (6px), padding `--space-1.5` `--space-2`, font-size `--text-caption`, `--shadow-md`. Arrow pointing to trigger element. Appears on hover (300ms delay) and focus.

**Accessibility**: `role="tooltip"`, `aria-describedby` on trigger. Dismiss on Escape.

---

## Molecule Components

### FormField

**Purpose**: Wraps an input (Input, Textarea, Select, Checkbox) with label, optional helper text, and error message.

**Structure**:
```
[Label]              ← --text-label (13px, weight 500), --text-primary
[Helper text]        ← --text-caption, --text-secondary (optional)
[Input component]
[Error message]      ← --text-caption, --color-error-500, with error icon
```

**Specs**: Label above input, `--space-1.5` (6px) gap. Error message below input, `--space-1` (4px) gap. Required fields: label ends with " *" (asterisk in `--color-error-500`).

**Accessibility**: Label's `htmlFor` matches input's `id`. Error text element has `id` referenced by input's `aria-describedby`. Required inputs have `required` attribute.

---

### StatCard

**Purpose**: Display a single metric with label.

**Structure**:
```
┌──────────────────────────┐
│  padding: 16px            │
│                           │
│  Active Projects          │  ← --text-caption, --text-secondary, weight 400
│  12                       │  ← --text-h3 (18px), --text-primary, weight 500
│  ↑ 3 from last month     │  ← --text-caption, --color-success-500 (optional trend)
│                           │
└──────────────────────────┘
```

**Specs**: `--bg-surface-sunken`, `--radius-lg`, no border. Used in Dashboard archetype in grids of 2–4.

---

### Navbar

**Purpose**: Global navigation present on all pages.

**Structure**: Logo (left) → Pillar links: Learn, Hub, Labs (center or left) → User menu (right).

**Active state**: Active pillar link uses `--text-primary` + weight 500 + 2px teal bottom border. Inactive: `--text-secondary`, hover: `--bg-hover`.

**Height**: 56px. `--bg-surface`, bottom `--border-default`.

**Mobile (<768px)**: Logo (left) + hamburger icon (right). Hamburger opens Sheet with navigation links.

---

### Sidebar

**Purpose**: Contextual navigation within a pillar or entity.

**Specs**: Width 240px (expanded), 64px (collapsed, icon-only). Background `--bg-surface`. Right border `--border-default`. Sticky (height: viewport). Toggle button at bottom or top.

**Items**: Icon + label (expanded) or icon-only (collapsed) with tooltip. Active: `--bg-selected`, `--text-primary`. Hover: `--bg-hover`.

**Mobile**: Hidden by default. Accessed via Sheet.

---

### TabBar

**Purpose**: Switch between views within a page (Entity Detail archetype).

**Specs**: Horizontal tabs. Active: `--text-primary`, weight 500, 2px `--action-primary` bottom border. Inactive: `--text-secondary`. Hover: `--text-primary`. Gap between tabs: `--space-6` (24px). Height: 44px.

**Mobile**: Horizontal scroll (`overflow-x: auto`). Active tab scrolled into view.

**Accessibility**: `role="tablist"`, `role="tab"`, `role="tabpanel"`. Arrow key navigation between tabs.

---

### Dialog

**Purpose**: Modal for confirmations, forms, and detail views.

**Specs**: Centered. Max-width 480px (small), 640px (medium), 800px (large). `--bg-surface`, `--radius-lg`, `--shadow-lg`. Backdrop `--bg-overlay`. Padding `--space-6`. Close button (X) top-right.

**Animation**: Entrance 200ms fade + scale(0.95→1). Exit 150ms fade + scale(1→0.95).

**Mobile (<768px)**: Full-screen sheet sliding up from bottom. Drag handle at top.

**Accessibility**: Focus trapped inside. Close on Escape. `aria-modal`, `aria-labelledby` (title), `aria-describedby` (description).

---

### Sheet

**Purpose**: Slide-out panel for mobile navigation, filters, and secondary content.

**Specs**: Full height, 300px width (side) or auto-height (bottom). `--bg-surface`, `--shadow-lg`. Backdrop `--bg-overlay`. Entrance from left (navigation) or bottom (filters, mobile dialogs).

**Animation**: 200ms slide + fade.

---

### Toast

**Purpose**: Non-blocking feedback notification.

**Variants**: `success` (green icon), `error` (red icon), `warning` (amber icon), `info` (blue icon), `default` (no icon).

**Specs**: Position: bottom-right (desktop), bottom-center (mobile). `--bg-surface`, `--border-default`, `--radius-lg`, `--shadow-md`. Auto-dismiss after 5s. Dismissable via close button.

**Accessibility**: `role="status"`, `aria-live="polite"`. Error toasts use `aria-live="assertive"`.

---

### DropdownMenu

**Purpose**: Contextual actions menu.

**Specs**: `--bg-surface-raised`, `--shadow-md`, `--radius-lg`. Items: 36px height, `--text-body`, hover `--bg-hover`. Dividers: 1px `--border-default`. Icons: 16px, `--text-secondary`.

**Accessibility**: `role="menu"`, `role="menuitem"`. Arrow key navigation. Close on Escape.

---

### Breadcrumb

**Purpose**: Show navigation hierarchy (Learn: Career > Track > Course > Fragment).

**Specs**: Items separated by `/` or chevron icon. Current page: `--text-primary`, weight 500. Parent pages: `--text-link`, clickable. Font-size: `--text-body-sm`.

---

### EmptyState

**Purpose**: Displayed when a list, grid, or section has no content.

**Structure**:
```
     [Illustration — optional, geometric flat]
     
     No projects yet                              ← --text-h3, --text-primary
     Create your first project to get started.    ← --text-body, --text-secondary
     
     [Create project →]                           ← primary button
```

**Specs**: Centered, max-width 400px. Padding `--space-12`. Illustration max-height 160px.

---

## Organism Components

### PageHeader

**Purpose**: Top section of a page with title, description, and optional actions.

**Structure**: Title (h1, `--text-h1`) + optional description (`--text-body`, `--text-secondary`) + optional action button (right-aligned on desktop, below on mobile).

**Specs**: Padding `--space-6` bottom. Bottom border optional.

---

### EntityHeader

**Purpose**: Header for institution, project, lab, track, or user profile.

**Structure**: Name (h1) + type badge + inline stats (3–4) + primary action button.

**Specs**: `--bg-surface`, padding `--space-6`, bottom `--border-default`. Stats use `--text-body-sm`, `--text-secondary` label + `--text-primary` value.

---

### ListRow

**Purpose**: Single row in a Dense List.

**Structure**: Status indicator (dot or icon) + ID (monospace, optional) + title + metadata (right-aligned).

**Specs**: Height per pillar profile (44–64px). Padding `--space-3` vertical, `--space-4` horizontal. Bottom border `--border-default`. Hover: `--bg-hover`. Selected: `--bg-selected`.

**Responsive (<768px)**: Metadata wraps below title. Single column layout.

---

### PillarBadge

**Purpose**: Identify which pillar a piece of content belongs to.

**Structure**: Small colored badge with pillar name.

| Pillar | Background | Text | Label |
|--------|------------|------|-------|
| Learn | `--color-learn-50` | `--color-learn-800` | "Learn" |
| Hub | `--color-hub-50` | `--color-hub-800` | "Hub" |
| Labs | `--color-labs-50` | `--color-labs-800` | "Labs" |

**Specs**: Same as Badge `pillar` variant. Used in cross-pillar search results, portfolio, and recommendations.

---

### Footer

**Purpose**: Site footer with navigation links and copyright.

**Structure**: 3–4 columns of links + copyright line. `--bg-surface`, top `--border-default`.

**Specs**: Max-width 1280px, centered. Column headers: `--text-label`. Links: `--text-secondary`, hover `--text-primary`. Copyright: `--text-caption`, `--text-tertiary`.

**Mobile**: Columns stack vertically.

---

## Composition Patterns

> *How components combine to form common UI blocks.*

### Issue Row (Hub)
`ListRow` containing: StatusDot (teal/neutral/error) + IssueID (Badge, monospace) + Title (text) + Avatar (assignee, sm) + Timestamp (secondary text, right).

### Fragment Card (Learn)
`Card` (interactive) containing: PillarIcon (amber) + FragmentNumber (caption) + Title (h3) + Description (body, 2 lines) + ProgressBar + Button (primary, "Continue building").

### Article Card (Labs)
`Card` (interactive) containing: VersionBadge (indigo) + Title (h3) + Authors (secondary) + SubjectArea badges (indigo pills) + DOI badge + MetadataLine (review count, datasets).

### Contribution Review Block (Hub)
Split layout: Left = artifact content/diff. Right = review thread (list of comments, each with Avatar + name + timestamp + text + inline anchor reference).

### Achievement Notification (Learn)
`Toast` (success) with: amber star icon + achievement title + XP earned. Auto-dismiss 5s.

---

## Deprecated Components

| Component | Deprecated Since | Replacement | Notes |
|-----------|------------------|-------------|-------|
| Glass Card variant | 2026-03-16 | Card `elevated` variant | Glass morphism removed from component definitions. Use shadow-based elevation. |
