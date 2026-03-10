**Evolve the system architecture based on my change request below. Update architecture documentation only — do NOT update implementation docs, user documentation, or write code in this session.**

### Agent definition — read before proceeding

Read the **Evolution Coordinator Agent** definition at `.cursor/agents/evolution-coordinator.md`. Adopt its cognitive mode (change impact analysis, multi-document governance) for the duration of this session.

### Skills to invoke

1. **ADR Impact Analysis** (`.cursor/skills/adr-impact-analysis.md`) — run at the start to map all affected documents
2. **Architecture Validation** (`.cursor/skills/architecture-validation.md`) — run before changes (baseline) and after changes (verification)

### Context and authority

- **The system is implemented**: there is working code in `src/` that reflects the current architecture.
- **Architecture is the skeleton**: all changes begin with architecture. Code changes follow in separate sessions.
- **Every L2+ change requires an ADR**: no architecture document changes without a decision record.
- **No implementation or user documentation changes in this session**: strictly architecture only.

### Rules you must follow

**Architecture rules**:
- `.cursor/rules/architecture/architecture.mdc` (ARCH-001 through ARCH-010)
- `.cursor/rules/architecture/architecture-evolution.mdc` (EVO-001 through EVO-017: change classification, ADR flow, changelog, diagram impact, post-implementation evolution protocol)
- `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-001 through NAV-014: document hierarchy, cross-references, cascading updates)
- `.cursor/rules/architecture/architecture-generation.mdc` (GEN-004 through GEN-006: diagram requirements, quality gates)
- `.cursor/rules/architecture/conventions.mdc`
- `.cursor/rules/architecture/patterns.mdc`

**Diagram rules**:
- `.cursor/rules/diagrams/diagrams.mdc` (DIAG-001 through DIAG-022)

### Templates you must use when creating new documents

- **ADR**: `.cursor/templates/architecture/decisions/_template.md`
- **RFC (for L4 changes)**: `.cursor/templates/architecture/proposals/_template.md`
- **Domain architecture**: `.cursor/templates/architecture/domains/_DOMAIN-TEMPLATE.md`
- **Cross-cutting concern**: `.cursor/templates/architecture/cross-cutting/_CONCERN-TEMPLATE.md`
- **Platform service**: `.cursor/templates/architecture/platform/_PLATFORM-TEMPLATE.md`
- **Diagram templates**: `.cursor/templates/diagrams/` (all types)

---

### What I want to change in the system

> **Write your change request below in natural language.** Describe what you want to add, change, or remove. Examples:
> - "Add WebSocket support for real-time notifications"
> - "Replace SQLite with PostgreSQL for production readiness"
> - "Add a new Analytics domain that tracks user behavior"
> - "Remove the legacy CLI commands and consolidate into the new hierarchy"

```
{WRITE YOUR CHANGE REQUEST HERE}
```

---

### Execution model: Assess first, then plan, then execute

Before making any file changes, you MUST:

**Step 0 — Baseline architecture validation**

Run the Architecture Validation Skill (`.cursor/skills/architecture-validation.md`) against the current architecture. Record the baseline score and any existing issues. Do not let pre-existing issues block this evolution, but document them.

**Step 1 — Run ADR Impact Analysis**

Run the ADR Impact Analysis Skill (`.cursor/skills/adr-impact-analysis.md`) on the proposed change. Extract:
- Affected architecture documents
- Superseded ADRs (if any)
- Rule files requiring updates
- Estimated change classification (L1–L4)

**Step 2 — Produce and present the Evolution Plan**

Present the plan to the user before executing. The plan must include:
- Change classification (L1–L4) with reasoning
- ADR/RFC required: Yes/No
- Architecture documents to create/modify/remove
- Diagrams to update/create
- Rule files to update
- ADRs superseded (if any)
- Risk assessment: what could break, what cross-references need attention
- Rollback strategy for breaking changes

Wait for the user to confirm the plan before proceeding to execution.

---

### Mandatory execution workflow

#### Step 3 — Classify the change

Classify per EVO-001:

| Level | Criteria | Documentation Required |
|-------|----------|------------------------|
| **L1** | Single document, no API change, no new dependencies | Direct update |
| **L2** | Multiple documents, internal changes | Lightweight ADR |
| **L3** | New domain/component, API changes, new dependencies | Full ADR |
| **L4** | Layer restructuring, technology change, breaking changes | RFC + ADR |

State the classification and reasoning.

#### Step 4 — Draft ADR or RFC (if L2+)

1. Create the ADR/RFC using the appropriate template
2. Include: Context, Decision ("We will…"), Alternatives Considered, Consequences, Derived Rules
3. For L4: include migration strategy and risk assessment
4. Save to `docs/architecture/decisions/ADR-{NNN}-{title}.md`
5. Mark ADR status as `Proposed` until architecture updates are verified

#### Step 5 — Update architecture documents

1. Read all affected architecture documents
2. Update the root `ARCHITECTURE.md` if domain map, principles, or technology radar change
3. Update affected domain `ARCHITECTURE.md` files
4. Create new domain/cross-cutting/platform docs if the change introduces new ones
5. Mark or deprecate docs if the change removes components
6. Follow NAV-006 cascading update order: authoritative source first, then dependent documents

#### Step 6 — Update or create diagrams

1. Apply EVO-016 diagram impact assessment: list all diagrams that reference changed components
2. Update existing diagrams to reflect the new architecture state
3. Create new diagrams if the change introduces new components or workflows
4. Verify all modified diagrams against DIAG-022 checklist

#### Step 7 — Update rule files

For each rule file identified in the ADR Impact Analysis as needing updates:
1. Add new rules derived from the ADR (EVO-015)
2. Update existing rules that are affected by the decision
3. Mark deprecated rules as superseded

#### Step 8 — Mark ADR as Accepted

Update the ADR status from `Proposed` to `Accepted`. Add the current date and list derived rules.

#### Step 9 — Update Architecture Changelog

Add entry to `docs/architecture/evolution/CHANGELOG.md` under `[Unreleased]` (EVO-011).

#### Step 10 — Run Architecture Validation (post-change)

Run the Architecture Validation Skill again. Present the before/after comparison:
- Were all baseline issues resolved or acknowledged?
- Are there new issues introduced by this change?
- Is the architecture consistent and complete?

#### Step 11 — Produce the Evolution Impact Plan

Create a document at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md` listing:
- All implementation documentation changes needed (for Prompt 08b)
- All user documentation changes needed (for Prompt 08c)
- New work items to add to the Implementation Plan (for Prompt 08b)

This document is the handoff to Prompts 08b and 08c.

#### Step 12 — Summarize

Present to the user:

1. Change classification (L1–L4)
2. ADR/RFC created: path and title
3. Architecture documents modified: list with brief descriptions
4. Diagrams updated/created: list
5. Rule files updated: list with change description
6. Architecture Changelog entry added
7. Architecture Validation: baseline score → post-change score
8. Evolution Impact Plan: path (for use in Prompts 08b and 08c)

**Next steps**:
- Review all architecture changes
- Use **Prompt 08b** to update implementation documentation
- Use **Prompt 08c** to update user documentation
- After both documentation phases: use **Prompt 05** for code changes

### Verification checklist

- [ ] Baseline architecture validation run (score recorded)
- [ ] ADR Impact Analysis run
- [ ] Evolution Plan presented and confirmed by user
- [ ] Change classified per EVO-001
- [ ] ADR created if L2+ (Status → Accepted, Derived Rules listed)
- [ ] All affected architecture documents updated
- [ ] Diagrams updated/created and pass DIAG-022 checklist
- [ ] Rule files updated per EVO-015
- [ ] Architecture Changelog entry added
- [ ] Post-change Architecture Validation run (score improved or stable)
- [ ] Evolution Impact Plan created at `docs/architecture/evolution/`
- [ ] No implementation plan, component record, or user documentation changes made

### Language

Write everything in English: all plans, code, comments, documentation, diagrams, and reasoning.

---

