# Activity Diagram Template

**Type**: Behavioral | **View**: Process  
**Purpose**: Illustrate business processes or step-by-step workflows (decisions, parallel flows, start/end).

## When to Use

- Documenting a process or workflow (e.g. order fulfillment, approval flow)
- Showing decisions, branches, and parallel activities
- Describing use-case or business process steps

## Descriptive Checklist

- [ ] Use **concrete** activity names (e.g. phase names, agent names, artifact names like "Phase 2: Configuration", "content_characterization").
- [ ] Label edges with **artifact or condition** (e.g. "post_ideas.json", "Validation passed", "score > 0.7").
- [ ] For pipelines or phases, consider adding **output per step** on the arrow or in a short note.

## Diagram

One process per diagram. Use a clear start and end. Label decision edges with conditions.

```mermaid
flowchart TD
    Start([Start]) --> A[{Activity 1}]
    A --> B[{Activity 2}]
    B --> D{Decision?}
    D -->|Yes| C1[{Activity A}]
    D -->|No| C2[{Activity B}]
    C1 --> E[{Activity 3}]
    C2 --> E
    E --> End([End])
```

## With Parallel Flows

```mermaid
flowchart TD
    Start([Start]) --> A[{Activity 1}]
    A --> B[{Activity 2}]
    B --> par{{Parallel}}
    par --> P1[{Path 1}]
    par --> P2[{Path 2}]
    P1 --> join{{Join}}
    P2 --> join
    join --> E[{Activity 3}]
    E --> End([End])
```

## Placeholders

| Placeholder   | Replace With |
|---------------|---------------|
| {Activity 1/2/3} | Short action labels (e.g. Validate input, Call payment API) |
| {Decision?}   | Question or condition (e.g. Valid?, Payment OK?) |
| {Activity A/B}| Actions for each branch |
| {Path 1/2}    | Parallel path descriptions |

## Caption (add below diagram in your doc)

> This activity diagram describes the {process name} workflow. {One sentence on the main takeaway.}
