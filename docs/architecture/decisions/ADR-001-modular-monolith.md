# ADR-001: Modular Monolith with Turborepo + pnpm Workspaces

## Status

Accepted

## Date

2026-03-12

## Context

The Syntropy Ecosystem must deliver three interconnected pillars — Learn, Hub, and Labs — plus a shared platform layer (authentication, event bus, portfolio, AI agents, IDE, DIP). The team starting this project is small (2–5 developers), but the system must scale in complexity and eventually in deployment topology.

Several forces are in tension:

- **Team size**: A 2–5 developer team cannot manage the operational overhead of a microservices deployment (service discovery, distributed tracing, independent CI/CD pipelines per service, network partitioning, distributed transactions). However, the system's domain complexity demands that bounded contexts remain structurally separate to prevent a tangled monolith that becomes impossible to modify.
- **Extensibility mandate**: Vision Section 9 (priority 4 — Extensibility) requires that new pillars and artifact types be addable without rewriting core. This demands clear separation boundaries from day one.
- **Inviolable decisions**: Vision Section 10 explicitly mandates a monorepo architecture using Turborepo + pnpm workspaces. This is not negotiable.
- **No direct cross-pillar imports**: Vision Section 10 prohibits direct imports between pillar applications (`apps/`). Shared logic must live in `packages/`.
- **Future extraction path**: The architecture must not prevent future extraction of bounded contexts toward microservices as the team and scale grow — but it should not pay the operational cost of microservices now.
- **Clean architecture**: The system's Core Domains (DIP, Platform Core, Learn, Hub, Labs) contain rich domain logic that requires proper layer separation — Presentation → Application → Domain → Infrastructure — to prevent business logic from bleeding into infrastructure code.

The central question is: **which structural pattern best serves a small team building a complex, multi-domain system that must remain modifiable over years?**

## Decision

We will use a **modular monolith** architecture implemented as a **Turborepo + pnpm workspaces monorepo**, with each bounded context implemented as one or more workspace packages, and with the following non-negotiable communication rules:

1. **No direct imports between pillar applications** (`apps/learn`, `apps/hub`, `apps/labs`). All shared logic lives in `packages/`.
2. **Cross-domain communication** within the monorepo happens exclusively through:
   - The **event bus** (Kafka in production; in-process EventEmitter adapter for development/testing) for asynchronous communication.
   - **Versioned internal APIs** exposed by domain packages for synchronous communication when immediate consistency is required.
3. **No direct cross-domain database access**. Each domain owns its PostgreSQL schema. Other domains must call through the owning domain's API or consume its events.
4. Each domain package implements a **4-layer clean architecture**: Presentation → Application → Domain → Infrastructure. Dependencies flow downward only. The domain layer depends on abstractions (interfaces), not infrastructure implementations.
5. The monorepo workspace structure is:
   ```
   apps/         ← Next.js pillar applications (no cross-app imports)
   packages/     ← Domain packages + shared packages
     platform-core/   domain/application/infrastructure/
     dip/             domain/application/infrastructure/
     identity/        domain/application/infrastructure/
     ai-agents/       domain/application/infrastructure/
     learn/           domain/application/infrastructure/
     hub/             domain/application/infrastructure/
     labs/            domain/application/infrastructure/
     ...              (supporting domains)
     shared/types/    shared TypeScript types
     shared/events/   Event Schema Registry
     shared/ui/       design system components
   ```
6. The architecture explicitly supports **future extraction**: domain packages are designed with minimal infrastructure coupling such that they can be wrapped in independent service runtimes without domain-layer changes.

## Alternatives Considered

### Alternative 1: Microservices from Day One

Deploy each bounded context as an independent deployable service with its own database, communicate over a real network via HTTP/gRPC and Kafka.

**Pros**:
- Independent deployability and scaling per service
- Technology heterogeneity possible (different languages per service)
- No shared-memory coupling

**Cons**:
- Extreme operational overhead for a 2–5 developer team (service discovery, distributed tracing, independent CI/CD, Kubernetes namespace management, network partitioning handling, distributed transactions)
- Distributed systems failures (network timeouts, partial failures, eventual consistency) introduce significant complexity before the product has found market fit
- Vastly increases time-to-first-working-feature

**Why rejected**: Vision Section 10 mandates Turborepo + pnpm workspaces — an explicitly monorepo structure. A 2–5 person team cannot responsibly operate microservices at this stage. The Vision's "Known Constraints" section explicitly names team size as a limiting factor.

### Alternative 2: Simple Monolith Without Domain Boundaries

A single codebase with no explicit package boundaries between domains. All code shares a database, imports freely across logical modules, no event bus.

**Pros**:
- Simplest possible setup
- No infrastructure for cross-domain communication
- Zero communication latency between components

**Cons**:
- No structural enforcement of domain boundaries — the codebase degrades into a "big ball of mud" within months
- Adding a new pillar requires understanding and modifying the entire codebase
- Testing becomes increasingly difficult as coupling grows
- Does not meet Vision Section 9 Extensibility requirement
- Violates ARCH-001, ARCH-003, ARCH-011 (Core Domains require rich domain models)

**Why rejected**: The system's Core Domains (DIP, Platform Core, Learn, Hub, Labs) require rich, independently evolvable domain models. Sharing a database and allowing free imports across contexts would collapse the boundary guarantees that the DIP entity ownership model depends on.

### Alternative 3: Serverless-First Architecture

Deploy all domain logic as serverless functions (AWS Lambda / Vercel Edge Functions). Event-driven by default via function-to-function invocation or SQS/EventBridge.

**Pros**:
- Zero server management
- Pay-per-invocation cost model
- Natural event-driven decomposition

**Cons**:
- Cold start latency unacceptable for IDE container lifecycle management (ADR-007) and real-time scientific article rendering
- Stateful components (IDE containers, long-running AI agent sessions) cannot run as serverless functions
- Complex local development experience
- Kafka consumer groups are not compatible with stateless function invocations

**Why rejected**: The IDE requires persistent container sessions; AI agent orchestration requires long-running memory; the background services architecture requires durable Kafka consumer groups. Serverless execution model is incompatible with these requirements.

## Consequences

### Positive

- The 2–5 developer team can operate the system with standard tooling (single `pnpm install`, `turbo build`, `turbo test`) without managing distributed infrastructure.
- Bounded context boundaries are structurally enforced by the workspace package graph — TypeScript compiler errors prevent accidental cross-domain coupling.
- The event bus communication requirement is implementable as an in-process adapter in development (zero infrastructure) and swapped for a real Kafka broker in production (ADR-002) with no domain-layer changes.
- Future extraction of any bounded context into an independent service is feasible: domain packages are already isolated with dependency injection; only the infrastructure adapter needs a network transport implementation.
- Turborepo's caching and parallel execution pipelines keep build and test times manageable as the codebase grows.

### Negative

- All bounded contexts share the same deployment process — a deployment affecting one domain deploys all domains simultaneously.
  - **Mitigation**: Feature flags, database migrations as separate steps, and blue/green deployments mitigate this. The architecture is explicitly designed for future extraction if deployment independence becomes critical.
- Shared infrastructure (Supabase PostgreSQL, Kafka broker) is a single point of failure across all domains.
  - **Mitigation**: ADR-004 (database strategy) and the Resilience cross-cutting architecture specify HA requirements for shared infrastructure. Schema isolation per domain limits blast radius.
- In-process event bus (development mode) hides eventual consistency behavior that will surface in production with Kafka.
  - **Mitigation**: Integration test suite runs against real Kafka (via Docker Compose) as part of CI. The event bus abstraction interface is identical in both adapters.

### Neutral

- All domains share the same TypeScript version and Next.js version managed by the monorepo root `package.json`. Upgrading affects all packages simultaneously — this is a trade-off of simplicity versus per-service independence.
- The architectural decision to separate domain packages now means some packages will be small at first (e.g., Planning, Sponsorship). This is acceptable; the boundary is established for correctness, not because the package volume justifies it today.

## Implementation Notes

### Workspace Package Naming Convention

```
@syntropy/platform-core
@syntropy/dip
@syntropy/identity
@syntropy/ai-agents
@syntropy/learn
@syntropy/hub
@syntropy/labs
@syntropy/sponsorship
@syntropy/communication
@syntropy/planning
@syntropy/ide
@syntropy/governance-moderation
@syntropy/events       ← Event Schema Registry (Published Language)
@syntropy/types        ← Shared TypeScript types
@syntropy/ui           ← Design system components
```

### Layer Directory Convention per Package

```
packages/{domain}/
  src/
    domain/           ← Entities, Value Objects, Domain Services, Repository interfaces
    application/      ← Use Cases, Application Services, Command/Query handlers
    infrastructure/   ← Repository implementations, External service adapters
    index.ts          ← Public API surface of the package (explicit exports only)
```

### Cross-Domain Import Rules

| From | To | Allowed? | Mechanism |
|------|----|----------|-----------|
| `apps/*` | `packages/*` | Yes | Import from package public API (`index.ts`) |
| `apps/learn` | `apps/hub` | **No** | Use event bus or versioned API |
| `packages/learn` | `packages/dip` | Only via ACL in `infrastructure/` | Anti-Corruption Layer adapter |
| `packages/*` | `packages/shared/*` | Yes | Shared types and events only |
| `packages/*/domain` | `packages/*/infrastructure` | **No** | Domain defines interfaces; infra implements |

## References

- Vision Document: Section 10 (Inviolable Decisions: Turborepo + pnpm workspaces; no direct cross-pillar imports)
- Vision Document: Section 9 (Priority 4: Extensibility; Priority 5: Maintainability)
- Vision Document: Section 10 (Known Constraints: team size 2–5 developers)
- Related ADRs: ADR-002 (Event Bus Technology), ADR-004 (Database Strategy)

## Derived Rules

- `architecture.mdc`: ARCH-001 — Strict layer separation (dependencies flow downward only)
- `architecture.mdc`: ARCH-002 — Dependency inversion (domain layer depends on abstractions)
- `architecture.mdc`: ARCH-003 — No direct cross-context database access; no direct cross-pillar imports
- `architecture.mdc`: ARCH-011 — Core Domains require rich domain models (not CRUD); this package structure enforces it structurally

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Confirmed against Vision Section 10 mandates; no alternatives viable given team size and Turborepo constraint |
