# Evolve System (Prompt 08)

Use this prompt to evolve an implemented system. Architecture changes first, then implementation documentation is updated, then user documentation is updated. This is **Phase 9** of the Vision-to-System Framework.

After using this prompt, use **Prompt 05** to implement the code changes.

---

## Prompt (copy everything below this line into a new Cursor conversation)

---

**Evolve the system based on my change request below. Update architecture first (with ADR if needed), then update implementation documentation, then update user documentation. Do NOT implement code changes — only update documentation.**

### Context and authority

- **The system is implemented**: there is working code in `src/` that reflects the current architecture.
- **Architecture is the skeleton**: changes must start with architecture. Code changes follow.
- **Implementation Plan is the backbone**: `docs/implementation/IMPLEMENTATION-PLAN.md` tracks all work. New work items from this evolution must be added to it.
- **User documentation reflects the system**: `docs/user/` contains user-facing documentation that must stay in sync with the architecture and code.
- **Three-step evolution**: this prompt handles Step 1 (architecture + implementation docs + user docs). Use Prompt 05 afterward for Step 2 (code changes). After code changes, review user docs again if needed.

### Rules you must follow

**Architecture rules**:
- `.cursor/rules/architecture/architecture.mdc` (ARCH-001 through ARCH-010)
- `.cursor/rules/architecture/architecture-evolution.mdc` (EVO-001 through EVO-015: change classification, ADR flow, changelog)
- `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-001 through NAV-014: document hierarchy, cross-references)
- `.cursor/rules/architecture/architecture-generation.mdc` (GEN-004 through GEN-006: diagram requirements, quality gates)
- `.cursor/rules/architecture/conventions.mdc`
- `.cursor/rules/architecture/patterns.mdc`

**Diagram rules**:
- `.cursor/rules/diagrams/diagrams.mdc` (DIAG-001 through DIAG-022)

**Implementation rules** (for updating docs, not writing code):
- `.cursor/rules/implementation/implementation-workflow.mdc` (IMPL-001 through IMPL-014)
- `.cursor/rules/implementation/progress-tracking.mdc` (TRACK-001 through TRACK-016)

**User documentation rules** (for updating user-facing docs):
- `.cursor/rules/documentation/user-documentation.mdc` (DOC-001 through DOC-014: structure, writing standards, examples, evolution triggers)

### Templates you must use when creating new documents

- **ADR**: `.cursor/templates/architecture/decisions/_template.md`
- **RFC (for L4 changes)**: `.cursor/templates/architecture/proposals/_template.md`
- **Domain architecture**: `.cursor/templates/architecture/domains/_DOMAIN-TEMPLATE.md`
- **Cross-cutting concern**: `.cursor/templates/architecture/cross-cutting/_CONCERN-TEMPLATE.md`
- **Platform service**: `.cursor/templates/architecture/platform/_PLATFORM-TEMPLATE.md`
- **Component record**: `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md`
- **Diagram templates**: `.cursor/templates/diagrams/` (all types)
- **Tutorial pages**: `.cursor/templates/documentation/_TUTORIAL-TEMPLATE.md`
- **How-to guide pages**: `.cursor/templates/documentation/_HOWTO-TEMPLATE.md`
- **API reference pages**: `.cursor/templates/documentation/_REFERENCE-API-TEMPLATE.md`
- **CLI reference pages**: `.cursor/templates/documentation/_REFERENCE-CLI-TEMPLATE.md`
- **Configuration reference**: `.cursor/templates/documentation/_REFERENCE-CONFIG-TEMPLATE.md`
- **Explanation/concept pages**: `.cursor/templates/documentation/_EXPLANATION-TEMPLATE.md`
- **User changelog**: `.cursor/templates/documentation/_CHANGELOG-USER-TEMPLATE.md`

---

### What I want to change in the system

> **Write your change request below in natural language.** Describe what you want to add, change, or remove. Examples:
> - "Add WebSocket support for real-time notifications"
> - "The pipeline needs a new phase for content review before publishing"
> - "Replace SQLite with PostgreSQL for production readiness"
> - "Add a new Analytics domain that tracks user behavior"
> - "Remove the legacy CLI commands and consolidate into the new hierarchy"

```
{WRITE YOUR CHANGE REQUEST HERE}
```

---

### Execution model: Plan first, then execute

Before making any file changes, you MUST first create a plan and present it to the user for review:

1. **Planning phase** (read-only): Read the change request, current architecture, implementation plan, and user documentation. Analyze the impact and produce a structured plan that includes:
   - Change classification (L1-L4) with reasoning
   - **Architecture impact**: documents to modify/create/remove, diagrams to update/create, ADR/RFC needed
   - **Implementation impact**: component records to update, new work items to create, stages to add/modify
   - **User documentation impact**: pages to update/create/remove, changelog entry summary
   - Risk assessment: what could break, what cross-references need attention
   - Estimated scope: number of documents modified, new work items, documentation pages affected
2. **Present the plan** to the user and wait for confirmation before proceeding
3. **Execution phase**: After the plan is confirmed, execute it following the mandatory workflow below

### Mandatory workflow (the AI must follow these steps in order)

#### Part A — Architecture Evolution

##### Step 1 — Classify the change

Classify per EVO-001:

| Level | Criteria | Documentation Required |
|-------|----------|------------------------|
| **L1** | Single document, no API change, no new dependencies | Direct update |
| **L2** | Multiple documents, internal changes | Lightweight ADR |
| **L3** | New domain/component, API changes, new dependencies | Full ADR |
| **L4** | Layer restructuring, technology change, breaking changes | RFC + ADR |

State the classification and reasoning.

##### Step 2 — Draft ADR or RFC (if L2+)

1. Create the ADR/RFC using the appropriate template
2. Include: Context (why this change is needed), Decision, Alternatives Considered, Consequences
3. For L4: include migration strategy and risk assessment
4. Save to `docs/architecture/decisions/ADR-{NNN}-{title}.md`

##### Step 3 — Update architecture documents

1. Read all affected architecture documents
2. Update the root ARCHITECTURE.md if domain map, principles, or technology radar change
3. Update affected domain ARCHITECTURE.md files
4. Create new domain/cross-cutting/platform docs if the change introduces new ones
5. Remove or deprecate docs if the change eliminates components

##### Step 4 — Update or create diagrams

1. Identify which diagrams are affected
2. Update existing diagrams to reflect the new architecture state
3. Create new diagrams if the change introduces new components or workflows
4. Verify all modified diagrams against DIAG-022 checklist

##### Step 5 — Update Architecture Changelog

Add entry to `docs/architecture/evolution/CHANGELOG.md` under `[Unreleased]`.

#### Part B — Implementation Documentation Update

##### Step 6 — Update affected component records

1. For existing components affected by the change:
   - Add new work items (COMP-XXX.Y) for the required code changes
   - Update acceptance criteria if requirements changed
   - Update file structure if directory layout changes
2. For new components:
   - Create a new component record using the template
   - Define all work items with acceptance criteria and size estimates
3. For removed components:
   - Mark the component record as deprecated
   - Add removal work items (cleanup tasks)

##### Step 7 — Update the Implementation Plan

1. Add new work items to **Section 7** (work items catalog) with status: Backlog
2. Add new items to **Section 6** (execution order) at the appropriate position
3. If new stages are needed, add them to **Section 5** (stages)
4. Update **Section 0** so that **Progress** and **Next item** reflect the new execution order and counts
5. Update the **BACKLOG.md** with new items
6. Do **not** consider Prompt 08 complete until `docs/implementation/IMPLEMENTATION-PLAN.md` has been updated and remains the single source of truth for what to implement next (IMPL-017)

##### Step 8 — Verify implementation consistency

1. Architecture documents are internally consistent
2. Implementation docs reference the updated architecture
3. All cross-references resolve
4. No orphan work items (every item traces to architecture)

#### Part C — User Documentation Update

##### Step 9 — Identify affected user documentation

Review the change and determine which user documentation pages are affected:

1. **Reference pages**: if APIs, CLI commands, or configuration options change, update corresponding reference pages
2. **Tutorials**: if user workflows change, update or create tutorials
3. **How-to guides**: if common tasks change or new tasks become possible, update or create guides
4. **Concept pages**: if domain concepts change or new ones are introduced, update or create explanation pages
5. **FAQ**: if new common questions arise from the change, update FAQ
6. **Glossary**: if new terms are introduced, update glossary

##### Step 10 — Update affected user documentation pages

For each affected page identified in Step 9:

1. Update the page content to reflect the new system behavior
2. Ensure all code examples are updated to match new APIs/commands/config
3. Update cross-references ("See Also" sections) if page relationships change
4. For new features: create new pages using the appropriate template
5. For removed features: remove or redirect pages, add migration guidance

##### Step 11 — Update user-facing changelog

Add an entry to `docs/user/changelog.md` under `[Unreleased]`:

- Write from the **user's perspective** (not developer perspective)
- Use appropriate category: Added, Changed, Deprecated, Removed, Fixed
- Name the affected command, endpoint, feature, or configuration option
- Include migration steps for breaking changes
- Link to the relevant documentation page

##### Step 12 — Verify user documentation consistency

1. MkDocs navigation (`docs/mkdocs.yml`) includes all new pages and excludes removed pages
2. All internal links in modified pages resolve
3. All code examples in modified pages are accurate
4. Every new page has a "See Also" section

##### Step 13 — Summarize

Present to the user:

**Architecture changes**:
1. Change classification (L1–L4)
2. ADR/RFC created (if applicable): path and title
3. Architecture documents modified: list with brief descriptions
4. Diagrams updated/created: list
5. Architecture Changelog updated

**Implementation documentation changes**:
6. Component records updated: list with new work items
7. New component records created (if any)
8. Implementation Plan updated: new items count, new stages (if any)
9. Total new work items added to backlog

**User documentation changes**:
10. Pages updated: list with brief description of changes
11. New pages created: list with page type (tutorial, how-to, reference, concept)
12. Pages removed or redirected: list
13. User changelog entry added
14. MkDocs navigation updated

**Next steps**:
15. Review all documentation changes (architecture, implementation, user)
16. Use **Prompt 05** (`.cursor/prompts/05-implement-stage.md`) to implement the code changes
17. After code changes, verify user documentation examples still work

### Verification checklist

- [ ] Change classified per EVO-001
- [ ] ADR created if L2+ (with Status, Context, Decision, Alternatives, Consequences)
- [ ] All affected architecture documents updated
- [ ] Diagrams updated/created and pass DIAG-022 checklist
- [ ] Architecture Changelog entry added
- [ ] Affected component records updated with new work items
- [ ] New component records created if needed
- [ ] IMPLEMENTATION-PLAN.md updated (Sections 5, 6, 7 as needed)
- [ ] BACKLOG.md updated
- [ ] All cross-references consistent
- [ ] Vision traceability maintained
- [ ] Affected user documentation pages updated
- [ ] New user documentation pages created if needed
- [ ] User-facing changelog updated
- [ ] MkDocs navigation updated
- [ ] All user documentation links resolve
- [ ] No code changes made (documentation only)

### Language

Write everything in English: all plan, code, comments, documentation, diagrams, planning, thought processes, and reasoning.

---

## How to use this prompt

1. Open a **new** Cursor conversation
2. Copy everything from the "Prompt" section above
3. Replace `{WRITE YOUR CHANGE REQUEST HERE}` with your change description
4. Send — the AI will update architecture docs, create ADRs, update implementation docs, and update user docs
5. Review all changes
6. Open another **new** conversation with **Prompt 05** to implement the code changes
7. After code changes, verify user documentation examples still work
8. Repeat this cycle for each evolution
