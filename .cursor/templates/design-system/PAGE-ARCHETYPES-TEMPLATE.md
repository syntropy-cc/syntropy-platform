# Page Archetypes — {Project Name}

> **Document Type**: Page Archetypes
> **Project**: {Project Name}
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-019)
> **Interaction Design Reference**: `.cursor/rules/ux/interaction-design.mdc` (IXD-016)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Purpose

Page archetypes are pre-defined layout and density templates for the seven fundamental page types in this product. Every page must be classified into one of these archetypes before implementation begins. The archetype determines layout structure, information density, dominant components, and responsive behavior.

Archetypes are not rigid wireframes — they are design contracts. A page may deviate from its archetype in one aspect if documented; it may not deviate in silence.

---

## Archetype 1: Dense List

> *A scannable, selectable list of items with consistent rows. Used for issue trackers, file browsers, member directories, activity feeds.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Page Header (title + actions)                          │
├─────────────────────────────────────────────────────────┤
│  Filter / Search bar                                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Icon]  Primary text          [Badge] [Action] │    │
│  │          Secondary text · Metadata              │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  [Icon]  Primary text          [Badge] [Action] │    │
│  │          Secondary text · Metadata              │    │
│  └─────────────────────────────────────────────────┘    │
│  Pagination                                             │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Layout | Full-width single column or sidebar + main |
| Row height | 48–56px (44px minimum for touch) |
| Row padding | `--space-4` horizontal, `--space-3` vertical |
| Section gap | `--space-4` between groups |
| Max items per page | 25–50 |
| Content max-width | Unrestricted (fills container) |
| Header height | 56–64px |
| Filter bar height | 40px |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< sm) | Single column; secondary metadata may be hidden or collapsed; action buttons collapse to icon-only |
| Tablet (sm–lg) | Full row with all columns visible; optional sidebar collapses to sheet |
| Desktop (> lg) | Sidebar + main split; all columns visible; bulk actions in header |

### Key Components

- DataTable or ListRow (Organism)
- SearchBar + FilterTray (Molecules)
- Pagination or infinite scroll (Molecule)
- EmptyState (Molecule) — when list is empty
- Bulk action bar (Organism) — when items are selected

### Pillar Adaptations

{Describe how density parameters differ per pillar, if applicable. E.g., "Hub Dense Lists use tighter row height (44px) and body-sm text; Learn activity feeds use 56px rows and body text."}

---

## Archetype 2: Long-Form Reading

> *A single-column reading layout for articles, documentation, tutorials, and long-form content. Optimized for sustained reading.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Navigation / Breadcrumb                                │
├────────────┬────────────────────────────┬───────────────┤
│  TOC       │                            │   Related /   │
│  sidebar   │  Article content column    │   On this     │
│  (sticky)  │  max-width: 65ch           │   page        │
│            │                            │   (sticky)    │
│            │  Heading                   │               │
│            │  Body text (1.7 lh)        │               │
│            │  Code blocks               │               │
│            │  Figures                   │               │
│            │                            │               │
│            │  [Footer actions]          │               │
└────────────┴────────────────────────────┴───────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Content column max-width | 65ch (approximately 720px) |
| Body line-height | 1.7 |
| Paragraph spacing | `--space-5` (20px) |
| Heading margin-top | `--space-10` (40px) above |
| Heading margin-bottom | `--space-4` (16px) below |
| TOC sidebar width | 220px |
| Related sidebar width | 200px |
| Font family | Sans-serif (default); serif optional for premium reading pillar |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Single column; TOC collapses to sticky "On this page" disclosure at top |
| Tablet (md–lg) | Content column + optional TOC; related sidebar hidden |
| Desktop (> lg) | Three-column with both sidebars |

### Key Components

- Prose content renderer (see CONTENT-RENDERING.md)
- Table of Contents (sticky Organism)
- Reading progress indicator (optional)
- Code blocks with syntax highlighting
- Admonitions / callouts
- Prev/Next navigation (Molecule)

---

## Archetype 3: Guided Flow

> *A sequential, step-by-step layout for onboarding, wizards, and multi-step forms. One step at a time.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Step indicator (1 of N)                    [Exit]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              ┌─────────────────────┐                   │
│              │  Step title         │                   │
│              │  Step description   │                   │
│              │                     │                   │
│              │  [Form / Content]   │                   │
│              │                     │                   │
│              │  [Back]   [Next →]  │                   │
│              └─────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Content max-width | 480–600px (centered) |
| Card padding | `--space-8` (32px) |
| Section gap | `--space-6` (24px) |
| Step indicator | Top bar with step count |
| Exit affordance | Always visible; triggers confirmation dialog |
| Navigation | Back + Next buttons; Submit on final step |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Full width card with reduced padding (`--space-6`); step indicator condensed |
| Desktop | Centered card, max-width enforced; side whitespace visible |

### Key Components

- StepIndicator (Molecule)
- Form (Organism) — one logical section per step
- ConfirmationDialog — on exit with unsaved progress

---

## Archetype 4: Dashboard

> *An overview layout with metrics, activity feeds, and status summaries. Entry point for a pillar or workspace.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Page Header ("Welcome back, {user}" + date range)      │
├──────────┬──────────┬──────────┬──────────┐            │
│  Stat    │  Stat    │  Stat    │  Stat    │            │
│  card    │  card    │  card    │  card    │            │
├──────────┴──────────┴──────────┴──────────┘            │
├──────────────────────────────┬──────────────────────────┤
│  Main chart / activity feed  │  Secondary summary       │
│  (2/3 width)                 │  (1/3 width)             │
│                              │                          │
├──────────────────────────────┴──────────────────────────┤
│  Recent items list (Dense List in mini form)            │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Layout | Full-width grid |
| Stat card grid | 4-column (desktop), 2-column (tablet), 1-column (mobile) |
| Stat card height | 96–120px |
| Main/secondary split | 8/4 columns (2/3 · 1/3) |
| Content max-width | Unrestricted |
| Section gap | `--space-8` (32px) between rows |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Stat cards: 2-column; main/secondary: stacked single column |
| Tablet (md–lg) | Stat cards: 2–4 column; main/secondary side by side |
| Desktop (> lg) | Full 4-column stat row; 8/4 column split |

### Key Components

- StatCard (Molecule)
- Chart / graph (via charting library)
- ActivityFeed (Organism)
- MiniList (Dense List subset)
- DateRangePicker (Molecule)

---

## Archetype 5: Split Editor

> *A two-pane layout with an editor on the left and live preview on the right. Used for code editors, content editors, form builders.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar (file name, save, publish, actions)            │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│  Editor pane             │  Preview pane                │
│  (50% width default)     │  (50% width default)         │
│                          │                              │
│  [code / markdown /      │  [rendered output]           │
│   form fields]           │                              │
│                          │                              │
├──────────────────────────┴──────────────────────────────┤
│  Status bar (char count, validation, save status)       │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Default split ratio | 50/50 |
| Adjustable split | Yes — draggable divider |
| Editor font | `--font-mono` |
| Editor line-height | 1.5 |
| Toolbar height | 48px |
| Status bar height | 32px |
| Content max-width | Full viewport (both panes fill height) |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Single pane with tab toggle (Edit / Preview) |
| Tablet (md–lg) | Optional split or tab toggle based on complexity |
| Desktop (> lg) | Side-by-side with adjustable split |

### Key Components

- CodeEditor or RichTextEditor (Organism)
- ContentPreview (Organism)
- DividerHandle (Atom)
- Toolbar with save state indicator

---

## Archetype 6: Entity Detail

> *A header + tabbed content layout for viewing and editing a single entity (project, user, repository, publication).*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Entity Header                                          │
│  [Avatar] Entity name               [Actions row]      │
│  Metadata row (type, status, created, owner)            │
├─────────────────────────────────────────────────────────┤
│  [Tab 1]  [Tab 2]  [Tab 3]  [Tab 4]                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tab content area                                       │
│  (content varies by active tab —                        │
│   may be Dense List, Long-Form, Dashboard)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Entity header height | 80–120px |
| Tab bar height | 44px |
| Max tabs | 7 (same rule as nav items) |
| Content max-width | Per tab's content archetype |
| Header sticky | Yes (header + tabs stick on scroll) |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Header condensed; tabs collapse to Select dropdown if > 4 tabs |
| Tablet (md–lg) | Full header; up to 5 tabs before overflow menu |
| Desktop (> lg) | Full header; all tabs visible |

### Key Components

- EntityHeader (Organism)
- TabBar (Molecule)
- Content per tab follows its own archetype (Dense List, Long-Form, etc.)

---

## Archetype 7: Discovery Grid

> *A grid of cards for browsing and discovering a collection of items. Used for course catalogs, project directories, template galleries.*

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Page Header (title + filters + sort)                   │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  Card     │  │  Card     │  │  Card     │           │
│  │  [image]  │  │  [image]  │  │  [image]  │           │
│  │  Title    │  │  Title    │  │  Title    │           │
│  │  Meta     │  │  Meta     │  │  Meta     │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  Card     │  │  Card     │  │  Card     │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│  Load more / Pagination                                 │
└─────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Grid columns | 3 (desktop), 2 (tablet), 1 (mobile) |
| Card aspect ratio | {e.g., 16:9 image + fixed content area} |
| Card padding | `--pillar-card-padding` |
| Grid gap | `--space-6` (24px) |
| Content max-width | 1200–1400px |
| Load more strategy | Pagination or "Load more" button (not infinite auto-scroll) |

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< sm) | 1-column |
| Tablet (sm–lg) | 2-column |
| Desktop (> lg) | 3-column; optional 4-column for very wide viewports |

### Key Components

- DiscoveryCard (Organism)
- FilterPanel (Organism) — sidebar or top filter bar
- SortDropdown (Molecule)
- EmptyState (Molecule)
- Pagination (Molecule)

---

## Archetype Selection Guide

Use this table to classify a new page:

| If the page primarily... | Use archetype |
|--------------------------|--------------|
| Shows a list of items users can scan, select, or act on | 1 — Dense List |
| Presents long-form content for sustained reading | 2 — Long-Form Reading |
| Guides the user through a sequential process | 3 — Guided Flow |
| Shows metrics, status, and recent activity | 4 — Dashboard |
| Lets users create or edit content with live preview | 5 — Split Editor |
| Shows a single entity with multiple facets (via tabs) | 6 — Entity Detail |
| Lets users browse and discover a collection | 7 — Discovery Grid |
| None of the above | Compose from the nearest archetype; document the deviation |

---

## Page Archetype Registry

> *Record each page in the product with its assigned archetype. Update when new pages are added.*

| Page / Route | Archetype | Notes |
|-------------|-----------|-------|
| {/route} | {Archetype N: Name} | {Deviations or adaptations} |
| {/route} | {Archetype N: Name} | |
