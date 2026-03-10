**Update implementation documentation to reflect the architecture evolution completed in Prompt 08a. Update component records and the Implementation Plan only — do NOT change architecture documents, user documentation, or write code in this session.**

### Agent definition — read before proceeding

Read the **Evolution Coordinator Agent** definition at `.cursor/agents/evolution-coordinator.md`. Adopt its Phase 9b responsibilities: updating component records and the Implementation Plan based on the Evolution Impact Plan from Prompt 08a.

### Skills to invoke

1. **Implementation Compliance Audit** (`.cursor/skills/implementation-compliance-audit.md`) — run at the start to establish baseline compliance before updating docs

### Context and authority

- **Prompt 08a is complete**: architecture documents, ADR, and the Evolution Impact Plan are already updated.
- **The Evolution Impact Plan is your guide**: read it at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md` — it specifies exactly which component records and plan sections need updating.
- **Implementation Plan is the single source of truth**: `docs/implementation/IMPLEMENTATION-PLAN.md` governs what gets implemented next (IMPL-017).
- **No architecture changes, no user documentation changes, no code in this session**.

### Rules you must follow

**Implementation rules**:
- `.cursor/rules/implementation/implementation-workflow.mdc` (IMPL-001 through IMPL-017)
- `.cursor/rules/implementation/progress-tracking.mdc` (TRACK-001 through TRACK-016)
- `.cursor/rules/implementation/coding-standards.mdc` (for understanding component boundaries, not for writing code)

**Architecture rules** (read-only reference):
- `.cursor/rules/architecture/architecture-evolution.mdc` (EVO-017: post-implementation evolution protocol)
- `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-012: traceability requirements)

### Templates you must use when creating new documents

- **Component record**: `.cursor/templates/implementation/components/_COMPONENT-TEMPLATE.md`
- **Backlog item structure**: per TRACK-002 in `progress-tracking.mdc`

---

### What was changed in the architecture

> **Provide the path to the Evolution Impact Plan from Prompt 08a.** If you do not have it, find it at `docs/architecture/evolution/evolution-impact-{ADR-ID}.md`.

```
Evolution Impact Plan path: {PATH TO EVOLUTION IMPACT PLAN}
ADR reference: {ADR-ID}
```

---

### Execution model: Assess first, then plan, then execute

**Step 0 — Run Implementation Compliance Audit (baseline)**

Run the Implementation Compliance Audit Skill (`.cursor/skills/implementation-compliance-audit.md`) in "full system" scope. Record existing violations. These are pre-existing issues that should be noted but do not block this session.

**Step 1 — Read the Evolution Impact Plan**

Read the Evolution Impact Plan from Prompt 08a. Extract:
- Implementation documentation changes required
- Component records to update or create
- New work items to add
- Stages to add to the Implementation Plan

**Step 2 — Produce and present the Documentation Update Plan**

Present the plan before executing. The plan must include:
- Component records to update (with summary of changes)
- New component records to create (if any)
- Work items to add (with ID, title, size, and component)
- Implementation Plan sections to update
- Estimated total new work items

Wait for the user to confirm before proceeding.

---

### Mandatory execution workflow

#### Step 3 — Update affected component records

For each component record listed in the Evolution Impact Plan:

1. Open the component record at `docs/implementation/components/{COMP-ID}-{name}.md`
2. For existing components with breaking architecture changes:
   - Add new work items (`COMP-XXX.Y`) for rework tasks
   - Update acceptance criteria where requirements changed
   - Update file structure references if directory layout changed
   - Add an entry to the component's Evolution History section
3. For new components:
   - Create a new component record using `_COMPONENT-TEMPLATE.md`
   - Define all work items with acceptance criteria and size estimates
   - Set status to `Backlog` for all items
4. For removed components:
   - Mark the component record as deprecated (`Status: Deprecated`)
   - Add cleanup work items (removal tasks)
   - Note the ADR that drove deprecation

#### Step 4 — Update the Implementation Plan

1. Open `docs/implementation/IMPLEMENTATION-PLAN.md`
2. Add new work items to **Section 7** (work items catalog) with status: `Backlog`
3. Insert new items into **Section 6** (execution order) at the appropriate position (after all items they depend on)
4. If new stages are needed, add them to **Section 5** (stages) — stages must be coherent and testable increments
5. Update **Section 8** (progress metrics) — increment total item count
6. Update **Section 0** so that **Progress count** and **Next item** reflect the updated backlog

Do not mark new items as In Progress — they are added as Backlog until Prompt 05 selects them.

#### Step 5 — Update BACKLOG.md and CURRENT-WORK.md

1. Add all new work items to `docs/implementation/BACKLOG.md`
2. If any existing items in `CURRENT-WORK.md` are now blocked or need rework due to the architecture change, update their status accordingly

#### Step 6 — Verify implementation documentation consistency

1. Every new work item traces to an architecture element (IMPL-001)
2. Every component record references the updated architecture docs
3. All cross-references within component records resolve
4. The Implementation Plan remains internally consistent (no duplicate IDs, no orphan items)
5. Total item count in Section 8 equals actual items in Section 7

#### Step 7 — Summarize

Present to the user:

1. Baseline compliance audit summary (from Step 0)
2. Component records updated: list with summary of changes
3. New component records created: list
4. Work items added: total count, with breakdown by component
5. New stages added to Implementation Plan: names and item counts
6. Implementation Plan sections updated: list
7. BACKLOG.md updated: Yes/No

**Next steps**:
- Review all component records and plan updates
- Use **Prompt 08c** (`.cursor/prompts/08c-evolve-user-documentation.md`) to update user documentation
- After both documentation phases: use **Prompt 05** for code implementation

### Verification checklist

- [ ] Baseline Implementation Compliance Audit run
- [ ] Evolution Impact Plan read
- [ ] Documentation Update Plan presented and confirmed by user
- [ ] All affected component records updated
- [ ] New component records created if needed
- [ ] Removed components deprecated with cleanup items
- [ ] IMPLEMENTATION-PLAN.md updated (Sections 0, 5, 6, 7, 8 as needed)
- [ ] BACKLOG.md updated
- [ ] CURRENT-WORK.md updated for any blocked items
- [ ] All new work items trace to architecture elements
- [ ] All cross-references in component records resolve
- [ ] No architecture changes, user documentation changes, or code written

### Language

Write everything in English: all plans, documentation, and reasoning.

---

