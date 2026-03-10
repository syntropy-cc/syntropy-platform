**Update user-facing documentation to reflect the architecture evolution. Update the documentation portal only — do NOT change architecture documents, component records, implementation plan, or write code in this session.**

### Agent definition — read before proceeding

Read the **Evolution Coordinator Agent** definition at `.cursor/agents/evolution-coordinator.md`. Adopt its Phase 9c responsibilities: updating user documentation based on the Evolution Impact Plan from Prompt 08a and verifying alignment with the updated architecture.

### Skills to invoke

1. **Documentation-Architecture Alignment** (`.cursor/skills/documentation-architecture-alignment.md`) — run in pre-generation mode first (to confirm what needs changing), then in post-generation mode (to verify alignment after updates)

### Context and authority

- **Prompts 08a and 08b are complete**: architecture and implementation docs are updated.
- **The Evolution Impact Plan is your guide**: read it at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md` — it specifies which documentation pages need updating.
- **Documentation follows Diataxis model**: Tutorials (learning), How-to guides (tasks), Reference (facts), Explanation (concepts).
- **User documentation is written for users, not developers**: never leak implementation details.
- **No architecture changes, no implementation plan changes, no code in this session**.

### Rules you must follow

**Documentation rules**:
- `.cursor/rules/documentation/user-documentation.mdc` (DOC-001 through DOC-014: structure, writing standards, examples, evolution triggers)

**Architecture rules** (read-only reference):
- `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-004: single source of truth; NAV-005: cross-references)

### Templates you must use when creating new documents

- **Tutorial pages**: `.cursor/templates/documentation/_TUTORIAL-TEMPLATE.md`
- **How-to guide pages**: `.cursor/templates/documentation/_HOWTO-TEMPLATE.md`
- **API reference pages**: `.cursor/templates/documentation/_REFERENCE-API-TEMPLATE.md`
- **CLI reference pages**: `.cursor/templates/documentation/_REFERENCE-CLI-TEMPLATE.md`
- **Configuration reference**: `.cursor/templates/documentation/_REFERENCE-CONFIG-TEMPLATE.md`
- **Explanation/concept pages**: `.cursor/templates/documentation/_EXPLANATION-TEMPLATE.md`
- **User changelog**: `.cursor/templates/documentation/_CHANGELOG-USER-TEMPLATE.md`

---

### What was changed in the architecture

> **Provide the path to the Evolution Impact Plan from Prompt 08a.** If you do not have it, find it at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md`.

```
Evolution Impact Plan path: {PATH TO EVOLUTION IMPACT PLAN}
ADR reference: {ADR-ID}
```

---

### Execution model: Assess first, then plan, then execute

**Step 0 — Run Documentation-Architecture Alignment (pre-change baseline)**

Run the Documentation-Architecture Alignment Skill in **pre-generation mode** (or post-generation mode if documentation already exists). Record:
- Current alignment score
- Pages already stale or missing due to the architecture evolution
- Any pre-existing phantom documentation

This is the baseline. Use it to prioritize what needs updating.

**Step 1 — Read the Evolution Impact Plan**

Read the Evolution Impact Plan from Prompt 08a. Extract:
- User documentation pages to update
- User documentation pages to create
- User documentation pages to remove or redirect

**Step 2 — Produce and present the Documentation Update Plan**

Present the plan before executing. The plan must include:
- Pages to update (with Diataxis type and summary of changes)
- Pages to create (with Diataxis type and purpose)
- Pages to remove or redirect (with migration guidance if needed)
- Changelog entry summary
- MkDocs navigation changes

Wait for the user to confirm before proceeding.

---

### Mandatory execution workflow

#### Step 3 — Update affected user documentation pages

For each page listed in the Evolution Impact Plan:

1. Open the page at `docs/user/{category}/{page}.md`
2. Update content to reflect the new system behavior:
   - Update API signatures, CLI commands, or configuration options in Reference pages
   - Update step sequences in Tutorials and How-to guides
   - Update conceptual explanations in Explanation pages
3. Ensure all code examples match the new APIs/commands/config
4. Update "See Also" cross-references if page relationships changed
5. Keep user perspective — never expose internal implementation details

#### Step 4 — Create new user documentation pages

For each new item identified in the Evolution Impact Plan or by the alignment baseline:

1. Determine the Diataxis quadrant:
   - **Tutorial**: user learns something new end-to-end
   - **How-to**: user accomplishes a specific goal
   - **Reference**: user looks up accurate facts about commands, APIs, config
   - **Explanation**: user understands a concept or design decision

2. Create the page using the appropriate template
3. Place in the correct directory:
   - `docs/user/tutorials/`
   - `docs/user/how-to/`
   - `docs/user/reference/`
   - `docs/user/explanation/`

4. Add a "See Also" section linking to related pages

#### Step 5 — Remove or redirect deprecated documentation pages

For each removed component or feature:

1. If the page should be removed, delete it
2. If users may still search for old terms, add a brief redirect or "this feature was removed" notice
3. For breaking changes: add migration guidance linking to the new approach

#### Step 6 — Update user-facing changelog

Add an entry to `docs/user/changelog.md` under `[Unreleased]`:

- Write from the **user's perspective** (what they can now do differently, not what code changed)
- Use appropriate category: Added, Changed, Deprecated, Removed, Fixed
- Name the affected command, endpoint, feature, or configuration option by its user-visible name
- Include migration steps for breaking changes
- Link to the relevant documentation page

#### Step 7 — Update MkDocs navigation

1. Open `docs/mkdocs.yml`
2. Add new pages to the appropriate navigation sections
3. Remove deleted pages from navigation
4. Verify no broken navigation links

#### Step 8 — Run Documentation-Architecture Alignment (post-change)

Run the Documentation-Architecture Alignment Skill in **post-generation mode**. Compare with the pre-change baseline:
- Did alignment score improve?
- Are there remaining gaps?
- Any new phantom documentation introduced?

Present the before/after comparison.

**Step 8a — Update the LLM Artifact**

Read `.cursor/rules/documentation/llm-docs.mdc` (LLM-016 — Update Instruction for Prompt 08c). Then update `docs/llm/AGENTS.md` to reflect the architecture changes from this evolution cycle.

**What to do**:
1. Read the Evolution Impact Plan at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md`
2. Identify which sections of `docs/llm/AGENTS.md` are affected by the architecture changes:
   - New or modified entities → update Section 2 (Domain Model)
   - New, modified, or removed endpoints/commands/events → update Section 3 (Entry Points)
   - Changed cross-cutting contracts (auth, errors, pagination) → update Section 4
   - Changed state machines or operation sequences → update Section 5
   - New failure modes from the changed implementation → add to Section 6
3. Update only the affected sections. Do not regenerate unaffected sections.
4. Update `last_updated` to today's date in the YAML header
5. Update `system_version` if the architecture version changed
6. Re-estimate token count; enforce budget per LLM-002
7. Run the LLM-017 verification checklist

**If `docs/llm/AGENTS.md` does not exist** (evolution ran before initial generation):
Generate the full artifact from scratch following LLM-014 (Prompt 01-C instructions) combined with LLM-015 (Prompt 07 instructions), since both architecture and code are available.

#### Step 9 — Summarize

Present to the user:

1. Pre-change alignment score (from Step 0)
2. Post-change alignment score (from Step 8)
3. Pages updated: list with brief description of changes
4. New pages created: list with Diataxis type
5. Pages removed or redirected: list
6. User changelog entry added: summary
7. MkDocs navigation updated: Yes/No
8. Remaining gaps (if any)
9. LLM artifact sections updated: list the sections changed in `docs/llm/AGENTS.md`

**Next steps**:
- Review all documentation changes
- Use **Prompt 05** (`.cursor/prompts/05-implement-stage.md`) to implement code changes
- After code changes, run this skill again if code examples need updating

### Verification checklist

- [ ] Pre-change Documentation-Architecture Alignment run (baseline recorded)
- [ ] Evolution Impact Plan read
- [ ] Documentation Update Plan presented and confirmed by user
- [ ] All affected pages updated with accurate content
- [ ] All code examples updated to match new APIs/commands/config
- [ ] New pages created using appropriate templates
- [ ] Removed pages deleted or redirected with migration guidance
- [ ] User-facing changelog updated
- [ ] MkDocs navigation updated
- [ ] Post-change Documentation-Architecture Alignment run (score improved or stable)
- [ ] `docs/llm/AGENTS.md` updated for affected sections (or created if missing)
- [ ] `docs/llm/AGENTS.md` `last_updated` and `system_version` updated in header
- [ ] `docs/llm/AGENTS.md` LLM-017 checklist passed
- [ ] No architecture changes, implementation plan changes, or code written

### Language

Write everything in English: all plans, documentation, and reasoning. User documentation tone should match the project's existing documentation style.

---

