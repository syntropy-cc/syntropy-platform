# Image Prompts — Syntropy Ecosystem

> **Document Type**: Image Prompts Library
> **Project**: Syntropy Ecosystem
> **Applicability**: Applicable — see Section 1
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-16
> **UX Architect**: AGT-UXA
> **Visual Direction Reference**: `docs/design-system/VISUAL-DIRECTION.md`
> **Design System Reference**: `docs/design-system/DESIGN-SYSTEM.md`
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-017)

---

## Applicability

Image generation prompts are applicable for this project. The Syntropy Ecosystem has a public-facing institutional landing page, an onboarding flow for new users, empty states throughout all three pillars, and marketing and social media needs for an open source project launch. The visual interface uses the component library and iconography for functional UI, and this prompt library governs the supplementary visual assets: spot illustrations, marketing/hero images, onboarding visuals, and social media graphics. All prompts derive from the aesthetic archetype and token decisions in `DESIGN-SYSTEM.md` and `VISUAL-DIRECTION.md`. Use the Base Style Specification as the mandatory starting point for any AI image generation task.

---

## How to Use This Document

1. **Always start with the Base Style Specification** (Section 2) — copy it verbatim as the foundation of your prompt
2. **Add the category-specific prompt** (Sections 3–7) that matches the asset type you need
3. **Replace all `[PLACEHOLDERS]` in square brackets** with your specific content
4. **Always append the Universal Negative Prompt** (Section 8) to your final prompt
5. **Verify against the Calibration Check** (Section 9) before using the generated result

**Supported tools**: These prompts are written for text-to-image models (Midjourney, DALL-E 3, Stable Diffusion, Ideogram, Flux). Adjust syntax per tool (e.g., add `--ar 16:9` for Midjourney aspect ratio, or wrap in `style:` for some tools).

**Do not use prompts from this document as-is without filling in the placeholders.** Prompts with unfilled placeholders produce generic results that will not match the project aesthetic.

---

## 1. Applicability Assessment

| Asset Category | Needed | Used In |
|----------------|--------|---------|
| UI Screenshots / Mockups | Yes | Documentation pages, README header, marketing |
| Marketing / Hero Images | Yes | Institutional landing page hero, press kit, README |
| Onboarding Illustrations | Yes | First-run wizard (career discovery, placement, first fragment) |
| Spot Illustrations | Yes | Empty states (portfolio, recommendations, project list), 404, success/error screens |
| Social Media Visuals | Yes | GitHub release announcements, feature launches, community announcements |

---

## 2. Base Style Specification

> *The mandatory foundation for every prompt in this document. It encodes the project's aesthetic archetype, color palette mood, typography character, and rendering style — derived directly from `DESIGN-SYSTEM.md` and `VISUAL-DIRECTION.md`. Copy this specification verbatim at the start of every prompt.*

**Base Style Specification:**

```
Flat geometric vector illustration, clean shapes; color palette of medium-saturation blue (#3b82f6 equivalent), 
slate gray, and cool neutrals with sky-blue accent used sparingly. 
Dark mode option: dark gradient background (slate and blue) or light neutral background; 
optional glass morphism (blur, translucent borders). 
Gradient allowed only on hero or card surfaces per design tokens (slate-to-blue hero gradient, cyan-to-purple accent). 
Precise and purposeful aesthetic, generous negative space, professional digital-tool visual style, 
2D only, no textures, no decorative elements without function
```

**What this specification encodes:**
- Aesthetic archetype: Purposeful & Immersive
- Primary color mood: Cool, systematic, trust-building — medium-saturation blue dominant, cool neutrals as ground; dark gradient or light neutral option
- Rendering: Flat geometric vector, 2D only; gradients only where specified (hero, accent)
- Tone: Professional, precise

---

## 3. UI Screenshots and Mockups

> *Photorealistic or stylized depictions of the interface. Used in documentation pages, README files, marketing materials, and press kits.*

**When to use**: Product documentation headers, tutorial step illustrations, GitHub README preview image, marketing hero sections, press kit.

**Positive Prompt Template:**

```
[BASE STYLE SPECIFICATION]

UI screenshot mockup of [SCREEN NAME OR DESCRIPTION — e.g., "the Syntropy Learn track progress view", 
"the Hub project issue list", "the Labs article editor with side-by-side preview"],
showing [KEY UI ELEMENTS TO INCLUDE — e.g., "a sidebar navigation, a list of fragments with completion 
indicators, and an active fragment card"], 
[INTERACTION STATE — e.g., "with several items completed and one in progress", "empty state with a 
prominent call-to-action", "filled with realistic content"],
displayed in a [DEVICE FRAME — e.g., "browser window frame on a light gray background", 
"no frame, edge-to-edge", "laptop mockup at slight angle"],
[THEME — e.g., "light theme", "dark theme with gradient background and glass-style navigation"],
[ASPECT — e.g., "widescreen 16:9", "4:3 for documentation"]
```

**Negative Prompt:**

```
[UNIVERSAL NEGATIVE PROMPT FROM SECTION 8], cluttered layout, too much text, unreadable typography,
outdated UI patterns, skeuomorphic elements, excessive drop shadows, neon colors,
misaligned elements, placeholder "Lorem ipsum" text visible at readable scale,
mobile layout (desktop only). Omit "dark mode interface" if the asset is explicitly dark theme.
```

**Recommended aspect ratio**: 16:9 for widescreen, 4:3 for documentation, 2:1 for README headers

**Usage notes**: Describe the content and state rather than asking the model to reproduce actual interface elements — the output will be illustrative, not pixel-accurate. These are for marketing and documentation previews. When depicting pillar-specific screens, mention the pillar name (Learn / Hub / Labs) so the model can calibrate the information density: Learn = more open and spatial; Hub = denser, more tabular; Labs = editorial with two-panel structure.

---

## 4. Marketing / Hero Images

> *Full-width visuals for landing pages, README headers, and press materials. These set the first impression of the product.*

**When to use**: Institutional landing page hero section, GitHub README header, press kit images, conference talk slide backgrounds, product hunt launch asset.

**Positive Prompt Template:**

```
[BASE STYLE SPECIFICATION]

Hero marketing image for a unified learning, collaboration, and research ecosystem platform,
[BACKGROUND — "dark gradient background (slate to blue)" or "light neutral background"];
[optional: "glass-style overlays"];
[VISUAL METAPHOR OR CONCEPT — choose one:
  Option A: "abstract geometric visualization of three interconnected flows — learning, building, and researching (Aprenda, Desenvolva, Pesquise) — converging toward a central node, suggesting the ecosystem's cross-pillar unification"
  Option B: "a structured city-like grid of interconnected nodes and pathways, some illuminated to suggest progress, others visible on the horizon, representing knowledge territories to be explored"
  Option C: "three distinct geometric clusters — a progression map, a collaborative network, and a document structure — connected by a central flowing path, representing Learn, Hub, and Labs unified"],
[MOOD — e.g., "confident and purposeful", "calm and structured", "expansive and forward-looking"],
wide panoramic composition, [ASPECT — e.g., "16:9 widescreen", "3:1 ultra-wide banner"],
no text or typography, purely visual
```

**Negative Prompt:**

```
[UNIVERSAL NEGATIVE PROMPT FROM SECTION 8], stock photo clichés, handshakes, generic business imagery,
people in suits, rocket ships, light bulbs as metaphor, gears as metaphor, excessive complexity,
text or typography embedded in the image,
consumer app aesthetic, playful or cartoon style
```

**Recommended aspect ratio**: 16:9 for the landing page hero; 3:1 for ultra-wide banners; 2:1 for README headers

**Usage notes**: The three-pillar structure (Learn, Hub, Labs) is the core visual concept available for hero images. Abstract representations of convergence — flows meeting at a point, territories connecting through pathways, separate structures unified by a common backbone — communicate the ecosystem's proposition without requiring the viewer to understand the platform first. Avoid depicting a specific pillar in isolation for the main hero; the convergence is the message.

---

## 5. Onboarding Illustrations

> *Step-by-step visual guides for new users in first-run experiences, tutorial pages, and getting-started flows.*

**When to use**: First-run wizard screens (career discovery, goal setting, placement), onboarding step headers, getting-started documentation, feature introduction moments (e.g., first fragment, first artifact published, first contribution submitted).

**Positive Prompt Template:**

```
[BASE STYLE SPECIFICATION]

Onboarding illustration for step [STEP NUMBER] of [TOTAL STEPS]: [STEP TITLE — e.g., "Choose your starting track"],
showing [WHAT IS HAPPENING IN THIS STEP — describe the concept, not the UI element — e.g., 
  "a simplified figure standing at the beginning of a clearly lit pathway, with multiple diverging routes ahead representing career choice"
  "a partially assembled geometric object gaining its final piece, representing progress toward a first artifact"
  "a small geometric node connecting to a larger network, representing a first contribution entering the ecosystem"],
[HUMAN PRESENCE — e.g., "featuring a simplified geometric human silhouette, no facial features" 
  or "no people, objects and abstract shapes only"],
instructional and clear composition, square or portrait format,
consistent flat geometric style with previous steps in this series
```

**Negative Prompt:**

```
[UNIVERSAL NEGATIVE PROMPT FROM SECTION 8], overly complex scene, multiple competing focal points,
photorealism, photograph style, corporate stock illustration clichés (floating heads, thumbs up, 
speech bubbles), dense text integrated into the illustration, confusing or abstract composition,
cartoon characters with faces, consumer-app mascot style
```

**Recommended aspect ratio**: 1:1 square for in-app wizard screens; 4:3 landscape for documentation headers; 16:9 for feature introduction banners

**Usage notes**: Generate all onboarding illustrations in one session with the Base Style Specification identical in each prompt, and specify "consistent flat geometric style with previous steps in this series" explicitly. Review all outputs together before accepting any — a style inconsistency in step 3 of a 5-step wizard is more damaging than a single imperfect illustration. The primary onboarding flows that need illustrations are: (1) career discovery and track selection, (2) first fragment and first artifact build, (3) first contribution submitted, (4) first portfolio update.

---

## 6. Spot Illustrations

> *Small, focused images for empty states, success confirmations, error pages, and similar single-purpose UI moments.*

**When to use**: Empty state panels (no portfolio entries yet, no recommendations yet, no open issues, no articles published), 404 error pages, success confirmation screens (artifact published, contribution accepted, article version published with DOI), permission-denied states, loading completion moments.

**Positive Prompt Template:**

```
[BASE STYLE SPECIFICATION]

Spot illustration for [USE CASE — choose the most specific description]:
  Empty states:
    "empty portfolio — a simple geometric frame with no content inside, suggesting a space ready to be filled"
    "no recommendations yet — a compass or directional element with no destination marked"
    "no open issues — a clean empty container or inbox shape"
    "no articles published — a blank document outline with an arrow pointing outward"
  Success states:
    "artifact published — a geometric node with a checkmark integrated into its structure, connecting to a network"
    "contribution accepted — a puzzle piece fitting cleanly into a larger geometric shape"
    "DOI issued — a document with a small stamp or seal element, suggesting official anchoring"
  Error states:
    "404 page not found — a map grid with an X marking a missing location"
    "connection failed — two geometric shapes with a gap between their connection points"
    "permission denied — a locked geometric container with a key shape nearby"

simple and focused composition with single focal element, generous empty space around the subject,
small format suitable for [DIMENSIONS — e.g., "200×200px inline empty state", "300×200px panel"],
no text, purely visual
```

**Negative Prompt:**

```
[UNIVERSAL NEGATIVE PROMPT FROM SECTION 8], complex multi-element scene, photorealism,
too many visual elements competing for attention, dark or anxiety-inducing imagery for neutral empty states,
overly celebratory imagery for error states, text integrated into illustration,
cartoon faces or consumer mascot elements, bright neon colors
```

**Recommended aspect ratio**: 1:1 square for most empty states; 3:2 landscape for wider panel use; 4:3 for documentation contexts

**Usage notes**: Spot illustrations are small and will be viewed at low resolution — keep them simple. One object, one idea. The metaphor should be universally recognizable without cultural ambiguity. The ecosystem's user base is global (Vision §3 explicitly includes users without formal institutional affiliation, from any background); avoid metaphors that differ in meaning across cultures. For empty states, prefer "ready to be filled" metaphors over "nothing here" — the tone should be inviting, not deflating. For success states, prefer "connected" or "anchored" metaphors that echo the portfolio's verifiable recording function.

---

## 7. Social Media Visuals

> *Announcement and sharing images for product releases, feature launches, and community sharing.*

**When to use**: GitHub release announcements, Twitter/X post images, LinkedIn post images, Product Hunt launch assets, changelog entries, community milestone announcements (e.g., first 1000 users, first research article published).

**Positive Prompt Template:**

```
[BASE STYLE SPECIFICATION]

Social media announcement image for [EVENT TYPE — e.g., 
  "open source project launch"
  "version release — v0.x milestone"
  "feature announcement — Learn pillar now live"
  "community milestone — first research article published on Labs"
  "ecosystem announcement — cross-pillar recommendation engine launched"],
[MAIN VISUAL ELEMENT — e.g., 
  "abstract geometric pattern of three interconnected nodes using brand blue and slate gray, suggesting ecosystem convergence"
  "a single large geometric shape being completed or connected, suggesting a milestone reached"
  "a grid of small geometric tiles assembling into a unified structure, suggesting community growth"],
bold and legible at small sizes, [ASPECT — e.g., "1:1 square for social", "16:9 for Twitter/LinkedIn sharing card"],
leave center [SAFE ZONE — e.g., "central 50% of the image"] clear for text overlay to be added separately,
no embedded text (text will be composited separately in a design tool)
```

**Negative Prompt:**

```
[UNIVERSAL NEGATIVE PROMPT FROM SECTION 8], text embedded in the image (text will be added separately),
photorealism, stock imagery, too many visual elements, poor contrast for small-size legibility,
imagery that looks dated or trend-dependent, meme references, confetti or party imagery,
dark or moody backgrounds that reduce legibility at thumbnail size
```

**Recommended aspect ratio**: 1:1 for most social platforms; 16:9 for Twitter/LinkedIn sharing cards; 9:16 portrait for Stories

**Usage notes**: Generate background images only — text (version number, product name, tagline, milestone description) should be composited separately in a design tool so it can be updated for each release. This keeps the base image reusable across multiple announcements. The visual should work at 200×200px thumbnail size as well as full resolution: test legibility at small size before accepting. For ecosystem-wide announcements, prefer three-element compositions that suggest the Learn/Hub/Labs structure; for single-pillar announcements, a single strong geometric shape in the pillar's contextual density is sufficient.

---

## 8. Universal Negative Prompt

> *Apply this to every generation regardless of category. It encodes the anti-patterns from `VISUAL-DIRECTION.md §8`.*

**Paste this at the end of every prompt:**

```
Negative prompt: gradients outside design tokens (no arbitrary rainbow or consumer-style gradients),
heavy drop shadows, skeuomorphic textures or depth effects,
colors outside the brand palette (no neon, no confetti),
consumer-gamification aesthetic (no cartoon mascots or celebratory explosions),
border radius exceeding 16px on rectangular containers (no pill-shaped cards),
decorative motion references or implied animation, photorealism (for illustration categories),
generic stock illustration style, clipart aesthetic, excessive detail competing with the focal element,
cluttered composition, amateurish quality, watermarks, blurry or low-resolution output,
rounded-soft consumer-app style, warm neutral backgrounds (cool neutrals only),
full-bleed colored section backgrounds except when using design token gradients, typography mixing multiple font families in one scene
```

---

## 9. Calibration Check

> *Run these checks on every generated image before accepting it for use. Any "No" answer requires regeneration with an adjusted prompt.*

Before using a generated image, verify:

- [ ] The color palette is consistent with the project's brand colors — medium-saturation blue dominant, slate gray secondary, cool neutrals as background, sky-blue accent used sparingly if at all?
- [ ] If dark mode: does text/background contrast meet WCAG AA where applicable?
- [ ] Gradients are used only per design tokens (hero gradient, accent gradient) — no arbitrary or consumer-style gradients?
- [ ] Glass/blur is used only where specified (e.g. hero overlays)?
- [ ] The rendering style matches the aesthetic archetype: flat, geometric; gradients only where specified; no heavy shadows?
- [ ] No anti-patterns from `VISUAL-DIRECTION.md §8` are present? (Check all 8 items.)
- [ ] The image works at the intended display size — is it legible and unambiguous at thumbnail scale for social media assets?
- [ ] If the image includes people: are the figures simplified and geometric (silhouette-level abstraction), with no facial features, consistent with `VISUAL-DIRECTION.md §7.3`?
- [ ] The image does not look like it came from a consumer edtech product (Duolingo, Coursera aesthetic), a generic stock illustration library, or a different product visual system?
- [ ] A product owner who has read `VISUAL-DIRECTION.md §1` could look at this image and immediately connect it to the Purposeful & Immersive archetype?
- [ ] For onboarding series: is this illustration visually consistent with all other illustrations in the same series (same color palette, same stroke weight, same level of detail, same background treatment)?

---

## 10. Prompt Version and Calibration Log

> *Track changes to prompts and calibration tests. When the design system evolves (new tokens, changed palette), update the Base Style Specification and note it here.*

| Date | Section Updated | Change | Updated By |
|------|----------------|--------|-----------|
| 2026-03-12 | Base Style Specification | Initial version derived from DESIGN-SYSTEM.md and VISUAL-DIRECTION.md | AGT-UXA |
| 2026-03-12 | All sections | Initial prompt library for all five applicable asset categories | AGT-UXA |
| 2026-03-16 | Base Style, §3–4, §8, §9, §10 | Alignment with syntropy-cc/syntropy style: dark-first option, token-based gradients, glass permitted; negative prompt and calibration updated | — |
