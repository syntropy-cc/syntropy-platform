# Pillar Profiles — Syntropy Ecosystem

> **Document Type**: Pillar Visual Profiles
> **Project**: Syntropy Ecosystem
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Page Archetypes Reference**: `docs/design-system/PAGE-ARCHETYPES.md`
> **Created**: 2026-03-16
> **Last Updated**: 2026-03-16

---

## Purpose

The Syntropy ecosystem has one design system and three pillar expressions. This document defines *how* each pillar — Learn, Hub, Labs — expresses the shared design language differently. The tokens are the same; the application varies.

**Concept — Tonal Range**: A brand does not need one tone. It needs a consistent personality expressed differently by context. The same person speaks differently in a workshop vs. a boardroom vs. a laboratory. The personality is the same; the register shifts. This document maps the register for each pillar.

**For LLM implementation**: When generating a page for `apps/learn`, apply the Learn profile. When generating for `apps/hub`, apply the Hub profile. When generating for `apps/platform` (portfolio, search, settings), use the Platform defaults. Never mix pillar profiles in a single view.

---

## 1. Platform Defaults

> *The baseline. Used in cross-pillar surfaces: portfolio, search, settings, onboarding, institutional site.*

| Property | Value |
|----------|-------|
| Body text size | 14px (`--text-body`) |
| Card padding | 16–20px (`--space-4` to `--space-5`) |
| Section gap | 32–40px (`--space-8` to `--space-10`) |
| Content max-width | 960px |
| Accent color | Primary teal only (no pillar accent) |
| Information density | Medium — balanced between Learn's openness and Hub's density |
| Interaction style | Self-service, standard |

---

## 2. Learn Profile

### 2.1 Character

Learn feels like navigating a well-organized workshop. Space is generous, progression is always visible, and each step ends in something you built. The interface invites rather than overwhelms. A first-time learner should feel: "I know exactly what to do next, and I can do it."

### 2.2 Visual Parameters

| Property | Value | Rationale |
|----------|-------|-----------|
| Body text size | **16px** (`--text-body-lg`) | Larger text reduces cognitive load for learners encountering new concepts. Comfortable for sustained reading of fragment theory sections. |
| Heading sizes | Display 36px, H1 28px, H2 22px, H3 18px | Standard scale; no variation from tokens needed. |
| Card padding | **24px** (`--space-6`) | More breathing room inside cards — each card is a meaningful unit (fragment, course, track). |
| Section gap | **48px** (`--space-12`) | Generous vertical rhythm. Each section (Problem, Theory, Artifact) is a distinct cognitive phase — the gap marks the transition. |
| Content max-width | **720px** | Optimized for reading. At 16px/1.6 line height, 720px produces ~65 characters per line — the readability sweet spot. |
| List row height | 56–64px | Taller rows with more padding. Each item (fragment, course) is a destination, not a line in a table. |
| Accent color | `--color-learn-500` (#F5A623) Amber/Gold | Appears in: achievement badges, collectible items, XP indicators, progress completion markers, course headers. |
| Accent subtle bg | `--color-learn-50` (#FFF8E7) | Background for achievement cards, milestone markers. |
| Primary action color | `--color-primary-500` (#0FA87F) Teal | All buttons, links, progress bars, active states remain teal. Amber is never an action color. |

### 2.3 Density & Rhythm

- **One primary concept per viewport.** A fragment page shows the Problem, then the Theory, then the Artifact — not all three simultaneously on a desktop.
- **Progressive disclosure.** The track map shows completed courses, the current course in focus, and upcoming courses dimmed. Do not dump all content at once.
- **Generous whitespace between cognitive phases.** The gap between the Theory section and the Artifact section should be 48–64px — enough to feel like a new context.
- **Cards over tables.** Where Hub might use a table, Learn uses cards. A list of fragments is displayed as stacked cards (each with title, description, status, and collectible fragment), not as a dense table row.

### 2.4 Distinctive Elements

| Element | Learn-Specific Treatment |
|---------|--------------------------|
| Progress bar | Teal fill with amber accent for completed milestones. Show percentage + "X artifacts published." |
| Collectible items | Displayed as visual icons that assemble (fragments → complete collectible on course completion). Use amber accent for completed pieces, neutral-300 for locked pieces. |
| Achievement badges | Amber background (`--color-learn-50`), amber icon (`--color-learn-600`), dark amber text (`--color-learn-800`). Rounded pill shape. |
| Fragment status | "Not started" (neutral), "In progress" (teal), "Artifact published" (teal + checkmark), "Artifact featured" (amber star). |
| Onboarding | Extra generous spacing (64px section gaps). Wizard-driven: one question or action per step. |

### 2.5 Example: Fragment Card

```
┌─────────────────────────────────────────────────────┐
│  padding: 24px                                       │
│                                                      │
│  [Amber icon ○]  Fragment 7 of 12                    │  ← caption, secondary text
│                                                      │
│  Building the Authentication Layer                   │  ← h3, primary text, 500 weight
│                                                      │
│  Implement JWT-based auth with refresh               │  ← body-lg (16px), secondary text
│  tokens for your SaaS project.                       │
│                                                      │
│  ████████████░░░░░░░░  58%                          │  ← teal progress bar
│                                                      │
│  [Continue building →]                               │  ← primary button, teal
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 3. Hub Profile

### 3.1 Character

Hub feels like a well-planned engineering workspace. Information is dense but organized. Multiple dimensions are visible simultaneously: issues, members, governance state, artifact manifesto. A seasoned contributor should feel: "I can see everything I need to make a decision."

### 3.2 Visual Parameters

| Property | Value | Rationale |
|----------|-------|-----------|
| Body text size | **14px** (`--text-body`) | Standard density. Contributors scan lists, read issue descriptions, review artifacts. 14px is the efficient-but-readable sweet spot. |
| Heading sizes | H1 28px, H2 22px, H3 18px | Standard scale. |
| Card padding | **16px** (`--space-4`) | Compact padding. More cards/items fit per viewport. Information density is a feature. |
| Section gap | **32px** (`--space-8`) | Tighter vertical rhythm than Learn. Sections are adjacent, not separated by cognitive gaps. |
| Content max-width | **100%** (with sidebar) | Hub layouts typically use sidebar + main content. Main content fills available width. |
| List row height | **44–48px** | Compact rows. Issue lists, member lists, contribution lists — each row communicates multiple attributes (title, status, assignee, date) in a single horizontal line. |
| Accent color | `--color-hub-500` (#6B7B93) Slate | Appears in: institution badges, governance state indicators, structural dividers, metadata labels. |
| Accent subtle bg | `--color-hub-50` (#F0F2F5) | Background for governance status cards, institution headers. |
| Primary action color | `--color-primary-500` (#0FA87F) Teal | All buttons, links, active states remain teal. |

### 3.3 Density & Rhythm

- **Multiple information dimensions per viewport.** An institution page shows: header (name, status, members count), tab navigation (Projects, Governance, Treasury, Members), and the active tab's content — all visible without scrolling.
- **Tables and lists are the primary pattern.** Issues, contributions, members, proposals — all displayed as compact lists with inline metadata.
- **Monospace for IDs and technical values.** Artifact IDs, contract hashes, version numbers — all use `--font-mono` at `--text-code` size.
- **Sidebar navigation is standard.** Hub pages default to a left sidebar (institution navigation, project list) + main content area.

### 3.4 Distinctive Elements

| Element | Hub-Specific Treatment |
|---------|------------------------|
| Issue row | Compact (48px): status badge (teal/neutral/error) + title + assignee avatar (24px) + date (right-aligned, secondary text). Monospace issue ID prefix. |
| Governance state | Slate badge for state labels (Draft, Discussion, Voting, Approved, Rejected, Executed). Teal for Approved/Executed. Error red for Rejected. |
| Institution header | Large name (h1), institution type badge (slate), member count, project count — all in a compact header strip. No hero image. |
| Contribution review | Split-pane: left shows the artifact diff/content, right shows reviewer comments (anchored to specific locations). Similar to GitHub PR review. |
| Treasury display | Stat cards (AVU balance, recent distributions, pending liquidations) in a 3-column grid with monospace numbers. |

### 3.5 Example: Issue List Row

```
┌──────────────────────────────────────────────────────────────────────┐
│  padding: 12px 16px    height: 48px                                  │
│                                                                      │
│  [●] SYN-142  Fix artifact versioning in IACP Phase 2  [○ JE] 2d   │
│   ↑     ↑              ↑                                  ↑    ↑    │
│  teal  mono         primary text, 14px, 400            avatar  secondary
│  dot   --text-code                                     24px   text
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Labs Profile

### 4.1 Character

Labs has two modes. **Work mode**: dense, efficient, expert-oriented — writing articles, managing experiments, analyzing reviews. **Discovery mode**: accessible, navigable — browsing articles, finding labs, reading research. The article reading experience should feel like a high-quality academic paper typeset for the screen.

### 4.2 Visual Parameters

| Property | Value | Rationale |
|----------|-------|-----------|
| Body text size (UI) | **14px** (`--text-body`) | UI chrome (navigation, metadata, review panels) uses standard density. |
| Body text size (article) | **16px** in `--font-serif` (Source Serif 4) | Long-form scientific reading benefits from serif at a comfortable size. The serif signals "this is authored content, not UI." |
| Heading sizes | H1 28px, H2 22px, H3 18px (all Inter, `--font-sans`) | Headings remain sans-serif even within articles — they are structural, not prose. |
| Card padding | **20px** (`--space-5`) | Between Learn's generous and Hub's compact. |
| Section gap | **40px** (`--space-10`) | Moderate rhythm for work mode; generous for article reading. |
| Content max-width (article) | **680px** | Narrower than Learn. Academic articles benefit from shorter line lengths (~60 characters at 16px serif). Generous side margins for annotation affordance. |
| Content max-width (UI) | **100%** (with sidebar) | Work mode uses sidebar + main. |
| List row height | 52–56px | Slightly taller than Hub to accommodate article metadata (authors, date, review count, DOI). |
| Accent color | `--color-labs-500` (#3D6BCF) Indigo | Appears in: DOI badges, subject area labels, review status indicators, lab identity markers. |
| Accent subtle bg | `--color-labs-50` (#EBF0FA) | Background for DOI badges, subject area pills, article metadata sections. |
| Primary action color | `--color-primary-500` (#0FA87F) Teal | All buttons, links, active states remain teal. |

### 4.3 Density & Rhythm

- **Article reading mode is king.** When a user is reading an article, the interface recedes: minimal sidebar, no competing elements, content centered with generous margins.
- **Review anchoring follows GitHub's model.** Reviews are linked to specific text passages. Inline indicators (subtle highlight + count badge) in the article text; review thread opens in a side panel.
- **Metadata is prominent but secondary.** Authors, subject area, DOI, version history, review count — displayed clearly but in secondary text weight, never competing with the article content.
- **Work mode (lab management, research line tracking) follows Hub density.** When managing a lab or research line, density matches Hub parameters (14px body, 16px card padding, compact lists).

### 4.4 Distinctive Elements

| Element | Labs-Specific Treatment |
|---------|--------------------------|
| Article header | Title (h1, 28px, Inter), authors (secondary text, linked to profiles), subject area badges (indigo pills), DOI badge (indigo subtle bg), version indicator (v1, v2…), review count. |
| Article body | Source Serif 4, 16px, 1.7 line-height, 680px max-width. Embedded artifacts (figures, interactive experiments) are full-width within the content column. |
| Review indicator | Small teal circle with count on the left margin of a passage. On click/hover, expands to show review thread in side panel. |
| DOI badge | `bg: --color-labs-50`, `text: --color-labs-800`, monospace DOI string, rounded pill. |
| Lab header | Lab name (h1), research area badges (indigo pills), member count, active research lines count, governance type. Similar structure to Hub institution header but with scientific terminology. |
| Experiment card | Distinctive: shows experiment type, participant count, status (Draft/Active/Closed), and a "Run experiment" CTA when active. Interactive preview thumbnail where possible. |

### 4.5 Example: Article Metadata Header

```
┌─────────────────────────────────────────────────────────┐
│  max-width: 680px, centered                              │
│  padding: 40px 0                                         │
│                                                          │
│  PUBLISHED ARTICLE — v2                                  │  ← caption, indigo-600, uppercase
│                                                          │
│  Emergent Cooperation in Minority Games                  │  ← h1, 28px, Inter, 500 weight
│  with Heterogeneous Agents                               │
│                                                          │
│  J. E. Scott, M. L. Ferreira                            │  ← body, secondary, linked
│  Lab: Syntropy Complex Systems                           │  ← body-sm, secondary
│                                                          │
│  [Statistical physics] [Agent-based modeling]            │  ← indigo pills
│  [DOI: 10.xxxxx/syntropy.2026.0142]                     │  ← indigo subtle badge, mono
│                                                          │
│  14 reviews · 3 datasets · 1 interactive experiment     │  ← body-sm, secondary
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Cross-Pillar Consistency Rules

These rules are inviolable — they are what makes the three pillar expressions feel like one product.

1. **Primary action color is always teal** (`--action-primary`). No exceptions, no pillar override. When a user sees a teal button, they know it is the primary action regardless of which pillar they are in.

2. **Same component library.** Button, Card, Badge, Input — all use the same `packages/ui` components. Pillar variation is achieved through tokens, not separate component implementations.

3. **Same navigation structure.** The top Navbar is present in all pillars with the same structure. The active pillar is indicated by the navigation state, not by a visual overhaul.

4. **Same semantic colors.** Success green, error red, warning amber, info blue — identical across all three pillar. No pillar redefines what "success" looks like.

5. **Same focus ring.** The teal focus ring (`--focus-ring`) is identical everywhere. Keyboard navigation feels the same in Learn, Hub, and Labs.

6. **Same motion tokens.** Animation durations, easings, and rules are identical. Learn does not animate more than Hub. Labs does not animate less.

7. **Pillar accent never replaces teal for actions.** The amber (Learn), slate (Hub), and indigo (Labs) are contextual identity markers — badges, category labels, decorative icons. They never appear on buttons, links, or active navigation states.

---

## 6. Implementation Guide — Pillar Token Overrides

In the monorepo, each app overrides pillar tokens in its own CSS:

```css
/* apps/learn/src/styles/pillar.css */
:root {
  --pillar-accent: var(--color-learn-500);
  --pillar-accent-subtle: var(--color-learn-50);
  --pillar-accent-text: var(--color-learn-800);
  --pillar-body-size: 16px;
  --pillar-card-padding: var(--space-6);
  --pillar-section-gap: var(--space-12);
  --pillar-content-max-width: 720px;
}
```

```css
/* apps/hub/src/styles/pillar.css */
:root {
  --pillar-accent: var(--color-hub-500);
  --pillar-accent-subtle: var(--color-hub-50);
  --pillar-accent-text: var(--color-hub-800);
  --pillar-body-size: 14px;
  --pillar-card-padding: var(--space-4);
  --pillar-section-gap: var(--space-8);
  --pillar-content-max-width: 100%;
}
```

```css
/* apps/labs/src/styles/pillar.css */
:root {
  --pillar-accent: var(--color-labs-500);
  --pillar-accent-subtle: var(--color-labs-50);
  --pillar-accent-text: var(--color-labs-800);
  --pillar-body-size: 14px;
  --pillar-card-padding: var(--space-5);
  --pillar-section-gap: var(--space-10);
  --pillar-content-max-width: 680px;
}
```

Components in `packages/ui` use these tokens. No component checks which pillar it is rendering in — the tokens handle context automatically.
