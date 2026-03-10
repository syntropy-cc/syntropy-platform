# Architecture: Assess and Brief (Prompt 01-A)

Use this prompt to evaluate the Vision Document and produce a confirmed **Architecture Brief** before any file is created. This is **Step 1 of 3** in the architecture generation phase (Phase 2) of the Vision-to-System Framework.

**This prompt runs entirely in Cursor's Plan mode.** It produces no architecture files. Its outputs are: the confirmed Architecture Brief (written to `docs/context/architecture-brief.md`) and an updated execution state (written to `docs/context/EXECUTION-STATE.md`).

After the user confirms the Architecture Brief, proceed to **Prompt 01-B** (`.cursor/prompts/01b-generate-architecture.md`).

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Assess the Vision Document and produce an Architecture Brief for this project.**

> **Run this prompt in Cursor's Plan mode.** This prompt performs analysis only — it does not create architecture files. Its outputs are the confirmed Architecture Brief written to `docs/context/architecture-brief.md` and an updated `docs/context/EXECUTION-STATE.md`. Prompt 01-B reads the brief from disk automatically — no copy-paste needed.

### Context inputs

Before any analysis, read the following:

1. `docs/context/EXECUTION-STATE.md` — check the current execution phase. If `Last completed prompt` shows 01-A was already run, warn the user: "Prompt 01-A has already run for this project. Re-running it will overwrite `docs/context/architecture-brief.md` and require 01-B and 01-C to be re-run as well. Confirm to proceed."
2. `docs/vision/VISION.md` — the Vision Document to assess

If `docs/context/EXECUTION-STATE.md` does not exist, this is a fresh project — proceed normally.

### Execution model

This prompt operates in two phases:

1. **Assessment phase** (read-only): invoke the Vision Quality Assessment Skill, extract required Vision sections verbatim, analyze the architecture, and produce the Architecture Brief
2. **User confirmation and context write**: present the Architecture Brief, wait for user confirmation, then write the confirmed brief to `docs/context/architecture-brief.md` and update `docs/context/EXECUTION-STATE.md`

No architecture files are written at any point. The only files written are the two context files listed above, and only after user confirmation.

### Agent definition — read before proceeding

Read the **System Architect Agent** definition at `.cursor/agents/system-architect.md`. Adopt its cognitive mode (architectural reasoning — structural design, domain decomposition, decision-making under constraints) for the duration of this session.

### Skill to invoke

- **Vision Quality Assessment** (`.cursor/skills/vision-quality-assessment.md`): invoke as the very first action, before any analysis begins. Follow the skill's execution steps to assess `docs/vision/VISION.md` exactly as specified.

### Rules you must follow

- **Context management**: `.cursor/rules/framework/context-management.mdc` (CTX-001, CTX-002, CTX-005, CTX-006)
- **Vision quality**: `.cursor/rules/vision/vision-quality.mdc` (VQ-007, VQ-008: feasibility pre-check and required input extraction)
- **Architecture generation**: `.cursor/rules/architecture/architecture-generation.mdc` (GEN-001 domain extraction heuristics, GEN-002 layer selection, GEN-003 entity identification, GEN-005 ambiguity handling)
- **Architecture principles**: `.cursor/rules/architecture/architecture.mdc`
- **Architecture navigation**: `.cursor/rules/architecture/architecture-navigation.mdc`
- **Constraints**: `.cursor/rules/architecture/constraints.mdc`

### Templates to read (for reference only — do not create files)

Read these templates to understand the structure of documents that will be created in 01-B. This informs the file list in the Architecture Brief:

- **Root architecture**: `.cursor/templates/architecture/ARCHITECTURE.md`
- **Domain architecture**: `.cursor/templates/architecture/domains/_DOMAIN-TEMPLATE.md`
- **Cross-cutting concern**: `.cursor/templates/architecture/cross-cutting/_CONCERN-TEMPLATE.md`
- **Platform service**: `.cursor/templates/architecture/platform/_PLATFORM-TEMPLATE.md`
- **ADR**: `.cursor/templates/architecture/decisions/_template.md`
- **Diagram index**: `.cursor/templates/diagrams/_DIAGRAM-INDEX.md`
- **Architecture Brief**: `.cursor/templates/context/ARCHITECTURE-BRIEF-TEMPLATE.md` (the format for the context file you will write)

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read execution state

1. Read `docs/context/EXECUTION-STATE.md` (CTX-001)
2. Note the current phase and whether 01-A has run before
3. If re-running: warn the user about overwrite consequences (see Context inputs above)

#### Step 2 — Run Vision Quality Assessment

1. Invoke the Vision Quality Assessment Skill (`.cursor/skills/vision-quality-assessment.md`)
2. Apply the verdict exactly as the skill specifies:
   - **Insufficient** (total score < 28 OR any critical dimension < 3): halt; present the full quality report; direct the user to Prompt 00 (`.cursor/prompts/00-refine-vision.md`)
   - **Needs Improvement**: present all gaps with their severity; ask: "Would you like to refine the Vision Document first (Prompt 00), or proceed despite these gaps?" If the user chooses to proceed, note every High or Critical gap as an assumption in the Architecture Brief
   - **Ready**: present a brief quality confirmation (score and top strengths); proceed to Step 3

#### Step 3 — Extract required Vision sections verbatim

Before any analysis, extract and quote each of the following sections exactly as written in `docs/vision/VISION.md`:

- **Section 4** (Interface and Interaction Preferences): used to identify delivery interfaces and inform layer selection (GEN-002) and platform document scope
- **Section 5** (System Components and Subsystem Visions): used to inform domain boundary decisions
- **Section 9** (Quality Priorities): used to select cross-cutting concerns and architecture style
- **Section 10** (Constraints): Integration Requirements → external adapters; Data Sensitivity → security cross-cutting concern; Scale → deployment architecture

Present each quoted section clearly labeled before proceeding to Step 4.

#### Step 4 — Extract architecture elements

From the Vision Document (reading all sections as needed):

1. **Extract bounded contexts and domains** from Section 6 (Capabilities) and Section 7 (Information Concepts), following GEN-001 heuristics. Each domain must have a single cohesive responsibility; different actors, different change rates, and different data ownership each signal a boundary.
2. **Identify entities** within each domain: list their attributes, relationships to other entities, data ownership, and cardinality (GEN-003). Note which domain owns each entity.
3. **Map actors** (Section 3) to system boundaries: distinguish external actors (users, external systems) from internal services.
4. **Map workflows** (Section 8) to cross-domain interactions: for each workflow, identify which domains are involved and in what sequence.
5. **Select the layer structure** using GEN-002: cite the specific inputs from Sections 4, 9, and 10 that justify the choice. State the chosen style explicitly (e.g., clean architecture, layered, hexagonal, microservices).

#### Step 5 — Resolve ambiguities

Apply GEN-005:
- **Critical ambiguities** (would change domain boundaries or layer structure): ask the user to clarify before finalizing the Architecture Brief
- **Significant ambiguities** (affect one domain's scope or technology choice): state your assumption and the rationale; document it in the Brief
- **Minor ambiguities** (affect a single document section or diagram): state your assumption; document it in the Brief

List every ambiguity found, its severity, and its resolution.

#### Step 6 — Produce and present the Architecture Brief

Present the Architecture Brief to the user. It must contain all of the following sections:

---

**Architecture Brief**

**Vision Quality**
- Verdict: [Ready / Needs Improvement / Insufficient]
- Score: [N/55]
- Gaps carried as assumptions: [list, or "none"]

**Delivery Interfaces**
- [For each interface type identified from Section 4: name, primary/secondary designation, impact on layer structure]

**Layer Structure**
- Chosen style: [name]
- Rationale: [cite specific inputs from Sections 4, 9, 10]

**Domains**
| Domain | Responsibility | Owned Entities | Vision Capabilities |
|---|---|---|---|
| [name] | [one sentence] | [list] | [Section 6 references] |

**Documents to Generate** (Prompt 01-B will create these)
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/domains/{name}/ARCHITECTURE.md` [one row per domain]
- `docs/architecture/cross-cutting/{concern}/ARCHITECTURE.md` [one row per concern]
- `docs/architecture/platform/{interface}/ARCHITECTURE.md` [one row per interface]
- `docs/architecture/diagrams/README.md`
- [shared diagram files as needed]

**Diagrams to Generate** (inline + shared)
- Root document: context/system diagram, layer/component overview, domain relationships
- Per domain: ERD, component diagram, at least one sequence diagram for the most critical workflow
- [any additional diagrams identified]

**ADRs to Create** (Prompt 01-C will create these)
| Working Title | Decision Subject |
|---|---|
| ADR-001-{architecture-style} | Layer structure and style choice |
| [additional ADRs] | [technology, communication patterns, significant patterns] |

**Cross-Cutting Concerns**
- [list each concern and why it was identified, e.g., "Security — Data Sensitivity in Section 10 flags PII"]

**Platform Documents**
- [list each platform document and the delivery interface it covers]

**Ambiguities and Resolutions**
| Ambiguity | Severity | Resolution |
|---|---|---|
| [description] | Critical / Significant / Minor | Asked / Assumed: [details] |

**Estimated Output**
- Documents: [N]
- Diagrams: [N]
- ADRs: [N]

---

After presenting the Architecture Brief, state:

> "This is the Architecture Brief. Please review it. If it looks correct, confirm and I will save it to `docs/context/architecture-brief.md` — then open a new conversation and run **Prompt 01-B** (`.cursor/prompts/01b-generate-architecture.md`), which will read the brief automatically. If you'd like changes, tell me what to adjust."

#### Step 7 — Write confirmed outputs (after user confirmation)

After the user confirms the Architecture Brief (CTX-005):

1. Write the confirmed Architecture Brief to `docs/context/architecture-brief.md` using the structure from `.cursor/templates/context/ARCHITECTURE-BRIEF-TEMPLATE.md`. Set `Status: Active`.
2. Write a one-paragraph project summary to `docs/context/EXECUTION-STATE.md` based on the Vision Document's problem statement and ideal future state.
3. Update `docs/context/EXECUTION-STATE.md` (CTX-002):
   - `Active phase`: Phase 2 — Architecture Generation
   - `Last completed prompt`: 01-A — Assess and Brief
   - `Next prompt`: 01-B — Generate Architecture
   - `Context File Registry`: set `architecture-brief.md` to `Active` with today's date
   - `Completed Phases`: add an entry for Phase 1 (Vision) noting the quality verdict and score
4. State: "Architecture Brief saved to `docs/context/architecture-brief.md`. Open a new conversation and run **Prompt 01-B** — it will read the brief automatically."

### Context outputs

| File | What is written | When |
|------|----------------|------|
| `docs/context/architecture-brief.md` | Complete confirmed Architecture Brief | After user confirmation |
| `docs/context/EXECUTION-STATE.md` | Phase update, project summary, context file registry | After user confirmation |

### Verification checklist (verify before completing this prompt)

- [ ] `docs/context/EXECUTION-STATE.md` read at startup (CTX-001)
- [ ] Vision Quality Assessment run; verdict presented before any analysis
- [ ] Section 4 explicitly extracted and quoted
- [ ] Section 5 explicitly extracted and quoted
- [ ] Section 9 explicitly extracted and quoted
- [ ] Section 10 explicitly extracted and quoted
- [ ] Every domain traced to at least one vision capability from Section 6
- [ ] Every vision capability from Section 6 maps to at least one domain
- [ ] All ambiguities classified and resolved: critical → asked; significant/minor → assumed and documented
- [ ] Architecture Brief contains all required sections
- [ ] User confirmed the Architecture Brief before any file was written
- [ ] `docs/context/architecture-brief.md` written with Status: Active (CTX-003, CTX-005)
- [ ] `docs/context/EXECUTION-STATE.md` updated with phase, next prompt, and registry (CTX-002)
- [ ] No architecture files were created during this session
- [ ] User directed to Prompt 01-B with note that no copy-paste is needed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Ensure your Vision Document exists at `docs/vision/VISION.md`
2. Open a **new** Cursor conversation in **Plan mode**
3. Copy everything from the "Prompt" section above into the conversation
4. Send — the AI will assess the Vision Document, analyze the vision, and produce the Architecture Brief
5. Review the Architecture Brief carefully — this governs everything that follows
6. Confirm — the AI will save the brief to `docs/context/architecture-brief.md` automatically
7. Open a new conversation and run **Prompt 01-B** — no copy-paste needed
