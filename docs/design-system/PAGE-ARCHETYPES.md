# Page Archetypes — Syntropy Ecosystem

> **Document Type**: Page Archetypes (Layout Templates)
> **Project**: Syntropy Ecosystem
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Pillar Profiles Reference**: `docs/design-system/PILLAR-PROFILES.md`
> **Created**: 2026-03-16
> **Last Updated**: 2026-03-16

---

## Purpose

Individual components and tokens are not sufficient for consistent page generation. This document defines **page archetypes** — recurring layout patterns that appear across the ecosystem. Each archetype specifies layout structure, information density, responsive behavior, and the components it typically contains.

**For LLM implementation**: When generating a new page, first identify which archetype it matches. Apply the archetype's layout, then populate with the correct components. If a page does not match any archetype, compose from the closest match and document the deviation.

---

## 1. Dense List

> *Used for: Hub issue lists, Hub member lists, Hub contribution lists, Labs research line lists, Labs article search results, Platform notification lists.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├──────────┬─────────────────────────────────────────────┤
│          │  [Page Header]                               │
│          │  Title + description + action button          │
│          │                                              │
│ Sidebar  │  [Filter Bar / Tabs]                         │
│ 240px    │  Status filters, sort, search                │
│          │                                              │
│ Nav      │  [List]                                      │
│ items    │  Row 1  ─────────────────────────────        │
│          │  Row 2  ─────────────────────────────        │
│          │  Row 3  ─────────────────────────────        │
│          │  Row 4  ─────────────────────────────        │
│          │  ...                                         │
│          │                                              │
│          │  [Pagination / Infinite scroll]               │
├──────────┴─────────────────────────────────────────────┤
│  [Footer]                                               │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Sidebar | Fixed, 240px width, collapsible to 64px (icon-only) |
| Main content | Fills remaining width |
| Row height | 44–56px depending on pillar profile |
| Row structure | Status indicator + title + metadata (right-aligned) |
| Page header padding | `--space-6` top/bottom |
| List gap | 0px (rows separated by 1px `--border-default`) |
| Filter bar | Sticky below navbar on scroll |
| Max items visible | Optimize for 10–15 rows without scrolling on 1080p |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | Sidebar visible, full list layout |
| 768–1023px | Sidebar collapses to icon-only (64px); can expand via toggle |
| < 768px | Sidebar becomes Sheet (slide-out); list is full-width; rows stack metadata below title |

### Key Components

PageHeader, TabBar / FilterBar, ListRow (custom per context), Sidebar, Pagination, EmptyState (when list is empty), Badge (status), Avatar (assignee).

---

## 2. Long-Form Reading

> *Used for: Labs article view, Learn fragment theory section, Learn fragment problem section, Platform blog posts, documentation pages.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│     ┌──────────────────────────────────┐                │
│     │  [Content Header]                │                │
│     │  Title, authors, metadata        │                │
│     │                                  │                │
│     │  [Body Content]                  │  ← Optional    │
│     │  Prose, figures, code blocks,    │    side panel   │
│     │  embedded artifacts              │    for reviews  │
│     │                                  │    or TOC       │
│     │                                  │                │
│     │  [Footer Section]               │                │
│     │  References, related content     │                │
│     └──────────────────────────────────┘                │
│            max-width per pillar                         │
│                                                         │
├────────────────────────────────────────────────────────┤
│  [Footer]                                               │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Content max-width | 680px (Labs articles), 720px (Learn fragments), 800px (documentation) |
| Content centering | Horizontally centered with auto margins |
| Body text | 16px, line-height 1.6–1.7. Serif optional for Labs articles. |
| Paragraph spacing | `--space-6` (24px) between paragraphs |
| Heading spacing | `--space-8` (32px) above headings, `--space-4` (16px) below |
| Figure/embed spacing | `--space-8` (32px) above and below |
| Side panel (optional) | 280–320px, for: table of contents (sticky), review threads (Labs), artifact explorer |
| Reading column padding | `--space-6` (24px) on mobile, `--space-16` (64px) on desktop |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | Centered content + optional side panel |
| 768–1023px | Centered content, side panel collapses to toggle overlay |
| < 768px | Full-width content with horizontal padding; side panel accessible via button; images scale to viewport width |

### Key Components

PageHeader (article/fragment variant), Prose (rendered markdown/MyST), CodeBlock, Figure, EmbeddedArtifact, TableOfContents (sticky sidebar), ReviewThread (Labs), Breadcrumb (Learn track > course > fragment).

---

## 3. Guided Flow

> *Used for: Learn fragment artifact section (step-by-step building), onboarding wizard, institution creation wizard, first-time article submission, career discovery assistant.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│           [Progress Indicator]                          │
│           Step 1 ● — ○ Step 2 — ○ Step 3               │
│                                                         │
│     ┌──────────────────────────────────┐                │
│     │                                  │                │
│     │  [Step Content]                  │                │
│     │  One question, one action,       │                │
│     │  or one concept per step         │                │
│     │                                  │                │
│     │                                  │                │
│     └──────────────────────────────────┘                │
│                                                         │
│           [Navigation]                                  │
│           [← Back]           [Continue →]               │
│                                                         │
├────────────────────────────────────────────────────────┤
│  [Footer — minimal or hidden]                           │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Content max-width | 560–640px (narrower than reading — focused) |
| Content centering | Horizontally and vertically centered |
| Step content padding | `--space-8` (32px) |
| Section gap | `--space-12` (48px) — generous, one idea per viewport |
| Progress indicator | Top of content area, sticky. Shows steps completed / remaining. |
| Navigation buttons | Fixed bottom or below content. "Back" = secondary button. "Continue" = primary button. |
| Transitions between steps | 200ms fade + translateY(8px) entrance |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 768px | Centered card layout with progress indicator above |
| < 768px | Full-width content, progress indicator simplified (e.g. "Step 2 of 5"), navigation buttons sticky at bottom of viewport |

### Key Components

ProgressIndicator (stepper), StepContent (varies per wizard), NavigationFooter (Back + Continue), FormField (for input-heavy steps), ConversationalPrompt (for career discovery assistant), Button.

---

## 4. Dashboard

> *Used for: Portfolio page, platform admin dashboard, institution dashboard (Hub), lab overview (Labs), mentor dashboard.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├──────────┬─────────────────────────────────────────────┤
│          │  [Page Header]                               │
│          │  Dashboard title + date range / filters       │
│          │                                              │
│ Sidebar  │  [Stat Cards — 3 or 4 column grid]           │
│ (opt.)   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│          │  │ Stat │ │ Stat │ │ Stat │ │ Stat │       │
│          │  └──────┘ └──────┘ └──────┘ └──────┘       │
│          │                                              │
│          │  [Content Sections — stacked]                 │
│          │  Section 1: Chart / Table / List              │
│          │  Section 2: Recent Activity                   │
│          │  Section 3: Quick Actions                     │
│          │                                              │
├──────────┴─────────────────────────────────────────────┤
│  [Footer]                                               │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Stat card grid | 2–4 columns, `gap: --space-4` (16px) |
| Stat card | `bg: --bg-surface`, `border: --border-default`, `radius: --radius-lg` (12px), `padding: --space-4` (16px). Label in `--text-caption` + `--text-secondary`. Value in `--text-h3` + `--text-primary`, weight 500. |
| Section gap | `--space-8` (32px) between dashboard sections |
| Sidebar | Optional — present when dashboard has multiple sub-views (e.g. portfolio sections) |
| Content max-width | 1200px, centered |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | 4-column stat grid, sidebar visible |
| 768–1023px | 2-column stat grid, sidebar collapses |
| < 768px | Single-column stat grid, sections stack vertically, sidebar becomes sheet |

### Key Components

StatCard, PageHeader, TabBar (for sub-views), Chart (if applicable), ActivityFeed, Table, Badge, Avatar, EmptyState.

---

## 5. Split Editor

> *Used for: Embedded IDE (all pillars), Labs article editor (MyST/LaTeX), Hub contribution review (diff + comments), Labs experiment builder.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├────────────────────────────────────────────────────────┤
│  [Editor Toolbar]                                       │
│  File name / context + actions (Save, Run, Publish)     │
├────────────────────┬───────────────────────────────────┤
│                    │                                    │
│  [Left Panel]      │  [Right Panel]                     │
│  Editor / Code     │  Preview / Output / Comments       │
│                    │                                    │
│                    │                                    │
│                    │                                    │
│                    │                                    │
│                    │                                    │
│                    │                                    │
├────────────────────┴───────────────────────────────────┤
│  [Status Bar]                                           │
│  Line/col, language, status                             │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Toolbar height | 48px. Compact: context title (left), action buttons (right). |
| Panel split | Default 50/50. Draggable divider. Persist user preference. |
| Panel min-width | 320px each |
| Status bar height | 28px. `--text-caption`, monospace for line/col info. `--bg-surface-sunken`. |
| Editor font | `--font-mono`, 14px, line-height 1.5 |
| No page-level padding | The editor fills the viewport edge-to-edge below the toolbar. |
| No footer | Footer is hidden in editor mode. |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | Side-by-side panels with draggable divider |
| 768–1023px | Tabbed panels — toggle between Editor and Preview |
| < 768px | Single panel with tab toggle; reduced toolbar |

### Key Components

EditorToolbar, CodeEditor (Monaco wrapper), PreviewPanel, StatusBar, ResizableDivider, TabToggle (for mobile).

---

## 6. Entity Detail

> *Used for: Institution page (Hub), project page (Hub), laboratory page (Labs), user profile / portfolio, track detail (Learn).*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Entity Header]                                        │
│  Name, description, key stats, primary action            │
│                                                         │
│  [Tab Navigation]                                       │
│  Tab 1 | Tab 2 | Tab 3 | Tab 4                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Tab Content]                                   │    │
│  │  Varies per tab: list, dashboard, settings       │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├────────────────────────────────────────────────────────┤
│  [Footer]                                               │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Entity header | Full-width, `--bg-surface`, bottom border. Contains: name (h1), description or mission (secondary text), inline stats (3-4 metrics), primary action button (right). Padding: `--space-6`. |
| Tab navigation | Horizontal tabs below entity header. Sticky on scroll. Active tab: teal underline (2px) + weight 500. Inactive: `--text-secondary`. |
| Tab content | Renders a child page archetype (Dense List, Dashboard, etc.) depending on the tab. |
| Content max-width | 1080px, centered. |
| Tab content padding | `--space-6` top. |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | Entity header in single row; tabs horizontal |
| 768–1023px | Entity header may stack stats below name; tabs horizontal with scroll |
| < 768px | Entity header stacks vertically; tabs become horizontal scrollable or dropdown; action button full-width |

### Key Components

EntityHeader, TabNavigation, Badge, StatInline (compact stat: label + value), Avatar, Button, and child archetype components.

---

## 7. Discovery Grid

> *Used for: Hub public square (institution/project directory), Labs article discovery, Learn track/career browser, artifact gallery, community feed.*

### Layout

```
┌────────────────────────────────────────────────────────┐
│  [Navbar — full width]                                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Page Header]                                          │
│  Title, description, search bar                          │
│                                                         │
│  [Filter Bar]                                           │
│  Category pills, sort dropdown, view toggle              │
│                                                         │
│  [Card Grid]                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ Card   │ │ Card   │ │ Card   │                      │
│  │        │ │        │ │        │                      │
│  └────────┘ └────────┘ └────────┘                      │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ Card   │ │ Card   │ │ Card   │                      │
│  └────────┘ └────────┘ └────────┘                      │
│                                                         │
│  [Load More / Pagination]                               │
│                                                         │
├────────────────────────────────────────────────────────┤
│  [Footer]                                               │
└────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Grid columns | 3 on desktop (≥1024px), 2 on tablet (768–1023px), 1 on mobile (<768px) |
| Grid gap | `--space-4` (16px) on Hub, `--space-6` (24px) on Learn |
| Card style | `--bg-surface`, `--border-default`, `--radius-lg`. Hover: `translateY(-2px)` + `--shadow-md`. Padding per pillar profile. |
| Card content | Title (h3), description (2 lines max, truncated), metadata (secondary), pillar badge, status. |
| Search bar | Prominent, above filter bar. Full-width on mobile. |
| Content max-width | 1200px, centered. |

### Responsive Behavior

See grid columns above. Filter bar becomes horizontally scrollable on mobile. Cards stack to single column.

### Key Components

PageHeader, SearchInput, FilterBar (pill toggles + sort), Card (content variant), Badge, Pagination, EmptyState.

---

## 8. Archetype Selection Guide

> *For LLM and developers: given a page description, select the archetype.*

| If the page primarily... | Use archetype |
|--------------------------|---------------|
| Shows a list of items to scan and select from | Dense List |
| Shows long text content to read | Long-Form Reading |
| Walks the user through sequential steps | Guided Flow |
| Shows summary stats and recent activity | Dashboard |
| Provides a code/text editor with preview | Split Editor |
| Shows a single entity with tabs for sub-views | Entity Detail |
| Shows a browsable collection of cards | Discovery Grid |
| Combines multiple patterns | Compose from closest archetype + document deviation |
