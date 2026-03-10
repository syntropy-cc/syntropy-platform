# Skills — Invocation Guide

This directory contains **Skill definitions** for the Vision-to-System Framework. Skills are reusable, step-by-step analytical procedures that AI assistants execute when instructed by a Prompt or Agent.

---

## How Skills Work

A skill is a Markdown file that defines:
- What the skill does (purpose)
- What inputs it requires (prerequisites)
- Exactly how to execute it (step-by-step execution steps)
- What it produces (output format)
- Where it integrates in the lifecycle (integration points)

Skills are deterministic procedures — given the same inputs, they should produce consistent outputs. They are not creative tasks; they are analytical ones.

**Usage pattern**:
```
1. A Prompt or Agent reads the skill file
2. The AI executes the steps defined in the skill against the project's artifacts
3. The skill produces a structured output (report, score, gap list)
4. The Prompt or Agent uses that output to make decisions or present to the user
```

---

## Skill Library

### Vision Governance

| Skill ID | File | Category | Purpose | Invoked By |
|----------|------|----------|---------|-----------|
| SKL-VQA | `vision-quality-assessment.md` | Vision Governance | Score Vision Document quality; classify readiness | Prompt 00, Prompt 01, AGT-VA |

### Architecture Governance

| Skill ID | File | Category | Purpose | Invoked By |
|----------|------|----------|---------|-----------|
| SKL-ARCHVAL | `architecture-validation.md` | Architecture Governance | Validate architecture internal consistency and traceability | Prompt 01, Prompt 02, Prompt 08a, AGT-SA, AGT-ACA, AGT-EC |
| SKL-ADRIMP | `adr-impact-analysis.md` | Architecture Governance | Map ADR propagation across all documents | Prompt 02, Prompt 08a, AGT-SA, AGT-EC |
| SKL-IMPLCOMP | `implementation-compliance-audit.md` | Architecture Governance | Verify code compliance with architecture and patterns | Prompt 05, Prompt 06, AGT-IE, AGT-ACA |

### Quality Assurance

| Skill ID | File | Category | Purpose | Invoked By |
|----------|------|----------|---------|-----------|
| SKL-TESTGAP | `test-coverage-gap-detection.md` | Quality Assurance | Identify gaps between acceptance criteria and test coverage | Prompt 06, AGT-TE |

### Documentation Quality

| Skill ID | File | Category | Purpose | Invoked By |
|----------|------|----------|---------|-----------|
| SKL-DOCAL | `documentation-architecture-alignment.md` | Documentation Quality | Verify user docs align with architecture; identify gaps | Prompt 07, Prompt 08c, AGT-DA |

### UX Quality

| Skill ID | File | Category | Purpose | Invoked By |
|----------|------|----------|---------|-----------|
| SKL-UXVAL | `ux-consistency-validation.md` | UX Quality | Validate UX principles and interaction design compliance | Prompt 01b, Prompt 06, AGT-UXA, AGT-IXD |

---

## Skill Execution Flow

```
Skill invoked by Prompt or Agent
          │
          ▼
Step 1: Check prerequisites (required inputs present?)
          │
          ├── NO → Halt, report missing input to user
          │
          ▼
Step 2: Execute analytical steps (read artifacts, apply rules)
          │
          ▼
Step 3: Score, classify, or detect findings
          │
          ▼
Step 4: Produce structured output (using output format template)
          │
          ▼
Step 5: Present findings to user / pass to invoking agent
```

---

## Skill Integration Matrix

Shows which skills run at each phase gate:

| Phase Gate | Skill(s) Run | Pass Condition |
|-----------|-------------|----------------|
| Phase 0 → Phase 1 | SKL-VQA | READY verdict |
| Phase 1 → Phase 2 | SKL-VQA (pre-check) | READY or NEEDS_IMPROVEMENT (with acknowledgment) |
| Phase 2 (each iteration) → Phase 3 | SKL-ARCHVAL | VALID or VALID_WITH_WARNINGS |
| Phase 3 → Phase 4 | SKL-ARCHVAL | VALID |
| Each Phase 6 session end | SKL-IMPLCOMP | COMPLIANT or MINOR_VIOLATIONS |
| Phase 6 → Phase 6b (Quality Audit) | SKL-IMPLCOMP, SKL-TESTGAP, SKL-UXVAL | All: MINOR_VIOLATIONS or better |
| Phase 6b → Phase 7 | All quality skills | No CRITICAL or MAJOR findings |
| Phase 7 (pre-generation) | SKL-DOCAL | Produces content inventory |
| Phase 7 (post-generation) | SKL-DOCAL | ALIGNED or MINOR_GAPS |
| Phase 9a → Phase 9b | SKL-ARCHVAL, SKL-ADRIMP | VALID, impact fully propagated |
| Phase 2b (design review) | SKL-UXVAL | COMPLIANT or MINOR_ISSUES |

---

## Output Templates

Each skill produces output using a template:

| Skill | Output Template |
|-------|----------------|
| SKL-VQA | `.cursor/templates/vision/VISION-QUALITY-REPORT-TEMPLATE.md` |
| SKL-ARCHVAL | Inline structured report (no separate template) |
| SKL-ADRIMP | Inline structured report (no separate template) |
| SKL-IMPLCOMP | Inline structured report (no separate template) |
| SKL-TESTGAP | Inline structured report (no separate template) |
| SKL-DOCAL | Inline structured report (no separate template) |
| SKL-UXVAL | `.cursor/templates/ux/UX-AUDIT-REPORT-TEMPLATE.md` |

---

## Creating New Skills

When creating a new skill, use this structure:

```markdown
# {Skill Name}

## Skill Identity
| Property | Value |
|----------|-------|
| Skill ID | SKL-{ID} |
| Location | .cursor/skills/{filename}.md |
| Category | {Category} |
| Invoked By | {Prompts and Agents} |
| Rules Governing This Skill | {Rule files} |
| Produces | {Output type} |

## Purpose
{What the skill does and why}

## Prerequisites
| Input | Location | Required |
|-------|----------|----------|
| {Input} | {Location} | Required / Optional |

## Execution Steps
### Step 1 — {Step Name}
{Detailed instructions}

...

## Output Format
{Exact structure of the output the skill produces}

## Verdict Criteria (if scoring skill)
{Table: verdict → condition}

## Integration Points
{Where in the lifecycle this skill is called and what happens with its output}
```

After creating a new skill:
1. Add it to the Skill Library table above
2. Add it to the Skill Integration Matrix if it has a phase gate role
3. Add it to the Output Templates table
4. Update FRAMEWORK.md Section 8 (Agents and Skills Reference)
5. Update `.cursor/agents/README.md` for any agents that use the new skill
