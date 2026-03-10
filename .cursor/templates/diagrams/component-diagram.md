# Component Diagram Template

**Type**: Structural | **View**: Logical / Development  
**Purpose**: Visualize high-level software components, their interfaces, and relationships. For complex scopes, add a **second diagram** showing **data/artifact flow** or **who reads vs who writes** so the set is descriptive and useful (see rules DIAG-019–DIAG-022).

## When to Use

- Documenting system or subsystem structure
- Showing dependencies between components
- Describing provided/required interfaces
- Explaining module or package organization

## Descriptive Checklist

Before finalizing, ensure:
- [ ] **Concrete names**: Real component/domain/agent names from the architecture (e.g. `Pipeline`, `ideation_agent`, `template_selector`, `Content Characterization`), not "Component A/B".
- [ ] **Edge labels**: Name the **artifact or interaction** (e.g. `coherence_brief.json`, "lê contexto", "escreve content_characterization") where it helps.
- [ ] **Responsibilities**: One-line role or key responsibility in the component label (e.g. "orquestra fases, validações").
- [ ] **Second diagram** (when useful): Add either (a) **Artifacts between layers** (what flows from Platform → Execution → Core), or (b) **Who feeds vs who consumes** (read vs write split) so the reader can trace data flow.

---

## Diagram 1: Components, Responsibilities, and Relationships

Replace placeholders with **concrete component names** and, where helpful, a short responsibility. Label edges with **what** is passed or done. Keep one level of abstraction per diagram.

```mermaid
flowchart TB
    subgraph "{System or Subsystem Name}"
        A[{Component A<br/>optional one-line responsibility}]
        B[{Component B<br/>optional one-line responsibility}]
        C[{Component C}]
    end

    A -->|"{artifact or interaction}"| B
    B -->|"{artifact or interaction}"| C
    A -.->|"optional dependency"| C
```

**Alternative (richer)**: Use subgraphs for layers (e.g. Platform, Execution, Core) and show cross-cutting concerns (e.g. Data Models, Templates) with dotted relationships. Name key artifacts on the arrows.

---

## Diagram 2 (optional): Key Artifacts Between Layers / Who Feeds vs Who Consumes

Use when the same document covers a **multi-layer or multi-phase** system. Choose one:

**Option A – Artifacts between layers**
- Show what the top layer sends (e.g. `run_pipeline(article, editorial_id)`), what flows between middle layers (e.g. `coherence_brief`, `narrative_structure`), and what is written to the bottom layer (e.g. `Content`, `content_characterization`).

**Option B – Who reads vs who writes**
- Two groups: "Lido por X" (entities or artifacts that X reads) and "Escrito por X" (what X or downstream writes). Arrows: ReadBy → X → WrittenBy. Add a feedback arrow if relevant.

```mermaid
flowchart LR
    subgraph ReadBy ["Lido por {Consumer}"]
        R1[{Entity or artifact 1}]
        R2[{Entity or artifact 2}]
    end

    subgraph WrittenBy ["Escrito por {Producer}"]
        W1[{Entity or artifact 1}]
        W2[{Entity or artifact 2}]
    end

    ReadBy -->|"contexto / input"| Consumer[{Consumer}]
    Consumer --> WrittenBy
```

---

## Placeholders

| Placeholder        | Replace With |
|--------------------|--------------|
| {System or Subsystem Name} | Name of the system or subsystem boundary |
| {Component A/B/C}   | **Concrete** names (e.g. Pipeline, narrative_agent, Content, Observability) |
| {artifact or interaction} | Real artifact or action (e.g. coherence_brief.json, "lê contexto", "escreve") |
| {Consumer}, {Producer} | e.g. Pipeline, Content Characterization Agent |
| {Entity or artifact 1/2} | Real schema/entity names (e.g. Institution, content_characterization) |

## Caption (add below each diagram)

> **Diagram 1**: Main components of {scope} and their dependencies. {One sentence on the main takeaway.}
>
> **Diagram 2** (if used): {Artifacts between layers | Who feeds vs who consumes} for {scope}. {One sentence.}
