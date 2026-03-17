# Content Rendering — {Project Name}

> **Document Type**: Content Rendering
> **Project**: {Project Name}
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-021)
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Purpose

This document defines how authored content (articles, documentation, tutorials, educational fragments, research publications) is rendered typographically and structurally. Authored content receives different treatment from UI chrome because it is optimized for reading rather than scanning or action-taking.

**Applies to**: {List the content types in this product that use authored content rendering — e.g., "Lab articles, Learn lesson content, documentation pages, changelogs."}

**Does not apply to**: UI chrome, data tables, dashboards, form interfaces, navigation. Those use the standard component library.

---

## 1. Prose Rendering (General)

### 1.1 Base Typography

| Property | Value | Notes |
|----------|-------|-------|
| Font family | `--font-sans` (default); `--font-serif` for premium reading contexts | Serif optional, pillar-specific |
| Body font size | `--text-body` (16px) default; may be `--pillar-body-size` | |
| Body line-height | 1.7 | More generous than UI chrome (1.6) |
| Body color | `--text-primary` | |
| Content max-width | 65ch (approximately 720px) | Optimal reading line length |
| Content padding | `--space-8` (32px) horizontal on desktop | Breathing room from edges |

### 1.2 Heading Styles in Content

Headings inside prose content are styled differently from page-level headings:

| Level | Size | Weight | Margin Above | Margin Below |
|-------|------|--------|-------------|-------------|
| h1 (article title) | `--text-h1` (32px) | 500 | — | `--space-6` (24px) |
| h2 | `--text-h2` (24px) | 500 | `--space-10` (40px) | `--space-4` (16px) |
| h3 | `--text-h3` (20px) | 500 | `--space-8` (32px) | `--space-3` (12px) |
| h4 | `--text-h4` (18px) | 500 | `--space-6` (24px) | `--space-2` (8px) |

**Rule**: Heading margin above is always larger than margin below (reading direction signals hierarchy).

### 1.3 Inline Elements

| Element | Style |
|---------|-------|
| `strong` / `b` | Weight 500; same color as body text |
| `em` / `i` | Italic; same color as body text |
| Inline `code` | `--font-mono`, `--text-body-sm`, `--bg-sunken`, `--border-subtle` border, `--radius-sm` |
| `a` (link) | `--pillar-accent` or `--action-primary`; underline on hover; `--status-error` for external links (with external icon) |
| `del` | Strikethrough; `--text-secondary` |
| `mark` | `--pillar-accent-subtle` background; same foreground as body |
| `sup` / `sub` | 75% font size; does not affect line-height |

### 1.4 Lists

| Type | Style |
|------|-------|
| `ul` | Disc bullet; `--text-secondary` bullet color; indent `--space-6` |
| `ol` | Numeric; `--pillar-accent` for numbers; indent `--space-6` |
| Nested lists | Indent additional `--space-5`; bullet style changes at each nesting level |
| List item spacing | `--space-2` (8px) between items; `--space-4` (16px) after last item before next paragraph |
| Task list (`- [x]`) | Checkbox-style; checked items may use `--text-secondary` + strikethrough |

### 1.5 Blockquotes

```
style:
  border-left: 3px solid --pillar-accent
  padding-left: --space-5
  margin: --space-6 0
  color: --text-secondary
  font-style: italic (optional, project-specific)
```

### 1.6 Horizontal Rules

- Use `--border-default` color at 1px height
- Margin: `--space-10` above and below
- Do not use decorative horizontal rules (centered dots, etc.) in content

### 1.7 Tables in Content

| Property | Value |
|----------|-------|
| Border | `--border-default` on all cells |
| Header row | `--bg-sunken` background; `--text-primary` weight 500 |
| Row hover | `--bg-hover` |
| Cell padding | `--space-3` vertical, `--space-4` horizontal |
| Mobile | Horizontal scroll container |
| Striped rows | Optional; use `--bg-sunken` on alternating rows |

---

## 2. Code Blocks

### 2.1 Standard Code Block

Code blocks render source code with syntax highlighting:

| Property | Value |
|----------|-------|
| Font | `--font-mono` |
| Font size | `--text-body-sm` (14px) |
| Line-height | 1.6 |
| Background | Dark-mode-style surface (even in light mode, for contrast) or `--bg-sunken` |
| Border | `--border-subtle` |
| Border radius | `--radius-default` (8px) |
| Padding | `--space-4` all sides |
| Overflow | Horizontal scroll (never word-wrap inside code) |

**Code block header** (optional, for named files or language labels):

```
┌──────────────────────────────────────────┐
│  filename.ts                 [Copy]       │
├──────────────────────────────────────────┤
│  const example = "code here";            │
│  // ...                                  │
└──────────────────────────────────────────┘
```

- Filename / language label: `--text-caption` size, `--text-secondary` color
- Copy button: shows on hover; icon-only with `aria-label="Copy code"`; success state for 2 seconds after copy

### 2.2 Inline Code

- `--font-mono`, `--text-body-sm`
- Background: `--bg-sunken`
- Border: 1px `--border-subtle`
- Border radius: `--radius-sm` (4px)
- No line-height change (padding vertical: 1px to avoid bumping line-height)

### 2.3 Code Block in Specific Contexts

| Context | Variation |
|---------|----------|
| {Pillar 1 — e.g., Labs articles} | {e.g., Full-width, dark background, numbered lines} |
| {Pillar 2 — e.g., Learn lessons} | {e.g., Highlighted line ranges for focus} |
| {Documentation} | {e.g., Collapsible long blocks > 30 lines} |

---

## 3. {Format}-Specific Rendering

> *Add one section per content format used in this product. Common formats: Markdown, MyST (extended Markdown for scientific publishing), LaTeX, MDX.*

### 3.{N}: {Format Name} (e.g., MyST Directives)

{Describe how this format's specific constructs are rendered. For MyST: admonitions, cross-references, figure captions, roles. For LaTeX: math equations, theorems, proofs. For MDX: interactive component embedding.}

#### Admonitions / Callouts

| Type | Background | Border Color | Icon |
|------|-----------|-------------|------|
| Note | `--status-info-bg` | `--status-info` | info circle |
| Warning | `--status-warning-bg` | `--status-warning` | warning triangle |
| Danger / Error | `--status-error-bg` | `--status-error` | error circle |
| Tip | `--status-success-bg` | `--status-success` | lightbulb or checkmark |
| Important | `--pillar-accent-subtle` | `--pillar-accent` | exclamation |

```
┌─────────────────────────────────────────────┐
│  ⓘ Note                                     │
│  ──────────────────────────────────────────  │
│  Admonition body text at --text-body-sm.    │
└─────────────────────────────────────────────┘
```

#### Math Equations (if applicable)

| Context | Rendering | Font |
|---------|----------|------|
| Inline math (e.g., `$E = mc^2$`) | Rendered inline; font-size matches surrounding text | MathJax or KaTeX |
| Display math (block, e.g., `$$...$$`) | Centered block; `--space-6` margin above/below; horizontal scroll on overflow | MathJax or KaTeX |

#### Cross-References (if applicable)

- Internal references: styled as links using `--action-primary`; hover shows target preview if supported
- External references: styled with external link icon; `--text-secondary` color

---

## 4. {Pillar}-Specific Content Patterns

> *Add one section per pillar that has distinct content rendering requirements.*

### 4.{N}: {Pillar Name} Content

{Describe how content manifests specifically in this pillar.}

**Example for a "Learn" pillar**:

| Element | Treatment |
|---------|----------|
| Lesson content | Long-Form Reading archetype; `--pillar-body-size`; serif font optional |
| Exercise blocks | Distinct card with `--pillar-accent` left border; interactive input if applicable |
| Progress markers | `--pillar-accent` check icon; appears at end of each section |
| Vocabulary terms | Highlighted with `--pillar-accent-subtle`; tooltip or definition panel on click |
| Embedded quizzes | Guided Flow nested within reading layout |

**Example for a "Labs" pillar**:

| Element | Treatment |
|---------|----------|
| Research article | Long-Form Reading; serif font for body; academic citation style |
| Abstract | Offset with `--bg-sunken` block, italic, `--space-8` margin |
| Figure captions | `--text-caption` size, centered below figure, `--text-secondary` |
| Citation in-text | Superscript number link `[1]`; jumps to References section |
| References section | Numbered list; smaller font (`--text-body-sm`); visually distinct from body |

---

## 5. Figures and Captions

| Property | Value |
|----------|-------|
| Figure container | `<figure>` element; `--space-8` vertical margin |
| Image | `max-width: 100%`; `height: auto`; `--radius-default` border radius |
| Caption (`<figcaption>`) | `--text-caption` size; `--text-secondary` color; centered; `--space-2` above |
| Border | Optional: `1px --border-subtle` around image for screenshots or UI mockups |

---

## 6. Syntax Highlighting Theme

> *The code syntax highlighting palette must use design system tokens.*

| Token Type | Color (Light) | Color (Dark) | Example |
|-----------|-------------|-------------|---------|
| Keyword | `--color-primary-500` | `--color-primary-400` | `const`, `function`, `import` |
| String | `--color-success-500` | `--color-success-400` | `"hello"`, `'world'` |
| Number | `--color-warning-500` | `--color-warning-400` | `42`, `3.14` |
| Comment | `--text-tertiary` | `--text-tertiary` dark variant | `// comment` |
| Operator | `--text-secondary` | `--text-secondary` dark | `+`, `=`, `=>` |
| Punctuation | `--text-secondary` | `--text-secondary` dark | `{`, `}`, `;` |
| Function name | `--color-info-500` | `--color-info-400` | function identifiers |
| Type / Class | `--color-warning-500` | `--color-warning-400` | type annotations |
| Variable | `--text-primary` | `--text-primary` dark | identifiers |
| Constant | `--color-primary-500` | `--color-primary-400` | `MAX_SIZE` |

**Rules**:
- Syntax highlighting palette uses tokens from `DESIGN-TOKENS.md` only — no arbitrary hex values
- Must be accessible: minimum 3:1 contrast between token colors and the code block background
- Dark code block background is used in both light and dark UI mode (consistency for code reading)
