# Pillar Profiles — {Project Name}

> **Document Type**: Pillar Profiles
> **Project**: {Project Name}
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-018)
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Purpose

This document defines how each pillar (or module/sub-application) within the product expresses the shared design system with contextual variations. All pillars share the same base tokens, component library, and primary action color. Pillar profiles define only the contextual overrides that give each pillar its distinct identity without fragmenting the visual system.

**What varies per pillar**: accent color, body text size, card padding, section gap, content max-width, information density, and characteristic component patterns.

**What never varies**: primary action color (`--action-primary`), semantic colors (success, error, warning, info), focus ring, and all shared components from `packages/ui`.

---

## 1. Platform Defaults (Baseline)

The baseline values active when no pillar context is set. All pillar overrides are relative to these defaults.

| Property | Default Value | Token |
|----------|--------------|-------|
| Body text size | 16px | `var(--text-body)` |
| Card padding | 24px | `var(--space-6)` |
| Section gap | 32px | `var(--space-8)` |
| Content max-width | 768px | — |
| List row height | 48px | — |
| Accent color | Primary brand color | `var(--action-primary)` |
| Density level | Medium | — |

---

## 2. {Pillar 1 Name} Profile

### 2.1 Character

{1–2 paragraphs describing the visual feel and purpose of this pillar. What is the user doing here? What emotional register should the interface convey — focused and instructional, efficient and scannable, exploratory and spacious? Example: "The Learn pillar is a guided environment where users follow structured paths. The visual language is warm and encouraging: generous spacing signals 'take your time', amber accents draw attention to progress markers, and the slightly larger body text makes sustained reading comfortable."}

### 2.2 Visual Parameters

| Property | Value | Rationale |
|----------|-------|-----------|
| Accent color | {#hex or token} | {Why this color for this pillar} |
| Accent subtle background | {#hex or token} | {Tint for highlights and badges} |
| Accent text (on accent bg) | {white / dark} | {Contrast requirement} |
| Body text size | {e.g., 16px / `var(--text-body)`} | {Why this size} |
| Card padding | {e.g., 24px / `var(--space-6)`} | {Density reasoning} |
| Section gap | {e.g., 32px / `var(--space-8)`} | {Breathing room rationale} |
| Content max-width | {e.g., 720px} | {Reading line length target} |
| List row height | {e.g., 56px} | {Touch and scan comfort} |
| Density level | {Low / Medium / High} | {User task type} |

### 2.3 Density & Rhythm

- {Rule about information density in this pillar: e.g., "Maximum 3 content blocks visible above the fold — this pillar prioritizes focus over scan."}
- {Rule about predominant patterns: e.g., "Card grid for discovery; single-column centered for reading; step indicator for guided flows."}
- {Rule about section rhythm: e.g., "Each cognitive section (introduction, content, exercise) is separated by `--pillar-section-gap`, not a visual divider."}

### 2.4 Distinctive Elements

> *How common design system elements manifest specifically in this pillar.*

| Element | This Pillar's Treatment |
|---------|------------------------|
| Progress indicator | {e.g., Accent-colored filled bar, always visible in sidebar} |
| Badges / tags | {e.g., Accent-subtle background, accent text, rounded-full} |
| Card header | {e.g., Accent left border, no drop shadow} |
| Status indicators | {e.g., Text-only labels in this pillar; no icon-only indicators} |
| Navigation active state | {e.g., Accent left border + accent text} |
| {Other element} | {Treatment} |

### 2.5 Example

```
┌─────────────────────────────────────────────┐
│  {Pillar 1} — typical component/layout      │
│  ┌─────────────────────────────────────┐    │
│  │  [Accent-colored header / title]    │    │
│  │  Body text at pillar body size      │    │
│  │  Secondary text in --text-secondary │    │
│  │                                     │    │
│  │  [Accent badge]  [Neutral badge]    │    │
│  └─────────────────────────────────────┘    │
│  ← card padding → ← section gap →           │
└─────────────────────────────────────────────┘
```

---

## 3. {Pillar 2 Name} Profile

### 3.1 Character

{1–2 paragraphs. What is the user doing here? What density and emotional register? Example: "Hub is the collaboration layer. Users are scanning issues, reviewing pull requests, and coordinating contributions. The visual language is efficient and structured: tighter spacing supports power users who scan vertically, slate accents signal 'infrastructure and coordination', and high information density is a feature, not a bug."}

### 3.2 Visual Parameters

| Property | Value | Rationale |
|----------|-------|-----------|
| Accent color | {#hex or token} | |
| Accent subtle background | {#hex or token} | |
| Accent text (on accent bg) | {white / dark} | |
| Body text size | {e.g., 14px / `var(--text-body-sm)`} | |
| Card padding | {e.g., 16px / `var(--space-4)`} | |
| Section gap | {e.g., 24px / `var(--space-6)`} | |
| Content max-width | {e.g., 1200px} | |
| List row height | {e.g., 44px} | |
| Density level | {Medium / High} | |

### 3.3 Density & Rhythm

- {Density rules for this pillar}
- {Predominant patterns}
- {Section rhythm rules}

### 3.4 Distinctive Elements

| Element | This Pillar's Treatment |
|---------|------------------------|
| Progress indicator | |
| Badges / tags | |
| Card header | |
| Status indicators | |
| Navigation active state | |

### 3.5 Example

```
┌─────────────────────────────────────────────┐
│  {Pillar 2} — typical component/layout      │
│  (compact, denser layout representation)    │
└─────────────────────────────────────────────┘
```

---

## {N}. {Pillar N Name} Profile

*(Repeat the structure above for each additional pillar. Minimum one section per pillar defined in the product.)*

---

## {N+1}. Cross-Pillar Consistency Rules

The following rules are inviolable and override any pillar-specific treatment:

1. **Primary action color is universal**: `--action-primary` (and its hover/active variants) is the same across all pillars. No pillar replaces primary buttons, primary links, or the focus ring with its accent color.
2. **Semantic colors are universal**: Success (green), error (red), warning (amber/yellow), and info (blue) tokens are identical in every pillar. A red error in Learn looks the same as a red error in Hub.
3. **Focus ring is universal**: The keyboard focus ring uses `--color-focus-ring` (derived from `--action-primary`) in all pillars.
4. **Typography base is shared**: Font families and the two permitted weights (400 and 500) are the same in all pillars. Pillar body size (`--pillar-body-size`) adjusts size only, not family or weight.
5. **Shared components do not check context**: Components in `packages/ui` consume pillar tokens. They do not contain conditional logic based on pillar identity.
6. **{Additional cross-pillar rule}**: {Description.}

---

## {N+2}. Implementation Guide — Pillar Token Overrides

### CSS Custom Property Override Pattern

```css
/* Pillar token defaults — set in the shared token file */
:root {
  --pillar-accent: var(--action-primary);
  --pillar-accent-subtle: color-mix(in srgb, var(--action-primary) 8%, transparent);
  --pillar-accent-text: white; /* or dark for light accents */
  --pillar-body-size: var(--text-body);       /* 16px */
  --pillar-card-padding: var(--space-6);       /* 24px */
  --pillar-section-gap: var(--space-8);        /* 32px */
  --pillar-content-max-width: 768px;
}

/* Pillar 1 override — applied on the pillar root element */
[data-pillar="{pillar1-slug}"],
.pillar-{pillar1-slug} {
  --pillar-accent: var(--color-{pillar1}-500);
  --pillar-accent-subtle: var(--color-{pillar1}-100);
  --pillar-accent-text: white; /* verify contrast */
  --pillar-body-size: var(--text-body);
  --pillar-card-padding: var(--space-6);
  --pillar-section-gap: var(--space-8);
  --pillar-content-max-width: 720px;
}

/* Pillar 2 override */
[data-pillar="{pillar2-slug}"],
.pillar-{pillar2-slug} {
  --pillar-accent: var(--color-{pillar2}-500);
  --pillar-accent-subtle: var(--color-{pillar2}-100);
  --pillar-accent-text: white;
  --pillar-body-size: var(--text-body-sm);     /* denser: 14px */
  --pillar-card-padding: var(--space-4);        /* tighter: 16px */
  --pillar-section-gap: var(--space-6);         /* tighter: 24px */
  --pillar-content-max-width: 1200px;
}
```

### Next.js / React Integration Pattern

```tsx
// Apply pillar context at the app layout level
// apps/{pillar-name}/src/app/layout.tsx

export default function PillarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-pillar="{pillar-slug}" className="pillar-{pillar-slug}">
      {children}
    </div>
  );
}
```

### Tailwind Dark Mode Pattern

```css
/* Dark mode pillar overrides */
.dark [data-pillar="{pillar1-slug}"] {
  --pillar-accent: var(--color-{pillar1}-400); /* slightly lighter for dark bg */
  --pillar-accent-subtle: color-mix(in srgb, var(--color-{pillar1}-500) 15%, transparent);
}
```
