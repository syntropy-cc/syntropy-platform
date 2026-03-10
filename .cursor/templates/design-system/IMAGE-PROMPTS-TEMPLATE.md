# Image Prompts — {Project Name}

> **Document Type**: Image Prompts Library  
> **Project**: {Project Name}  
> **Applicability**: {Applicable / Not applicable — see Section 1}  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **UX Architect**: (AGT-UXA if AI-generated)  
> **Visual Direction Reference**: `docs/design-system/VISUAL-DIRECTION.md`  
> **Design System Reference**: `docs/design-system/DESIGN-SYSTEM.md`  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-017)

---

## Applicability

{If not applicable: "Image generation prompts are not applicable for this project. The visual interface relies entirely on the component library, iconography, and design tokens defined in `DESIGN-SYSTEM.md`. No illustrations, marketing imagery, or custom visual assets are required. The Base Style Specification below is provided for reference should this change in future."}

{If applicable: "This document provides calibrated prompts for every visual asset category needed by this project. All prompts derive from the aesthetic archetype and token decisions in `DESIGN-SYSTEM.md` and `VISUAL-DIRECTION.md`. Use the Base Style Specification as the mandatory starting point for any AI image generation task."}

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
| UI Screenshots / Mockups | {Yes / No} | {Documentation, marketing, README} |
| Marketing / Hero Images | {Yes / No} | {Landing page, press kit} |
| Onboarding Illustrations | {Yes / No} | {First-run flow, tutorial pages} |
| Spot Illustrations | {Yes / No} | {Empty states, 404, success screens} |
| Social Media Visuals | {Yes / No} | {Release announcements, social sharing} |

---

## 2. Base Style Specification

> *The mandatory foundation for every prompt in this document. It encodes the project's aesthetic archetype, color palette mood, typography character, and rendering style — derived directly from `DESIGN-SYSTEM.md` and `VISUAL-DIRECTION.md`. Copy this specification verbatim at the start of every prompt.*

**Base Style Specification:**

```
{A single, complete prose sentence or two that encodes:
- Color palette mood: "Using a muted, cool-neutral color palette anchored by [primary color description, not hex — e.g., 'a medium-blue slate'] with [secondary] accents"
- Rendering style: derived from VISUAL-DIRECTION.md §7 — e.g., "flat vector illustration style with clean geometric shapes and no gradients"
- Aesthetic archetype in adjective form: e.g., "precise, professional, and minimal"
- Typography character (for mockups only): e.g., "clean geometric sans-serif typography"
- Surface treatment: e.g., "white and light neutral backgrounds, no textures"

Example (do not use verbatim — this is illustrative only):
"Flat vector illustration, clean geometric shapes, color palette of deep navy, slate blue, and soft white with mint green accents, no gradients or shadows, precise and minimal aesthetic, generous negative space, professional developer-tool visual style, 2D only"
}
```

**What this specification encodes:**
- Aesthetic archetype: {archetype from VISUAL-DIRECTION.md §1}
- Primary color mood: {brief description of the color character}
- Rendering: {flat / isometric / hand-drawn / photographic / other}
- Tone: {one adjective: professional / warm / playful / technical / etc.}

---

## 3. UI Screenshots and Mockups

> *Photorealistic or stylized depictions of the interface. Used in documentation pages, README files, marketing materials, and press kits. The goal is to represent the interface accurately while making it visually compelling.*

**When to use**: Product documentation headers, tutorial step illustrations, marketing hero sections, README preview images.

**Positive Prompt Template:**

```
{BASE STYLE SPECIFICATION}

UI screenshot mockup of [SCREEN NAME OR DESCRIPTION], showing [KEY UI ELEMENTS TO INCLUDE], 
[INTERACTION STATE: e.g., "dashboard with data populated", "empty state with call-to-action", "form with validation error"],
displayed in a [DEVICE FRAME: e.g., "browser window frame", "no frame, edge-to-edge", "laptop mockup"],
[BACKGROUND: e.g., "on a neutral light gray background", "floating with subtle shadow", "no background"],
[ASPECT: e.g., "widescreen 16:9", "square 1:1 for social", "portrait 9:16 for mobile"]
```

**Negative Prompt:**

```
{Universal negative prompt from Section 8}, cluttered layout, too much text, unreadable typography, 
outdated UI patterns, skeuomorphic elements, excessive drop shadows, neon colors, 
misaligned elements, placeholder "Lorem ipsum" text visible at readable scale
```

**Recommended aspect ratio**: 16:9 for widescreen, 4:3 for documentation, 1:1 for social

**Usage notes**: When generating UI mockups, describe the content and state rather than asking the model to reproduce actual interface elements — the output will be illustrative, not pixel-accurate. Use these for marketing and documentation previews, not for design specs.

---

## 4. Marketing / Hero Images

> *Full-width visuals for landing pages, README headers, and press materials. These set the first impression of the product. They do not need to show the interface but must communicate the product's purpose and aesthetic character.*

**When to use**: Product landing page hero sections, GitHub README headers, press kit images, conference talk slides.

**Positive Prompt Template:**

```
{BASE STYLE SPECIFICATION}

Hero marketing image for [PRODUCT TYPE: e.g., "a developer tool", "a data pipeline platform", "a project management app"],
[VISUAL METAPHOR OR CONCEPT: e.g., "abstract visualization of data flowing through connected nodes", 
"a clean workspace with code editor and output terminal", "geometric shapes suggesting structure and precision"],
[MOOD: e.g., "confident and focused", "calm and organized", "energetic and modern"],
wide panoramic composition, [ASPECT: e.g., "16:9 widescreen", "3:1 ultra-wide banner"],
no text or typography, purely visual
```

**Negative Prompt:**

```
{Universal negative prompt from Section 8}, stock photo clichés, handshakes, generic business imagery, 
people in suits, rocket ships (unless directly relevant), light bulbs, gears as metaphor, 
excessive complexity, dark or moody atmosphere (unless intentional), text or typography embedded
```

**Recommended aspect ratio**: 16:9 or 3:1 for banners; 16:9 for social sharing cards

**Usage notes**: Avoid requesting literal product screenshots in hero images — abstract visual metaphors communicate the product's value more effectively and age better. The image should make someone feel the product's character, not demonstrate its features.

---

## 5. Onboarding Illustrations

> *Step-by-step visual guides for new users. These appear in first-run experiences, tutorial pages, and getting-started documentation. They should be instructive without being patronizing and consistent without being repetitive.*

**When to use**: First-run wizard screens, tutorial page headers, getting-started documentation, feature introduction overlays.

**Positive Prompt Template:**

```
{BASE STYLE SPECIFICATION}

Onboarding illustration for step [STEP NUMBER] of [TOTAL STEPS]: [STEP TITLE],
showing [WHAT IS HAPPENING IN THIS STEP: describe the action or concept, not the UI element],
[VISUAL METAPHOR if applicable: e.g., "a key unlocking a door", "a puzzle piece fitting into place"],
[HUMAN PRESENCE: "featuring a simplified human figure" or "no people, objects only"],
instructional and clear composition, square or portrait format, 
consistent style with previous steps in this series
```

**Negative Prompt:**

```
{Universal negative prompt from Section 8}, overly complex scene, multiple competing focal points,
photorealism, photograph style, corporate stock illustration clichés (e.g., floating heads, thumbs up),
dense text integrated into the illustration, confusing or abstract composition for instructional content
```

**Recommended aspect ratio**: 1:1 square or 4:3 landscape for in-app; 16:9 for documentation headers

**Usage notes**: Generate all onboarding illustrations in one session to ensure stylistic consistency. Include the Base Style Specification identically in each prompt, and specify "consistent style with previous steps" explicitly. Review all outputs together before accepting any.

---

## 6. Spot Illustrations

> *Small, focused decorative images for empty states, success confirmations, error pages, and similar single-purpose UI moments. They provide personality without competing with the interface for attention.*

**When to use**: Empty state panels (no data yet), 404 error pages, success confirmation screens, permission-denied states, loading completion moments.

**Positive Prompt Template:**

```
{BASE STYLE SPECIFICATION}

Spot illustration for [USE CASE: e.g., "empty state — no projects created yet", "success — file uploaded", 
"error — connection failed", "404 — page not found"],
[VISUAL METAPHOR: one specific object or concept — e.g., "an empty inbox", "a checkmark with confetti",
"a disconnected cable", "a map with no destination marked"],
simple and focused composition with single focal element, generous empty space around the subject,
small format suitable for [DIMENSIONS: e.g., "200×200px", "300×200px inline panel"],
no text, purely visual
```

**Negative Prompt:**

```
{Universal negative prompt from Section 8}, complex multi-element scene, photorealism, 
too many visual elements competing for attention, dark or anxiety-inducing imagery for neutral states,
overly celebratory imagery for error states, text integrated into illustration
```

**Recommended aspect ratio**: 1:1 square, or 3:2 landscape for panel use

**Usage notes**: Spot illustrations are small and will be viewed at low resolution — keep them simple. One object, one idea. The metaphor should be universally recognizable without cultural ambiguity. Avoid metaphors that differ in meaning across cultures (e.g., OK-hand gesture).

---

## 7. Social Media Visuals

> *Announcement and sharing images for product releases, feature launches, and community sharing. These must be legible at small sizes and communicate the product's character in a single glance.*

**When to use**: GitHub release announcements, Twitter/X post images, LinkedIn post images, product hunt launch assets, changelog entries.

**Positive Prompt Template:**

```
{BASE STYLE SPECIFICATION}

Social media announcement image for [EVENT TYPE: e.g., "product launch", "version release", "feature announcement"],
[MAIN VISUAL ELEMENT: e.g., "abstract graphic suggesting speed and efficiency", 
"geometric pattern using brand colors", "stylized version number typography"],
bold and legible at small sizes, [ASPECT: "1:1 square for social", "16:9 for Twitter/LinkedIn", "9:16 portrait for Stories"],
leave [SAFE ZONE: e.g., "center 60% of the image"] clear for text overlay to be added separately,
no embedded text (text will be composited separately)
```

**Negative Prompt:**

```
{Universal negative prompt from Section 8}, text embedded in the image (text will be added separately),
photorealism, stock imagery, too many visual elements, poor contrast for small-size legibility,
imagery that looks dated or trend-dependent (avoid memes, trend references)
```

**Recommended aspect ratio**: 1:1 for most social platforms; 16:9 for sharing cards; 9:16 for Stories

**Usage notes**: Generate background images only — text (version number, product name, tagline) should be composited separately in a design tool so it can be updated for each release. This keeps the base image reusable.

---

## 8. Universal Negative Prompt

> *Apply this to every generation regardless of category. It encodes the anti-patterns from `VISUAL-DIRECTION.md §8`.*

**Paste this at the end of every prompt:**

```
Negative prompt: {List of universal anti-patterns derived from VISUAL-DIRECTION.md §8.
Example format:
"gradients on large surfaces, heavy drop shadows, skeuomorphic textures, overly bright or saturated colors
outside the brand palette, cheap or generic stock illustration style, clipart aesthetic, excessive detail,
cluttered composition, poor alignment, amateurish quality, watermarks, blurry or low-resolution output,
off-brand colors, decorative elements with no purpose, photorealism (unless category calls for it)"}
```

---

## 9. Calibration Check

> *Run these checks on every generated image before accepting it for use. Any "No" answer requires regeneration with an adjusted prompt.*

Before using a generated image, verify:

- [ ] The color palette is consistent with the project's brand colors (primary, secondary, neutral range)?
- [ ] The rendering style matches the aesthetic archetype from `VISUAL-DIRECTION.md §1`?
- [ ] No anti-patterns from `VISUAL-DIRECTION.md §8` are present?
- [ ] The image works at the intended display size (not too complex for small sizes)?
- [ ] If the image includes people: does the representation align with the intended human presence decision in `VISUAL-DIRECTION.md §7.3`?
- [ ] The image does not look like it came from a different product or visual system?
- [ ] A product owner could look at this image and immediately connect it to the product's intended character?

---

## 10. Prompt Version and Calibration Log

> *Track changes to prompts and calibration tests. When the design system evolves (new tokens, changed palette), update the Base Style Specification and note it here.*

| Date | Section Updated | Change | Updated By |
|------|----------------|--------|-----------|
| {YYYY-MM-DD} | Base Style Specification | Initial version | AGT-UXA |
