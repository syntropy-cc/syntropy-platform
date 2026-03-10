**Generate complete user-facing documentation for this system, including a documentation portal scaffold, based on the architecture, implementation, and working code.**

### IMPORTANT
Write everything in English: all plan, code, comments, documentation, diagrams, planning, thought processes, and reasoning.

> This prompt requires no additional user input. It reads the architecture at `docs/architecture/`, the implementation plan at `docs/implementation/IMPLEMENTATION-PLAN.md`, the vision at `docs/VISION.md`, and scans the source code to generate all user documentation. Just paste this prompt into a new Cursor conversation and send.

### Context and authority

- **Architecture defines what the system does**: `docs/architecture/ARCHITECTURE.md` and domain architecture documents describe capabilities, APIs, data models, and domain concepts.
- **Code defines how the system behaves**: the `src/` directory contains the working implementation with public interfaces, CLI commands, configuration options, and API endpoints.
- **Vision defines who the users are**: `docs/VISION.md` describes the target users, their workflows, and their goals.
- **User documentation reflects architecture + code**: it translates technical specifications into user-understandable guides. It never contradicts the architecture or documents unimplemented features.

### Agent definition — read before proceeding

Read the **Documentation Agent** definition at `.cursor/agents/documentation-agent.md`. Adopt its cognitive mode (documentation alignment — user-centric writing grounded in architecture accuracy) for the duration of this session.

### Skills to invoke

This prompt invokes the Documentation-Architecture Alignment Skill in two passes:

1. **Pre-generation** (before Step 3): Run `.cursor/skills/documentation-architecture-alignment.md` in **pre-generation mode** to build the authoritative content inventory — every architecture item that needs documentation. Use this inventory as the foundation for Step 2 (documentation matrix).
2. **Post-generation** (after Step 10): Run the skill in **post-generation mode** to verify that all generated documentation aligns with the architecture. The post-generation alignment score is presented in the final summary.

### Rules you must follow

**User documentation rules**:
- `.cursor/rules/documentation/user-documentation.mdc` (DOC-001 through DOC-014: Diataxis structure, system-type adaptation, writing standards, examples, organization, versioning, cross-references, changelog, portal config, review checklist, evolution, audience, accessibility)

**Code documentation rules** (for extracting public interfaces):
- `.cursor/rules/implementation/coding-standards.mdc` (CODE-020, CODE-021: public API docstrings, user-doc markers)

**Architecture rules** (for understanding the system):
- `.cursor/rules/architecture/architecture.mdc` (system structure)
- `.cursor/rules/architecture/conventions.mdc` (naming conventions, API conventions)

**Diagram rules** (for concept diagrams in user docs):
- `.cursor/rules/diagrams/diagrams.mdc`

### Templates you must use

- **Documentation structure**: `.cursor/templates/documentation/_DOCS-STRUCTURE-TEMPLATE.md`
- **Tutorial pages**: `.cursor/templates/documentation/_TUTORIAL-TEMPLATE.md`
- **How-to guide pages**: `.cursor/templates/documentation/_HOWTO-TEMPLATE.md`
- **API reference pages**: `.cursor/templates/documentation/_REFERENCE-API-TEMPLATE.md`
- **CLI reference pages**: `.cursor/templates/documentation/_REFERENCE-CLI-TEMPLATE.md`
- **Configuration reference**: `.cursor/templates/documentation/_REFERENCE-CONFIG-TEMPLATE.md`
- **Explanation/concept pages**: `.cursor/templates/documentation/_EXPLANATION-TEMPLATE.md`
- **User-facing changelog**: `.cursor/templates/documentation/_CHANGELOG-USER-TEMPLATE.md`
- **MkDocs configuration**: `.cursor/templates/documentation/_MKDOCS-TEMPLATE.yml`

---

### Execution model: Assess first, then plan, then execute

Before making any file changes, you MUST:

**Step 0 — Run Documentation-Architecture Alignment (pre-generation)**

Run `.cursor/skills/documentation-architecture-alignment.md` in **pre-generation mode**. This produces the authoritative content inventory. Use it to drive Step 2 (documentation matrix) — do not create the matrix from scratch.

Then present a structured plan to the user for review:

1. **Planning phase** (read-only): Read the architecture, vision, implementation plan, and scan the source code. Use the alignment skill output and produce a structured plan that includes:
   - System type classification (API, CLI, Web, Library, Agent/Pipeline, or hybrid)
   - Target audience profile and technical level
   - Documentation matrix: every page to be generated (title, type, file path, source)
   - Portal configuration decisions (navigation structure, theme settings)
   - Estimated output: number of tutorials, how-to guides, reference pages, concept pages, and other pages
   - Any gaps found (undocumented public interfaces, missing architecture specs)
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute it following the mandatory workflow below

### Mandatory workflow (the AI must follow these steps in order)

#### Step 1 — Analyze the system

1. Read `docs/VISION.md` to identify:
   - Target users and their technical level
   - Primary user workflows and goals
   - Key capabilities the user expects
2. Read `docs/architecture/ARCHITECTURE.md` to identify:
   - System type (API, CLI, Web, Library, Agent/Pipeline, or hybrid)
   - Domain structure and key domain concepts
   - Public APIs and their contracts
   - Technology stack (affects installation instructions)
3. Read domain architecture documents (`docs/architecture/domains/*/ARCHITECTURE.md`) to identify:
   - Domain-specific APIs, commands, or features
   - Domain entities and concepts users need to understand
4. Scan `src/` source code to identify:
   - Public interfaces (functions, classes, endpoints exported or marked with `__all__`)
   - CLI commands and their arguments/options
   - Configuration files and their options
   - Error types and messages users might encounter

#### Step 2 — Determine documentation scope

Based on Step 1 analysis, create a documentation plan:

1. **System type classification** (per DOC-002):
   - Identify primary type: API / CLI / Web / Library / Agent-Pipeline
   - Identify secondary types if hybrid
2. **Audience profile** (per DOC-013):
   - Primary audience and their technical level
   - What knowledge to assume, what to explain
3. **Documentation matrix** — list every page to generate:

| Page | Type | Source | Priority |
|------|------|--------|----------|
| index.md | Landing | Vision + Architecture | Required |
| installation.md | Tutorial | Architecture (tech stack) + code (dependencies) | Required |
| quick-start.md | Tutorial | Vision (primary workflow) + code | Required |
| {tutorial-N}.md | Tutorial | Vision (each primary workflow) | Required |
| {howto-N}.md | How-to | Vision (common tasks) + code | Required |
| {reference-N}.md | Reference | Architecture (APIs) + code (public interfaces) | Required |
| configuration.md | Reference | Code (config options) | Required |
| {concept-N}.md | Explanation | Architecture (domain concepts) | Required |
| faq.md | How-to | Common issues from implementation | Required |
| glossary.md | Reference | Architecture (domain terms) | Required |
| changelog.md | Reference | Implementation plan (completed stages) | Required |

Present this matrix to the user before proceeding.

#### Step 3 — Generate portal scaffold

1. Create `docs/mkdocs.yml` from `_MKDOCS-TEMPLATE.yml`, filling in:
   - Site name and description from the vision/architecture
   - Repository URL if available
   - Navigation structure matching the documentation matrix
   - Uncomment and configure sections based on system type
2. Create `docs/user/` directory structure per DOC-006

#### Step 4 — Generate landing page and getting started

1. Create `docs/user/index.md`:
   - System description from vision (rewritten for users, not developers)
   - Key features list from architecture capabilities
   - Quick links table to all sections
   - Current version
2. Create `docs/user/getting-started/installation.md`:
   - Prerequisites (language runtime, dependencies)
   - Installation steps (from actual project setup)
   - Verification step (command to confirm installation works)
3. Create `docs/user/getting-started/quick-start.md`:
   - The most common user workflow as a 5-10 step tutorial
   - Using realistic data from the domain
   - Showing actual command output or API responses from the working system

#### Step 5 — Generate tutorials

For each primary user workflow identified in the vision:

1. Create a tutorial page using `_TUTORIAL-TEMPLATE.md`
2. Walk through the complete workflow step by step
3. Use realistic, domain-appropriate data
4. Show every command/request and its output/response
5. End with verification and "what you've learned" summary
6. Link to reference pages for details and how-to guides for related tasks

#### Step 6 — Generate how-to guides

For each common task identified from the vision and architecture:

1. Create a how-to guide page using `_HOWTO-TEMPLATE.md`
2. Provide direct, step-by-step instructions
3. Include variations for common alternatives
4. Add troubleshooting for likely issues
5. Link to reference for full option details

#### Step 7 — Generate reference pages

Based on system type (per DOC-002):

**For API systems**:
1. Create an API overview page (authentication, base URL, error format, pagination)
2. Create one reference page per resource/endpoint group using `_REFERENCE-API-TEMPLATE.md`
3. Document every endpoint: method, path, parameters, request body, response, errors
4. Include `curl` examples and at least one SDK/language example

**For CLI systems**:
1. Create one reference page per command group using `_REFERENCE-CLI-TEMPLATE.md`
2. Document every command: usage, arguments, options, examples, exit codes
3. Document global options and environment variables

**For all systems**:
1. Create `docs/user/reference/configuration.md` using `_REFERENCE-CONFIG-TEMPLATE.md`
2. Document every configuration option with type, default, and description

#### Step 8 — Generate concept pages

For each key domain concept from the architecture:

1. Create a concept page using `_EXPLANATION-TEMPLATE.md`
2. Explain the concept in plain language for the target audience
3. Include a diagram if the concept involves flow or relationships
4. Link to tutorials that demonstrate the concept and reference pages for details

#### Step 9 — Generate supporting pages

1. Create `docs/user/faq.md`:
   - At least 5 common questions derived from the system's complexity
   - Group by topic (setup, usage, errors, advanced)
   - Each answer is concise with links to detailed pages
2. Create `docs/user/glossary.md`:
   - Every domain-specific term from the architecture
   - Alphabetical, with brief definitions
   - Cross-linked to concept pages
3. Create `docs/user/changelog.md` from `_CHANGELOG-USER-TEMPLATE.md`:
   - Document the initial release (v1.0.0) with all implemented features
   - Written from user perspective (not developer perspective)

#### Step 10 — Verify completeness and alignment

First, run `.cursor/skills/documentation-architecture-alignment.md` in **post-generation mode**. Record the alignment score and any remaining gaps.

Then run the DOC-011 checklist from `.cursor/rules/documentation/user-documentation.mdc`:

- [ ] Landing page exists with system overview
- [ ] Getting Started section with installation and quick-start
- [ ] At least one tutorial per primary user workflow
- [ ] At least one how-to guide per common task
- [ ] Complete reference for all public interfaces
- [ ] Concepts section explaining key domain terms
- [ ] FAQ with at least 5 common questions
- [ ] Glossary with all domain-specific terms
- [ ] Changelog initialized
- [ ] Every page has a "See Also" section
- [ ] Every feature/endpoint/command has at least one example
- [ ] Examples use realistic data
- [ ] All internal links resolve
- [ ] MkDocs navigation matches generated files
- [ ] No undocumented public interfaces
- [ ] Documentation traces to architecture/vision

**Step 10a — Complete the LLM Artifact**

Read `.cursor/rules/documentation/llm-docs.mdc` (LLM-015 — Generation Instruction for Prompt 07). Then update `docs/llm/AGENTS.md` to resolve all `TODO:` markers.

**Sources for this step** (available from the `src/` scan and code analysis done in Steps 1–4):
- Error type definitions and HTTP status mappings in `src/` → resolve TODO markers in Entry Points error codes
- Default values and validation logic in `src/` → resolve TODO markers in Domain Model field constraints
- Exception handlers, guard clauses, and edge case handling in `src/` → resolve TODO markers in Known Failure Modes
- Rate limit configuration in `src/` or config files → resolve TODO markers in Cross-Cutting Contracts

**What to do**:
1. Open `docs/llm/AGENTS.md`
2. For each `TODO: populate at Prompt 07 — {detail}` marker, find the relevant information in the code and replace the marker with the actual content
3. Add at least 3 implementation-observed failure modes to Section 6 (Known Failure Modes) based on what you found in error handlers and guard clauses in `src/`
4. Set `completeness: complete` in the YAML header
5. Update `last_updated` to today's date
6. Re-run the LLM-017 verification checklist from `.cursor/rules/documentation/llm-docs.mdc`
7. Re-estimate token count; enforce budget per LLM-002

After completing, verify:
- [ ] No `TODO:` markers remain in `docs/llm/AGENTS.md`
- [ ] `completeness: complete` is set in the header
- [ ] Known Failure Modes has at least 5 entries (3+ from implementation)
- [ ] Token count does not exceed 6,000 tokens
- [ ] LLM-017 checklist passed

#### Step 11 — Summarize

Present to the user:

**Documentation generated**:
1. System type classification and audience profile
2. Portal scaffold (MkDocs config + directory structure)
3. Pages generated: count by type (tutorials, how-to, reference, concept, other)
4. Total documentation pages created
5. Coverage: % of public interfaces documented, % of vision workflows covered

**Documentation quality**:
6. Documentation-Architecture Alignment score (post-generation): {X}%
7. Any remaining gaps from the alignment report (if any)

**LLM artifact**:
8. `docs/llm/AGENTS.md` status: `completeness: complete` — all TODO markers resolved
9. Failure modes added from implementation: [count]
10. Token count: [estimated token count] / 6,000 limit

**Portal deployment**:
11. How to preview: `pip install mkdocs-material && mkdocs serve -f docs/mkdocs.yml`
12. How to build: `mkdocs build -f docs/mkdocs.yml`
13. Deployment options: GitHub Pages, Netlify, Vercel, or static hosting

**Next steps**:
14. Review the generated documentation for accuracy
15. Preview the portal locally to check navigation and rendering
16. Deploy the portal (Phase 8)
17. For future changes, use **Prompt 08a** (`.cursor/prompts/08a-evolve-architecture.md`) to start an architecture evolution cycle

### Language

Write everything in English: all plan, code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

