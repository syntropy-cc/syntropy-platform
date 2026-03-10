# Vision-to-System Framework

A complete, reusable framework for building software systems from idea to working application, driven by architecture as the single source of truth.

---

## Table of Contents

1. [What Is This Framework?](#1-what-is-this-framework)
2. [How Automation Works](#2-how-automation-works)
3. [Prerequisites](#3-prerequisites)
4. [Quick Start: Your First Project](#4-quick-start-your-first-project)
5. [The 13 Phases in Detail](#5-the-13-phases-in-detail)
6. [Commands Reference](#6-commands-reference)
7. [Rules Reference](#7-rules-reference)
8. [Templates Reference](#8-templates-reference)
9. [Agents and Skills Reference](#9-agents-and-skills-reference)
10. [Traceability Chain](#10-traceability-chain)
11. [Adapting the Framework](#11-adapting-the-framework)
12. [Troubleshooting](#12-troubleshooting)
13. [Quick Reference Card](#13-quick-reference-card)

---

## 1. What Is This Framework?

This framework takes a software project from an **idea** (a Vision Document) to a **working, documented, evolving system** through a disciplined, architecture-driven workflow.

### Core Philosophy

- **Architecture is the skeleton**: everything that will be built must exist in the architecture. Nothing outside the architecture gets implemented. Every change starts with architecture, then flows to implementation.
- **Vision drives architecture**: the user describes their ideal system in non-technical terms. AI transforms that vision into rigorous technical architecture.
- **Diagrams are as important as text**: complex systems need visual representation. Every architecture document includes diagrams.
- **Incremental delivery**: the system is built stage by stage, with each stage producing a testable increment.
- **User documentation is a deliverable**: every system ships with user-facing documentation following the Diataxis framework, served through a documentation portal.
- **Evolution by design**: the system is built to change. There is a defined protocol for evolving architecture, implementation, and user documentation together.
- **Automation by default**: context is carried automatically between steps. The user provides input only where judgment is genuinely required.

### The Lifecycle

```
Phase 0          Phase 1           Phase 2                         Phase 3
Vision      -->  Vision       -->  Architecture + UX Design    --> Architecture
Refinement       Document          (commands: /01a → auto →         Iteration
(/00,            (manual,          auto → /01d → auto → auto)       (/02 + text)
optional)        quality-gated)

Phase 4          Phase 5           Phase 6             Phase 6b
/03          --> /04           --> /05 (repeat)    --> /06
(auto)           (auto)            (auto)              (auto, required)

Phase 7          Phase 8           Phase 9
/07          --> Deploy Portal --> /08a + text → /08b → /08c → /05
(auto)           (manual)          (evolve + text → then auto)
```

### What the User Does

The user's role at each phase is deliberate and minimal:

| Phase | User Action | Why Manual |
|-------|-------------|------------|
| 1. Vision | Write `docs/vision/VISION.md` using the template | Creative knowledge capture — only the user knows the product |
| 2a. Arch: Brief | Run `/01a`, review Architecture Brief, confirm | Judgment checkpoint — validates domain structure before generation |
| 2b. Arch: Generate | _(automatic after confirmation)_ | Zero input — reads `architecture-brief.md` from disk |
| 2c. Arch: Decisions | _(automatic)_ | Zero input — reads both context files from disk |
| 2d. UX: Brief | _(conditional)_ Run `/01d`, review UX Brief, confirm | Judgment checkpoint — validates interface types and flow priorities |
| 2e. UX: Generate | _(conditional, automatic after confirmation)_ | Zero input — reads `ux-brief.md` from disk |
| 2f. Visual Direction | _(conditional, automatic)_ Run `/01f`, review Visual Direction Brief, confirm | Judgment checkpoint — validates aesthetic archetype and anti-patterns |
| 3. Iterate Architecture | Run `/02` + write change request | Change request is inherently human input |
| 4–7. Automation | Run `/03`, `/04`, `/05` (repeat), `/06`, `/07` | Zero input — reads architecture + implementation plan from disk |
| 8. Deploy Portal | Run `mkdocs serve` / deploy | Deployment infrastructure is human-controlled |
| 9. Evolve | Run `/08a` + write change request | Evolution intent is inherently human input |

> **The key distinction**: judgment-required steps (writing vision, confirming briefs, providing change requests) require user input. Execution steps (generating, implementing, documenting) are fully automatic — the framework carries all context via persistent files.

---

## 2. How Automation Works

### Context Engineering System

The framework uses a **persistent context file system** that eliminates all manual copy-paste between steps. Every step writes its outputs to disk. The next step reads from disk automatically.

Context files live in `docs/context/`:

| File | Written by | Read by | What it contains |
|------|-----------|---------|-----------------|
| `EXECUTION-STATE.md` | Every step (updates) | Every step (startup) | Current phase, last completed step, next step, registry of all context files |
| `architecture-brief.md` | `/01a` (after your confirmation) | `/01b`, `/01c` | Confirmed Architecture Brief |
| `architecture-file-list.md` | `/01b` | `/01c` | Complete list of generated architecture files |
| `generation-summary.md` | `/01c` | `/01d`, `/01e` | Generation summary with routing decision |
| `ux-brief.md` | `/01d` (after your confirmation) | `/01e` | Confirmed UX Brief |
| `ux-generation-summary.md` | `/01e` | `/01f` | UX generation summary with DS-001 gate result |

**What this means for you**: after every step completes, just open a new conversation and run the next command. The AI reads everything it needs from disk. You never paste outputs between conversations.

> Read `docs/context/README.md` for full technical details of the context system.

### Plan-then-Execute Workflow

Every execution step follows a mandatory two-step pattern:

1. **Plan mode** — the AI reads all context files and produces a full **Execution Plan** that includes:
   - **Context Loaded**: what was found in each file, summarized
   - **Scope**: file count and estimated duration
   - **File Manifest**: every file to be created with its content outline (what goes in each section)
   - **Key Decisions**: decisions to be made during execution with preliminary conclusions
   - **Assumptions**: gaps in input context and what assumption covers them
   - **Execution Order**: files in dependency order with reasoning

2. **Confirm, then Agent mode** — you review the Execution Plan and confirm. Only after confirmation does the AI create any file.

**This is enforced**: no execution step creates files without your confirmation of the plan. This gives you a meaningful review opportunity at every stage.

### Commands vs. Prompts

The framework has two parallel representations of each step:

- **`.cursor/commands/`** — slim command files. Use these via `/command-name` in any Cursor conversation. They contain only the instruction content, which Cursor loads directly.
- **`.cursor/prompts/`** — full documentation files with context, "How to use" guidance, and complete instruction content. Use these for learning, debugging, or when commands aren't available.

**Prefer commands for the main workflow.** Commands are faster, require no copy-paste, and work with the context engineering system.

---

## 3. Prerequisites

Before using this framework, you need:

1. **Cursor IDE** installed and configured
2. **The `.cursor/` framework directory** copied into your project root. This directory contains:
   - `.cursor/rules/` — AI behavior rules
   - `.cursor/templates/` — Document templates
   - `.cursor/prompts/` — Full prompt documentation
   - `.cursor/commands/` — Slim command files for `/` invocation
   - `.cursor/agents/` — Specialized AI agent definitions
   - `.cursor/skills/` — Reusable AI skill definitions
   - `.cursor/FRAMEWORK.md` — This guide
3. **A project directory** — either empty (for new projects) or with existing code
4. **MkDocs Material** (for Phase 8 only) — `pip install mkdocs-material`

### Directory Structure After Setup

```
your-project/
├── .cursor/
│   ├── FRAMEWORK.md                  <-- This guide
│   ├── main.mdc                      <-- Global always-applied rules
│   ├── agents/                       <-- Specialized AI agent definitions
│   │   ├── README.md
│   │   ├── vision-analyst.md
│   │   ├── test-engineer.md
│   │   ├── architecture-compliance-auditor.md
│   │   ├── ux-architect.md
│   │   ├── interaction-designer.md
│   │   ├── system-architect.md
│   │   ├── implementation-engineer.md
│   │   ├── documentation-agent.md
│   │   └── evolution-coordinator.md
│   ├── skills/                       <-- Reusable AI skill definitions
│   │   ├── README.md
│   │   ├── vision-quality-assessment.md
│   │   ├── architecture-validation.md
│   │   ├── test-coverage-gap-detection.md
│   │   ├── implementation-compliance-audit.md
│   │   ├── adr-impact-analysis.md
│   │   ├── documentation-architecture-alignment.md
│   │   └── ux-consistency-validation.md
│   ├── rules/
│   │   ├── framework/                <-- Framework execution rules (1 file)
│   │   ├── architecture/             <-- Architecture rules (8 files)
│   │   ├── diagrams/                 <-- Diagram rules (1 file)
│   │   ├── documentation/            <-- User documentation rules (1 file)
│   │   ├── implementation/           <-- Implementation rules (3 files)
│   │   ├── tests/                    <-- Testing rules (6 files)
│   │   ├── vision/                   <-- Vision quality rules (1 file)
│   │   ├── ux/                       <-- UX and interaction design rules (2 files)
│   │   └── design-system/            <-- Design system rules (1 file, conditional)
│   ├── templates/
│   │   ├── context/                  <-- Context file templates (7 files)
│   │   ├── vision/                   <-- Vision templates (2 files)
│   │   ├── architecture/             <-- Architecture templates (8 files)
│   │   ├── diagrams/                 <-- Diagram templates (10 files)
│   │   ├── documentation/            <-- User documentation templates (9 files)
│   │   ├── implementation/           <-- Implementation templates (6 files)
│   │   ├── tests/                    <-- Test templates (1 file)
│   │   ├── ux/                       <-- UX templates (4 files, conditional)
│   │   └── design-system/            <-- Design system templates (3 files, conditional)
│   ├── commands/                     <-- Cursor slash commands (invoke with /)
│   │   ├── 00-refine-vision.md       → /00
│   │   ├── 01a-assess-and-brief.md   → /01a
│   │   ├── 01b-generate-architecture.md → /01b
│   │   ├── 01c-decisions-and-validation.md → /01c
│   │   ├── 01d-ux-assess-and-brief.md → /01d
│   │   ├── 01e-ux-generate-and-validate.md → /01e
│   │   ├── 01f-visual-direction-and-image-prompts.md → /01f
│   │   ├── 02-iterate-architecture.md → /02
│   │   ├── 03-generate-implementation-docs.md → /03
│   │   ├── 04-generate-implementation-plan.md → /04
│   │   ├── 05-implement-stage.md     → /05
│   │   ├── 06-audit-quality.md       → /06
│   │   ├── 07-generate-user-documentation.md → /07
│   │   ├── 08a-evolve-architecture.md → /08a
│   │   ├── 08b-evolve-implementation-docs.md → /08b
│   │   └── 08c-evolve-user-documentation.md → /08c
│   └── prompts/                      <-- Full prompt documentation (reference)
│       └── (same file names as commands/)
├── docs/                             <-- Generated by the framework
│   ├── vision/
│   │   └── VISION.md                 <-- Your vision document
│   ├── context/                      <-- Context engineering files (auto-managed)
│   │   ├── README.md
│   │   ├── EXECUTION-STATE.md
│   │   ├── architecture-brief.md
│   │   ├── architecture-file-list.md
│   │   ├── generation-summary.md
│   │   ├── ux-brief.md
│   │   └── ux-generation-summary.md
│   ├── architecture/                 <-- Generated architecture
│   ├── ux/                           <-- Generated UX docs (conditional)
│   ├── design-system/                <-- Generated design system (conditional)
│   ├── implementation/               <-- Generated implementation docs
│   ├── user/                         <-- Generated user documentation
│   ├── llm/                          <-- Generated LLM agent reference artifact
│   │   ├── README.md                 <-- What this directory is (human-readable)
│   │   ├── AGENTS.md                 <-- LLM documentation artifact (machine-generated)
│   │   └── AGENTS-EXTENDED.md        <-- Overflow for large systems (optional)
│   └── mkdocs.yml                    <-- Documentation portal config
├── src/                              <-- Generated code
└── tests/                            <-- Generated tests
```

---

## 4. Quick Start: Your First Project

### Step 1: Set Up the Framework

Copy the `.cursor/` directory into your project root. If starting from scratch:

```bash
mkdir my-project && cd my-project
git init
# Copy .cursor/ directory from the framework source
```

### Step 2: Write Your Vision Document

1. Copy `.cursor/templates/vision/VISION-TEMPLATE.md` to `docs/vision/VISION.md`
2. Fill in all 12 sections using plain, non-technical language
3. Focus on **what** you want, not **how** to build it
4. The more detail you provide, the better the architecture will be

**Key sections for architecture quality**:
- **Section 3** (Actors): name every person and system that interacts
- **Section 4** (Interface Preferences): identify delivery interfaces — this drives layer structure
- **Section 5** (Component Visions): describe the design character of each distinct component
- **Section 6** (Capabilities): list at least 5 with MVP priorities
- **Section 8** (Workflows): tell the story of each major user journey

### Step 2b: Optionally Assess Your Vision Document

Open a **new** Cursor conversation and type:

```
/00
```

The AI will score your Vision Document and guide you through improvements. This step is optional but strongly recommended for first-time users or complex projects.

### Step 3: Generate the Architecture (Phase 2)

Phase 2 runs through six commands in sequence. Most steps are fully automatic. The three that require your review and confirmation are clearly indicated.

**Step 3a — Architecture: Assess and Brief**

> ⏸ **Requires your review and confirmation**

Open a **new** Cursor conversation in **Plan mode** and type:

```
/01a
```

The AI will assess the Vision Document, analyze the architecture, and produce the Architecture Brief. Review it carefully — this brief governs all documents that will be generated. When satisfied, confirm. The brief is saved automatically to `docs/context/architecture-brief.md`.

**Step 3b — Architecture: Generate** *(automatic)*

Open a **new** Cursor conversation and type:

```
/01b
```

The AI reads `docs/context/architecture-brief.md` automatically. In Plan mode it presents the Execution Plan with the full file manifest and key decisions — confirm it. Then it generates all architecture documents and diagrams. Outputs are saved automatically.

**Step 3c — Architecture: Decisions and Validation** *(automatic)*

Open a **new** Cursor conversation and type:

```
/01c
```

The AI reads both context files automatically. In Plan mode it presents the ADR manifest — confirm it. Then it creates all ADRs, initializes the changelog, runs the Architecture Validation Skill, and saves the Generation Summary to `docs/context/generation-summary.md`.

**Step 3d — UX: Assess and Brief** *(conditional — skip if no user-facing interface)*

> ⏸ **Requires your review and confirmation**

*The AI will tell you to skip this step if the Generation Summary shows no user-facing interface.*

Open a **new** Cursor conversation in **Plan mode** and type:

```
/01d
```

The AI reads `docs/context/generation-summary.md` automatically. It identifies interface types, applies the design system gate, and produces the UX Brief. Review it — particularly the execution path and flows to design. Confirm; the brief is saved to `docs/context/ux-brief.md`.

**Step 3e — UX: Generate and Validate** *(conditional, automatic)*

Open a **new** Cursor conversation and type:

```
/01e
```

The AI reads both UX context files automatically. In Plan mode it presents the document manifest — confirm it. Then it generates all UX documents, runs the UX Consistency Validation Skill, and saves the UX Generation Summary.

**Step 3f — Visual Direction and Image Prompts** *(conditional — only if design system was created)*

> ⏸ **Requires your review and confirmation**

*The AI will tell you to skip this step if no design system was created (CLI-only or API-only system).*

Open a **new** Cursor conversation and type:

```
/01f
```

The AI reads the design system and UX summary automatically. It produces the Visual Direction Brief — review the aesthetic archetype, color story, and anti-patterns. Confirm; the AI generates `VISUAL-DIRECTION.md` and `IMAGE-PROMPTS.md`.

### Step 4: Iterate the Architecture

Review the generated architecture. For each improvement, open a **new** Cursor conversation and type:

```
/02
[Your change request here]
```

Example:
```
/02
Split the Identity domain into separate Authentication and Authorization domains. The authorization rules are complex enough to warrant a dedicated domain with its own entity model.
```

Repeat until you are satisfied. The AI creates ADRs for significant changes.

### Step 5: Generate Implementation Documentation *(automatic)*

Open a **new** Cursor conversation and type:

```
/03
```

The AI reads the architecture, presents the Execution Plan (component list, dependency graph), awaits confirmation, then generates all component records and the backlog.

### Step 6: Generate the Implementation Plan *(automatic)*

Open a **new** Cursor conversation and type:

```
/04
```

The AI reads all component records, presents the Execution Plan (proposed stages and milestones), awaits confirmation, then generates the Implementation Plan, Roadmap, and Progress Summary.

### Step 7: Implement Stage by Stage *(automatic, repeating)*

For each implementation session, open a **new** Cursor conversation and type:

```
/05
```

The AI reads the Implementation Plan, identifies the next stage, presents the Execution Plan (file manifest with source and test file outlines), awaits confirmation, implements, runs the compliance audit, and updates the plan. Repeat in a new conversation for each session until all stages are done.

### Step 7b: Run the Quality Audit *(automatic)*

After all implementation stages are complete:

```
/06
```

The AI assesses test coverage and architecture compliance. Critical failures must be resolved before Phase 7. The verdict is PASS / PASS WITH WARNINGS / FAIL.

### Step 8: Generate User Documentation *(automatic)*

```
/07
```

The AI analyzes the architecture, scans the code, reads the vision, and generates all user-facing documentation: tutorials, how-to guides, reference pages, concept explanations, FAQ, glossary, changelog, and the MkDocs portal configuration.

### Step 9: Deploy the Documentation Portal

Preview and deploy:

```bash
pip install mkdocs-material          # Install (one time)
mkdocs serve -f docs/mkdocs.yml      # Preview locally
mkdocs build -f docs/mkdocs.yml      # Build for deployment
```

Deploy the generated `site/` directory to GitHub Pages, Netlify, Vercel, or any static hosting.

### Step 10: Evolve the System

After the initial implementation, when you need changes:

**Step 10a — Evolve Architecture** *(requires your change request)*

```
/08a
[Your change request here]
```

Example:
```
/08a
Add a real-time notification system. Users need to receive push notifications when orders change status. This requires a WebSocket or SSE layer and a new Notifications domain.
```

**Step 10b — Evolve Implementation Docs** *(automatic)*

```
/08b
```

**Step 10c — Evolve User Documentation** *(automatic)*

```
/08c
```

**Step 10d — Implement the changes** *(automatic)*

```
/05
```

---

## 5. The 13 Phases in Detail

### Phase 0: Vision Refinement (Optional)

**What it does**: Assesses the Vision Document for quality and completeness, then guides the user through interactive improvements.

**Command**: `/00`

**Agent**: Vision Analyst Agent (`.cursor/agents/vision-analyst.md`)

**Skill**: Vision Quality Assessment (`.cursor/skills/vision-quality-assessment.md`)

**User input**: None — reads `docs/vision/VISION.md` automatically.

**Output**: Improved `docs/vision/VISION.md`, `docs/vision/VISION-QUALITY-REPORT.md`

**When to use**: Recommended for all new projects. Required if `/01a` returns a verdict of Insufficient.

**What to check**:
- Vision Quality Report verdict is Ready (score ≥ 38/55) or Needs Improvement
- All critical dimensions (Actors, Interface Preferences, Capabilities, Workflows) score ≥ 3

---

### Phase 1: Vision

**What it does**: Captures what the user wants in non-technical terms.

**User input**: Write the Vision Document manually, optionally with LLM assistance.

**Output**: `docs/vision/VISION.md`

**Template**: `.cursor/templates/vision/VISION-TEMPLATE.md`

**What to check before moving on**:
- All 12 sections are filled in (or Section 5 explicitly marked N/A for single-component systems)
- At least 2 actors defined with Technical Level column filled
- At least 5 capabilities described with Priority column (MVP/Post-MVP/Future)
- Section 4 (Interface Preferences) identifies at least one delivery interface
- At least 3 concepts/entities listed with Lifecycle States column
- At least 2 workflows described with Frequency and Volume
- Quality priorities ranked, including Maintainability, Observability, Testability
- Run `/00` or verify score ≥ 28/55 (at minimum) before proceeding

**Common mistakes**:
- Being too vague ("make it fast" — instead: "API responses under 200ms for 95% of requests")
- Describing technical solutions instead of needs ("use PostgreSQL" — instead: "data must be reliable and support complex queries")
- Missing actors ("the system sends emails" — who receives them? Add that actor)

---

### Phase 2: Initial Architecture Generation

**What it does**: Transforms the vision into a complete architecture documentation set, UX design, and design system foundation.

**Commands**: Six sequential commands. Steps with ⏸ require user review and confirmation.

| Step | Command | Mode | ⏸ User Input | Output (disk) |
|------|---------|------|-------------|---------------|
| 2a | `/01a` | Plan only | ⏸ Confirm Architecture Brief | `architecture-brief.md` |
| 2b | `/01b` | Plan → Agent | ⏸ Confirm Execution Plan | All architecture docs, `architecture-file-list.md` |
| 2c | `/01c` | Plan → Agent | ⏸ Confirm ADR manifest | ADRs, changelog, `generation-summary.md` |
| 2d | `/01d` | Plan only *(conditional)* | ⏸ Confirm UX Brief | `ux-brief.md` |
| 2e | `/01e` | Plan → Agent *(conditional)* | ⏸ Confirm document manifest | UX + design system docs, `ux-generation-summary.md` |
| 2f | `/01f` | Plan → Agent *(conditional)* | ⏸ Confirm Visual Direction Brief | `VISUAL-DIRECTION.md`, `IMAGE-PROMPTS.md` |

**User input**: Confirmation at judgment checkpoints only. No copy-paste between steps — context flows through `docs/context/`.

**Output**: `docs/architecture/` (root doc, domain docs, cross-cutting docs, platform docs, diagrams, ADRs, changelog) and, if applicable, `docs/ux/` and `docs/design-system/`

**Halt conditions**: If a step detects a required context file is missing (e.g., running `/01b` before `/01a`), it halts immediately and tells you which step to run first.

**What to check before moving on**:
- Architecture Brief was confirmed before any documents were created
- Every vision capability maps to at least one domain (and vice versa)
- Diagrams use concrete names (not "Component A")
- Layer structure makes sense for the project
- Domain boundaries feel right (not too many, not too few)
- ADR-001 accurately describes the architecture style choice
- Architecture Validation Skill passed in `/01c`
- If user-facing interfaces exist: UX Brief confirmed; UX Consistency Validation passed in `/01e`
- If web/dashboard interface: Visual Direction and Image Prompts created in `/01f`

**Common mistakes**:
- Too many small domains (combine related concepts)
- Too few large domains (split when different actors or change rates exist)
- Generic diagrams that don't add value beyond the text
- Skipping `/01d` and `/01e` when the system has a user-facing interface

---

### Phase 3: Architecture Iteration

**What it does**: Evolves and refines the architecture based on user feedback.

**Command**: `/02` + change request text

**User input**: Natural language description of what to change or improve.

**Output**: Updated architecture documents, new/updated diagrams, ADRs for significant changes

**What to check before moving on**:
- Architecture feels complete and accurate
- All domains have clear boundaries and responsibilities
- Diagrams effectively communicate the system's structure and behavior
- No contradictions between documents
- You can explain the architecture to someone else using the documents

---

### Phase 4: Implementation Setup

**What it does**: Extracts architectural components into implementation records with work items.

**Command**: `/03`

**User input**: None — reads architecture automatically.

**Output**: `docs/implementation/components/COMP-XXX-name.md` files + `docs/implementation/BACKLOG.md`

**What to check before moving on**:
- Every architectural domain has a corresponding component record
- Work items have clear acceptance criteria
- Dependencies between components make sense
- Size estimates feel reasonable

---

### Phase 5: Implementation Planning

**What it does**: Groups work items into stages and creates the backbone planning document.

**Command**: `/04`

**User input**: None — reads architecture + component records automatically.

**Output**: `docs/implementation/IMPLEMENTATION-PLAN.md`, `ROADMAP.md`, `PROGRESS-SUMMARY.md`

**What to check before moving on**:
- Stages are well-sized (3–8 items, 1–3 sessions each)
- Dependency order is correct
- First stage is achievable and produces something testable
- Milestones represent meaningful progress points

---

### Phase 6: Implementation Execution

**What it does**: Implements the system stage by stage.

**Command**: `/05` (repeat per session)

**User input**: None — reads the implementation plan automatically.

**Output**: Production code in `src/`, tests in `tests/`, updated implementation plan

**What to check during execution**:
- Tests pass after each stage
- Code follows architecture boundaries
- Implementation plan stays up to date
- Compliance audit verdict is COMPLIANT or MINOR VIOLATIONS

---

### Phase 6b: Quality Audit (Required)

**What it does**: Validates test coverage and architecture compliance before user documentation is generated.

**Command**: `/06`

**Agents**: Test Engineer Agent, Architecture Compliance Auditor Agent

**Skills**: Test Coverage Gap Detection, Architecture Validation, Implementation Compliance Audit

**User input**: None — reads `src/`, `tests/`, architecture, component records automatically.

**Output**: Quality Audit Report — PASS / PASS WITH WARNINGS / FAIL verdict

**What to check**:
- No uncovered acceptance criteria for domain logic or critical paths
- No layer boundary violations (Critical severity)
- Architecture validation passes (no missing documents, no broken traceability)

---

### Phase 7: User Documentation Generation

**What it does**: Generates complete user-facing documentation, a documentation portal scaffold, and completes the LLM agent reference artifact.

**Command**: `/07`

**User input**: None — reads architecture, scans code, reads vision automatically.

**Output**: `docs/user/` directory + `docs/mkdocs.yml` portal configuration + `docs/llm/AGENTS.md` (completed)

**Documentation follows the Diataxis framework**:
- **Tutorials**: step-by-step learning experiences for each primary user workflow
- **How-to guides**: task-oriented recipes for common tasks
- **Reference**: precise technical specifications (API endpoints, CLI commands, configuration)
- **Explanation**: concept pages helping users understand domain ideas

**LLM artifact completion**: Step 10a resolves all `TODO:` markers in `docs/llm/AGENTS.md` using the code scan, adds implementation-observed failure modes, and sets `completeness: complete`. The artifact is now ready to be loaded by any LLM agent building on top of this system.

**What to check before moving on**:
- Every public interface (API, CLI, config) has a reference page
- Every primary user workflow has a tutorial
- Examples use realistic data and show actual output
- MkDocs portal renders correctly with `mkdocs serve`
- FAQ has at least 5 entries; Glossary covers all domain terms
- `docs/llm/AGENTS.md` has `completeness: complete` with no `TODO:` markers remaining

---

### Phase 8: Documentation Portal Deployment

**What it does**: Deploys the user documentation as a browsable website.

**User input**: Manual deployment command.

```bash
pip install mkdocs-material           # Install (one time)
mkdocs serve -f docs/mkdocs.yml       # Preview locally
mkdocs build -f docs/mkdocs.yml       # Build for deployment
mkdocs gh-deploy -f docs/mkdocs.yml   # GitHub Pages (optional)
```

Deploy the generated `site/` directory to GitHub Pages, Netlify, Vercel, or any static hosting.

---

### Phase 9a: Evolve Architecture

**What it does**: Evolves architecture documents in response to a change request.

**Command**: `/08a` + change request text

**Agent**: Evolution Coordinator Agent, System Architect Agent

**Skills**: ADR Impact Analysis, Architecture Validation

**User input**: Natural language change request — the only thing the user provides.

**Output**: Updated architecture documents, ADRs, Architecture Changelog

---

### Phase 9b: Evolve Implementation Docs

**What it does**: Updates component records and implementation plan to reflect architecture changes.

**Command**: `/08b`

**User input**: None — reads updated architecture automatically.

**Output**: Updated component records, updated Implementation Plan

---

### Phase 9c: Evolve User Documentation

**What it does**: Updates user-facing documentation to reflect system changes.

**Command**: `/08c`

**Agent**: Documentation Agent

**Skill**: Documentation-Architecture Alignment

**User input**: None — reads updated architecture automatically.

**Output**: Updated user documentation pages, updated user changelog

---

## 6. Commands Reference

Use these commands in any Cursor conversation by typing the command name preceded by `/`.

| Command | Phase | What It Does | User Input Required |
|---------|-------|-------------|---------------------|
| `/00` | 0 | Assess and improve Vision Document | None (reads `docs/vision/VISION.md`) |
| `/01a` | 2 | Assess vision; produce and confirm Architecture Brief | ⏸ Confirm Architecture Brief |
| `/01b` | 2 | Generate all architecture docs from Architecture Brief | ⏸ Confirm Execution Plan |
| `/01c` | 2 | Create ADRs, initialize changelog, run validation | ⏸ Confirm ADR manifest |
| `/01d` | 2b | Identify interfaces; produce and confirm UX Brief *(conditional)* | ⏸ Confirm UX Brief |
| `/01e` | 2b | Generate UX + design system docs; run validation *(conditional)* | ⏸ Confirm document manifest |
| `/01f` | 2b | Produce and confirm Visual Direction Brief; generate docs *(conditional)* | ⏸ Confirm Visual Direction Brief |
| `/02` | 3 | Evolve architecture | ✏️ Change request (text after command) |
| `/03` | 4 | Extract implementation docs from architecture | ⏸ Confirm component list |
| `/04` | 5 | Generate implementation plan with stages | ⏸ Confirm proposed stages |
| `/05` | 6 | Implement next stage with tests | ⏸ Confirm Execution Plan |
| `/06` | 6b | Quality audit (test coverage + architecture compliance) | ⏸ Review audit findings |
| `/07` | 7 | Generate all user documentation + complete LLM artifact | ⏸ Confirm document manifest |
| `/08a` | 9a | Evolve architecture | ✏️ Change request (text after command) |
| `/08b` | 9b | Evolve implementation docs | None (automatic) |
| `/08c` | 9c | Evolve user documentation + update LLM artifact | None (automatic) |

**Legend**:
- ⏸ = AI pauses and presents a plan for your review before creating any file
- ✏️ = You write a change request after the command

### Checking Current State

At any time, read `docs/context/EXECUTION-STATE.md` to see:
- Which phase the project is in
- Which command last ran
- What the next step is
- Whether any context files are missing

---

## 7. Rules Reference

### Framework Rules (`.cursor/rules/framework/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `context-management.mdc` | CTX-001 to CTX-009 | Context file reads/writes, halt conditions, status lifecycle, Plan mode format requirements |

### Vision Rules (`.cursor/rules/vision/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `vision-quality.mdc` | VQ-001 to VQ-008 | Vision scoring dimensions, readiness classification, gap severity, `/01a` pre-check |

### Architecture Rules (`.cursor/rules/architecture/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `architecture.mdc` | ARCH-001 to ARCH-010 | Layer boundaries, dependency inversion, error handling, configuration, security |
| `architecture-generation.mdc` | GEN-001 to GEN-010 | Domain extraction, layer selection, mandatory outputs, diagrams, ambiguity, quality gates |
| `architecture-evolution.mdc` | EVO-001 to EVO-017 | Change classification, ADR/RFC flow, changelog, diagram impact, post-impl evolution |
| `architecture-navigation.mdc` | NAV-001 to NAV-014 | Document hierarchy, cross-references, consistency, pre-implementation checklist |
| `conventions.mdc` | CONV-001 to CONV-019 | Naming, file organization, API conventions, git conventions |
| `patterns.mdc` | PAT-001 to PAT-010 | Factory, Builder, Repository, Adapter, Strategy, Command, Observer, anti-patterns |
| `constraints.mdc` | CON-001 to CON-010 | Technology stack, runtime limits, compatibility, performance, security classification |

### Diagram Rules (`.cursor/rules/diagrams/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `diagrams.mdc` | DIAG-001 to DIAG-022 | Diagram types, Mermaid syntax, per-type rules, descriptive diagrams, quality checklist |

### User Documentation Rules (`.cursor/rules/documentation/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `user-documentation.mdc` | DOC-001 to DOC-014 | Diataxis structure, writing standards, examples, file organization, versioning, changelog, portal config |

### Implementation Rules (`.cursor/rules/implementation/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `implementation-workflow.mdc` | IMPL-001 to IMPL-017 | Architecture-driven implementation, stages, status transitions, completion checklist |
| `coding-standards.mdc` | CODE-001 to CODE-021 | File structure, naming, function design, error handling, types, dependencies, public API docs |
| `progress-tracking.mdc` | TRACK-001 to TRACK-016 | Work item format, status management, metrics, component records, reporting |

### Testing Rules (`.cursor/rules/tests/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `testing-strategy.mdc` | TEST-001 to TEST-018 | Test pyramid, naming, independence, coverage, mocking, assertions, performance |
| `unit-testing.mdc` | UNIT-001 to UNIT-014 | Unit test boundaries, domain logic testing, edge cases, organization |
| `integration-testing.mdc` | INT-001 to INT-015 | Database testing, API testing, test isolation, CI/CD |
| `e2e-contract-testing.mdc` | E2E-001 to E2E-013, RWT-001 to RWT-003 | E2E tests, contract tests, real-world tests |
| `mocking-test-doubles.mdc` | MOCK-001 to MOCK-014 | Test doubles, boundary mocking, async mocking, anti-patterns |
| `test-data-fixtures.mdc` | DATA-001 to DATA-012 | Factories, fixtures, test data patterns |

### UX Rules (`.cursor/rules/ux/`)

| File | Key Rules | Purpose |
|------|-----------|---------|
| `ux-principles.mdc` | UX-001+ | Core UX principles: discoverability, feedback, error prevention, consistency, accessibility |
| `interaction-design.mdc` | IXD-001+ | System-type-specific interaction standards (CLI, Web, API) |

### Design System Rules (`.cursor/rules/design-system/`) — conditional

| File | Key Rules | Purpose |
|------|-----------|---------|
| `design-system.mdc` | DS-001+ | Design consistency standards, component naming, token conventions (web systems only) |

---

## 8. Templates Reference

### Context Templates (`.cursor/templates/context/`)

| Template | Purpose |
|----------|---------|
| `EXECUTION-STATE-TEMPLATE.md` | Execution state index structure |
| `ARCHITECTURE-BRIEF-TEMPLATE.md` | Architecture Brief format |
| `ARCHITECTURE-FILE-LIST-TEMPLATE.md` | Architecture file list format |
| `GENERATION-SUMMARY-TEMPLATE.md` | Architecture generation summary format |
| `UX-BRIEF-TEMPLATE.md` | UX Brief format |
| `UX-GENERATION-SUMMARY-TEMPLATE.md` | UX generation summary format |
| `EXECUTION-PLAN-TEMPLATE.md` | Standard Plan mode output format (all execute commands) |

### Vision Templates (`.cursor/templates/vision/`)

| Template | Purpose |
|----------|---------|
| `VISION-TEMPLATE.md` | Structured vision document with 12 sections |
| `VISION-QUALITY-REPORT-TEMPLATE.md` | Output template for Vision Quality Assessment results |

### Architecture Templates (`.cursor/templates/architecture/`)

| Template | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | Root architecture document |
| `domains/_DOMAIN-TEMPLATE.md` | Domain architecture with vision traceability |
| `cross-cutting/_CONCERN-TEMPLATE.md` | Cross-cutting concern (security, resilience, etc.) |
| `platform/_PLATFORM-TEMPLATE.md` | Platform service (CLI, API, Web) |
| `decisions/_template.md` | Architecture Decision Record (ADR) |
| `proposals/_template.md` | Request for Comments (RFC) |
| `evolution/CHANGELOG.md` | Architecture change history |

### Diagram Templates (`.cursor/templates/diagrams/`)

| Template | Type | When to Use |
|----------|------|-------------|
| `_DIAGRAM-INDEX.md` | Index | Reference for choosing diagram types |
| `context-system-diagram.md` | Context | System boundary and external actors |
| `component-diagram.md` | Component | High-level components and dependencies |
| `sequence-diagram.md` | Sequence | Order of interactions in a flow |
| `activity-diagram.md` | Activity | Workflows and processes |
| `entity-relationship-diagram.md` | ERD | Data models and relationships |
| `class-diagram.md` | Class | Object structure and relationships |
| `state-machine-diagram.md` | State | Entity lifecycle and transitions |
| `deployment-diagram.md` | Deployment | Physical deployment topology |
| `use-case-diagram.md` | Use Case | User goals and actors |

### User Documentation Templates (`.cursor/templates/documentation/`)

| Template | Type |
|----------|------|
| `_DOCS-STRUCTURE-TEMPLATE.md` | Scaffold |
| `_TUTORIAL-TEMPLATE.md` | Tutorial |
| `_HOWTO-TEMPLATE.md` | How-to guide |
| `_REFERENCE-API-TEMPLATE.md` | REST API reference |
| `_REFERENCE-CLI-TEMPLATE.md` | CLI command reference |
| `_REFERENCE-CONFIG-TEMPLATE.md` | Configuration reference |
| `_EXPLANATION-TEMPLATE.md` | Concept explanation |
| `_CHANGELOG-USER-TEMPLATE.md` | User-facing changelog |
| `_MKDOCS-TEMPLATE.yml` | MkDocs portal configuration |

### Implementation Templates (`.cursor/templates/implementation/`)

| Template | Purpose |
|----------|---------|
| `components/_COMPONENT-TEMPLATE.md` | Component implementation record |
| `_BACKLOG-TEMPLATE.md` | Implementation backlog |
| `_CURRENT-WORK-TEMPLATE.md` | Current work tracking |
| `_PROGRESS-SUMMARY-TEMPLATE.md` | Progress metrics dashboard |
| `_ROADMAP-TEMPLATE.md` | Strategic milestones and timeline |

### UX Templates (`.cursor/templates/ux/`) — conditional

| Template | Purpose |
|----------|---------|
| `UX-PRINCIPLES-TEMPLATE.md` | UX principles, user profiles, usability requirements |
| `INTERACTION-DESIGN-TEMPLATE.md` | Interaction flows, affordances, error states, feedback |
| `ACCESSIBILITY-REQUIREMENTS-TEMPLATE.md` | Accessibility standards and WCAG targets |
| `UX-AUDIT-REPORT-TEMPLATE.md` | UX consistency validation report structure |

### Design System Templates (`.cursor/templates/design-system/`) — web systems only

| Template | Purpose |
|----------|---------|
| `DESIGN-SYSTEM-TEMPLATE.md` | Visual language: tokens, color, typography, spacing |
| `COMPONENT-LIBRARY-TEMPLATE.md` | UI component catalog with variants and states |
| `DESIGN-AUDIT-REPORT-TEMPLATE.md` | Design consistency audit report structure |

---

## 9. Agents and Skills Reference

The framework includes specialized **Agents** (cognitive personas with defined roles) and **Skills** (reusable analysis procedures) that commands invoke automatically.

### How Agents Work

Agents are Markdown definitions that commands read at the start of execution. Each agent defines:
- A cognitive mode and reasoning approach
- Which commands invoke it
- Which skills it uses
- What outputs it produces

An agent is not autonomous — it operates within the context of a command execution. The command reads the agent file and adopts its persona and constraints for that session.

### How Skills Work

Skills are step-by-step analytical procedures. A command reads the skill file and executes its steps against the project's artifacts. Skills produce structured outputs — scores, gap lists, reports — that guide next actions.

Skills can also be invoked directly in any conversation using `/skill-name` if the skill file is in `.cursor/commands/`.

### Agent Roster

| Agent ID | File | Phase | Cognitive Mode | Key Skills Used |
|----------|------|-------|----------------|-----------------|
| AGT-VA | `agents/vision-analyst.md` | Phase 0 | Domain discovery, user need articulation | SKL-VQA |
| AGT-SA | `agents/system-architect.md` | Phase 2–3, 9a | Architectural reasoning | SKL-ARCHVAL |
| AGT-UXA | `agents/ux-architect.md` | Phase 2b | UX system design | SKL-UXVAL |
| AGT-IXD | `agents/interaction-designer.md` | Phase 2b | Interaction flow design | SKL-UXVAL |
| AGT-IE | `agents/implementation-engineer.md` | Phase 6 | Structured implementation | SKL-IMPLCOMP |
| AGT-TE | `agents/test-engineer.md` | Phase 6b | Adversarial verification, gap identification | SKL-TESTGAP |
| AGT-ACA | `agents/architecture-compliance-auditor.md` | Phase 6b, 9a | Adversarial auditing, drift detection | SKL-ARCHVAL, SKL-IMPLCOMP |
| AGT-DA | `agents/documentation-agent.md` | Phase 7–8 | Documentation alignment | SKL-DOCAL |
| AGT-EC | `agents/evolution-coordinator.md` | Phase 9 | Change impact analysis, governance | SKL-ADRIMP, SKL-ARCHVAL |

### Skill Library

| Skill ID | File | Category | Commands That Use It |
|----------|------|----------|---------------------|
| SKL-VQA | `skills/vision-quality-assessment.md` | Vision Governance | `/00`, `/01a` |
| SKL-ARCHVAL | `skills/architecture-validation.md` | Architecture Governance | `/01c`, `/02`, `/08a` |
| SKL-TESTGAP | `skills/test-coverage-gap-detection.md` | Quality Assurance | `/06` |
| SKL-IMPLCOMP | `skills/implementation-compliance-audit.md` | Architecture Governance | `/05`, `/06` |
| SKL-ADRIMP | `skills/adr-impact-analysis.md` | Architecture Governance | `/02`, `/08a` |
| SKL-DOCAL | `skills/documentation-architecture-alignment.md` | Documentation Quality | `/07` |
| SKL-UXVAL | `skills/ux-consistency-validation.md` | UX Quality | `/01e`, `/06` |

---

## 10. Traceability Chain

The framework maintains a continuous traceability chain from idea to user documentation:

```
Vision Document (docs/vision/VISION.md)
    │
    │  "We need to manage customer orders"
    │  (Section 6: Key Capabilities)
    │
    ▼
Architecture (docs/architecture/ARCHITECTURE.md)
    │
    │  Vision Traceability table maps capability → Orders domain
    │
    ▼
Domain Architecture (docs/architecture/domains/orders/ARCHITECTURE.md)
    │
    │  Vision Traceability: implements "manage customer orders" capability
    │  Defines: entities, APIs, events, integration points
    │
    ▼
Component Record (docs/implementation/components/COMP-005-orders.md)
    │
    │  Architecture Reference → domains/orders/ARCHITECTURE.md
    │  Work items: COMP-005.1, COMP-005.2, ...
    │
    ▼
Implementation Plan (docs/implementation/IMPLEMENTATION-PLAN.md)
    │
    │  Stage S3 includes COMP-005.1, COMP-005.2
    │  Execution order: item 15, 16, 17
    │
    ▼
Code (src/orders/)
    │
    │  Implements COMP-005.1 acceptance criteria
    │  Tests verify behavior specified in architecture
    │
    ▼
Tests (tests/unit/orders/, tests/integration/orders/)
    │
    ▼
User Documentation (docs/user/)
    │
    │  Tutorial: "Managing Orders" → traces to vision capability
    │  Reference: "Orders API" → traces to domain architecture API spec
    │  Concept: "Order Lifecycle" → traces to domain entity model
```

### Verifying Traceability

At any point, you should be able to:

1. **From Vision to Docs**: pick a vision capability → trace it through architecture → component → stage → code → user documentation page
2. **From Docs to Vision**: pick a user documentation page → trace it back through code → component → architecture → vision capability
3. **Detect gaps**: any vision capability without code = not yet implemented. Any code without architecture = unauthorized implementation. Any implemented feature without user documentation = documentation gap.

### When Traceability Breaks

| Mismatch | Fix |
|----------|-----|
| Code exists but no architecture | `/08a` — describe the existing code; add the missing architecture |
| Architecture exists but no implementation item | `/03` — regenerate component records |
| Vision capability has no domain | `/02` — add the missing domain |
| Implemented feature has no user documentation | `/07` — regenerate, or update docs manually |
| User documentation describes a non-existent feature | Remove the page; update MkDocs navigation |

---

## 11. Adapting the Framework

### For Web Applications

- In the vision, emphasize user workflows and UI/UX quality priorities
- Architecture will have a Platform layer with Web UI
- Cross-cutting: add security (authentication, authorization), data models
- `/01d` through `/01f` are all applicable — design system will be created
- User documentation: feature guides and user workflows, consider screenshots

### For API Services

- In the vision, focus on consumers (who calls the API) and data contracts
- Architecture will have strong domain boundaries with REST/GraphQL APIs
- Cross-cutting: add API versioning, rate limiting, authentication
- `/01d` applies for API documentation UX; `/01f` is not applicable
- User documentation: emphasis on API reference, authentication guide, SDKs

### For Agent/Pipeline Systems

- In the vision, describe the transformation process and AI capabilities
- Architecture may use a specialized 3-layer structure (Core + Execution + Platform)
- Cross-cutting: add prompt management, state management, tool registry
- Consider the tripolar architecture pattern (Instructions, State, Tools)
- User documentation: capability reference, configuration, pipeline tutorials

### For CLI Tools

- In the vision, describe the commands, workflows, and automation scenarios
- Architecture focuses on command structure and data processing
- `/01d` applies (CLI is a user-facing interface); `/01e` generates IXD standards; `/01f` is not applicable
- User documentation: CLI command reference, shell integration, scripting how-to guides

### For Monoliths vs Microservices

- **Solo/small team**: use a monolith with clean layer boundaries. Architecture still has separate domains, but they share a single deployment unit.
- **Growing team**: start monolith, evolve to microservices as needed. Domain boundaries make this split straightforward.
- **Large team**: consider microservices from the start, with each domain as a separate service.

### Customizing Rules

1. Keep the rule files in `.cursor/rules/` as the framework provides them
2. Override specific values in the project's architecture docs (e.g., technology stack in `constraints.mdc`)
3. Create project-specific rule files for domain-specific conventions
4. Never modify the framework rule files directly — extend them

---

## 12. Troubleshooting

### "I see a halt error when running a command"

**Symptom**: Running `/01b` and the AI says "Required context file `docs/context/architecture-brief.md` is missing."

**Cause**: You skipped a step — `/01a` must run and be confirmed before `/01b`.

**Fix**: Run the prerequisite command. The halt message tells you exactly which command to run. Then run your intended command.

### "I accidentally closed the conversation before confirming"

**Symptom**: The Architecture Brief was presented but you closed the conversation before confirming.

**Fix**: Open a new conversation and run `/01a` again. The AI will warn you that it has already run (because `EXECUTION-STATE.md` shows prior state) and ask for confirmation before overwriting `architecture-brief.md`.

### "The AI generated too many domains"

**Cause**: The vision document has too many fine-grained capabilities.

**Fix**: In the vision, consolidate related capabilities. Then run `/02` and say: "Merge the X, Y, and Z domains into a single Domain Name domain."

### "The AI generated too few domains"

**Cause**: The vision document describes capabilities too broadly.

**Fix**: Break capabilities into more specific ones. Then run `/02` and say: "Split the X domain into separate domains for Y and Z."

### "Stages are too large"

**Symptom**: A stage has 15+ work items and would take many sessions.

**Cause**: Components were not broken down enough in Phase 4.

**Fix**: Run `/02` to refine the architecture with more granular components, or manually split the stage in the Implementation Plan.

### "Architecture and implementation are out of sync"

**Symptom**: Code exists that doesn't match the architecture documents.

**Fix**: Run `/08a`. Describe the current state and ask the AI to align architecture with reality (or vice versa).

### "I need to change something fundamental after v1"

**Symptom**: The architecture style or core domain structure needs to change.

**Fix**: Run `/08a` with a detailed change request. This will be classified as L4 (major), triggering an RFC. The AI will create a migration plan.

### "The AI keeps asking clarifying questions in /01a"

**Cause**: The vision document is too vague on critical aspects — missing actors, capabilities, or interface definitions.

**Fix**: Go back to the vision document and fill in the missing sections, or run `/00` to get a quality assessment and targeted improvement guidance. This behavior is correct per GEN-005 (ambiguity protocol): the AI must ask about critical ambiguities before producing the Architecture Brief.

### "User documentation is too generic"

**Cause**: The implementation is incomplete or the architecture lacks specific API/CLI definitions.

**Fix**: Ensure all implementation stages are complete before running `/07`. If the architecture is vague on API contracts, run `/02` to iterate it first.

### "MkDocs portal won't build"

**Cause**: The MkDocs `nav` section references files that don't exist, or files exist that aren't in `nav`.

**Fix**: Verify that every file in `docs/user/` is listed in `docs/mkdocs.yml` navigation, and every navigation entry points to an existing file. Run `mkdocs serve` locally to identify the specific error.

---

## 13. Quick Reference Card

### Command → Phase → User Input → Output

| Command | Phase | User Input | Output |
|---------|-------|------------|--------|
| `/00` | 0. Refine Vision | None | `VISION-QUALITY-REPORT.md` |
| `/01a` | 2a. Arch: Brief | ⏸ Confirm Architecture Brief | `docs/context/architecture-brief.md` |
| `/01b` | 2b. Arch: Generate | ⏸ Confirm Execution Plan | `docs/architecture/` (all docs + diagrams) |
| `/01c` | 2c. Arch: Decisions | ⏸ Confirm ADR manifest | ADRs, changelog, `generation-summary.md` |
| `/01d` | 2d. UX: Brief *(cond.)* | ⏸ Confirm UX Brief | `docs/context/ux-brief.md` |
| `/01e` | 2e. UX: Generate *(cond.)* | ⏸ Confirm document manifest | `docs/ux/`, `docs/design-system/` |
| `/01f` | 2f. Visual Dir *(cond.)* | ⏸ Confirm Visual Direction Brief | `VISUAL-DIRECTION.md`, `IMAGE-PROMPTS.md` |
| `/02` | 3. Iterate Arch | ✏️ Change request | Updated architecture, ADRs |
| `/03` | 4. Impl Docs | ⏸ Confirm component list | `docs/implementation/components/`, `BACKLOG.md` |
| `/04` | 5. Impl Plan | ⏸ Confirm proposed stages | `IMPLEMENTATION-PLAN.md`, `ROADMAP.md` |
| `/05` | 6. Implement | ⏸ Confirm Execution Plan | Code + tests + updated plan |
| `/06` | 6b. Quality Audit | ⏸ Review findings | Quality Audit Report |
| `/07` | 7. User Docs | ⏸ Confirm document manifest | `docs/user/`, `docs/mkdocs.yml`, `docs/llm/AGENTS.md` (completed) |
| `/08a` | 9a. Evolve Arch | ✏️ Change request | Updated arch + ADRs |
| `/08b` | 9b. Evolve Impl | None | Updated component records + plan |
| `/08c` | 9c. Evolve Docs | None | Updated user documentation + `docs/llm/AGENTS.md` |

**Legend**: ⏸ = review and confirm a plan | ✏️ = provide a change request

### Key File Paths

| What | Where |
|------|-------|
| Framework guide | `.cursor/FRAMEWORK.md` |
| Commands (invoke with /) | `.cursor/commands/` |
| Full prompt documentation | `.cursor/prompts/` |
| All rules | `.cursor/rules/` |
| All templates | `.cursor/templates/` |
| Vision document | `docs/vision/VISION.md` |
| Execution state (current phase) | `docs/context/EXECUTION-STATE.md` |
| Context files | `docs/context/` |
| Architecture root | `docs/architecture/ARCHITECTURE.md` |
| Implementation plan | `docs/implementation/IMPLEMENTATION-PLAN.md` |
| Component records | `docs/implementation/components/` |
| User documentation | `docs/user/` |
| LLM agent reference artifact | `docs/llm/AGENTS.md` |
| Portal configuration | `docs/mkdocs.yml` |

### Lifecycle Diagram

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                   VISION-TO-SYSTEM LIFECYCLE                         │
 ├────────────────────────────────────┬────────────────────────────────┤
 │  USER PROVIDES INPUT               │  AUTOMATIC (zero user input)    │
 ├────────────────────────────────────┼────────────────────────────────┤
 │                                    │                                  │
 │  [1] Write VISION.md               │                                  │
 │                                    │                                  │
 │  [2a] /01a → confirm brief ────────┤──> [2b] /01b (auto generate)    │
 │                                    │──> [2c] /01c (auto ADRs)         │
 │  [2d] /01d → confirm UX brief ─────┤──> [2e] /01e (auto UX docs)     │
 │  [2f] /01f → confirm visual dir ───┘                                  │
 │                                    │                                  │
 │  [3] /02 + change request          │                                  │
 │       (repeat as needed)           │                                  │
 │                                    │                                  │
 │                                    │  [4] /03 (auto impl docs)        │
 │                                    │  [5] /04 (auto impl plan)        │
 │                                    │  [6] /05 (auto implement, repeat)│
 │                                    │  [6b] /06 (auto audit)           │
 │                                    │  [7] /07 (auto user docs)        │
 │                                    │                                  │
 │  [8] Deploy portal (manual cmd)    │                                  │
 │                                    │                                  │
 │  [9] /08a + change request ────────┤──> /08b (auto impl docs)         │
 │       (repeat as needed)           │──> /08c (auto user docs)         │
 │                                    │──> /05  (auto implement)         │
 │                                    │                                  │
 └────────────────────────────────────┴────────────────────────────────┘
```
