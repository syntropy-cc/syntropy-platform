# Use Case Diagram Template

**Type**: Behavioral | **View**: Scenario (+1)  
**Purpose**: Illustrate user (actor) interactions with the system—goals and scope of functionality.

## When to Use

- Communicating system or feature scope to stakeholders
- Showing which actors can perform which use cases
- High-level requirements or product overview

## Diagram

Keep the set of use cases small per diagram (one subsystem or feature area). Use `include`/`extend` only when they add clarity.

```mermaid
flowchart LR
    subgraph Actors
        A(({Actor 1}))
        B(({Actor 2}))
    end

    subgraph UseCases["Use Cases"]
        U1([{Use Case 1}])
        U2([{Use Case 2}])
        U3([{Use Case 3}])
    end

    A --> U1
    A --> U2
    B --> U2
    B --> U3
    U1 -.->|include| U2
```

## Alternative: Mermaid (actor–use case style)

```mermaid
flowchart TB
    actor1(({Actor 1}))
    actor2(({Actor 2}))
    uc1([{Use Case 1}])
    uc2([{Use Case 2}])
    uc3([{Use Case 3}])

    actor1 --> uc1
    actor1 --> uc2
    actor2 --> uc2
    actor2 --> uc3
```

## Placeholders

| Placeholder   | Replace With |
|---------------|---------------|
| {Actor 1/2}   | e.g. Customer, Admin, External System |
| {Use Case 1/2/3} | Goals (e.g. Place order, View report, Export data) |

## Caption (add below diagram in your doc)

> This use case diagram shows the main actors and use cases for {scope}. {One sentence on the main takeaway.}
