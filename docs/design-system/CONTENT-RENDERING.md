# Content Rendering — Syntropy Ecosystem

> **Document Type**: Content Rendering Patterns
> **Project**: Syntropy Ecosystem
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Pillar Profiles Reference**: `docs/design-system/PILLAR-PROFILES.md`
> **Created**: 2026-03-16
> **Last Updated**: 2026-03-16

---

## Purpose

The Syntropy ecosystem renders authored content — Learn fragments, Labs scientific articles, Hub documentation, and contributor guides. This document defines how that content is styled, ensuring consistency across all rendering contexts. Authored content uses a different typographic treatment than UI chrome: it should feel like reading a carefully typeset document, not navigating a dashboard.

---

## 1. Prose Rendering (General)

Applies to: Learn fragment theory and problem sections, Hub project README and documentation, Labs article body, any long-form authored content.

### 1.1 Base Typography

| Property | Value |
|----------|-------|
| Font family | `--font-sans` (Inter) for Learn and Hub; `--font-serif` (Source Serif 4) optional for Labs articles |
| Body text size | `--pillar-body-size` (16px Learn, 14px Hub/Labs) — but article body in Labs uses 16px serif |
| Line height | 1.7 for prose paragraphs (more generous than UI text at 1.6) |
| Paragraph spacing | `--space-6` (24px) between paragraphs |
| Max width | `--pillar-content-max-width` |
| Text color | `--text-primary` |

### 1.2 Headings in Content

| Level | Size | Weight | Spacing Above | Spacing Below |
|-------|------|--------|---------------|---------------|
| h1 | `--text-h1` (28px) | 500 | `--space-12` (48px) | `--space-6` (24px) |
| h2 | `--text-h2` (22px) | 500 | `--space-10` (40px) | `--space-4` (16px) |
| h3 | `--text-h3` (18px) | 500 | `--space-8` (32px) | `--space-3` (12px) |
| h4 | 16px | 500 | `--space-6` (24px) | `--space-2` (8px) |

Headings always use `--font-sans` (Inter), even when the body is in serif. The contrast between serif body and sans-serif headings creates a clean document hierarchy.

### 1.3 Inline Elements

| Element | Style |
|---------|-------|
| **Bold** | Weight 500 (not 700), `--text-primary` |
| *Italic* | Italic style, same weight |
| `Inline code` | `--font-mono`, `--bg-surface-sunken`, `--radius-sm` (4px), padding 2px 6px, font-size 0.9em |
| [Link](#) | `--text-link`, underline on hover, `--focus-ring` on keyboard focus |
| ~~Strikethrough~~ | `--text-tertiary`, line-through |

### 1.4 Lists

- Unordered lists: disc marker, `--text-secondary` marker color.
- Ordered lists: decimal marker, `--text-secondary` marker color.
- Item spacing: `--space-2` (8px) between items.
- Nested list indent: `--space-6` (24px).
- List item line-height: same as body (1.7).

### 1.5 Blockquotes

Border-left: 3px solid `--color-primary-200`. Padding-left: `--space-4` (16px). Text color: `--text-secondary`. Font style: italic. Background: none.

### 1.6 Horizontal Rules

1px solid `--border-default`. Margin: `--space-8` (32px) top and bottom.

### 1.7 Tables in Content

- `--bg-surface` background for cells. `--bg-surface-sunken` for header row.
- `--border-default` for all cell borders (1px).
- Cell padding: `--space-3` (12px).
- Header text: `--text-label` (13px, weight 500).
- Body text: `--text-body` (14px, weight 400).
- Responsive: horizontal scroll wrapper on mobile. `table-layout: fixed` with minimum column widths.

---

## 2. Code Blocks

### 2.1 Standard Code Block

```
┌──────────────────────────────────────────────┐
│  Language label          [Copy button]        │  ← header bar
├──────────────────────────────────────────────┤
│                                               │
│  const artifact = await publish({             │  ← code content
│    name: 'my-component',                      │
│    type: 'code',                              │
│  });                                          │
│                                               │
└──────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `--bg-surface-sunken`, `--radius-lg` (12px), `--border-default` |
| Header bar | `--bg-surface-sunken` darker shade or `--border-default` bottom. Language label: `--text-caption`, `--text-secondary`. Copy button: ghost, icon-only (Lucide `Copy`). |
| Code font | `--font-mono`, 14px (`--text-code`), line-height 1.5 |
| Padding | `--space-4` (16px) |
| Syntax highlighting | Theme matches light/dark mode. Light: based on GitHub light theme. Dark: based on One Dark or similar. Use the same highlighting theme across all code contexts. |
| Overflow | Horizontal scroll. Never wrap code lines. |
| Line numbers | Optional, shown in `--text-tertiary`. |

### 2.2 Inline Code

`--font-mono`, `--bg-surface-sunken`, 2px 6px padding, `--radius-sm` (4px), font-size 0.9em relative to surrounding text.

### 2.3 Code in Specific Contexts

| Context | Behavior |
|---------|----------|
| Learn fragment (artifact section) | Code block with "Run" button in header (if executable). Connects to embedded IDE. |
| Hub issue description | Code block without run button. Standard rendering. |
| Hub contribution review | Code diff view: two-column or unified, with line-level comment anchoring. |
| Labs article | Code block with optional output/result display below. May be executable (connected to experiment container). |

---

## 3. MyST-Specific Rendering

> *MyST (Markedly Structured Text) is the scientific writing format used in Labs.*

### 3.1 Admonitions

Admonitions are callout boxes for tips, warnings, notes, and important information.

| Type | Left Border Color | Icon | Background |
|------|-------------------|------|------------|
| `note` | `--color-info-500` | Info circle | `--color-info-50` at 50% opacity |
| `tip` | `--color-success-500` | Lightbulb | `--color-success-50` at 50% opacity |
| `warning` | `--color-warning-500` | Alert triangle | `--color-warning-50` at 50% opacity |
| `danger` | `--color-error-500` | Alert octagon | `--color-error-50` at 50% opacity |
| `important` | `--color-primary-500` | Star | `--color-primary-50` at 50% opacity |

**Structure**: 3px left border, `--radius-lg` on the right corners only, `--space-4` padding. Title: icon + type label in matching color, weight 500. Body: `--text-primary`, standard prose styling.

### 3.2 Figures and Captions

```
┌────────────────────────────────────────┐
│                                         │
│  [Image / Chart / Embedded Artifact]    │
│                                         │
├────────────────────────────────────────┤
│  Figure 3: Caption text describing      │  ← --text-caption, --text-secondary
│  the content above.                     │     centered
└────────────────────────────────────────┘
```

- Images: `max-width: 100%`, `border-radius: --radius-lg`, optional `--border-default`.
- Caption: centered, `--text-caption`, `--text-secondary`. "Figure N:" prefix in weight 500.
- Spacing: `--space-8` above and below the figure block.

### 3.3 Mathematical Equations

- Inline math: rendered with KaTeX or MathJax, same size as surrounding text.
- Display math (block equations): centered, `--space-6` above and below. Optional equation number right-aligned.
- Font: KaTeX default (matches academic convention).

### 3.4 Citations and References

- In-text citations: bracketed numbers [1] or (Author, Year) linking to reference list. Style: `--text-link` color, no underline. Hover: tooltip with full reference.
- Reference list (end of article): ordered list, `--text-body-sm`, `--text-secondary`. Authors, title (italic), venue, year, DOI (linked).

### 3.5 Embedded Artifacts

When an article references an interactive artifact (experiment, dataset visualization, interactive graph):

- Rendered inline within the content column.
- Container: `--bg-surface-sunken`, `--radius-lg`, `--border-default`, `--space-4` padding.
- Header: artifact type badge + title + "Open in new tab" link.
- Content: iframe or embedded component with defined aspect ratio.
- Below: caption (same as figure caption).

### 3.6 Dropdowns / Collapsible Sections

- Trigger: row with chevron icon + title text. `--text-primary`, weight 500.
- Collapsed: chevron points right. Only trigger visible.
- Expanded: chevron points down. Content renders below with `--space-3` padding-top.
- Animation: 200ms height transition.
- Optional: tinted border-left (same as admonition types) for thematic collapsibles.

---

## 4. Learn-Specific Content Patterns

### 4.1 Fragment Structure Rendering

Every fragment has exactly three sections. They are visually distinct:

**Problem Presentation**:
- Header: "Problem" label + icon (Lucide `Target`), `--text-h2`.
- Content: prose describing the real-world problem this fragment addresses.
- Visual emphasis: slightly larger text or highlighted first paragraph.

**Theoretical Discussion**:
- Header: "Theory" label + icon (Lucide `BookOpen`), `--text-h2`.
- Content: educational prose, may include code blocks, diagrams, admonitions.
- Depth indicator: optional badge showing estimated reading time.

**Artifact**:
- Header: "Build" label + icon (Lucide `Hammer`), `--text-h2`.
- Content: instructions for building the artifact, embedded IDE, reference artifact view.
- Action: "Publish artifact" primary button at the end.

Section transitions: `--space-12` (48px) gap between Problem→Theory→Artifact. Subtle horizontal rule or step indicator between them.

### 4.2 Reference Artifact vs Learner Artifact

- Reference artifact: rendered in a Card with "Reference" badge. Read-only code view.
- Learner's artifact: rendered alongside or below the reference. Editable in the embedded IDE. "Publish" button.
- Side-by-side layout (≥1024px) or stacked layout (<1024px).

---

## 5. Labs-Specific Content Patterns

### 5.1 Article Rendering Mode

When viewing a published article, the UI chrome recedes:
- Navbar remains visible but minimal.
- Sidebar collapses or becomes a table of contents.
- Content is centered at 680px max-width.
- Body uses `--font-serif` at 16px/1.7.
- No cards, no badges, no dashboard elements in the reading area.

### 5.2 Review Annotations

- Passages with reviews: subtle background highlight (`--color-primary-50` at 30% opacity).
- Review count indicator: small teal circle with number on the left margin.
- Click: opens side panel (280px) with review thread.
- Side panel: `--bg-surface`, `--border-default` left border. Review items: Avatar + name + date + comment text. Reply field at bottom.

### 5.3 Version Indicators

- Current version shown in article header: "v2" badge (indigo).
- Version history accessible via dropdown from the badge.
- Diff between versions: highlighted additions (green tint) and removals (red tint) inline.

---

## 6. Syntax Highlighting Theme

Use a single, cohesive syntax highlighting theme that adapts to light/dark mode.

**Light mode palette** (based on GitHub light):
- Keywords: `--color-primary-700`
- Strings: `--color-success-700`
- Comments: `--text-tertiary`
- Functions: `--color-labs-700` (indigo)
- Numbers: `--color-learn-700` (amber-brown)
- Variables: `--text-primary`

**Dark mode palette** (based on One Dark Pro):
- Keywords: `--color-primary-300`
- Strings: `--color-success-300`
- Comments: `--text-tertiary`
- Functions: `--color-labs-300`
- Numbers: `--color-learn-300`
- Variables: `--text-primary`

This ensures the syntax theme uses the Syntropy palette, not an arbitrary external theme.
