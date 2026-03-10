**Generate the Visual Direction document and Image Prompts library from the completed design system.**

> **Run this prompt in Plan mode first, then switch to Agent mode to execute.** In Plan mode, read the UX Generation Summary from disk, verify the DS-001 gate result, read the five source documents, produce the Visual Direction Brief (a structured planning output), and await user confirmation. In Agent mode, generate both documents and update execution state.

### Context inputs

Before any analysis:

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001) — verify the current phase is Phase 2b and the last completed prompt was 01-E
2. Read `docs/context/ux-generation-summary.md` — confirms the DS-001 gate result and provides the list of documents created. **If missing, halt**: "Required context file `docs/context/ux-generation-summary.md` is missing. Run Prompt 01-E first." (CTX-004)

**Applicability check**: Read the `## Design System Decision` section of `ux-generation-summary.md`. If DS-001 gate result is **"Not Required"**, state: "Prompt 01-F is not applicable — no design system was created. Phase 2b is complete. Proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`)." Update `docs/context/EXECUTION-STATE.md` accordingly. Do not proceed further.

If the DS-001 gate was "Required" and `docs/design-system/DESIGN-SYSTEM.md` exists, proceed with this prompt.

### Execution model

**In Plan mode (assessment and brief phase):**
1. Confirm the DS-001 gate result from the context file
2. Read all five source documents listed below
3. Produce the **Visual Direction Brief** (the Execution Plan for this prompt)
4. Present the brief and await user confirmation (CTX-009)

**In Agent mode (generation phase):**
1. Generate `docs/design-system/VISUAL-DIRECTION.md` (Part A)
2. Generate `docs/design-system/IMAGE-PROMPTS.md` (Part B)
3. Write context outputs and present the Visual Direction Generation Summary

### Agent definition — read before proceeding

Read the **UX Architect Agent** definition at `.cursor/agents/ux-architect.md`. For this prompt, adopt a visual design direction mode: reading technical token decisions and translating them into aesthetic language that developers, content creators, and AI agents can act on.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001 through CTX-009)
- `.cursor/rules/design-system/design-system.mdc` — DS-001 through DS-015 (understand the token system before writing the narrative); DS-016 (Visual Direction requirement) and DS-017 (Image Prompt Calibration)
- `.cursor/rules/ux/ux-principles.mdc` — UX-001 through UX-008

### Templates you must use

- **Visual Direction**: `.cursor/templates/design-system/VISUAL-DIRECTION-TEMPLATE.md` → `docs/design-system/VISUAL-DIRECTION.md`
- **Image Prompts**: `.cursor/templates/design-system/IMAGE-PROMPTS-TEMPLATE.md` → `docs/design-system/IMAGE-PROMPTS.md`

---

### What you must do (mandatory steps, in order)

#### Step 0 — Plan mode: read sources and produce Visual Direction Brief

**Read all five source documents before producing the brief:**

1. `docs/vision/VISION.md` — Section 5 (Component Visions: stated visual character) and Section 3 (Users and Actors)
2. `docs/ux/UX-PRINCIPLES.md` — Sections 1 and 2 (Interface Profile and UX Principles)
3. `docs/design-system/DESIGN-SYSTEM.md` — Sections 1 through 7 (all token decisions)
4. `docs/design-system/COMPONENT-LIBRARY.md` — component definitions, particularly Button and Input
5. `docs/context/ux-generation-summary.md` (already read above)

**Extract and record before producing the brief:**
- The one-sentence Aesthetic Direction from DESIGN-SYSTEM.md Section 1.2
- All brand color hex values and their stated usage
- The font families chosen (heading vs. body)
- Any visual references mentioned in Vision Section 5
- The spacing base unit and border radius range
- The motion duration range and easing functions

**Produce the Visual Direction Brief (Execution Plan):**

Following the standard format from `.cursor/templates/context/EXECUTION-PLAN-TEMPLATE.md`, present:

**Context Loaded** — summarize what was extracted from each source document.

**Scope** — 2 files to create: `VISUAL-DIRECTION.md` and `IMAGE-PROMPTS.md`.

**File Manifest:**
- `docs/design-system/VISUAL-DIRECTION.md` → content outline: Aesthetic Archetype (one word + one sentence), Visual Character (3–5 concrete sentences), Color Story (narrative for each palette range), Typography Personality, Spatial Character, Motion Character, Illustration and Imagery Style, Anti-Patterns (5–8 specific items), Reference Landmarks (3–5 comparable products), Extension Guidelines (4–6 numbered rules), Calibration Checklist (6–8 yes/no questions)
- `docs/design-system/IMAGE-PROMPTS.md` → content outline: Base Style Specification (complete style string), 5 asset categories (UI Screenshots, Marketing/Hero, Onboarding, Spot Illustrations, Social Media) with positive/negative prompts, aspect ratios, and usage notes

**Key Decisions:**
- One-word aesthetic archetype (proposed, based on token profile)
- Color story (how the palette is narrated)
- Illustration and imagery applicability (Yes/No based on project type)
- Reference landmarks to use

**Assumptions** — any gaps in source documents.

Present the following to the user and state: "This is the Visual Direction Brief. If the aesthetic archetype, color story, and illustration direction look correct, confirm to proceed. Switch to Agent mode after confirming."

---

**Visual Direction Brief**

**Source Extraction**
- Aesthetic Direction (from DESIGN-SYSTEM.md §1.2): [quote verbatim]
- Vision Section 5 visual references: [list any comparisons, adjectives, or product names]
- Brand colors: [primary, secondary, accent with hex values]
- Font families: [heading and body font names]
- Spacing base unit: [value]
- Border radius range: [smallest to largest value]
- Motion range: [fast to slow duration values]

**Proposed Aesthetic Archetype**
- One-word archetype: [e.g., Professional / Technical / Playful / Minimal / Editorial / Warm / Authoritative]
- One-sentence expansion: [e.g., "A tool that respects its users' time — precise, efficient, and quietly confident."]

**Color Story Summary**
- [2-3 sentences: What the palette communicates, why these specific hues, what they signal to the user]

**Typography Personality**
- [1-2 sentences: What the font choice says about the product's character]

**Illustration and Imagery Direction**
- Applicable: [Yes / No]
- If yes: Proposed illustration style in one sentence

**Proposed Reference Landmarks**
- [3-5 comparable products or visual references]

**Files to Create**
- `docs/design-system/VISUAL-DIRECTION.md`
- `docs/design-system/IMAGE-PROMPTS.md`

---

Wait for confirmation. Do not create any files until the user confirms (CTX-009).

---

#### Part A — Visual Direction Document

*(Switch to Agent mode after user confirms.)*

##### Step 1 — Create Visual Direction document

Create `docs/design-system/VISUAL-DIRECTION.md` using the Visual Direction template. Fill every section with project-specific content. Apply these rules:

- **Aesthetic Archetype**: use the confirmed one-word archetype and one-sentence expansion
- **Visual Character**: 3–5 concrete, specific sentences — not generic ("clean and modern")
- **Color Story**: one to two sentences per color range explaining the aesthetic reasoning
- **Typography Personality**: one to two sentences per font family
- **Spatial Character**: what the spacing scale and border radius choices communicate
- **Motion Character**: animation philosophy; what motion should do and avoid
- **Illustration and Imagery Style**: describe style rules if applicable; "Not applicable" if not
- **Anti-Patterns**: 5–8 specific, actionable items that contradict this system's aesthetic
- **Reference Landmarks**: 3–5 products; one sentence per product on what specifically to take from it; include at least one product to explicitly NOT emulate
- **Extension Guidelines**: 4–6 numbered actionable rules for visual decisions not covered by tokens
- **Calibration Checklist**: 6–8 yes/no questions for self-validating a new visual element

---

#### Part B — Image Prompts Library

##### Step 2 — Determine image prompts applicability

Check: Does Vision Section 5 mention visual asset needs? Does the project have a web interface needing illustrations? Did VISUAL-DIRECTION.md Section 7 result in "Not applicable"?

If no image needs: create IMAGE-PROMPTS.md with a brief statement at the top explaining inapplicability. Include only the Base Style Specification section.

If image needs exist: proceed with all sections.

##### Step 3 — Create Image Prompts document

Create `docs/design-system/IMAGE-PROMPTS.md` using the Image Prompts template.

**Base Style Specification**: a complete, usable style string encoding color palette, typography aesthetic, rendering style, mood, and what to avoid. This base is prepended to every category prompt.

**Asset Categories** (mark inapplicable ones): UI Screenshots and Mockups; Marketing / Hero Images; Onboarding Illustrations; Spot Illustrations; Social Media Visuals.

Verify that every positive prompt, when read alone, produces a result consistent with the aesthetic archetype.

---

#### Step 4 — Write context outputs and present summary

1. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 2b — UX and Interaction Design (Complete)
   - `Last completed prompt`: 01-F — Visual Direction and Image Prompts
   - `Next prompt`: 03 — Generate Implementation Docs
   - `Context File Registry`: set `ux-generation-summary.md` to `Delivered` (CTX-006)
   - `Completed Phases`: add entry for 01-F completion; note that Phase 2b is now fully complete

2. Present the Visual Direction Generation Summary:

---

**Visual Direction Generation Summary**

**Aesthetic Archetype** — One-word archetype: [confirmed]; One-sentence expansion: [from VISUAL-DIRECTION.md]

**Documents Created**
- `docs/design-system/VISUAL-DIRECTION.md` — Sections: Aesthetic Archetype, Visual Character, Color Story, Typography Personality, Spatial Character, Motion Character, Illustration Style, Anti-Patterns, Reference Landmarks, Extension Guidelines, Calibration Checklist
- `docs/design-system/IMAGE-PROMPTS.md` — Base Style Specification: [one sentence excerpt]; Asset categories covered: [list]; Image prompts applicable: [Yes / No]

**Key Visual Direction Decisions** — Color narrative: [1 sentence]; Anti-patterns count: [N]; Reference landmarks: [list]; Extension guidelines: [count]

**Next Steps**
- Review `docs/design-system/VISUAL-DIRECTION.md` — particularly the Anti-Patterns and Extension Guidelines sections
- Review `docs/design-system/IMAGE-PROMPTS.md` — test the Base Style Specification with your preferred image generation tool
- Phase 2b is now complete
- Proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`) — no copy-paste needed

---

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/EXECUTION-STATE.md` | Phase 2b completion, next prompt = 03, ux-generation-summary.md → Delivered | After both documents are created |

### Verification checklist (verify before completing this prompt)

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] `docs/context/ux-generation-summary.md` confirmed present (CTX-004)
- [ ] DS-001 gate confirmed "Required" before proceeding; halt stated if "Not Required"
- [ ] All five source documents read before producing the Visual Direction Brief
- [ ] Visual Direction Brief produced in Plan mode with all required fields (CTX-007, CTX-008)
- [ ] User confirmation received before any file was created (CTX-009)
- [ ] `docs/design-system/VISUAL-DIRECTION.md` created using the Visual Direction template
- [ ] Every section of VISUAL-DIRECTION.md filled with project-specific content (no placeholder text)
- [ ] Visual Character section is concrete and specific, not generic
- [ ] Anti-Patterns section contains at least 5 specific, actionable items
- [ ] Extension Guidelines section contains at least 4 numbered rules
- [ ] `docs/design-system/IMAGE-PROMPTS.md` created using the Image Prompts template
- [ ] Base Style Specification is a complete, usable style string
- [ ] All positive prompts verified consistent with the aesthetic archetype
- [ ] `docs/context/EXECUTION-STATE.md` updated: Phase 2b complete, next = Prompt 03, ux-generation-summary.md → Delivered (CTX-002, CTX-006)
- [ ] User directed to Prompt 03 with note that no copy-paste is needed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

