# Agents — Invocation Guide

This directory contains **Agent definitions** for the Vision-to-System Framework. Agents are specialized cognitive personas that AI assistants adopt when executing specific prompts.

---

## How Agents Work

An agent is a Markdown file that defines:
- A cognitive mode (how the AI should reason)
- A phase in the lifecycle (when it's active)
- Which prompts invoke it
- Which skills it uses
- What outputs it produces

Agents are not autonomous — they operate within the context of a Prompt. The prompt reads the agent file and the AI adopts its persona and constraints for that session.

**Usage pattern**:
```
1. User copies a Prompt into a Cursor conversation
2. Prompt instructs: "Read agent definition at .cursor/agents/{agent}.md"
3. AI reads the agent file and adopts its cognitive mode
4. AI completes the session in that persona
5. Session ends; cognitive mode returns to default
```

---

## Agent Roster

### Core Engineering Agents

| Agent ID | File | Phase | Cognitive Mode | Key Skills |
|----------|------|-------|----------------|------------|
| AGT-SA | `system-architect.md` | Phase 2–3, 9a | Architectural reasoning | SKL-ARCHVAL, SKL-ADRIMP |
| AGT-IE | `implementation-engineer.md` | Phase 6 | Structured implementation | SKL-IMPLCOMP |
| AGT-DA | `documentation-agent.md` | Phase 7–8, 9c | Documentation alignment | SKL-DOCAL |
| AGT-EC | `evolution-coordinator.md` | Phase 9 (all) | Change impact analysis | SKL-ADRIMP, SKL-ARCHVAL, SKL-IMPLCOMP |

### Quality Agents

| Agent ID | File | Phase | Cognitive Mode | Key Skills |
|----------|------|-------|----------------|------------|
| AGT-TE | `test-engineer.md` | Phase 6b | Adversarial verification | SKL-TESTGAP |
| AGT-ACA | `architecture-compliance-auditor.md` | Phase 6b, 9a | Adversarial auditing | SKL-ARCHVAL, SKL-IMPLCOMP |

### Vision and UX Agents

| Agent ID | File | Phase | Cognitive Mode | Key Skills |
|----------|------|-------|----------------|------------|
| AGT-VA | `vision-analyst.md` | Phase 0 | Domain discovery | SKL-VQA |
| AGT-UXA | `ux-architect.md` | Phase 2b, 6b | UX system design | SKL-UXVAL |
| AGT-IXD | `interaction-designer.md` | Phase 2b | Interaction flow design | SKL-UXVAL |

---

## Prompt-to-Agent Mapping

| Prompt | Phase | Agent(s) Invoked |
|--------|-------|-----------------|
| `00-refine-vision.md` | Phase 0 | AGT-VA |
| `01a-assess-and-brief.md` | Phase 2 | AGT-SA |
| `01b-generate-architecture.md` | Phase 2 | AGT-SA |
| `01c-decisions-and-validation.md` | Phase 2 | AGT-SA |
| `01d-ux-assess-and-brief.md` | Phase 2b | AGT-UXA |
| `01e-ux-generate-and-validate.md` | Phase 2b | AGT-UXA → AGT-IXD (sequential) |
| `02-iterate-architecture.md` | Phase 3 | AGT-SA |
| `03-generate-implementation-docs.md` | Phase 4 | (no dedicated agent — prompt is self-contained) |
| `04-generate-implementation-plan.md` | Phase 5 | (no dedicated agent — prompt is self-contained) |
| `05-implement-stage.md` | Phase 6 | AGT-IE |
| `06-audit-quality.md` | Phase 6b | AGT-TE + AGT-ACA (parallel) |
| `07-generate-user-documentation.md` | Phase 7–8 | AGT-DA |
| `08a-evolve-architecture.md` | Phase 9a | AGT-EC (with AGT-SA for architecture judgment) |
| `08b-evolve-implementation-docs.md` | Phase 9b | AGT-EC |
| `08c-evolve-user-documentation.md` | Phase 9c | AGT-EC (with AGT-DA for documentation) |

---

## Agent Interaction Map

```
Phase 0
  AGT-VA ──────────────────────────────────────────── Vision Governance
                                                            │
                                                            ▼
Phase 2          Phase 2b
  AGT-SA ──────── AGT-UXA ──── AGT-IXD ─────────── Architecture + UX
      │                                                     │
      ▼                                                     ▼
Phase 3                                           Architecture refined
  AGT-SA ─────────────────────────────────────── (iterate as needed)
      │
      ▼
Phase 6
  AGT-IE ──────────────────────────────────────── Implementation
      │
      ▼
Phase 6b (Quality Gate)
  AGT-TE ──────┐
               ├────────────────────────────────── Quality Audit
  AGT-ACA ─────┘
      │
      ▼
Phase 7-8
  AGT-DA ──────────────────────────────────────── User Documentation
      │
      ▼
Phase 9 (Evolution)
  AGT-EC ──────────────────────────────────────── Evolution Coordination
    ├── AGT-SA (Phase 9a, architecture judgment)
    └── AGT-DA (Phase 9c, documentation)
```

---

## Creating New Agents

When creating a new agent, use this structure:

```markdown
# {Agent Name}

## Agent Identity
| Property | Value |
|----------|-------|
| Agent ID | AGT-{ID} |
| Location | .cursor/agents/{filename}.md |
| Phase | Phase {N} |
| Invoked By | Prompt {N} (...) |
| Cognitive Mode | {Short description} |
| Skills Used | {SKL-ID1}, {SKL-ID2} |
| Produces | {List of outputs} |

## Role and Responsibility
{What the agent does and why}

## Cognitive Mode: {Mode Name}
{How the agent reasons in this mode — numbered list}

## Principles
{Non-negotiable rules this agent follows}

## Activation Instructions
{What to read before starting}

## Responsibilities
{Detailed task list by phase}

## Outputs
{Table: output name, template, destination}

## When to Escalate
{Conditions that cause the agent to pause and ask the user}

## Anti-Patterns to Avoid
{Table: anti-pattern, risk, prevention}
```

After creating a new agent:
1. Add it to the roster table above
2. Add it to the Prompt-to-Agent Mapping table
3. Update the Agent Interaction Map
4. Update FRAMEWORK.md Section 8 (Agents and Skills Reference)
5. Update `.cursor/skills/README.md` if the agent uses new skills
