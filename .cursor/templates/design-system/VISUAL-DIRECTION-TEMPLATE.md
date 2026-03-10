# Visual Direction — {Project Name}

> **Document Type**: Visual Direction  
> **Project**: {Project Name}  
> **Applicability**: Web interface only (see `.cursor/rules/design-system/design-system.mdc`, Rule DS-001)  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **UX Architect**: (AGT-UXA if AI-generated)  
> **Design System Reference**: `docs/design-system/DESIGN-SYSTEM.md`  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-016)  
> **Vision Reference**: Section 5 (Component Visions), Section 3 (Users and Actors)

---

## Purpose of This Document

This document translates the design token decisions in `DESIGN-SYSTEM.md` into an aesthetic narrative. The tokens tell you *what* values to use. This document tells you *why* those values were chosen, what they communicate, and how to make new visual decisions that remain consistent with the system's character.

**Audiences:**
- Developers implementing new UI components or pages
- Content creators generating visual assets
- AI agents making autonomous visual decisions during implementation
- Product owners validating that the aesthetic direction matches the product vision

---

## 1. Aesthetic Archetype

> *One word that captures the system's visual and experiential character. This is the primary calibration tool for any new visual decision: "Does this choice fit the archetype?"*

**Archetype**: {e.g., Professional / Technical / Playful / Minimal / Editorial / Warm / Authoritative / Precise}

**Expansion**: {One sentence that converts the archetype into a concrete experience. Example: "A tool that respects its users' time — precise, efficient, and quietly confident without decoration." Example: "A workspace that feels calm and spacious, where each element earns its place."}

**When to use this section**: Reference the archetype whenever making a visual decision not explicitly covered by the design tokens. Ask: "Does this fit the archetype in one word?"

---

## 2. Visual Character

> *3–5 concrete sentences describing the overall visual and experiential character of the interface. Be specific, not aspirational. Avoid generic phrases like "clean and modern." Describe what a person would actually see and feel.*

{Paragraph 1: Overall impression — what strikes a user in the first three seconds of seeing the interface.}

{Paragraph 2: Information presentation — how dense or airy, how structured or organic, what visual hierarchy feels like in practice.}

{Paragraph 3: Emotional register — the emotional tone the interface conveys to its primary user type. Not "professional" but something more specific: "It communicates that this is a serious tool built for people who know what they're doing."}

{Optional Paragraph 4: What the interface explicitly is not — a negative contrast that clarifies the character by defining its boundaries.}

---

## 3. Color Story

> *The aesthetic rationale behind the color palette choices. This section does not repeat the hex values (those are in DESIGN-SYSTEM.md). It explains what the colors communicate and why these specific choices were made.*

### 3.1 Brand Color Narrative

**Primary brand color** (`--color-brand-primary`): {2-3 sentences. What mood does this hue carry? Why this saturation level and not a brighter or muted version? What does it signal to the primary user type?}

**Secondary brand color** (`--color-brand-secondary`): {1-2 sentences. How does it relate to the primary? What role does it play — does it create contrast, warmth, energy?}

**Accent color** (`--color-brand-accent`): {1-2 sentences. When does it appear? What does its use communicate? It should be used sparingly — why?}

### 3.2 Neutral Scale Narrative

{2-3 sentences. What character does the neutral scale create? Warm grays vs. cool grays signal different things. The depth of the dark end of the scale (near-black vs. pure black) matters. Describe what this specific neutral range contributes to the overall aesthetic.}

### 3.3 Semantic Color Rationale

{1-2 sentences on whether the semantic colors (success, warning, error, info) were chosen to be conventional and expected (green/yellow/red) or whether deliberate deviations were made and why. Note any accessibility tradeoffs.}

### 3.4 Palette as a Set

{1-2 sentences on what the entire palette communicates when seen together. Does it read as cool and technical, warm and approachable, bold and energetic, muted and sophisticated? Why does this palette fit the user type identified in Vision Section 3?}

---

## 4. Typography Personality

> *What the typeface choices communicate about the product's character. Not technical specifications (those are in DESIGN-SYSTEM.md) — the personality that the fonts bring.*

### 4.1 Heading / Display Font

**Font**: {Font family name from DESIGN-SYSTEM.md}

{2-3 sentences. Is it geometric or humanist? Serious or friendly? Heavy or light at its default weight? What associations does it carry? What does using this font for headings say about this product?}

### 4.2 Body Font

**Font**: {Font family name from DESIGN-SYSTEM.md}

{2-3 sentences. Is it the same family as the heading or a deliberate contrast? If different, what does the contrast achieve — does the body font soften the precision of the heading font? Does it improve readability at small sizes? What personality does it add?}

### 4.3 Monospace / Code Font

**Font**: {Font family name from DESIGN-SYSTEM.md, or "Not defined — no code content in this interface"}

{1-2 sentences. If defined: what character does it add for code and technical content? If not defined: why it was explicitly excluded.}

### 4.4 Type Scale Intention

{2 sentences. What does the ratio between heading and body sizes communicate — authority, hierarchy, calm? Is the scale tight (limited contrast between sizes, creating uniformity) or expansive (strong contrast, creating drama)?}

---

## 5. Spatial Character

> *What the spacing scale and border radius choices communicate as a system.*

### 5.1 Density and Whitespace

**Spacing base unit**: {value from DESIGN-SYSTEM.md}

{2-3 sentences. Is the spacing system tight (4px base, compact layouts) or generous (8px+ base, open layouts)? What does this communicate? What kind of product benefit does it serve — does density serve power users scanning data, or does generosity create calm for occasional users?}

### 5.2 Border Radius Character

**Range**: {smallest radius token value} to {largest radius token value}

{2-3 sentences. Sharp corners (0–2px) signal precision and structure. Rounded corners (8–16px+) signal approachability and friendliness. Pills (9999px) signal playfulness. Where does this product land on that spectrum and why? Does it match the user type's expectations?}

### 5.3 Layout Grid Intention

{1-2 sentences. Is layout constrained and grid-based (predictable, structured) or more fluid (adaptive, organic)? What does this signal about the product's relationship to content — is it a tool that imposes structure or a canvas that adapts?}

---

## 6. Motion Character

> *The animation philosophy — what motion should do, what it should avoid, and what personality it adds.*

### 6.1 Speed Profile

**Fast end**: {`--duration-fast` value} — {What this duration is used for and what it signals: snappy, efficient, responsive}

**Normal**: {`--duration-normal` value} — {What this covers and what it signals}

**Slow end**: {`--duration-slow` value} — {What this duration is used for: page transitions, complex reveals}

{2-3 sentences. Overall: does the speed profile make the interface feel snappy and tool-like, or fluid and product-like? Is the range narrow (consistent, predictable) or wide (expressive, varied)?}

### 6.2 Animation Philosophy

{2-3 sentences. What purpose do animations serve in this interface? What should they never do? Example: "Every animation confirms an action or reveals a state change — motion is never decorative. Animations are short enough to be invisible in repeated use but present enough to communicate system responsiveness."}

**Commitment**: All animations respect the `prefers-reduced-motion` media query. No animation is required for functionality — they are enhancements only.

---

## 7. Illustration and Imagery Style

> *Rules for visual assets that go beyond the component library and iconography. If this project has no illustration or imagery needs, state that explicitly.*

{If not applicable: "Not applicable for this project. The visual interface relies entirely on the component library and iconography defined in `DESIGN-SYSTEM.md`. No illustrations, custom photography, or marketing imagery are required. If this changes, consult the Extension Guidelines in Section 10 for direction."}

{If applicable, fill the following:}

### 7.1 Illustration Style

**Style**: {One-word style: geometric / hand-drawn / isometric / flat / minimal / painterly / photographic}

**Style description**: {2-3 sentences. What does the illustration style look like? What are its defining visual characteristics? How does it relate to the interface's aesthetic archetype?}

### 7.2 Color Usage in Illustrations

{2-3 sentences. Which design tokens can be used in illustrations? Which are forbidden? Is there a maximum number of colors per illustration? Are gradients permitted? Are off-palette colors permitted for context (e.g., a green tree in an illustration even if green isn't in the brand palette)?}

### 7.3 Human Presence

**Include people in illustrations**: {Yes / No / Contextual — define when}

{1-2 sentences. If yes: what level of abstraction (realistic, stylized, silhouette, iconographic)? Does the style represent diverse users? If no: why (e.g., "Tool-first aesthetic — people are users of the system, not the subject of the imagery")?}

### 7.4 Photography Direction

**Photography in use**: {Yes — define where / No}

{If yes: 1-2 sentences on style (candid vs. staged, high-key vs. moody, specific subjects). Note color treatment if any (desaturated, color-graded, filters).}

### 7.5 Asset Categories

| Category | Used In | Style Notes |
|----------|---------|-------------|
| {Spot illustrations} | {Empty states, 404, success screens} | {Style constraints} |
| {Marketing / hero images} | {Landing page, README} | {Style constraints} |
| {Onboarding visuals} | {First-run experience, tutorials} | {Style constraints} |
| {Social media} | {Announcements, releases} | {Style constraints} |

---

## 8. Anti-Patterns

> *Explicit visual choices that contradict this system's aesthetic. These are not suggestions — they are prohibitions. Each item is specific and actionable, not generic.*

The following must not appear in this product's visual interface or assets:

1. **{Anti-pattern name}**: {Specific description of what to avoid and why it contradicts the aesthetic archetype. Example: "Heavy drop shadows — the neutral palette and flat elevation tokens establish a low-shadow aesthetic; heavy shadows would signal a 2010s-era consumer product, which this explicitly is not."}

2. **{Anti-pattern name}**: {Specific description. Example: "Gradients in primary backgrounds or large surfaces — the interface uses a flat neutral scale deliberately; gradients introduce a warmth and dynamism that contradicts the 'precise and efficient' archetype."}

3. **{Anti-pattern name}**: {Specific description. Example: "Decorative illustration in functional UI — spot illustrations belong in empty states and onboarding only; using them within data-dense functional screens undermines information hierarchy."}

4. **{Anti-pattern name}**: {Specific description.}

5. **{Anti-pattern name}**: {Specific description.}

*(Add more as needed. Minimum 5. Maximum 10.)*

---

## 9. Reference Landmarks

> *Comparable products or visual references that informed the design direction. For each, one sentence on what to take from it. Include at least one explicit anti-reference.*

| Reference | What to Take | Source Connection |
|-----------|-------------|-------------------|
| {Product or reference name} | {One sentence: the specific quality to calibrate against — not to copy, but to use as a benchmark} | {Where this reference was introduced: Vision Section 5 / token choices / explicit} |
| {Product or reference name} | {One sentence} | {Source} |
| {Product or reference name} | {One sentence} | {Source} |

**Anti-reference** (do not emulate): {Product or reference name}

**What to avoid from it**: {One sentence: the specific quality this product must not exhibit, and why it's incompatible with the aesthetic archetype.}

---

## 10. Extension Guidelines

> *Numbered rules for making visual decisions not covered by the design token system. Each rule is actionable and specific. Use these when implementing new components, creating new illustrations, or making layout decisions outside the component library.*

1. **{Rule name}**: {Specific, actionable rule. Example: "When adding a new illustration, limit the color palette to the primary brand token, one neutral, and one semantic color. Do not introduce new hues."}

2. **{Rule name}**: {Specific, actionable rule. Example: "When choosing between two border radius options, use the smaller value. The aesthetic is precise, not soft."}

3. **{Rule name}**: {Specific, actionable rule. Example: "When a new layout needs a visual break between sections, use spacing tokens, not decorative dividers or color fills."}

4. **{Rule name}**: {Specific, actionable rule.}

5. **{Rule name}**: {Specific, actionable rule.}

6. **{Rule name}**: {Specific, actionable rule.}

*(Minimum 4 rules. Maximum 8.)*

---

## 11. Calibration Checklist

> *Questions for developers, designers, or AI agents to self-validate a new visual element before committing it. Answer all questions — any "No" warrants a revision before proceeding.*

When adding a new component, illustration, page, or visual asset, verify:

- [ ] Does every color value come from a token in `DESIGN-SYSTEM.md`? (No hardcoded hex values.)
- [ ] Does every spacing value use a spacing token? (No arbitrary `margin: 13px`.)
- [ ] Does the element fit the aesthetic archetype in Section 1 in one word?
- [ ] Does the element avoid every anti-pattern listed in Section 8?
- [ ] If the element contains an illustration or image: does it follow the style rules in Section 7?
- [ ] If the element introduces motion: is the duration within the range in `DESIGN-SYSTEM.md §6`? Does it respect `prefers-reduced-motion`?
- [ ] Would an engineer familiar with the Reference Landmarks in Section 9 consider this element consistent with those products?
- [ ] Does the element extend the design system rather than contradict it?

---

## 12. Review and Approval

| Reviewer | Role | Date | Status |
|---------|------|------|--------|
| | UX Architect (AGT-UXA) | | Approved / Needs Revision |
| | System Architect | | Approved / Needs Revision |
| | Product Owner | | Approved / Needs Revision |
