# Context / System Diagram Template

**Type**: Structural | **View**: Scenario / Logical  
**Purpose**: High-level view of the entire system and its interaction with external actors and systems. When used for root architecture, add a **second diagram** for **data flow** (inputs → system → outputs) so the diagram set is descriptive and useful (see rules DIAG-019–DIAG-022).

## When to Use

- Introducing the system boundary and external users/systems
- Onboarding or executive overview
- Defining scope and external dependencies
- Root architecture document (e.g. ARCHITECTURE.md)

## Descriptive Checklist

Before finalizing, ensure:
- [ ] **Concrete names**: Real actor roles and external systems (e.g. "Usuário / Agência", "Provedores LLM", "SQLite", "Plataformas de Publicação"), not only "User" and "External System".
- [ ] **Interaction labels**: What is exchanged (e.g. "comandos, opções", "article.txt, config", "run pipeline", "reasoning, geração de texto") on the edges.
- [ ] **Internal structure** (optional): If the system is more than one box, show main internal blocks (e.g. CLI → Pipeline → Core/Execution) so the reader sees where requests go.
- [ ] **Second diagram**: For root context, add a **Data Flow** diagram (Diagram 2) showing inputs → main processing steps → outputs and persistence (see below).

---

## Diagram 1: System Context – Actors and External Systems

One system (or system boundary) in the center; external actors and external systems at the edges. Label edges with **what** is exchanged. Prefer concrete names.

```mermaid
flowchart LR
    subgraph External["External"]
        A(({Actor 1}))
        B(({Actor 2}))
        E1[{External System 1}]
        E2[{External System 2}]
    end

    subgraph System["{System Name}"]
        S[{System or Core Platform}]
    end

    A -->|"{interaction}"| S
    B -->|"{interaction}"| S
    S -->|"{interaction}"| E1
    S -->|"{interaction}"| E2
```

**Alternative**: Expand the system into 2–3 internal blocks (e.g. UI → Orchestration → Core) and show which block talks to which external system, with concrete interaction labels.

---

## Diagram 2 (recommended): Data Flow – Inputs to Outputs

Use when documenting root or system-level context. Show the main **inputs** (e.g. article, config), **processing steps or phases** (optional), and **outputs / persistence** (e.g. output files, DB entities). Use **concrete artifact names** (file names, DTOs, table names).

```mermaid
flowchart LR
    subgraph In ["Entradas"]
        I1[{Input 1}]
        I2[{Input 2}]
    end

    subgraph System ["{System Name}"]
        P1[{Step or Phase 1}]
        P2[{Step or Phase 2}]
        I1 --> P1
        I2 --> P2
        P1 -->|"{artifact}"| P2
    end

    subgraph Out ["Saídas / Persistência"]
        O1[{Output or Entity 1}]
        O2[{Output or Entity 2}]
    end

    P2 --> O1
    P2 --> O2
```

---

## Placeholders

| Placeholder     | Replace With |
|-----------------|--------------|
| {System Name}   | Name of the system or product |
| {Actor 1/2}     | Concrete roles (e.g. Usuário/Agência, Admin, Mobile App) |
| {External System 1/2} | Concrete systems (e.g. Provedores LLM, DALL-E, SQLite, Payment Provider) |
| {Core System}   | e.g. Platform Core, Main Application |
| {interaction}   | Concrete exchange (e.g. "comandos", "article.txt", "reasoning", "persiste entidades") |
| {Input 1/2}, {Step}, {artifact}, {Output} | Real artifact names (files, DTOs, phases) |

## Caption (add below each diagram)

> **Diagram 1**: This context diagram shows {system name} and its external actors and systems. {One sentence on the main takeaway.}
>
> **Diagram 2**: Flow of data from inputs ({list}) through {system} to outputs and persistence ({list}).
