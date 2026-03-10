# Architecture Diagram Templates Index

> Use this index to choose the right diagram type and template. Copy the template that matches your need and fill in the placeholders. **Prefer descriptive, useful diagrams**: use concrete names, show data/artifact flow, and add a second diagram when one would be too simple (see rules DIAG-019–DIAG-022 in `.cursor/rules/diagrams/diagrams.mdc`).

## Descriptive Diagrams (Rules DIAG-019–DIAG-022)

Diagrams should help the reader **observe a complex architecture in a simpler way**. Avoid diagrams that are obvious or add little beyond the text.

- **Use concrete names** from the architecture (agents, tools, entities, phases, files, DTOs).
- **Show data/artifact flow** (what passes between components) and **who reads vs who writes** where relevant.
- **Add a second diagram** when useful: e.g. Context + Data Flow; Component layout + Artifacts between layers (or Who feeds vs Who consumes); one flow + one zoom into a phase/agent.
- Before finalizing: run the **checklist** in each template (and Rule DIAG-022 in the rules).

Reference implementation: `docs/architecture/diagrams/` (overview, core, execution, platform, cross-cutting).

---

## Classification Overview

| Category    | Diagram Type     | Template File                     | When to Use |
|------------|------------------|-----------------------------------|-------------|
| Structural | Component        | `component-diagram.md`            | High-level components, interfaces, dependencies; add "artifacts between layers" or "who reads/writes" when scope is large |
| Structural | Class            | `class-diagram.md`                | Domain/API classes, attributes, relationships |
| Structural | Deployment       | `deployment-diagram.md`           | Hardware, nodes, where software runs |
| Structural | Context/System   | `context-system-diagram.md`       | System boundary and external actors/systems; **add Diagram 2: Data Flow** for root context |
| Structural | ERD              | `entity-relationship-diagram.md`  | Data entities and relationships |
| Behavioral | Sequence         | `sequence-diagram.md`             | Order of interactions (flows, API calls); use concrete participant and message names |
| Behavioral | Activity         | `activity-diagram.md`             | Workflows and step-by-step processes; label with concrete phase/artifact names |
| Behavioral | State Machine    | `state-machine-diagram.md`        | Life cycle and state transitions |
| Behavioral | Use Case         | `use-case-diagram.md`             | User goals and actors |

## 4+1 View Model

| View            | Primary Templates |
|-----------------|-------------------|
| Logical         | Component, Class |
| Process         | Sequence, Activity |
| Development     | Component (module view) |
| Physical        | Deployment |
| Scenario (+1)   | Use Case |

## How to Use

1. Choose the diagram type from the table above or from the rules (`.cursor/rules/diagrams/diagrams.mdc`).
2. Open the corresponding template in `.cursor/templates/diagrams/`.
3. Copy the template into your document (e.g. ARCHITECTURE.md, ADR, RFC).
4. Replace placeholders with **concrete, system-specific names** (from architecture docs or code).
5. Run the **Descriptive checklist** in the template; add a second diagram if the scope warrants it.
6. Keep one main idea per diagram; split into multiple diagrams if needed.

## Template Naming

Templates are named by diagram type. When saving a new diagram as a file under `docs/architecture/diagrams/`, use:

- `{diagram-type}-{scope}-{short-name}.md` (e.g. `sequence-orders-place-order.md`)
- Or embed the diagram inline in the owning architecture/ADR/RFC document.
