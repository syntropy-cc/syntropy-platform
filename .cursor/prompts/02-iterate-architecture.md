# Iterate Architecture (Prompt 02)

Use this prompt to evolve and improve the architecture documentation. This is **Phase 3** of the Vision-to-System Framework. Use it repeatedly until the architecture is satisfactory.

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Evolve the architecture based on my request below, following all architecture rules and templates.**

### Context and authority

- **Architecture is the skeleton**: it is the most important artifact in the project. Every change must be deliberate, documented, and consistent.
- **Vision Document** is the upstream source of truth: `docs/VISION.md` (or wherever it lives). Architecture must remain aligned with the vision.
- **Existing architecture** is in `docs/architecture/`. Read it before making changes.
- **Diagrams are as important as text**: assess diagram impact for every change.

### Agent definition — read before proceeding

Read the **System Architect Agent** definition at `.cursor/agents/system-architect.md`. Adopt its cognitive mode (architectural reasoning) for the duration of this session.

### Skills to invoke

For **L2 or higher changes**, invoke the following skill **after Step 2 (ADR draft)** and again **after Step 6 (verification)**:

- **ADR Impact Analysis** (`.cursor/skills/adr-impact-analysis.md`) — run on every new ADR draft to map all affected documents and identify superseded decisions before applying changes

If the ADR Impact Analysis reveals more documents than originally expected, update the plan before proceeding.

### Rules you must follow

- **Architecture principles**: `.cursor/rules/architecture/architecture.mdc` (ARCH-001 through ARCH-010)
- **Architecture evolution**: `.cursor/rules/architecture/architecture-evolution.mdc` (change classification, ADR flow, changelog)
- **Architecture navigation**: `.cursor/rules/architecture/architecture-navigation.mdc` (document hierarchy, cross-references, consistency)
- **Architecture generation**: `.cursor/rules/architecture/architecture-generation.mdc` (quality gates, diagram requirements)
- **Conventions**: `.cursor/rules/architecture/conventions.mdc`
- **Patterns**: `.cursor/rules/architecture/patterns.mdc`
- **Diagrams**: `.cursor/rules/diagrams/diagrams.mdc` (DIAG-001 through DIAG-022, especially DIAG-019 through DIAG-022 for descriptive diagrams)

### Templates you must use when creating new documents

- **Root architecture**: `.cursor/templates/architecture/ARCHITECTURE.md`
- **Domain architecture**: `.cursor/templates/architecture/domains/_DOMAIN-TEMPLATE.md`
- **Cross-cutting concern**: `.cursor/templates/architecture/cross-cutting/_CONCERN-TEMPLATE.md`
- **Platform service**: `.cursor/templates/architecture/platform/_PLATFORM-TEMPLATE.md`
- **ADR**: `.cursor/templates/architecture/decisions/_template.md`
- **RFC (for L4 changes)**: `.cursor/templates/architecture/proposals/_template.md`
- **Diagram templates**: `.cursor/templates/diagrams/` (all types)

---

### What I want to change or improve

> **Write your request below in natural language.** Be as specific or as broad as you need. Examples:
> - "Add a notification domain that handles email and push notifications"
> - "The Branding domain should also manage visual guidelines (colors, fonts, logos)"
> - "I want to split the Content domain into Draft and Published sub-domains"
> - "Improve the diagrams — they're too generic, add more detail"
> - "Add an API platform alongside the CLI"

```
{WRITE YOUR REQUEST HERE}
```

---

### Execution model: Plan first, then execute

Before making any file changes, you MUST first create a plan and present it to the user for review:

1. **Planning phase** (read-only): Read the change request above and all current architecture documents. Analyze the impact and produce a structured plan that includes:
   - Change classification (L1-L4) with reasoning
   - List of every document that will be modified, created, or removed (with file paths)
   - List of every diagram that will be updated or created
   - Whether an ADR/RFC is needed (and a draft title/summary if so)
   - Risk assessment: what could break, what cross-references need updating
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute it following the mandatory workflow below

### Mandatory workflow (the AI must follow these steps in order)

#### Step 1 — Classify the change

Classify the requested change per EVO-001:

| Level | Criteria | Documentation Required |
|-------|----------|------------------------|
| **L1 — Trivial** | Single document, no API change, no new dependencies | Direct implementation |
| **L2 — Minor** | Multiple documents, internal refactoring, no external impact | Lightweight ADR |
| **L3 — Significant** | New domain, API changes, new dependencies | Full ADR |
| **L4 — Major** | Restructuring layers, technology change, breaking changes | RFC + ADR |

State the classification and reasoning before proceeding.

#### Step 2 — If L2 or higher, draft ADR (or RFC for L4) and run Impact Analysis

1. Create the ADR using `.cursor/templates/architecture/decisions/_template.md`
2. Include: Status (Proposed), Context, Decision, Alternatives Considered, Consequences, Derived Rules
3. For L4: create RFC using `.cursor/templates/architecture/proposals/_template.md`
4. **Run ADR Impact Analysis** (`.cursor/skills/adr-impact-analysis.md`) on the drafted ADR — this may reveal additional documents to update
5. Update the plan with any newly-identified affected documents
6. Present the ADR/RFC and impact analysis summary to the user for review before making changes

#### Step 3 — Update the affected architecture documents

1. Read all documents that will be affected (use NAV-002 to determine which to load)
2. Make the changes, respecting:
   - ARCH-001: Layer separation (no upward dependencies)
   - ARCH-002: Dependency inversion (depend on abstractions)
   - ARCH-003: Communication patterns (events, commands, queries)
   - ARCH-005: Single source of truth (update authoritative doc, not copies)
3. If adding a new domain, use the domain template and fill in all sections
4. If removing a domain, update all cross-references

#### Step 4 — Update or create diagrams

1. Assess which diagrams are affected by the change
2. Update existing diagrams to reflect the new state
3. Create new diagrams if the change introduces new components, domains, or workflows
4. Verify all diagrams against DIAG-022 checklist:
   - [ ] Concrete names used
   - [ ] Data/artifact flows visible
   - [ ] Not redundant with surrounding text
   - [ ] Navigable by unfamiliar reader

#### Step 5 — Update the Architecture Changelog

Add an entry to `docs/architecture/evolution/CHANGELOG.md` under `[Unreleased]` with:
- What changed (Added / Changed / Deprecated / Removed)
- Reference to ADR if applicable

#### Step 6 — Verify cross-references and consistency

1. Verify the Document Map in the root ARCHITECTURE.md matches actual files
2. Verify all cross-references between documents still resolve
3. Check that no contradictions exist between documents (NAV-004)
4. Verify vision traceability: every domain still traces to vision capabilities
5. **Verify ADR propagation**: confirm that all documents identified in the ADR Impact Analysis have been updated (or explicitly deferred with justification)

#### Step 7 — Summarize

Present to the user:
1. **Change classification**: L1/L2/L3/L4
2. **ADR created**: path and title (if applicable)
3. **Documents modified**: list with brief description of changes
4. **Diagrams updated/created**: list
5. **Impact on other documents**: any cascading effects
6. **What to review**: specific sections the user should verify

### Verification checklist

- [ ] Change classified per EVO-001
- [ ] ADR created if L2+ (status: Proposed → Accepted after changes verified)
- [ ] ADR Impact Analysis run (L2+ only) — impact map reviewed
- [ ] All affected documents updated (including those revealed by impact analysis)
- [ ] Diagrams updated or created as needed
- [ ] Architecture Changelog updated
- [ ] Cross-references consistent (Document Map, domain links, ADR references)
- [ ] Vision traceability maintained
- [ ] No layer boundary violations introduced
- [ ] ADR propagation verified — all impacted documents addressed

### Language

Write everything in English: all code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Open a **new** Cursor conversation
2. Copy everything from the "Prompt" section above
3. Replace `{WRITE YOUR REQUEST HERE}` with your change request in natural language
4. Send — the AI will classify, document, update, and summarize
5. Review the changes; repeat with another request if needed
6. When satisfied, proceed to **Prompt 03** (`.cursor/prompts/03-generate-implementation-docs.md`)
