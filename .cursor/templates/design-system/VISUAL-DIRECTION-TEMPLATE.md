# Visual Direction — {Project Name}

> **Document Type**: Visual Direction
> **Project**: {Project Name}
> **Applicability**: Web interface only (see `.cursor/rules/design-system/design-system.mdc`, Rule DS-001)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}
> **UX Architect**: (AGT-UXA if AI-generated)
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-016)
> **Vision Reference**: Section 5 (Component Visions), Section 3 (Users and Actors)

---

## Purpose of This Document

This document translates the design token decisions in `DESIGN-TOKENS.md` into an aesthetic narrative. The tokens tell you *what* values to use. This document tells you *why* those values were chosen, what they communicate, and how to make new visual decisions that remain consistent with the system's character.

**Audiences:**
- Developers implementing new UI components or pages
- Content creators generating visual assets
- AI agents making autonomous visual decisions during implementation
- Product owners validating that the aesthetic direction matches the product vision

---

## 1. Aesthetic Archetype

> *One word that captures the system's visual and experiential character. This is the primary calibration tool for any new visual decision: "Does this choice fit the archetype?"*

**Archetype**: {e.g., Trustworthy / Intelligent / Precise / Purposeful / Editorial / Warm / Authoritative}

**Expansion**: {One sentence that converts the archetype into a concrete experience. Example: "A professional tool that earns trust through restraint — every element earns its place by serving the user's work, never by decorating it." Another example: "Intelligent and evidence-backed, communicating through density and structure rather than visual noise."}

**When to use this section**: Reference the archetype whenever making a visual decision not explicitly covered by the design tokens. Ask: "Does this choice fit the archetype in one word?" A component that introduces unnecessary decoration, animation for its own sake, or visual complexity that obscures content fails the archetype test.

---

## 2. Visual Character

> *3–5 concrete sentences describing the overall visual and experiential character of the interface. Be specific, not aspirational. Avoid generic phrases like "clean and modern." Describe what a person would actually see and feel.*

{Paragraph 1: Overall impression — what strikes a user in the first three seconds of seeing the interface.}

{Paragraph 2: Information presentation — how dense or airy, how structured or organic, what visual hierarchy feels like in practice.}

{Paragraph 3: Emotional register — the emotional tone the interface conveys to its primary user type. Not "professional" but something more specific: "It communicates that this is a serious tool built for people who know what they're doing."}

{Optional Paragraph 4: What the interface explicitly is not — a negative contrast that clarifies the character by defining its boundaries.}

---

## 3. Color Story

> *The aesthetic rationale behind the color palette choices. This section does not repeat the hex values (those are in DESIGN-TOKENS.md). It explains what the colors communicate and why these specific choices were made.*

### 3.1 Primary Brand Color Narrative

**Primary color** (`--action-primary`): {2–3 sentences. What mood does this hue carry? Why this saturation level and not a brighter or muted version? What does it signal to the primary user type? Example: "The teal-emerald primary sits at the intersection of nature and technology — it communicates growth, reliability, and forward motion without the aggression of a pure green or the coolness of a blue."}

### 3.2 Pillar Accent Narratives

> *One entry per pillar. Explain the aesthetic reasoning behind each pillar's accent color choice.*

**{Pillar 1} accent** (`--color-{pillar1}-500`): {2 sentences. What does this color communicate for this pillar's purpose? Why this hue specifically? Example: "Amber signals learning and discovery — a warm, attention-guiding tone that recalls annotation highlights and the glow of an engaged mind."}

**{Pillar 2} accent** (`--color-{pillar2}-500`): {2 sentences.}

**{Pillar 3} accent** (`--color-{pillar3}-500`): {2 sentences.}

*(Add entries for each pillar defined in `PILLAR-PROFILES.md`)*

### 3.3 Neutral Scale Narrative

{2–3 sentences. What character does the neutral scale create? Warm grays vs. cool grays signal different things. The depth of the dark end of the scale (near-black vs. pure black) matters. Describe what this specific neutral range contributes to the overall aesthetic.}

### 3.4 Semantic Color Rationale

{1–2 sentences on whether the semantic colors (success, warning, error, info) were chosen to be conventional and expected, or whether deliberate deviations were made and why. Note the rule: status is always communicated with icon + text, never color alone.}

### 3.5 Palette as a Set

{1–2 sentences on what the entire palette communicates when seen together. Does it read as cool and technical, warm and approachable, bold and energetic, muted and sophisticated? Why does this palette fit the user type identified in Vision Section 3?}

---

## 4. Typography Personality

> *What the typeface choices communicate about the product's character. Not technical specifications (those are in DESIGN-TOKENS.md) — the personality that the fonts bring.*

### 4.1 Primary Sans Serif

**Font**: {Font family name from DESIGN-TOKENS.md}

{2–3 sentences. Is it geometric or humanist? Serious or friendly? What associations does it carry? At only two weights (400 and 500), what does the restrained weight palette signal — consistency, precision, refusal of typographic drama for its own sake?}

### 4.2 Monospace / Code Font

**Font**: {Font family name from DESIGN-TOKENS.md, or "Not defined — no code content in this interface"}

{1–2 sentences. If defined: what character does it add for code and technical content? Does it feel technical-precise or warm-readable? If not defined: why it was explicitly excluded.}

### 4.3 Serif (Long-Form Reading Only)

**Font**: {Font family name, or "Not used — no long-form reading content"}

{1–2 sentences. If used: for which pillar or content type? What quality does the serif bring to sustained reading that the sans would not — authority, texture, editorial weight?}

### 4.4 Type Scale Intention

{2 sentences. What does the ratio between heading and body sizes communicate? Is the scale tight (limited contrast between sizes, creating uniformity) or expansive (strong contrast, creating drama)? Does the two-weight constraint reinforce or tension against this scale character?}

---

## 5. Spatial Character

> *What the spacing scale and border radius choices communicate as a system.*

### 5.1 Density and Whitespace

**Spacing base unit**: {4px or 8px, from DESIGN-TOKENS.md}

{2–3 sentences. Is the spacing system tight (compact layouts for power users) or generous (open layouts for occasional users)? How does density vary across pillars — which pillars are denser, which are more spacious, and why does this serve their user types?}

### 5.2 Border Radius Character

**Range**: 4px (sm) to 16px (xl); pills at 9999px (full)

{2–3 sentences. The system's radius range spans from structured (4px) to rounded (16px). Where does the default (8px) land on the spectrum from "precise tool" to "approachable product"? Why does this match the archetype?}

### 5.3 Elevation Strategy

{1–2 sentences. Elevation is expressed through shadows only — not through glass morphism or transparency. What does this choice communicate? Example: "Shadows define hierarchy without the visual weight of blur effects, keeping the interface clean and scannable at high information density."}

### 5.4 Layout Grid Intention

{1–2 sentences. Is layout constrained and grid-based (predictable, structured) or more fluid (adaptive, organic)? What does this signal about the product's relationship to content?}

---

## 6. Motion Character

> *The animation philosophy — what motion should do, what it should avoid, and what personality it adds.*

### 6.1 Speed Profile

**Fast end**: {`--duration-fast` = 100ms} — {Micro-interactions, tooltips, instant confirmations}

**Normal**: {`--duration-normal` = 200ms} — {Standard transitions, mode switching, content reveals}

**Slow end**: {`--duration-slow` = 400ms} — {Page transitions, complex enters, sheet slides}

{2–3 sentences. Overall: does the speed profile make the interface feel snappy and tool-like, or fluid and product-like? Does the range reinforce the archetype?}

### 6.2 Animation Philosophy

{2–3 sentences. What purpose do animations serve in this interface? What should they never do? Example: "Every animation confirms an action or reveals a state change — motion is never decorative. Animations are short enough to be invisible in repeated use but present enough to communicate system responsiveness."}

**Commitment**: All animations respect the `prefers-reduced-motion` media query. No animation is required for functionality — they are enhancements only.

---

## 7. Illustration and Imagery Style

> *Rules for visual assets beyond the component library and iconography. If this project has no illustration or imagery needs, state that explicitly.*

{If not applicable: "Not applicable for this project. The visual interface relies entirely on the component library and iconography defined in `DESIGN-TOKENS.md`. No illustrations, custom photography, or marketing imagery are required. If this changes, consult the Extension Guidelines in Section 10."}

{If applicable, fill the following:}

### 7.1 Illustration Style

**Style**: {One-word style: geometric / hand-drawn / isometric / flat / minimal / painterly / photographic}

**Style description**: {2–3 sentences. What does the illustration style look like? What are its defining visual characteristics? How does it relate to the aesthetic archetype?}

### 7.2 Color Usage in Illustrations

{2–3 sentences. Which design tokens can be used in illustrations? Which are forbidden? Is there a maximum number of colors per illustration? Are gradients permitted?}

### 7.3 Human Presence

**Include people in illustrations**: {Yes / No / Contextual — define when}

{1–2 sentences. If yes: what level of abstraction (realistic, stylized, silhouette, iconographic)? If no: why.}

### 7.4 Asset Categories

| Category | Used In | Style Notes |
|----------|---------|-------------|
| {Spot illustrations} | {Empty states, 404, success screens} | {Style constraints} |
| {Marketing / hero images} | {Landing page, README} | {Style constraints} |
| {Onboarding visuals} | {First-run experience, tutorials} | {Style constraints} |

---

## 8. Anti-Patterns

> *Explicit visual choices that contradict this system's aesthetic. These are not suggestions — they are prohibitions. Each item is specific and actionable.*

The following must not appear in this product's visual interface or assets:

1. **Glass morphism on functional UI**: Blur and semi-transparency effects on cards, sidebars, or data containers. Elevation is expressed through shadows only. Glass morphism introduces visual noise that harms readability at information density.

2. **Font weights beyond 400 and 500**: Bold (700), semibold (600), or light (300) weights are not part of this system. Hierarchy is expressed through size, color, and spacing — not weight contrast.

3. **Decorative gradients on surfaces**: Gradient fills on cards, panels, or page backgrounds. The surface color system is flat by design; gradients contradict the structured, tool-like character.

4. **Pillar-specific action colors**: Each pillar has an accent color, but primary action buttons, links, and focus rings always use `--action-primary` across all pillars. Pillar accents appear on highlights, badges, and indicators — never on interactive affordances.

5. **Status communicated by color alone**: Any state indicator (success, error, warning) that does not include both a semantic icon and a text label alongside the color. Color blindness accessibility requires this dual-coding at all times.

6. **{Additional anti-pattern}**: {Specific description of what to avoid and why it contradicts the aesthetic archetype.}

7. **{Additional anti-pattern}**: {Specific description.}

8. **{Additional anti-pattern}**: {Specific description.}

*(Minimum 5 total. Add more as needed, up to 10.)*

---

## 9. Reference Landmarks

> *Comparable products or visual references that informed the design direction. For each, one sentence on what to take from it.*

| Reference | What to Take | Source Connection |
|-----------|-------------|-------------------|
| {Product or reference name} | {One sentence: the specific quality to calibrate against — not to copy, but to benchmark} | {Vision Section 5 / token choices / explicit} |
| {Product or reference name} | {One sentence} | {Source} |
| {Product or reference name} | {One sentence} | {Source} |

**Anti-reference** (do not emulate): {Product or reference name}

**What to avoid from it**: {One sentence: the specific quality this product must not exhibit, and why it is incompatible with the aesthetic archetype.}

---

## 10. Extension Guidelines

> *Numbered rules for making visual decisions not covered by the design token system. Each rule is actionable and specific.*

1. **New colors**: When a new color is needed that is not in the token system, map it to the nearest existing semantic token first. If a primitive is truly needed, add it to `DESIGN-TOKENS.md` Layer 1 before using it anywhere.

2. **New spacing**: When the standard spacing scale does not fit, use the nearest token. Do not introduce arbitrary values. If a recurring pattern requires a new spacing value, add it as a pillar token in `PILLAR-PROFILES.md`.

3. **Choosing between border radius options**: When two radius values could work, use the smaller value. The system skews toward structure (smaller radii) for data-dense contexts and toward approachability (larger radii) for onboarding and marketing surfaces.

4. **New layout sections**: When adding a section break between page sections, use spacing tokens (`--space-16` or `--space-24`) and a `--border-subtle` separator. Do not use color fills, gradient dividers, or heavy decorative elements.

5. **{Additional rule}**: {Specific, actionable rule.}

6. **{Additional rule}**: {Specific, actionable rule.}

*(Minimum 4 rules. Maximum 8.)*

---

## 11. Calibration Checklist

> *Questions for developers, designers, or AI agents to self-validate a new visual element before committing it. Answer all — any "No" warrants a revision.*

When adding a new component, illustration, page, or visual asset, verify:

- [ ] Does every color value come from a token in `DESIGN-TOKENS.md`? (No hardcoded hex values.)
- [ ] Does every spacing value use a spacing token? (No arbitrary `margin: 13px`.)
- [ ] Are only weights 400 and 500 used? (No 600, 700, or 300.)
- [ ] Does the element fit the aesthetic archetype in Section 1 in one word?
- [ ] Does the element avoid every anti-pattern listed in Section 8?
- [ ] If the element contains status information: does it use icon + text alongside color?
- [ ] If the element contains an illustration or image: does it follow the style rules in Section 7?
- [ ] If the element introduces motion: is the duration within the range in `DESIGN-TOKENS.md §6`? Does it respect `prefers-reduced-motion`?
- [ ] Would a developer familiar with the Reference Landmarks in Section 9 consider this element consistent?
- [ ] Does the element extend the design system rather than contradict it?

---

## 12. Review and Approval

| Reviewer | Role | Date | Status |
|---------|------|------|--------|
| | UX Architect (AGT-UXA) | | Approved / Needs Revision |
| | System Architect | | Approved / Needs Revision |
| | Product Owner | | Approved / Needs Revision |
