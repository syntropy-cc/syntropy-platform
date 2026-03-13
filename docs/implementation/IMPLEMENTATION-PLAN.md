# Implementation Plan — Syntropy Platform

> **Source of Truth**: This document governs all implementation. When it conflicts with BACKLOG.md, CURRENT-WORK.md, or PROGRESS-SUMMARY.md, this document wins.
> **Last Updated**: 2026-03-13
> **Total Work Items**: 262 (enumerated in Section 6; BACKLOG.md header lists 270 — an 8-item accounting discrepancy noted in Section 3)

---

## Section 0 — Current Focus

```
CURRENT STAGE : S5 — Event Bus Core
CURRENT ITEM  : COMP-009.2 — Event schema versioning system
MILESTONE     : M1 — Foundation + Walking Skeleton
STAGE PROGRESS: 0 / 7 items done (S5)
OVERALL       : 24 / 262 items done (9%)
```

**Next 5 items**:
1. `COMP-009.2` — Event schema versioning system ← **START HERE**
2. `COMP-009.3` — AppendOnlyLog PostgreSQL schema + migrations
3. `COMP-009.4` — ActorSignatureVerifier
4. `COMP-009.5` — CausalChainTracer
5. `COMP-009.6` — AppendOnlyLog repository (Postgres)

**Component record**: [`COMP-009`](./components/COMP-009-event-bus-audit.md)

**Next item (COMP-009.2) acceptance criteria**: `EventSchema` registry base class; schema version in event envelope; backward compatibility check; `SchemaRegistry.register(topic, schema, version)` stores schema.

**Suggested steps**: (1) Write `EventSchema` type with version field (2) Write `SchemaRegistry` in-memory store (3) Write compatibility check

---

## Section 1 — Purpose

This document is the single source of truth for implementing the Syntropy Platform. It translates architectural decisions (ADRs, component specs) into an ordered sequence of 262 concrete work items grouped into 56 stages across 5 milestones.

**How to use this document**:
- Read Section 0 to know exactly what to build next
- Read Section 4 to understand the milestone you are in
- Read Section 5 to see the full stage definition and verification criteria
- Read Section 7 to get acceptance criteria and implementation steps for the current item
- Update Section 0 after completing each item; update Section 8 after completing each stage

**Implementation sessions flow**:
```
Read Section 0 → read stage definition (Section 5) → read item catalog entry (Section 7)
→ read component record (linked from Section 7) → implement → run verification → update
```

---

## Section 2 — Strategic Vision

The Syntropy Platform is a **modular monolith** (Turborepo + pnpm workspaces) that implements the **Digital Institutions Protocol (DIP)** — a framework for creating persistent digital institutions with formal governance, value distribution, and artifact registries.

**Three Pillars**:
| Pillar | Purpose |
|--------|---------|
| **Learn** | Structured learning paths with creator tools, mentorship, and gamification |
| **Hub** | Open-source-style collaboration with institutional governance and IDE sessions |
| **Labs** | Scientific publishing with peer review, DOI issuance, and data provenance |

**Architecture**: Bounded contexts as workspace packages (`packages/*`), platform services as apps (`apps/*`), cross-cutting concerns as shared libraries.

**Design Principle**: Every item of knowledge, contribution, or research is a **DIP Artifact** — permanently recorded, governed, and composable.

---

## Section 3 — Baseline

### Architecture Status (at implementation start)

| Document | Status |
|----------|--------|
| Root ARCHITECTURE.md | ✅ Complete |
| All 40 component records | ✅ Complete |
| ADR-001 through ADR-009 | ✅ Complete |
| Context Map | ✅ Complete |
| Implementation backlog | ✅ Complete |

### Item Count Reconciliation

| Source | Count | Notes |
|--------|-------|-------|
| BACKLOG.md header | 270 | Header declaration |
| Sum of component records | 262 | Explicit enumeration used here |
| Discrepancy | 8 | Likely counting/merging artifacts in BACKLOG.md; Section 6 is authoritative |

### Technology Stack

| Concern | Technology |
|---------|------------|
| Language | TypeScript (strict mode) |
| Monorepo | Turborepo + pnpm workspaces |
| Web Framework | Next.js 14 (App Router) |
| API Server | Fastify |
| Database | PostgreSQL 15 + pgvector |
| Cache / Rate-limit | Redis 7 |
| Event Bus | Apache Kafka (KafkaJS) |
| Auth | Supabase Auth (wrapped with ACL) |
| Search | PostgreSQL FTS + pgvector semantic search |
| IDE | Monaco Editor + WebSocket + Kubernetes/Docker |
| Payments | Stripe |
| DOI | DataCite API |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki |
| Container | Docker Compose (dev) / Kubernetes (prod) |

---

## Section 4 — Milestones

### M1 — Foundation + Walking Skeleton
**Stages**: S1–S8 | **Items**: 45 | **Sessions**: 5–8

**Objective**: Working development environment with core infrastructure, Identity, Event Bus, REST API gateway shell, and Next.js app shells so the team can navigate to `/health` and `/login` in a browser on day one.

**Components**:
- COMP-001 Monorepo Infrastructure (complete)
- COMP-002 Identity Domain (partial: 002.1–002.7 complete)
- COMP-009 Event Bus & Audit (complete)
- COMP-033 REST API (partial: 033.1–033.3, 033.7)
- COMP-032 Web Application (partial: 032.1, 032.2)
- COMP-034 Background Services (partial: 034.1–034.5)
- COMP-037 Security (partial: 037.1, 037.3, 037.5, 037.6)
- COMP-038 Observability (partial: 038.1)
- COMP-039 Data Integrity (partial: 039.1, 039.3, 039.4)
- COMP-040 Resilience (partial: 040.1–040.4)

**Browser-Testable Verification**:
1. `http://localhost:3000` (apps/platform) — Next.js app loads, shows landing page stub
2. `http://localhost:3000/login` — Supabase Auth login form renders
3. `http://localhost:8080/health` (API) — `{ "status": "ok", "version": "..." }`
4. `http://localhost:8080/api/v1/auth/me` — returns `401 UNAUTHORIZED` (auth middleware active)
5. Kafka topics visible in Kafka UI (`http://localhost:9080`)

---

### M2 — Core: DIP + Platform Core + AI Foundation
**Stages**: S9–S25 | **Items**: 73 | **Sessions**: 10–18

**Objective**: Full DIP protocol live — artifacts can be published, smart contracts evaluated, governance proposals executed, and projects managed. Portfolio aggregation, search, and AI agent core (orchestration + registry) functional.

**Components**:
- COMP-003 DIP Artifact Registry (complete)
- COMP-004 DIP Smart Contract Engine (complete)
- COMP-005 DIP IACP Engine (complete)
- COMP-006 DIP Project Manifest & DAG (complete)
- COMP-007 DIP Institutional Governance (complete)
- COMP-008 DIP Value Distribution & Treasury (complete)
- COMP-010 Portfolio Aggregation (complete)
- COMP-011 Search & Recommendation (complete)
- COMP-012 AI Agents Orchestration (complete)
- COMP-013 AI Agents Registry (complete)

**Browser-Testable Verification**:
1. `POST /api/v1/artifacts` — creates artifact, returns Nostr-anchored record
2. `GET /api/v1/portfolios/{userId}` — returns computed portfolio with XP and achievements
3. `GET /api/v1/search?q=test` — returns full-text + semantic search results
4. `POST /api/v1/ai-agents/sessions` — creates AI agent session, returns session ID
5. `POST /api/v1/institutions` — creates `DigitalInstitution`, stores governance contract

---

### M3 — Pillars: Learn, Hub, Labs
**Stages**: S26–S41 | **Items**: 77 | **Sessions**: 15–22

**Objective**: All three pillars functionally complete. Learners can navigate content, creators can publish fragments, hub contributors can open issues and submit contributions, labs authors can write and submit articles for peer review.

**Components**:
- COMP-015 Learn Content Hierarchy (complete)
- COMP-016 Learn Fragment & Artifact Engine (complete)
- COMP-017 Learn Creator Tools & AI Copilot (complete)
- COMP-018 Learn Mentorship & Community (complete)
- COMP-019 Hub Collaboration Layer (partial: 019.1–019.5, 019.7, 019.8)
- COMP-020 Hub Institution Orchestration (complete)
- COMP-021 Hub Public Square (complete)
- COMP-022 Labs Scientific Context Extension (complete)
- COMP-023 Labs Article Editor (complete)
- COMP-024 Labs Experiment Design (complete)
- COMP-025 Labs Open Peer Review (complete)
- COMP-026 Labs DOI & External Publication (complete)
- COMP-032 Web Application (partial: 032.3, 032.4, 032.5)

**Browser-Testable Verification**:
1. `http://localhost:3001/learn` (apps/learn) — Career/Track/Course hierarchy renders with fog-of-war navigation
2. `http://localhost:3001/learn/fragments/{id}` — Fragment detail with progress tracking
3. `http://localhost:3002/hub` (apps/hub) — Project list, issue board renders
4. `http://localhost:3002/hub/issues/{id}` — Issue detail with contribution flow
5. `http://localhost:3003/labs` (apps/labs) — Article list with MyST rendered articles

---

### M4 — Supporting Domains + AI Pillar Tools
**Stages**: S42–S50 | **Items**: 41 | **Sessions**: 8–12

**Objective**: All supporting domains complete (Sponsorship, Communication, Planning, IDE Domain, Governance/Moderation) and AI pillar tool handlers wired to all three pillars. IDE sandbox fully operational.

**Components**:
- COMP-019 Hub Collaboration (partial: 019.6 — Sandbox Orchestrator)
- COMP-014 AI Agents Pillar Tools (complete)
- COMP-027 Sponsorship (complete)
- COMP-028 Communication (complete)
- COMP-029 Planning (complete)
- COMP-030 IDE Domain (complete)
- COMP-031 Governance & Moderation (complete)

**Browser-Testable Verification**:
1. `POST /api/v1/ai-agents/sessions/{id}/invoke` with Learn tool — AI responds using Learn domain data
2. `GET /api/v1/notifications` — returns user notifications list
3. `GET /api/v1/planning/tasks` — returns user task list
4. `POST /api/v1/ide/sessions` — provisions IDE container, returns session with WebSocket URL
5. `GET /api/v1/moderation/flags` — returns moderation queue (admin role required)

---

### M5 — Delivery: Full API, IDE Platform, Institutional Site, Observability
**Stages**: S51–S56 | **Items**: 26 | **Sessions**: 5–8

**Objective**: Production-ready delivery layer — all API routes registered, OpenAPI spec generated, IDE WebSocket gateway + Monaco Editor live, Institutional Site with ISR, and full observability stack (tracing, metrics, dashboards, alerting).

**Components**:
- COMP-033 REST API (partial: 033.4–033.6)
- COMP-032 Web Application (partial: 032.6–032.8)
- COMP-034 Background Services (partial: 034.6, 034.7)
- COMP-035 Embedded IDE Platform (complete)
- COMP-036 Institutional Site (complete)
- COMP-037 Security (partial: 037.2, 037.4)
- COMP-038 Observability (partial: 038.2–038.6)
- COMP-039 Data Integrity (partial: 039.5)

**Browser-Testable Verification**:
1. `GET /api/v1/openapi.json` — full OpenAPI 3.1 spec with all endpoints documented
2. `wss://localhost:8080/api/v1/ide/sessions/{id}/ws` — WebSocket upgrade succeeds, terminal stream active
3. `http://localhost:3002/hub/contribute/{id}/editor` — Monaco Editor loads with TypeScript LSP
4. `http://localhost:4000/institutions/{slug}` (apps/institutional-site) — ISR page renders in < 2.5s
5. `http://localhost:3000/metrics` (Grafana) — all dashboards show live data

---

## Section 5 — Stage Definitions

> Format: **Stage ID** — Name (Milestone) | Items | Sessions | Deps | Verification

---

### M1 — Foundation + Walking Skeleton (S1–S8)

---

#### S1 — Monorepo Scaffold (M1)
| Items | 5 | Sessions | 1 | Deps | None |
|-------|---|----------|---|------|------|

Items: `COMP-001.1`, `001.2`, `001.3`, `001.4`, `001.5`

**Verification**: `pnpm install` from repo root completes with no errors; `turbo run build` outputs green; `docker compose up` starts Postgres, Redis, Kafka, and Zookeeper.

---

#### S2 — Cross-Cutting Libraries (M1)
| Items | 8 | Sessions | 1–2 | Deps | S1 |
|-------|---|----------|-----|------|-----|

Items: `COMP-038.1`, `040.1`, `040.3`, `037.6`, `037.3`, `037.5`, `039.1`, `039.3`

**Verification**: `pnpm test --filter packages/platform-core` passes; logger outputs JSON with `correlation_id`; CircuitBreaker transitions correctly in unit tests; SoftDeletable mixin deletes by setting `deleted_at`.

---

#### S3 — Identity Core (M1)
| Items | 5 | Sessions | 1–2 | Deps | S2 |
|-------|---|----------|-----|------|-----|

Items: `COMP-002.1`, `002.2`, `002.3`, `002.4`, `039.4`

**Verification**: `pnpm test --filter packages/identity` passes; `User` aggregate creates with `ActorId`; `SupabaseAuthAdapter.verifyToken()` returns `IdentityToken` for a valid Supabase JWT; `AuditColumns` mixin sets `created_at`/`updated_at` automatically.

---

#### S4 — Infrastructure Bootstrap (M1)
| Items | 6 | Sessions | 1–2 | Deps | S3 |
|-------|---|----------|-----|------|-----|

Items: `COMP-040.2`, `040.4`, `034.1`, `034.2`, `009.1`, `033.1`

**Verification**: `pnpm --filter apps/workers dev` starts without errors; Kafka producer/consumer round-trip test passes; `GET http://localhost:8080/health` returns `200 OK`; RetryPolicy retries on transient errors in unit test.

---

#### S5 — Event Bus Core (M1)
| Items | 7 | Sessions | 2 | Deps | S4 |
|-------|---|----------|---|------|-----|

Items: `COMP-009.2`, `009.3`, `009.4`, `009.5`, `009.6`, `009.7`, `002.5`

**Verification**: Event published via `KafkaProducer` appears in `AppendOnlyLog` table within 2s; `ActorSignatureVerifier` rejects events with invalid actor signature; `IdentityEventPublisher` emits `identity.user.created` on user registration.

---

#### S6 — Event Bus Completion + Identity Finalization (M1)
| Items | 5 | Sessions | 1 | Deps | S5 |
|-------|---|----------|---|------|-----|

Items: `COMP-009.8`, `002.6`, `002.7`, `034.3`, `034.4`

**Verification**: `GET /api/v1/auth/me` with valid JWT returns user profile; `POST /api/v1/auth/login` issues session token; Schema registry rejects incompatible event schema versions; DLQ processor retries failed messages with exponential backoff.

---

#### S7 — Security + Resilience + Workers Foundation (M1)
| Items | 5 | Sessions | 1 | Deps | S6 |
|-------|---|----------|---|------|-----|

Items: `COMP-037.1`, `040.5`, `039.2`, `034.5`, `033.2`

**Verification**: `requirePermission('user', 'resource', 'action')` throws `ForbiddenError` for insufficient role; `BulkheadPattern` limits concurrent calls to configured maximum; `GET /workers/metrics` returns Prometheus metrics; `GET /api/v1/protected` with invalid token returns `401`.

---

#### S8 — Walking Skeleton UI (M1)
| Items | 4 | Sessions | 1 | Deps | S7 |
|-------|---|----------|---|------|-----|

Items: `COMP-033.3`, `033.7`, `032.2`, `032.1`

**Verification** (M1 complete): Navigate to `http://localhost:3000` — app loads. Navigate to `http://localhost:3000/login` — Supabase Auth login renders. Rate limiter returns `429` after burst threshold. `GET /health/ready` checks DB+Kafka+Redis connectivity.

---

### M2 — Core: DIP + Platform Core + AI Foundation (S9–S25)

---

#### S9 — DIP Artifact Registry Core (M2)
| Items | 5 | Sessions | 1–2 | Deps | S8 |
|-------|---|----------|-----|------|-----|

Items: `COMP-003.1`, `003.2`, `003.3`, `003.4`, `003.5`

**Verification**: `Artifact` aggregate persists to DB with UUID; `ArtifactLifecycleService.draft()` creates artifact in `draft` state; DIP package builds without errors.

---

#### S10 — DIP Artifact Registry Completion + AI Foundation Start (M2)
| Items | 4 | Sessions | 1 | Deps | S9 |
|-------|---|----------|---|------|-----|

Items: `COMP-003.6`, `003.7`, `003.8`, `012.1`

**Verification**: `POST /api/v1/artifacts` creates and returns artifact; Nostr anchor hash recorded; `UserContextModel` aggregate persists with user activity context.

---

#### S11 — DIP Smart Contract Engine (M2)
| Items | 6 | Sessions | 1–2 | Deps | S9 |
|-------|---|----------|-----|------|-----|

Items: `COMP-004.1`, `004.2`, `004.3`, `004.4`, `004.5`, `004.6`

**Verification**: `GovernanceContract` evaluates `TransparencyClause` and `ParticipationThreshold`; DSL parser rejects malformed contract; `SmartContractEvaluator.evaluate()` returns `EvaluationResult` with pass/fail per clause.

---

#### S12 — AI Agents Orchestration Core (M2)
| Items | 5 | Sessions | 1–2 | Deps | S10 |
|-------|---|----------|-----|------|------|

Items: `COMP-012.2`, `012.3`, `012.4`, `012.5`, `012.6`

**Verification**: `AgentSession` created and persisted; `LLMAdapter` calls OpenAI API (mocked in tests); `ToolRouter` resolves correct tool handler by name; `AgentOrchestrator.invoke()` returns `AgentResponse`.

---

#### S13 — AI Agents Orchestration Completion (M2)
| Items | 3 | Sessions | 1 | Deps | S12 |
|-------|---|----------|---|------|------|

Items: `COMP-012.7`, `012.8`, `013.1`

**Verification**: `POST /api/v1/ai-agents/sessions` creates session; streaming SSE response works for agent invocation; `AIAgentDefinition` registered in registry with tool list.

---

#### S14 — DIP Project Manifest & DAG (M2)
| Items | 5 | Sessions | 1–2 | Deps | S11 |
|-------|---|----------|-----|------|------|

Items: `COMP-006.1`, `006.2`, `006.3`, `006.4`, `006.5`

**Verification**: `DigitalProject` aggregate created with `ProjectManifest`; `DAGService.addEdge()` throws `CyclicDependencyError` for cyclic graphs; artifact DAG persists and retrieves correctly.

---

#### S15 — Project Manifest Completion + Agent Registry Core (M2)
| Items | 4 | Sessions | 1 | Deps | S13, S14 |
|-------|---|----------|---|------|----------|

Items: `COMP-006.6`, `013.2`, `013.3`, `013.4`

**Verification**: `GET /api/v1/projects/{id}` returns project with DAG; `ToolDefinition` stored with schema validation; `ToolPermissionEvaluator` rejects tool calls without required role.

---

#### S16 — Agent Registry Completion + IACP Start (M2)
| Items | 3 | Sessions | 1 | Deps | S15 |
|-------|---|----------|---|------|------|

Items: `COMP-013.5`, `005.1`, `005.2`

**Verification**: Agent registry API returns registered agents; `IACPEngine` package initializes; `IACPRecord` aggregate persists in `draft` state.

---

#### S17 — IACP Engine Core (M2)
| Items | 5 | Sessions | 1–2 | Deps | S16 |
|-------|---|----------|-----|------|------|

Items: `COMP-005.3`, `005.4`, `005.5`, `005.6`, `005.7`

**Verification**: `IACPStateMachine` transitions from `draft → pending_signatures → active`; multi-party signing collects `n-of-m` signatures; `IACPEngine.evaluate()` validates consensus threshold.

---

#### S18 — IACP Completion + Governance Start (M2)
| Items | 4 | Sessions | 1 | Deps | S17 |
|-------|---|----------|---|------|------|

Items: `COMP-005.8`, `007.1`, `007.2`, `007.3`

**Verification**: IACP API creates and retrieves records; `DigitalInstitution` aggregate initializes with governance contract; `Proposal` aggregate created in `open` state.

---

#### S19 — Institutional Governance Core (M2)
| Items | 5 | Sessions | 1–2 | Deps | S18 |
|-------|---|----------|-----|------|------|

Items: `COMP-007.4`, `007.5`, `007.6`, `007.7`, `007.8`

**Verification**: `VotingService.castVote()` validates eligibility and records vote; `GovernanceService.executeProposal()` enforces quorum before execution; `LegitimacyChain` events append in sequence.

---

#### S20 — Governance Completion + Treasury Start (M2)
| Items | 4 | Sessions | 1 | Deps | S19 |
|-------|---|----------|---|------|------|

Items: `COMP-007.9`, `008.1`, `008.2`, `008.3`

**Verification**: `GET /api/v1/institutions/{id}` returns institution with governance summary; `TreasuryAccount` aggregate tracks `AVUBalance`; `UsageRegistration` event records contribution.

---

#### S21 — Value Distribution & Treasury Core (M2)
| Items | 4 | Sessions | 1–2 | Deps | S20 |
|-------|---|----------|-----|------|------|

Items: `COMP-008.4`, `008.5`, `008.6`, `008.7`

**Verification**: `ValueDistributionService.compute()` distributes proportionally; oracle produces `LiquidationRate`; `TreasuryTransfer` records debit/credit correctly.

---

#### S22 — Treasury Completion + Portfolio Start (M2)
| Items | 4 | Sessions | 1 | Deps | S21 |
|-------|---|----------|---|------|------|

Items: `COMP-008.8`, `010.1`, `010.2`, `010.3`

**Verification**: `GET /api/v1/treasury/{institutionId}` returns balance and history; `Portfolio` aggregate built from events; XP calculation increases with published artifacts.

---

#### S23 — Portfolio Aggregation Core (M2)
| Items | 4 | Sessions | 1 | Deps | S22 |
|-------|---|----------|---|------|------|

Items: `COMP-010.4`, `010.5`, `010.6`, `010.7`

**Verification**: `SkillProfile` computed from contribution events; achievement unlocked when milestone reached; `PortfolioEventConsumer` processes events within 2s.

---

#### S24 — Portfolio Completion + Search Start (M2)
| Items | 4 | Sessions | 1 | Deps | S23 |
|-------|---|----------|---|------|------|

Items: `COMP-010.8`, `011.1`, `011.2`, `011.3`

**Verification**: `GET /api/v1/portfolios/{userId}` returns portfolio with XP, skills, reputation; `SearchIndex` entity created; FTS query returns ranked results; `tsvector` column populated.

---

#### S25 — Search & Recommendation Completion (M2)
| Items | 4 | Sessions | 1 | Deps | S24 |
|-------|---|----------|---|------|------|

Items: `COMP-011.4`, `011.5`, `011.6`, `011.7`

**Verification** (M2 complete): `GET /api/v1/search?q=machine+learning` returns semantic + FTS results; `GET /api/v1/recommendations/{userId}` returns personalized list; `RecommendationSet` refreshes on new artifact event.

---

### M3 — Pillars: Learn, Hub, Labs (S26–S41)

---

#### S26 — Learn Content Hierarchy (M3)
| Items | 6 | Sessions | 1–2 | Deps | S25 |
|-------|---|----------|-----|------|------|

Items: `COMP-015.1`, `015.2`, `015.3`, `015.4`, `015.5`, `015.6`

**Verification**: `Career → Track → Course` hierarchy persists; `FogOfWarNavigationService` unlocks next content on prerequisite completion; `GET /api/v1/learn/careers` returns hierarchical tree.

---

#### S27 — Learn Fragment & Artifact Engine Core (M3)
| Items | 5 | Sessions | 1–2 | Deps | S26 |
|-------|---|----------|-----|------|------|

Items: `COMP-016.1`, `016.2`, `016.3`, `016.4`, `016.5`

**Verification**: `Fragment` aggregate enforces IL1 invariant (at least one DIP artifact); `LearnerProgressRecord` created on fragment completion; artifact published to DIP on fragment publish.

---

#### S28 — Learn Fragment Completion + Learn Pages (M3)
| Items | 4 | Sessions | 1 | Deps | S27 |
|-------|---|----------|---|------|------|

Items: `COMP-016.6`, `016.7`, `016.8`, `032.3`

**Verification** (Learn pillar end-to-end): Navigate to `http://localhost:3001/learn/tracks/{id}` — track page loads with course list; click fragment — progress recorded; creator can submit fragment for review.

---

#### S29 — Learn Creator Tools (M3)
| Items | 6 | Sessions | 1–2 | Deps | S28 |
|-------|---|----------|-----|------|------|

Items: `COMP-017.1`, `017.2`, `017.3`, `017.4`, `017.5`, `017.6`

**Verification**: `CreatorWorkflow` progresses through 5 phases; `AIGeneratedDraft` created via AI copilot tool; `ApprovalRecord` stored on reviewer approval.

---

#### S30 — Learn Mentorship & Community (M3)
| Items | 5 | Sessions | 1–2 | Deps | S29 |
|-------|---|----------|-----|------|------|

Items: `COMP-018.1`, `018.2`, `018.3`, `018.4`, `018.5`

**Verification**: `MentorshipRelationship` created between mentor and learner; `MentorReview` submits feedback on fragment; `ArtifactGallery` read model returns published artifacts.

---

#### S31 — Hub Collaboration Core (M3)
| Items | 5 | Sessions | 1–2 | Deps | S28 |
|-------|---|----------|-----|------|------|

Items: `COMP-019.1`, `019.2`, `019.3`, `019.4`, `019.5`

**Verification**: `Issue` aggregate opens and transitions to `in_review`; `Contribution` aggregate links to Issue; `ContributionSandbox` aggregate created (without container, container wired in M4); DIP artifact published on contribution merge.

---

#### S32 — Hub Collaboration Completion + Institution Start (M3)
| Items | 5 | Sessions | 1 | Deps | S31 |
|-------|---|----------|---|------|------|

Items: `COMP-019.7`, `019.8`, `020.1`, `020.2`, `020.3`

**Verification**: `GET /api/v1/hub/issues` returns issue list; `ContractTemplate` entity stored; `InstitutionCreationWorkflow` processes initiation event; `InstitutionProfile` read model created.

---

#### S33 — Hub Institution Orchestration Completion (M3)
| Items | 4 | Sessions | 1 | Deps | S32 |
|-------|---|----------|---|------|------|

Items: `COMP-020.4`, `020.5`, `020.6`, `021.1`

**Verification**: `GET /api/v1/hub/institutions/{id}` returns institution profile; `InstitutionOrchestrationService` triggers DIP governance contract; `DiscoveryDocument` built from institution events.

---

#### S34 — Hub Public Square + Hub Pages (M3)
| Items | 5 | Sessions | 1 | Deps | S33 |
|-------|---|----------|---|------|------|

Items: `COMP-021.2`, `021.3`, `021.4`, `021.5`, `032.4`

**Verification** (Hub pillar end-to-end): `GET /api/v1/hub/discover` returns `DiscoveryDocument` list ranked by prominence; `ProminenceScorer.score()` computes weighted prominence; navigate to `http://localhost:3002/hub/discover` — public square renders.

---

#### S35 — Labs Scientific Context (M3)
| Items | 5 | Sessions | 1–2 | Deps | S28 |
|-------|---|----------|-----|------|------|

Items: `COMP-022.1`, `022.2`, `022.3`, `022.4`, `022.5`

**Verification**: `SubjectArea` taxonomy persists hierarchically; `ResearchMethodology` entity stored; `HypothesisRecord` created with status `proposed`; Labs package builds without errors.

---

#### S36 — Labs Article Editor Core (M3)
| Items | 5 | Sessions | 1–2 | Deps | S35 |
|-------|---|----------|-----|------|------|

Items: `COMP-023.1`, `023.2`, `023.3`, `023.4`, `023.5`

**Verification**: `ScientificArticle` aggregate created with MyST Markdown content; `ArticleVersion` snapshot stored; MyST rendered to HTML in tests; article DIP artifact published.

---

#### S37 — Article Completion + Experiment Start (M3)
| Items | 4 | Sessions | 1 | Deps | S36 |
|-------|---|----------|---|------|------|

Items: `COMP-023.6`, `023.7`, `023.8`, `024.1`

**Verification**: `GET /api/v1/labs/articles/{id}` returns article with versions; submission workflow transitions correctly; `ExperimentDesign` aggregate created with hypothesis link.

---

#### S38 — Experiment Design (M3)
| Items | 5 | Sessions | 1–2 | Deps | S37 |
|-------|---|----------|-----|------|------|

Items: `COMP-024.2`, `024.3`, `024.4`, `024.5`, `024.6`

**Verification**: `ExperimentResult` stored with `AnonymizationPolicyEnforcer` applied; `AnonymizationPolicyEnforcer.enforce()` redacts PII fields; `GET /api/v1/labs/experiments/{id}` returns experiment data.

---

#### S39 — Peer Review Core (M3)
| Items | 5 | Sessions | 1–2 | Deps | S38 |
|-------|---|----------|-----|------|------|

Items: `COMP-025.1`, `025.2`, `025.3`, `025.4`, `025.5`

**Verification**: `Review` aggregate created and linked to article; `ReviewPassageLink` attaches review to specific article passage; `AuthorResponse` responds to review comment; `ReviewVisibilityEvaluator` enforces blind review policy.

---

#### S40 — Peer Review Completion + DOI Start (M3)
| Items | 4 | Sessions | 1 | Deps | S39 |
|-------|---|----------|---|------|------|

Items: `COMP-025.6`, `025.7`, `026.1`, `026.2`

**Verification**: `GET /api/v1/labs/articles/{id}/reviews` returns review list with visibility enforced; `DOIRecord` entity created; `DataCiteAdapter.register()` mock succeeds in test.

---

#### S41 — DOI Completion + Labs Pages (M3)
| Items | 4 | Sessions | 1 | Deps | S40 |
|-------|---|----------|---|------|------|

Items: `COMP-026.3`, `026.4`, `026.5`, `032.5`

**Verification** (Labs pillar end-to-end): `GET /api/v1/labs/articles/{id}/doi` returns registered DOI; `ExternalIndexingNotifier` sends submission to CrossRef; navigate to `http://localhost:3003/labs/articles/{id}` — article renders with MyST content and review status.

---

### M4 — Supporting Domains + AI Pillar Tools (S42–S50)

---

#### S42 — Sponsorship Core (M4)
| Items | 5 | Sessions | 1–2 | Deps | S41 |
|-------|---|----------|-----|------|------|

Items: `COMP-027.1`, `027.2`, `027.3`, `027.4`, `027.5`

**Verification**: `Sponsorship` aggregate created between sponsor and sponsored; `StripePaymentAdapter.createPaymentIntent()` calls Stripe API (mock); `ImpactMetric` computed from artifact events.

---

#### S43 — Sponsorship Completion + Communication Start (M4)
| Items | 4 | Sessions | 1 | Deps | S42 |
|-------|---|----------|---|------|------|

Items: `COMP-027.6`, `027.7`, `028.1`, `028.2`

**Verification**: `GET /api/v1/sponsorships` returns sponsorship list; `Thread` aggregate created with participants; `Message` entity stored.

---

#### S44 — Communication Core (M4)
| Items | 5 | Sessions | 1–2 | Deps | S43 |
|-------|---|----------|-----|------|------|

Items: `COMP-028.3`, `028.4`, `028.5`, `028.6`, `028.7`

**Verification**: `NotificationEventConsumer` processes `artifact.published` event and creates notification; `GET /api/v1/notifications` returns notification list; SSE stream delivers notification within 3s of event; user preferences disable/enable notification types.

---

#### S45 — Planning Core (M4)
| Items | 5 | Sessions | 1–2 | Deps | S44 |
|-------|---|----------|-----|------|------|

Items: `COMP-029.1`, `029.2`, `029.3`, `029.4`, `029.5`

**Verification**: `Task` aggregate created and transitions to `done`; `Sprint` groups tasks with date range; `StudyPlan` generates suggested learning path; `MentorSession` scheduled between mentor and learner.

---

#### S46 — Planning Completion + IDE Domain Start (M4)
| Items | 4 | Sessions | 1 | Deps | S45 |
|-------|---|----------|---|------|------|

Items: `COMP-029.6`, `030.1`, `030.2`, `030.3`

**Verification**: `GET /api/v1/planning/goals` returns user goals with progress; `IDESession` aggregate created in `pending` state; `Container` value object stores resource allocation; `ResourceQuotaEnforcer` rejects session if user quota exceeded.

---

#### S47 — IDE Domain Core (M4)
| Items | 5 | Sessions | 1–2 | Deps | S46 |
|-------|---|----------|-----|------|------|

Items: `COMP-030.4`, `030.5`, `030.6`, `030.7`, `030.8`

**Verification**: `IDESession.start()` triggers `ContainerProvisioned` event; `WorkspaceSnapshot` stores file state; `ArtifactPublishBridge` publishes IDE output as DIP artifact; `GET /api/v1/ide/sessions/{id}` returns session status.

---

#### S48 — Sandbox Orchestrator + AI Pillar Tools Core (M4)
| Items | 4 | Sessions | 1–2 | Deps | S47 |
|-------|---|----------|-----|------|------|

Items: `COMP-019.6`, `014.1`, `014.2`, `014.3`

**Verification**: `ContributionSandboxOrchestrator.provision()` calls IDE Domain (now available); Learn AI tool queries fragment data; Hub AI tool retrieves issue context; Labs AI tool returns article metadata.

---

#### S49 — AI Pillar Tools Completion (M4)
| Items | 4 | Sessions | 1 | Deps | S48 |
|-------|---|----------|---|------|------|

Items: `COMP-014.4`, `014.5`, `014.6`, `031.1`

**Verification**: Cross-pillar AI tool synthesizes cross-domain context; system prompts loaded for all 12 agents; IDE tool handler can list/read files in active IDE session; `ModerationFlag` aggregate created.

---

#### S50 — Governance & Moderation (M4)
| Items | 5 | Sessions | 1–2 | Deps | S49 |
|-------|---|----------|-----|------|------|

Items: `COMP-031.2`, `031.3`, `031.4`, `031.5`, `031.6`

**Verification** (M4 complete): `ModerationAction` records moderator decision; `PlatformPolicy` evaluated against flagged content; `CommunityProposal` transitions through voting lifecycle; `GET /api/v1/moderation/flags` returns queue (admin only); `POST /api/v1/ai-agents/sessions/{id}/invoke` with IDE tool returns file listing from active container.

---

### M5 — Delivery (S51–S56)

---

#### S51 — Full API Route Registration + Security Hardening (M5)
| Items | 5 | Sessions | 1–2 | Deps | S50 |
|-------|---|----------|-----|------|------|

Items: `COMP-033.4`, `033.5`, `033.6`, `037.2`, `037.4`

**Verification**: `GET /api/v1/openapi.json` returns full spec with all domain routes; `GET /api/v1/docs` shows Swagger UI; all routes include auth middleware; `Strict-Transport-Security` header present; mTLS certificates loaded for `/internal/*` routes.

---

#### S52 — Web Application Completion + IDE Supervisor (M5)
| Items | 4 | Sessions | 1 | Deps | S51 |
|-------|---|----------|---|------|------|

Items: `COMP-032.6`, `032.7`, `032.8`, `034.6`

**Verification**: Admin dashboard pages render (role-gated); API proxy routes correctly to REST API; error boundary catches and displays domain-specific error pages; IDE session supervisor suspends sessions inactive > 30min.

---

#### S53 — IDE Platform: Monaco + WebSocket + K8s (M5)
| Items | 5 | Sessions | 2–3 | Deps | S52 |
|-------|---|----------|-----|------|------|

Items: `COMP-034.7`, `035.1`, `035.2`, `035.3`, `035.4`

**Verification**: Monaco Editor loads in `http://localhost:3002/hub/contribute/{id}/editor` with TypeScript LSP; WebSocket upgrade succeeds on `/api/v1/ide/sessions/{id}/ws`; K8s Pod (or Docker container) provisioned on `POST /api/v1/ide/sessions`; session reconnects within 5min window.

---

#### S54 — IDE Workspace Persistence + Institutional Site (M5)
| Items | 4 | Sessions | 1 | Deps | S53 |
|-------|---|----------|---|------|------|

Items: `COMP-035.5`, `035.6`, `036.1`, `036.2`

**Verification**: Container images build with `docker build`; workspace auto-saves every 2min; `http://localhost:4000/institutions/{slug}` renders institution page from ISR; institution components (`InstitutionHero`, `GovernanceSummary`) render correctly.

---

#### S55 — Institutional Site + Observability Core (M5)
| Items | 4 | Sessions | 1 | Deps | S54 |
|-------|---|----------|---|------|------|

Items: `COMP-036.3`, `036.4`, `038.2`, `038.3`

**Verification**: OpenGraph tags present in page `<head>`; `sitemap.xml` returns institution slugs; LCP < 2.5s in Lighthouse; `X-Correlation-ID` header propagated in all downstream calls; Jaeger (dev) shows trace spans for a full request.

---

#### S56 — Observability Completion (M5)
| Items | 4 | Sessions | 1 | Deps | S55 |
|-------|---|----------|---|------|------|

Items: `COMP-038.4`, `038.5`, `038.6`, `039.5`

**Verification** (M5 complete — ALL DONE): `GET /api/metrics` returns Prometheus metrics with `http_request_duration_seconds`; Grafana Platform Overview dashboard shows live request rate; Loki in Grafana Explore shows logs searchable by `correlation_id`; data retention policy deletes records older than configured window.

---

## Section 6 — Work Items in Topological Order

> Complete flat list of all 262 items. No item appears before its dependencies. Use this list to verify ordering and find item positions.

```
  1. COMP-001.1  — Initialize Turborepo + pnpm workspaces                [S1, Critical, S]
  2. COMP-001.2  — TypeScript project references and shared tsconfig      [S1, Critical, S]
  3. COMP-001.3  — Docker Compose local infrastructure                    [S1, Critical, M]
  4. COMP-001.4  — CI/CD pipeline (GitHub Actions)                       [S1, Critical, M]
  5. COMP-001.5  — Dev environment scripts and documentation              [S1, High, S]
  6. COMP-038.1  — Structured logger library                             [S2, Critical, S]
  7. COMP-040.1  — CircuitBreaker implementation                         [S2, Critical, S]
  8. COMP-040.3  — TimeoutWrapper utility                                [S2, High, S]
  9. COMP-037.6  — Secret management configuration                       [S2, Critical, S]
 10. COMP-037.3  — Data encryption for classified fields                 [S2, Critical, S]
 11. COMP-037.5  — SAST and dependency vulnerability scanning in CI      [S2, High, S]
 12. COMP-039.1  — SoftDeletable mixin                                   [S2, Critical, S]
 13. COMP-039.3  — PostgreSQL AppendOnlyLog implementation               [S2, High, S]
 14. COMP-002.1  — Identity package setup and User aggregate             [S3, Critical, S]
 15. COMP-002.2  — RBACRole, Permission, Role entities                   [S3, Critical, S]
 16. COMP-002.3  — Session aggregate and IdentityToken value object      [S3, Critical, S]
 17. COMP-002.4  — SupabaseAuthAdapter (ACL)                             [S3, Critical, M]
 18. COMP-039.4  — AuditColumns mixin                                    [S3, High, S]
 19. COMP-040.2  — RetryPolicy with exponential backoff                  [S4, Critical, S]
 20. COMP-040.4  — BulkheadPattern (semaphore concurrency limiter)       [S4, High, S]
 21. COMP-034.1  — Background services process setup + worker registry   [S4, Critical, S]
 22. COMP-034.2  — Kafka consumer worker bootstrapping                   [S4, Critical, M]
 23. COMP-009.1  — Kafka client package setup                            [S4, Critical, S]
 24. COMP-033.1  — REST API server setup and middleware stack            [S4, Critical, S]
 25. COMP-009.2  — Event schema versioning system                        [S5, Critical, S]
 26. COMP-009.3  — AppendOnlyLog PostgreSQL schema + migrations          [S5, Critical, S]
 27. COMP-009.4  — ActorSignatureVerifier                                [S5, High, S]
 28. COMP-009.5  — CausalChainTracer                                     [S5, High, S]
 29. COMP-009.6  — AppendOnlyLog repository (Postgres)                  [S5, High, S]
 30. COMP-009.7  — AppendOnlyLog Kafka consumer writer                   [S5, High, M]
 31. COMP-002.5  — IdentityEventPublisher (Kafka)                        [S5, High, S]
 32. COMP-009.8  — Schema registry API                                   [S6, Medium, S]
 33. COMP-002.6  — Identity REST API endpoints                           [S6, Critical, M]
 34. COMP-002.7  — Session Kafka consumer                                [S6, High, S]
 35. COMP-034.3  — DLQ processor                                         [S6, High, S]
 36. COMP-034.4  — Scheduled job runner                                  [S6, High, S]
 37. COMP-037.1  — RBAC enforcement library                              [S7, Critical, S]
 38. COMP-040.5  — Resilience integration tests                          [S7, High, S]
 39. COMP-039.2  — AppendOnlyLog abstract interface                      [S7, High, S]
 40. COMP-034.5  — Prometheus metrics and health endpoints (workers)     [S7, High, S]
 41. COMP-033.2  — Auth middleware and token verification                [S7, Critical, S]
 42. COMP-033.3  — Rate limiting middleware                              [S8, High, S]
 43. COMP-033.7  — Health check and server info endpoints                [S8, High, XS]
 44. COMP-032.2  — Auth Provider integration (Supabase UI)              [S8, Critical, M]
 45. COMP-032.1  — Next.js app scaffolding and design system            [S8, Critical, M]
 46. COMP-003.1  — DIP package setup + Artifact aggregate               [S9, Critical, S]
 47. COMP-003.2  — ArtifactLifecycleService                             [S9, Critical, M]
 48. COMP-003.3  — NostrAnchor integration                               [S9, High, S]
 49. COMP-003.4  — ArtifactRepository (Postgres)                        [S9, High, S]
 50. COMP-003.5  — ArtifactEventPublisher                                [S9, High, S]
 51. COMP-003.6  — Artifact query service                                [S10, High, S]
 52. COMP-003.7  — Artifact REST API endpoints                           [S10, High, M]
 53. COMP-003.8  — Integration tests for Artifact Registry              [S10, High, M]
 54. COMP-012.1  — AI agents package setup + UserContextModel aggregate  [S10, Critical, S]
 55. COMP-004.1  — Smart Contract Engine package setup                   [S11, Critical, S]
 56. COMP-004.2  — GovernanceContract aggregate + clause value objects   [S11, Critical, M]
 57. COMP-004.3  — SmartContractEvaluator                                [S11, Critical, M]
 58. COMP-004.4  — Contract DSL parser                                   [S11, High, M]
 59. COMP-004.5  — ContractRepository (Postgres)                        [S11, High, S]
 60. COMP-004.6  — Smart Contract API + integration tests                [S11, High, S]
 61. COMP-012.2  — AgentSession aggregate                                [S12, Critical, S]
 62. COMP-012.3  — LLMAdapter (OpenAI)                                   [S12, Critical, M]
 63. COMP-012.4  — ToolRouter                                            [S12, Critical, S]
 64. COMP-012.5  — ContextModelUpdater                                   [S12, High, S]
 65. COMP-012.6  — AgentOrchestrator                                     [S12, Critical, M]
 66. COMP-012.7  — AgentRepository + AgentEventPublisher                 [S13, High, S]
 67. COMP-012.8  — AI Agents REST API endpoints                          [S13, High, M]
 68. COMP-013.1  — Agent Registry package setup + AIAgentDefinition     [S13, Critical, S]
 69. COMP-006.1  — DIP Project package setup + DigitalProject aggregate  [S14, Critical, S]
 70. COMP-006.2  — ProjectManifest value object                          [S14, Critical, S]
 71. COMP-006.3  — DAGService (acyclicity enforcement)                   [S14, Critical, M]
 72. COMP-006.4  — ProjectRepository (Postgres)                         [S14, High, S]
 73. COMP-006.5  — Project event publisher                               [S14, High, S]
 74. COMP-006.6  — Project REST API endpoints + integration tests        [S15, High, M]
 75. COMP-013.2  — ToolDefinition entity + schema validation             [S15, Critical, S]
 76. COMP-013.3  — ToolPermissionEvaluator                               [S15, Critical, S]
 77. COMP-013.4  — Agent Registry REST API (register, list, get)         [S15, High, S]
 78. COMP-013.5  — Agent Registry integration tests                      [S16, High, S]
 79. COMP-005.1  — IACP Engine package setup + IACPRecord aggregate     [S16, Critical, S]
 80. COMP-005.2  — IACPParty value object + multi-party signing setup    [S16, Critical, S]
 81. COMP-005.3  — IACPStateMachine (draft→pending→active→terminated)   [S17, Critical, M]
 82. COMP-005.4  — SignatureCollector (n-of-m threshold logic)           [S17, Critical, M]
 83. COMP-005.5  — IACPEngine.evaluate() consensus check                 [S17, Critical, M]
 84. COMP-005.6  — IACPRepository (Postgres)                            [S17, High, S]
 85. COMP-005.7  — IACPEventPublisher (Kafka)                            [S17, High, S]
 86. COMP-005.8  — IACP REST API endpoints + integration tests           [S18, High, M]
 87. COMP-007.1  — DIP Governance package setup + DigitalInstitution    [S18, Critical, M]
 88. COMP-007.2  — Proposal aggregate                                    [S18, Critical, S]
 89. COMP-007.3  — VotingService                                         [S18, Critical, M]
 90. COMP-007.4  — GovernanceService.executeProposal()                   [S19, Critical, M]
 91. COMP-007.5  — LegitimacyChain event chain                           [S19, Critical, M]
 92. COMP-007.6  — GovernanceRepository (Postgres)                      [S19, High, S]
 93. COMP-007.7  — GovernanceEventPublisher (Kafka)                      [S19, High, S]
 94. COMP-007.8  — Governance query service + read models                [S19, High, S]
 95. COMP-007.9  — Governance REST API endpoints + integration tests     [S20, High, M]
 96. COMP-008.1  — Value Distribution package setup + TreasuryAccount   [S20, Critical, S]
 97. COMP-008.2  — UsageRegistration event consumer                      [S20, Critical, S]
 98. COMP-008.3  — AVU accounting (debit/credit)                         [S20, Critical, M]
 99. COMP-008.4  — ValueDistributionService.compute()                    [S21, Critical, M]
100. COMP-008.5  — Liquidation oracle integration                        [S21, High, M]
101. COMP-008.6  — TreasuryTransfer aggregate                            [S21, High, S]
102. COMP-008.7  — TreasuryRepository (Postgres)                        [S21, High, S]
103. COMP-008.8  — Treasury REST API endpoints + integration tests       [S22, High, M]
104. COMP-010.1  — Platform-core package setup + Portfolio aggregate     [S22, Critical, S]
105. COMP-010.2  — XP calculation engine                                 [S22, Critical, M]
106. COMP-010.3  — AchievementService                                    [S22, High, M]
107. COMP-010.4  — SkillProfile computation                              [S23, High, M]
108. COMP-010.5  — ReputationScore calculation                           [S23, High, M]
109. COMP-010.6  — PortfolioEventConsumer (Kafka)                        [S23, High, S]
110. COMP-010.7  — PortfolioRepository (Postgres)                       [S23, High, S]
111. COMP-010.8  — Portfolio REST API endpoints + integration tests      [S24, High, M]
112. COMP-011.1  — Search package setup + SearchIndex entity             [S24, Critical, S]
113. COMP-011.2  — Full-text search implementation (tsvector)            [S24, Critical, M]
114. COMP-011.3  — EventIndexingConsumer (Kafka)                         [S24, High, S]
115. COMP-011.4  — Semantic search (pgvector embeddings)                 [S25, High, L]
116. COMP-011.5  — RecommendationSet computation                         [S25, High, M]
117. COMP-011.6  — SearchRepository (Postgres)                          [S25, High, S]
118. COMP-011.7  — Search & Recommendation REST API                      [S25, High, M]
119. COMP-015.1  — Learn package setup + Career aggregate                [S26, Critical, S]
120. COMP-015.2  — Track and Course entities                             [S26, Critical, S]
121. COMP-015.3  — FogOfWarNavigationService                             [S26, Critical, M]
122. COMP-015.4  — PrerequisiteEvaluator                                 [S26, High, S]
123. COMP-015.5  — ContentHierarchyRepository (Postgres)                [S26, High, S]
124. COMP-015.6  — Content hierarchy REST API endpoints                  [S26, High, M]
125. COMP-016.1  — Fragment aggregate (IL1 invariant)                    [S27, Critical, M]
126. COMP-016.2  — Artifact content types (Video, Text, Code, Quiz)     [S27, Critical, M]
127. COMP-016.3  — LearnerProgressRecord                                 [S27, Critical, M]
128. COMP-016.4  — DIP artifact publication bridge                       [S27, High, S]
129. COMP-016.5  — FragmentRepository (Postgres)                        [S27, High, S]
130. COMP-016.6  — Fragment review workflow                              [S28, High, M]
131. COMP-016.7  — Fragment REST API endpoints                           [S28, High, M]
132. COMP-016.8  — Fragment integration tests                            [S28, High, M]
133. COMP-032.3  — Learn pillar Next.js pages                            [S28, High, M]
134. COMP-017.1  — CreatorWorkflow aggregate (5-phase lifecycle)         [S29, High, M]
135. COMP-017.2  — AIGeneratedDraft (AI Copilot integration)             [S29, High, M]
136. COMP-017.3  — ApprovalRecord and review workflow                    [S29, High, S]
137. COMP-017.4  — CreatorRepository (Postgres)                         [S29, Medium, S]
138. COMP-017.5  — Creator Tools REST API                                [S29, High, M]
139. COMP-017.6  — Creator Tools integration tests                       [S29, High, M]
140. COMP-018.1  — MentorshipRelationship aggregate                      [S30, High, M]
141. COMP-018.2  — MentorReview entity                                   [S30, High, S]
142. COMP-018.3  — ArtifactGallery read model                            [S30, High, S]
143. COMP-018.4  — MentorshipRepository (Postgres)                      [S30, Medium, S]
144. COMP-018.5  — Mentorship REST API + integration tests               [S30, High, M]
145. COMP-019.1  — Issue aggregate                                       [S31, Critical, M]
146. COMP-019.2  — Contribution aggregate                                [S31, Critical, M]
147. COMP-019.3  — ContributionSandbox aggregate (business logic only)  [S31, Critical, M]
148. COMP-019.4  — DIPContributionAdapter (ACL)                          [S31, High, S]
149. COMP-019.5  — ContributionIntegrationService                        [S31, High, M]
150. COMP-019.7  — CollaborationRepository (Postgres)                   [S32, High, S]
151. COMP-019.8  — Collaboration REST API endpoints                      [S32, High, M]
152. COMP-020.1  — ContractTemplate entity                               [S32, High, S]
153. COMP-020.2  — InstitutionCreationWorkflow aggregate                 [S32, Critical, M]
154. COMP-020.3  — InstitutionProfile read model                         [S32, High, S]
155. COMP-020.4  — InstitutionOrchestrationService                       [S33, Critical, M]
156. COMP-020.5  — InstitutionRepository (Postgres)                     [S33, High, S]
157. COMP-020.6  — Institution Orchestration REST API                    [S33, High, M]
158. COMP-021.1  — DiscoveryDocument read model                          [S33, High, M]
159. COMP-021.2  — ProminenceScorer                                      [S34, High, M]
160. COMP-021.3  — PublicSquareIndexer (Kafka consumer)                  [S34, High, S]
161. COMP-021.4  — DiscoveryRepository (Postgres)                       [S34, Medium, S]
162. COMP-021.5  — Public Square REST API                                [S34, High, S]
163. COMP-032.4  — Hub pillar Next.js pages                              [S34, High, M]
164. COMP-022.1  — Labs package setup + SubjectArea taxonomy             [S35, Critical, S]
165. COMP-022.2  — ResearchMethodology entity                            [S35, High, S]
166. COMP-022.3  — HypothesisRecord aggregate                            [S35, High, S]
167. COMP-022.4  — ScientificContextRepository (Postgres)               [S35, High, S]
168. COMP-022.5  — Scientific Context REST API                           [S35, High, S]
169. COMP-023.1  — ScientificArticle aggregate with MyST Markdown        [S36, Critical, M]
170. COMP-023.2  — ArticleVersion snapshot                               [S36, Critical, S]
171. COMP-023.3  — MyST-to-HTML renderer                                 [S36, Critical, M]
172. COMP-023.4  — Article DIP artifact publication                      [S36, High, S]
173. COMP-023.5  — ArticleRepository (Postgres)                         [S36, High, S]
174. COMP-023.6  — Article submission workflow                           [S37, High, M]
175. COMP-023.7  — Article REST API endpoints                            [S37, High, M]
176. COMP-023.8  — Article integration tests                             [S37, High, M]
177. COMP-024.1  — ExperimentDesign aggregate                            [S37, High, S]
178. COMP-024.2  — ExperimentResult entity                               [S38, High, S]
179. COMP-024.3  — AnonymizationPolicyEnforcer                           [S38, Critical, M]
180. COMP-024.4  — ExperimentRepository (Postgres)                      [S38, High, S]
181. COMP-024.5  — Experiment Design REST API                            [S38, High, M]
182. COMP-024.6  — Experiment integration tests                          [S38, High, M]
183. COMP-025.1  — Review aggregate                                      [S39, Critical, M]
184. COMP-025.2  — ReviewPassageLink value object                        [S39, High, S]
185. COMP-025.3  — AuthorResponse entity                                 [S39, High, S]
186. COMP-025.4  — ReviewVisibilityEvaluator                             [S39, Critical, M]
187. COMP-025.5  — ReviewRepository (Postgres)                          [S39, High, S]
188. COMP-025.6  — Review publication scheduler                          [S40, High, S]
189. COMP-025.7  — Peer Review REST API                                  [S40, High, M]
190. COMP-026.1  — DOIRecord entity                                      [S40, High, S]
191. COMP-026.2  — DataCiteAdapter                                       [S40, High, M]
192. COMP-026.3  — DOIRegistrationService                                [S41, High, M]
193. COMP-026.4  — ExternalIndexingNotifier                              [S41, Medium, S]
194. COMP-026.5  — DOI REST API + integration tests                      [S41, High, M]
195. COMP-032.5  — Labs pillar Next.js pages                             [S41, High, M]
196. COMP-027.1  — Sponsorship package setup + Sponsorship aggregate     [S42, High, S]
197. COMP-027.2  — StripePaymentAdapter                                  [S42, High, M]
198. COMP-027.3  — ImpactMetric computation                              [S42, Medium, M]
199. COMP-027.4  — SponsorshipRepository (Postgres)                     [S42, Medium, S]
200. COMP-027.5  — SponsorshipEventPublisher (Kafka)                     [S42, Medium, S]
201. COMP-027.6  — Sponsorship REST API                                  [S43, High, M]
202. COMP-027.7  — Sponsorship integration tests                         [S43, Medium, M]
203. COMP-028.1  — Communication package setup + Thread aggregate        [S43, Critical, S]
204. COMP-028.2  — Message entity                                        [S43, Critical, S]
205. COMP-028.3  — NotificationEventConsumer (Kafka)                     [S44, Critical, M]
206. COMP-028.4  — Notification delivery service                         [S44, High, M]
207. COMP-028.5  — User notification preferences                         [S44, High, S]
208. COMP-028.6  — Communication REST API                                [S44, High, M]
209. COMP-028.7  — SSE stream for real-time notifications                [S44, High, M]
210. COMP-029.1  — Task aggregate                                        [S45, High, S]
211. COMP-029.2  — Goal and Sprint entities                              [S45, High, S]
212. COMP-029.3  — StudyPlan aggregate                                   [S45, High, M]
213. COMP-029.4  — MentorSession scheduling                              [S45, High, S]
214. COMP-029.5  — PlanningRepository (Postgres)                        [S45, Medium, S]
215. COMP-029.6  — Planning REST API + integration tests                 [S46, High, M]
216. COMP-030.1  — IDE package setup + IDESession aggregate              [S46, Critical, S]
217. COMP-030.2  — Container value object + ContainerOrchestrator iface  [S46, Critical, S]
218. COMP-030.3  — ResourceQuotaEnforcer                                 [S46, Critical, M]
219. COMP-030.4  — WorkspaceSnapshot entity                              [S47, High, S]
220. COMP-030.5  — ArtifactPublishBridge                                 [S47, High, S]
221. COMP-030.6  — IDE session provisioning service                      [S47, Critical, M]
222. COMP-030.7  — IDERepository (Postgres)                             [S47, High, S]
223. COMP-030.8  — IDE Domain REST API                                   [S47, High, M]
224. COMP-019.6  — ContributionSandboxOrchestrator                       [S48, High, M]
225. COMP-014.1  — Learn AI tool handlers                                [S48, High, M]
226. COMP-014.2  — Hub AI tool handlers                                  [S48, High, M]
227. COMP-014.3  — Labs AI tool handlers                                 [S48, High, M]
228. COMP-014.4  — Cross-pillar AI tool handlers                         [S49, High, M]
229. COMP-014.5  — AI agent system prompts                               [S49, High, M]
230. COMP-014.6  — IDE tool handler                                      [S49, High, M]
231. COMP-031.1  — Gov/Mod package setup + ModerationFlag aggregate     [S49, Critical, S]
232. COMP-031.2  — ModerationAction entity                               [S50, Critical, S]
233. COMP-031.3  — PlatformPolicy aggregate                              [S50, Critical, M]
234. COMP-031.4  — ContentPolicyEvaluator                                [S50, Critical, M]
235. COMP-031.5  — CommunityProposal aggregate                           [S50, High, M]
236. COMP-031.6  — Governance & Moderation REST API                      [S50, High, M]
237. COMP-033.4  — Route registration for all domain packages            [S51, Critical, M]
238. COMP-033.5  — API versioning strategy                               [S51, High, S]
239. COMP-033.6  — OpenAPI spec generation                               [S51, Medium, S]
240. COMP-037.2  — API security headers and CSP                          [S51, High, S]
241. COMP-037.4  — mTLS configuration for internal services              [S51, High, S]
242. COMP-032.6  — Admin dashboard pages                                 [S52, High, M]
243. COMP-032.7  — API proxy and route handlers                          [S52, Critical, M]
244. COMP-032.8  — Error boundaries and domain error pages               [S52, High, S]
245. COMP-034.6  — IDE session inactivity supervisor                     [S52, High, S]
246. COMP-034.7  — Integration tests for all workers                     [S53, High, M]
247. COMP-035.1  — Monaco Editor React integration                       [S53, High, M]
248. COMP-035.2  — WebSocket gateway                                     [S53, Critical, M]
249. COMP-035.3  — Kubernetes container provisioning adapter             [S53, Critical, M]
250. COMP-035.4  — Session reconnection and state recovery               [S53, High, S]
251. COMP-035.5  — Container image configuration                         [S54, High, S]
252. COMP-035.6  — Workspace persistence integration                     [S54, High, S]
253. COMP-036.1  — Next.js ISR routing and data fetching                 [S54, High, S]
254. COMP-036.2  — Institution page components                           [S54, High, S]
255. COMP-036.3  — SEO and structured data                               [S55, Medium, S]
256. COMP-036.4  — Performance optimization                              [S55, Medium, S]
257. COMP-038.2  — Correlation ID propagation middleware                 [S55, Critical, S]
258. COMP-038.3  — OpenTelemetry distributed tracing                     [S55, High, M]
259. COMP-038.4  — Prometheus metrics                                    [S56, High, S]
260. COMP-038.5  — Grafana dashboards and alerting rules                 [S56, Medium, M]
261. COMP-038.6  — Log aggregation pipeline configuration                [S56, Medium, S]
262. COMP-039.5  — Data retention and archival policy                    [S56, High, S]
```

---

## Section 7 — Work Item Catalog

> Format per entry: **ID** Title | `Stage` `Priority` `Size` [Record→](link)
> Key criteria (top 3). Steps (top 3).
> Status: ⬜ Not Started

---

#### [COMP-001.1] Initialize Turborepo + pnpm workspaces
`S1` `Critical` `S` [Record→](./components/COMP-001-monorepo-infrastructure.md)
Status: ✅ Done | **Deps**: None
**Criteria**: `pnpm-workspace.yaml` defines `apps/*` and `packages/*`; `turbo.json` has `build`, `test`, `lint` pipelines; `package.json` root with `turbo` and `typescript` devDeps.
**Steps**: (1) `pnpm init` + install `turbo` (2) Create `turbo.json` with pipeline config (3) Create `packages/` and `apps/` dirs with placeholder `package.json`

---

#### [COMP-001.2] TypeScript project references and shared tsconfig
`S1` `Critical` `S` [Record→](./components/COMP-001-monorepo-infrastructure.md)
Status: ✅ Done | **Deps**: COMP-001.1
**Criteria**: `tsconfig.base.json` with strict mode; each workspace package has `tsconfig.json` extending base; `tsc --build` compiles all packages.
**Steps**: (1) Write `tsconfig.base.json` (strict, ES2022, NodeNext) (2) Add `references` to each workspace (3) Run `turbo run build` to verify

---

#### [COMP-001.3] Docker Compose local infrastructure
`S1` `Critical` `M` [Record→](./components/COMP-001-monorepo-infrastructure.md)
Status: ✅ Done | **Deps**: COMP-001.1
**Criteria**: `docker-compose.yml` starts Postgres 15 + Redis 7 + Kafka + Zookeeper; pgvector extension enabled; all services have health checks; `pnpm dev:infra` starts all services.
**Steps**: (1) Write `docker-compose.yml` with all services (2) Add pgvector init script (3) Add `Makefile` targets for start/stop/reset

---

#### [COMP-001.4] CI/CD pipeline (GitHub Actions)
`S1` `Critical` `M` [Record→](./components/COMP-001-monorepo-infrastructure.md)
Status: ✅ Done | **Deps**: COMP-001.2
**Criteria**: `.github/workflows/ci.yml` runs lint, type-check, test, build on PR; Turborepo remote cache configured; matrix strategy for affected packages only.
**Steps**: (1) Write `ci.yml` with turbo `--filter` (2) Configure Turborepo cache (3) Add required status checks in branch protection

---

#### [COMP-001.5] Development environment scripts and documentation
`S1` `High` `S` [Record→](./components/COMP-001-monorepo-infrastructure.md)
Status: ✅ Done | **Deps**: COMP-001.3
**Criteria**: `README.md` with setup in < 5 commands; `scripts/setup.sh` installs all deps and starts infra; `.env.example` files in each app.
**Steps**: (1) Write root `README.md` with quickstart (2) Write `scripts/setup.sh` (3) Create `.env.example` for each app

---

#### [COMP-038.1] Structured logger library
`S2` `Critical` `S` [Record→](./components/COMP-038-observability.md)
Status: ✅ Done | **Deps**: COMP-001
**Criteria**: `createLogger(service)` returns JSON logger; all logs include `correlation_id`, `service`, `level`, `timestamp`; secret patterns redacted; tests verify redaction.
**Steps**: (1) Add `pino` to `packages/platform-core` (2) Write `logger.ts` with `createLogger` factory (3) Write redaction test

---

#### [COMP-040.1] CircuitBreaker implementation
`S2` `Critical` `S` [Record→](./components/COMP-040-resilience.md)
Status: ✅ Done | **Deps**: COMP-001
**Criteria**: `CircuitBreaker` transitions `closed→open→half-open→closed`; failure threshold configurable; `execute()` throws `CircuitOpenError` when open; unit tests cover all transitions.
**Steps**: (1) Write `CircuitBreaker` class with state machine (2) Add failure counter and timeout timer (3) Write state transition unit tests

---

#### [COMP-040.3] TimeoutWrapper utility
`S2` `High` `S` [Record→](./components/COMP-040-resilience.md)
Status: ✅ Done | **Deps**: COMP-001
**Criteria**: `withTimeout(fn, ms)` rejects with `TimeoutError` after `ms`; cleans up underlying promise; tests verify timeout fires and success path.
**Steps**: (1) Write `withTimeout` using `Promise.race` (2) Ensure cleanup on timeout (3) Add unit tests

---

#### [COMP-037.6] Secret management configuration
`S2` `Critical` `S` [Record→](./components/COMP-037-security.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `.env.example` in each app with all vars (values redacted); `.env.*.local` in `.gitignore`; `env-validator.ts` validates required env vars at startup.
**Steps**: (1) Create `.env.example` for each app (2) Write `env-validator.ts` (3) Add gitignore patterns for secrets

---

#### [COMP-037.3] Data encryption for classified fields
`S2` `Critical` `S` [Record→](./components/COMP-037-security.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `encryptField(value, key)` AES-256-GCM; `decryptField(cipher, key)` decrypts; key loaded from `DATA_ENCRYPTION_KEY` env var; tests verify round-trip.
**Steps**: (1) Write `encrypted-field.ts` with AES-256-GCM (2) Add `EncryptedField<T>` type (3) Write round-trip test

---

#### [COMP-037.5] SAST and dependency vulnerability scanning in CI
`S2` `High` `S` [Record→](./components/COMP-037-security.md)
Status: Done | **Deps**: COMP-001
**Criteria**: GitHub Actions Semgrep scan on PR; `npm audit` fails on high/critical; SAST results as PR annotations; blocks merge on critical findings.
**Steps**: (1) Write `.github/workflows/security-scan.yml` with Semgrep (2) Add `npm audit` step (3) Configure block-on-critical

---

#### [COMP-039.1] SoftDeletable mixin
`S2` `Critical` `S` [Record→](./components/COMP-039-data-integrity.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `SoftDeletable` mixin adds `deleted_at: Date | null`; `softDelete()` sets timestamp; repository `findAll()` filters out soft-deleted by default; unit tests verify behavior.
**Steps**: (1) Write `SoftDeletable` class/mixin (2) Add `withDeleted` repository option (3) Write unit tests

---

#### [COMP-039.3] PostgreSQL AppendOnlyLog implementation
`S2` `High` `S` [Record→](./components/COMP-039-data-integrity.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `append_only_log` table with `(id, actor_id, event_type, payload, schema_version, correlation_id, causation_id, recorded_at)`; no UPDATE/DELETE permissions; migration file.
**Steps**: (1) Write migration for `append_only_log` table (2) Add DB user with INSERT-only permissions (3) Write insert test

---

#### [COMP-002.1] Identity package setup and User aggregate
`S3` `Critical` `S` [Record→](./components/COMP-002-identity.md)
Status: ✅ Done | **Deps**: COMP-001, COMP-038.1
**Criteria**: `packages/identity` workspace with `UserAggregate`; `ActorId` value object (UUID-based); `User.create()` factory; domain events: `UserCreated`, `UserUpdated`; unit tests.
**Steps**: (1) Scaffold `packages/identity` with `package.json` and `tsconfig.json` (2) Write `User` aggregate with `ActorId` (3) Write `UserCreated` event + unit tests

---

#### [COMP-002.2] RBACRole, Permission, Role entities
`S3` `Critical` `S` [Record→](./components/COMP-002-identity.md)
Status: ✅ Done | **Deps**: COMP-002.1
**Criteria**: `RBACRole` enum (`admin`, `creator`, `learner`, `mentor`, `reviewer`, `moderator`); `Permission` value object (`resource:action`); `Role` entity maps role to permissions; unit tests.
**Steps**: (1) Write `RBACRole` enum and `Permission` value object (2) Write `Role` entity with permission set (3) Write permission check unit tests

---

#### [COMP-002.3] Session aggregate and IdentityToken value object
`S3` `Critical` `S` [Record→](./components/COMP-002-identity.md)
Status: ✅ Done | **Deps**: COMP-002.2
**Criteria**: `Session` aggregate with `sessionId`, `userId`, `expiresAt`; `IdentityToken` value object wraps JWT claims; `Session.isExpired()` checks expiry; unit tests.
**Steps**: (1) Write `Session` aggregate with lifecycle methods (2) Write `IdentityToken` with claim extraction (3) Write session expiry tests

---

#### [COMP-002.4] SupabaseAuthAdapter (ACL)
`S3` `Critical` `M` [Record→](./components/COMP-002-identity.md)
Status: ✅ Done | **Deps**: COMP-002.3
**Criteria**: `SupabaseAuthAdapter` implements `AuthProvider` interface; `verifyToken(jwt)` calls Supabase and returns `IdentityToken`; `signIn/signOut` delegate to Supabase; adapter translates Supabase errors to domain errors.
**Steps**: (1) Define `AuthProvider` interface (2) Write `SupabaseAuthAdapter` (3) Mock Supabase in tests

---

#### [COMP-039.4] AuditColumns mixin
`S3` `High` `S` [Record→](./components/COMP-039-data-integrity.md)
Status: ✅ Done | **Deps**: COMP-001
**Criteria**: `AuditColumns` mixin adds `created_at`, `updated_at`, `created_by_actor_id`; `updated_at` auto-updated on save; migration helper; unit tests.
**Steps**: (1) Write `AuditColumns` class (2) Add auto-update hook for `updated_at` (3) Write mixin tests

---

#### [COMP-040.2] RetryPolicy with exponential backoff
`S4` `Critical` `S` [Record→](./components/COMP-040-resilience.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `RetryPolicy.execute(fn, options)` retries on transient errors; exponential backoff with jitter; max 3 retries configurable; throws after max; unit tests.
**Steps**: (1) Write `RetryPolicy` with `execute` method (2) Implement exponential backoff with jitter (3) Write retry count tests

---

#### [COMP-040.4] BulkheadPattern (semaphore concurrency limiter)
`S4` `High` `S` [Record→](./components/COMP-040-resilience.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `Bulkhead(maxConcurrent)` limits parallel executions; excess calls queued or rejected (configurable); `execute(fn)` acquires semaphore before calling fn; tests verify limit.
**Steps**: (1) Write `Bulkhead` class with semaphore (2) Add queue/reject option (3) Write concurrency limit test

---

#### [COMP-034.1] Background services process setup + worker registry
`S4` `Critical` `S` [Record→](./components/COMP-034-background-services.md)
Status: Done | **Deps**: COMP-001
**Criteria**: `apps/workers` workspace with `src/main.ts`; `WorkerRegistry` pattern; `SIGTERM` handler with 30s wait; each worker reports health; unhandled rejections crash process.
**Steps**: (1) Scaffold `apps/workers` (2) Write `WorkerRegistry` class (3) Write `SIGTERM` handler

---

#### [COMP-034.2] Kafka consumer worker bootstrapping
`S4` `Critical` `M` [Record→](./components/COMP-034-background-services.md)
Status: Done | **Deps**: COMP-034.1, COMP-009, COMP-010, COMP-011
**Criteria**: All 8 consumer workers bootstrapped from domain packages; all started in parallel; unique consumer group IDs; Prometheus counter per worker.
**Steps**: (1) Import consumer workers from domain packages (2) Register all in `WorkerRegistry` (3) Add per-worker Prometheus counters

---

#### [COMP-009.1] Kafka client package setup
`S4` `Critical` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ✅ Done | **Deps**: COMP-001
**Criteria**: `packages/event-bus` with `KafkaProducer` and `KafkaConsumer` wrappers; `createKafkaClient(config)` factory; producer `publish(topic, event)` with schema validation; consumer `subscribe(topic, handler)`.
**Steps**: (1) Scaffold `packages/event-bus` with kafkajs (2) Write `KafkaProducer` with `publish` (3) Write `KafkaConsumer` with `subscribe`

---

#### [COMP-033.1] REST API server setup and middleware stack
`S4` `Critical` `S` [Record→](./components/COMP-033-rest-api.md)
Status: Done | **Deps**: COMP-001
**Criteria**: Fastify server with TypeScript; CORS configured; correlation-id middleware (UUID v4); request/response logging; graceful shutdown.
**Steps**: (1) Scaffold `apps/api` with Fastify (2) Add correlation-id and logging plugins (3) Add graceful shutdown handler

---

#### [COMP-009.2] Event schema versioning system
`S5` `Critical` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.1
**Criteria**: `EventSchema` registry base class; schema version in event envelope; backward compatibility check; `SchemaRegistry.register(topic, schema, version)` stores schema.
**Steps**: (1) Write `EventSchema` type with version field (2) Write `SchemaRegistry` in-memory store (3) Write compatibility check

---

#### [COMP-009.3] AppendOnlyLog PostgreSQL schema + migrations
`S5` `Critical` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-039.3
**Criteria**: Migration creates `event_log` table with all required columns; index on `(actor_id, recorded_at)` and `(correlation_id)`; triggers prevent UPDATE/DELETE.
**Steps**: (1) Write migration file (2) Add index definitions (3) Add trigger to prevent mutations

---

#### [COMP-009.4] ActorSignatureVerifier
`S5` `High` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.1
**Criteria**: `ActorSignatureVerifier.verify(event)` validates actor digital signature (Ed25519 or HMAC); rejects events with invalid signature; used by AppendOnlyLog consumer before write.
**Steps**: (1) Write `ActorSignatureVerifier` (2) Implement Ed25519 verify (3) Write acceptance + rejection tests

---

#### [COMP-009.5] CausalChainTracer
`S5` `High` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.1
**Criteria**: `CausalChainTracer.trace(eventId)` reconstructs causation chain from `causation_id` links; returns ordered list of events; handles cycles gracefully.
**Steps**: (1) Write `CausalChainTracer` (2) Query `event_log` by causation chain (3) Write trace test

---

#### [COMP-009.6] AppendOnlyLog repository (Postgres)
`S5` `High` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.3
**Criteria**: `AppendOnlyLogRepository.append(event)` inserts to `event_log`; `findByCorrelationId(id)` retrieves events; `findByActorId(actorId, dateRange)` for audit queries; no update/delete methods.
**Steps**: (1) Write repository with INSERT-only methods (2) Add query methods (3) Integration test with real DB

---

#### [COMP-009.7] AppendOnlyLog Kafka consumer writer
`S5` `High` `M` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.6, COMP-039.3
**Criteria**: Kafka consumer subscribes to all domain event topics; on each message, validates signature then writes to `event_log`; DLQ routing on validation failure; exactly-once semantics via Kafka transactions.
**Steps**: (1) Write `AuditLogConsumer` subscribing to `*.events` topics (2) Add signature validation (3) Add DLQ routing on failure

---

#### [COMP-002.5] IdentityEventPublisher (Kafka)
`S5` `High` `S` [Record→](./components/COMP-002-identity.md)
Status: ⬜ | **Deps**: COMP-002.4, COMP-009.1
**Criteria**: `IdentityEventPublisher` publishes `identity.user.created`, `identity.user.updated`, `identity.session.created` events to Kafka with correct schema; unit tests with mock Kafka.
**Steps**: (1) Write `IdentityEventPublisher` (2) Map domain events to Kafka messages (3) Write publish tests

---

#### [COMP-009.8] Schema registry API
`S6` `Medium` `S` [Record→](./components/COMP-009-event-bus-audit.md)
Status: ⬜ | **Deps**: COMP-009.2
**Criteria**: `GET /internal/event-schemas` lists all registered schemas; `POST /internal/event-schemas` registers new version; compatibility check rejects breaking changes; admin-only access.
**Steps**: (1) Write schema registry API routes (2) Add compatibility check logic (3) Write API tests

---

#### [COMP-002.6] Identity REST API endpoints
`S6` `Critical` `M` [Record→](./components/COMP-002-identity.md)
Status: ⬜ | **Deps**: COMP-002.5, COMP-033.1
**Criteria**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, `GET /api/v1/users/{id}`, `PUT /api/v1/users/{id}/roles`; all return correct response envelopes; 401/403 on auth failure.
**Steps**: (1) Write Fastify route handlers (2) Wire to identity use cases (3) Write API integration tests

---

#### [COMP-002.7] Session Kafka consumer
`S6` `High` `S` [Record→](./components/COMP-002-identity.md)
Status: ⬜ | **Deps**: COMP-002.5, COMP-009.7
**Criteria**: Consumes events that invalidate sessions (e.g., `identity.user.banned`); triggers `Session.invalidate()` and clears Redis token cache; registered in `WorkerRegistry`.
**Steps**: (1) Write `SessionInvalidationConsumer` (2) Handle user-banned event (3) Clear Redis cache on invalidation

---

#### [COMP-034.3] DLQ processor
`S6` `High` `S` [Record→](./components/COMP-034-background-services.md)
Status: ⬜ | **Deps**: COMP-034.1
**Criteria**: DLQ consumer subscribes to `*.dlq` topics; 3 retry attempts with 5s/30s/5min backoff; after max retries: persisted to `dlq_archive` table; alert when DLQ depth > 100.
**Steps**: (1) Write `DLQProcessor` consumer (2) Implement retry with backoff (3) Write `dlq_archive` migration

---

#### [COMP-034.4] Scheduled job runner
`S6` `High` `S` [Record→](./components/COMP-034-background-services.md)
Status: ⬜ | **Deps**: COMP-034.1
**Criteria**: `CronScheduler` using `node-cron`; distributed lock via Redis SETNX; 4 registered cron jobs; job execution time logged; alert if job > 5min.
**Steps**: (1) Write `CronScheduler` with distributed lock (2) Register 4 cron jobs (3) Add duration logging

---

#### [COMP-037.1] RBAC enforcement library
`S7` `Critical` `S` [Record→](./components/COMP-037-security.md)
Status: ⬜ | **Deps**: COMP-002
**Criteria**: `hasPermission(actorId, resource, action)` returns boolean; `requirePermission` throws `ForbiddenError`; `@RequireRole` decorator; Redis cache with 5min TTL.
**Steps**: (1) Write `hasPermission` function (2) Write `requirePermission` wrapper (3) Add Redis caching

---

#### [COMP-040.5] Resilience integration tests
`S7` `High` `S` [Record→](./components/COMP-040-resilience.md)
Status: ⬜ | **Deps**: COMP-040.1, COMP-040.2, COMP-040.3, COMP-040.4
**Criteria**: Integration tests for CircuitBreaker + RetryPolicy combination; Bulkhead under load; TimeoutWrapper with real async delay; all tests < 5s total.
**Steps**: (1) Write circuit-breaker + retry combo test (2) Write bulkhead load test (3) Run full suite

---

#### [COMP-039.2] AppendOnlyLog abstract interface
`S7` `High` `S` [Record→](./components/COMP-039-data-integrity.md)
Status: ⬜ | **Deps**: COMP-009.3
**Criteria**: `AppendOnlyLog` interface with `append(event)` and `query(filter)` methods; implemented by `PostgresAppendOnlyLog` and mock; used throughout domain packages.
**Steps**: (1) Write `AppendOnlyLog` interface (2) Write `MockAppendOnlyLog` for tests (3) Verify `PostgresAppendOnlyLog` implements it

---

#### [COMP-034.5] Prometheus metrics and health endpoints (workers)
`S7` `High` `S` [Record→](./components/COMP-034-background-services.md)
Status: ⬜ | **Deps**: COMP-034.1
**Criteria**: `GET /metrics` returns Prometheus format; `GET /health` checks all workers + DLQ depth + Redis/Kafka; default Node.js metrics collected; custom per-worker counters.
**Steps**: (1) Add `prom-client` to workers (2) Write metrics endpoint (3) Write health check

---

#### [COMP-033.2] Auth middleware and token verification
`S7` `Critical` `S` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: COMP-002, COMP-033.1
**Criteria**: `authMiddleware` calls `verifyIdentityToken()`; sets `request.user`; returns 401 on invalid token; 403 on insufficient role; Redis token cache 5min TTL.
**Steps**: (1) Write `authMiddleware` Fastify plugin (2) Wire to `verifyIdentityToken` (3) Add Redis cache

---

#### [COMP-033.3] Rate limiting middleware
`S8` `High` `S` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: COMP-033.1
**Criteria**: Sliding window: 100 req/s burst, 1000 req/min per user; IP-based for unauthenticated (20 req/min); 429 with `Retry-After`; AI streaming sessions: 20 concurrent.
**Steps**: (1) Add `@fastify/rate-limit` with Redis backend (2) Configure per-user and IP limits (3) Test 429 response

---

#### [COMP-033.7] Health check and server info endpoints
`S8` `High` `XS` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: COMP-033.1
**Criteria**: `GET /health` → `{ status, version, timestamp }`; `GET /health/ready` checks DB/Kafka/Redis; `GET /health/live` simple liveness; p99 < 10ms.
**Steps**: (1) Write `/health` route (2) Write `/health/ready` with connectivity checks (3) Write liveness check

---

#### [COMP-032.2] Auth Provider integration (Supabase UI)
`S8` `Critical` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-002, COMP-033.2
**Criteria**: Next.js Auth Provider wraps Supabase client; `/login` page renders; `/logout` clears session; `useUser()` hook returns current user; protected routes redirect to `/login`.
**Steps**: (1) Add `@supabase/ssr` to apps (2) Write `AuthProvider` component (3) Write `useUser` hook

---

#### [COMP-032.1] Next.js app scaffolding and design system
`S8` `Critical` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-001
**Criteria**: `apps/platform`, `apps/learn`, `apps/hub`, `apps/labs` scaffolded; shared `packages/ui` with design system (Tailwind + shadcn/ui); global layout with navigation; theme (light/dark) support.
**Steps**: (1) Scaffold 4 Next.js apps with `create-next-app` (2) Create `packages/ui` with base components (3) Add Tailwind + shadcn/ui to all apps

---

#### [COMP-003.1] DIP package setup + Artifact aggregate
`S9` `Critical` `S` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-001, COMP-009
**Criteria**: `packages/dip` workspace; `Artifact` aggregate with `ArtifactId`, `ContentHash`, `AuthorId`; `ArtifactStatus` enum (`draft/published/archived`); `Artifact.draft()` factory; unit tests.
**Steps**: (1) Scaffold `packages/dip` (2) Write `Artifact` aggregate (3) Write `ArtifactId` + `ContentHash` value objects

---

#### [COMP-003.2] ArtifactLifecycleService
`S9` `Critical` `M` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.1
**Criteria**: `draft(author, content) → Artifact`; `submit(artifactId) → Artifact`; `publish(artifactId) → Artifact`; `archive(artifactId) → Artifact`; each step publishes domain event; unit tests with mock repo.
**Steps**: (1) Write `ArtifactLifecycleService` (2) Add event publishing on each transition (3) Write lifecycle unit tests

---

#### [COMP-003.3] NostrAnchor integration
`S9` `High` `S` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.2
**Criteria**: `NostrAnchorService.anchor(artifact)` computes content hash and submits to Nostr relay; returns `NostrEventId`; stored on artifact; mock relay in tests.
**Steps**: (1) Write `NostrAnchorService` (2) Compute SHA-256 content hash (3) Mock Nostr relay in tests

---

#### [COMP-003.4] ArtifactRepository (Postgres)
`S9` `High` `S` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.1, COMP-039.1, COMP-039.4
**Criteria**: `ArtifactRepository` implements interface; `save`, `findById`, `findByAuthor`, `findPublished`; migration creates `artifacts` table with all columns; integration test.
**Steps**: (1) Write migration (2) Write `PostgresArtifactRepository` (3) Write integration test

---

#### [COMP-003.5] ArtifactEventPublisher
`S9` `High` `S` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.2, COMP-009.1
**Criteria**: Publishes `dip.artifact.published`, `dip.artifact.archived` to Kafka; event schema version 1; actor signature included; unit tests with mock Kafka.
**Steps**: (1) Write `ArtifactEventPublisher` (2) Define event schemas (3) Write publish tests

---

#### [COMP-003.6] Artifact query service
`S10` `High` `S` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.4
**Criteria**: `ArtifactQueryService.findPublished(filter)` with pagination; filter by `authorId`, `type`, `tag`; cursor-based pagination; returns `ArtifactSummary[]`.
**Steps**: (1) Write query service (2) Add filter + pagination logic (3) Write query tests

---

#### [COMP-003.7] Artifact REST API endpoints
`S10` `High` `M` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.6, COMP-033.2
**Criteria**: `POST /api/v1/artifacts`, `GET /api/v1/artifacts/{id}`, `PUT /api/v1/artifacts/{id}/submit`, `PUT /api/v1/artifacts/{id}/publish`; auth required; response envelopes per CONV-017.
**Steps**: (1) Write Fastify route handlers (2) Wire to lifecycle service (3) Write API tests

---

#### [COMP-003.8] Integration tests for Artifact Registry
`S10` `High` `M` [Record→](./components/COMP-003-dip-artifact-registry.md)
Status: ⬜ | **Deps**: COMP-003.7
**Criteria**: Full lifecycle test: draft→submit→publish; Nostr anchor verified; Kafka event emitted; API returns correct status at each step; uses real DB (testcontainers).
**Steps**: (1) Write lifecycle integration test (2) Assert Kafka event (3) Assert Nostr anchor stored

---

#### [COMP-012.1] AI agents package setup + UserContextModel aggregate
`S10` `Critical` `S` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-001, COMP-002
**Criteria**: `packages/ai-agents` workspace; `UserContextModel` aggregate with `userId`, `recentActivity[]`, `activeGoals[]`, `skillLevel`; `update(event)` method; unit tests.
**Steps**: (1) Scaffold `packages/ai-agents` (2) Write `UserContextModel` aggregate (3) Write context update unit tests

---

#### [COMP-004.1] Smart Contract Engine package setup
`S11` `Critical` `S` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-003
**Criteria**: `packages/dip-contracts` workspace; package initialized with TypeScript; base types: `ContractClause`, `EvaluationResult`; empty `GovernanceContract` scaffold; tests pass.
**Steps**: (1) Scaffold `packages/dip-contracts` (2) Write base types (3) Write empty tests scaffold

---

#### [COMP-004.2] GovernanceContract aggregate + clause value objects
`S11` `Critical` `M` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-004.1
**Criteria**: `GovernanceContract` aggregate with `clauses: ContractClause[]`; clause types: `TransparencyClause`, `ParticipationThreshold`, `VetoRight`, `AmendmentProcedure`; each is immutable value object; unit tests.
**Steps**: (1) Write `GovernanceContract` aggregate (2) Write 4 clause value objects (3) Write aggregate unit tests

---

#### [COMP-004.3] SmartContractEvaluator
`S11` `Critical` `M` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-004.2
**Criteria**: `SmartContractEvaluator.evaluate(contract, context)` returns `EvaluationResult` per clause; evaluates `ParticipationThreshold` against quorum; `TransparencyClause` checks public record; unit tests with varied contexts.
**Steps**: (1) Write `SmartContractEvaluator` (2) Implement clause evaluators (3) Write test scenarios

---

#### [COMP-004.4] Contract DSL parser
`S11` `High` `M` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-004.2
**Criteria**: `ContractDSLParser.parse(dsl: string)` returns `GovernanceContract`; rejects malformed DSL with descriptive error; supports JSON and YAML DSL formats; round-trip parse/serialize test.
**Steps**: (1) Write JSON DSL parser (2) Add YAML support (3) Write malformed input test

---

#### [COMP-004.5] ContractRepository (Postgres)
`S11` `High` `S` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-004.2, COMP-039.4
**Criteria**: `ContractRepository` with `save`, `findById`, `findByInstitution`; migration creates `governance_contracts` table; stores DSL as JSONB; integration test.
**Steps**: (1) Write migration (2) Write repository (3) Write integration test

---

#### [COMP-004.6] Smart Contract API + integration tests
`S11` `High` `S` [Record→](./components/COMP-004-dip-smart-contract-engine.md)
Status: ⬜ | **Deps**: COMP-004.5, COMP-033.2
**Criteria**: `POST /api/v1/contracts`, `GET /api/v1/contracts/{id}`, `POST /api/v1/contracts/{id}/evaluate`; full lifecycle integration test; DSL validation on create.
**Steps**: (1) Write API routes (2) Wire to evaluator (3) Write integration test

---

#### [COMP-012.2] AgentSession aggregate
`S12` `Critical` `S` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.1
**Criteria**: `AgentSession` aggregate with `sessionId`, `userId`, `agentId`, `status`, `history[]`; `create()` factory; `addMessage(message)` appends to history; `close()` terminates; unit tests.
**Steps**: (1) Write `AgentSession` aggregate (2) Add message history methods (3) Write session lifecycle tests

---

#### [COMP-012.3] LLMAdapter (OpenAI)
`S12` `Critical` `M` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.1
**Criteria**: `LLMAdapter` interface + `OpenAIAdapter` implementation; `complete(prompt, context)` returns `LLMResponse`; streaming support via async generator; mock adapter for tests; respects timeout (30s).
**Steps**: (1) Write `LLMAdapter` interface (2) Write `OpenAIAdapter` (3) Write mock adapter + tests

---

#### [COMP-012.4] ToolRouter
`S12` `Critical` `S` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.1, COMP-013.1
**Criteria**: `ToolRouter.route(toolName, params)` looks up `ToolDefinition` in registry and calls handler; validates params against tool schema (Zod); returns `ToolResult`; throws `ToolNotFoundError` for unknown tools.
**Steps**: (1) Write `ToolRouter` (2) Add Zod schema validation (3) Write routing tests

---

#### [COMP-012.5] ContextModelUpdater
`S12` `High` `S` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.1
**Criteria**: `ContextModelUpdater.update(userId, event)` updates `UserContextModel` with latest activity; batches updates; refreshes from Kafka consumer; unit tests.
**Steps**: (1) Write `ContextModelUpdater` (2) Add event-to-context mapping (3) Write update tests

---

#### [COMP-012.6] AgentOrchestrator
`S12` `Critical` `M` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.2, COMP-012.3, COMP-012.4, COMP-012.5
**Criteria**: `AgentOrchestrator.invoke(sessionId, message)` builds prompt from context, calls LLM, routes tool calls, returns `AgentResponse`; handles multi-turn; streaming mode via SSE; unit tests with mock LLM.
**Steps**: (1) Write `AgentOrchestrator` main loop (2) Add tool call parsing from LLM response (3) Add SSE streaming support

---

#### [COMP-012.7] AgentRepository + AgentEventPublisher
`S13` `High` `S` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.6
**Criteria**: `AgentSessionRepository` saves/loads sessions; migration creates `agent_sessions` table; `AgentEventPublisher` publishes `ai.agent.session_started`, `ai.agent.invoked`; integration test.
**Steps**: (1) Write repository + migration (2) Write event publisher (3) Write integration test

---

#### [COMP-012.8] AI Agents REST API endpoints
`S13` `High` `M` [Record→](./components/COMP-012-ai-agents-orchestration.md)
Status: ⬜ | **Deps**: COMP-012.7, COMP-033.2
**Criteria**: `POST /api/v1/ai-agents/sessions`, `GET /api/v1/ai-agents/sessions/{id}`, `POST /api/v1/ai-agents/sessions/{id}/invoke` (SSE streaming); auth required; rate limited (20 concurrent per user).
**Steps**: (1) Write session creation endpoint (2) Write SSE streaming invoke endpoint (3) Write API tests

---

#### [COMP-013.1] Agent Registry package setup + AIAgentDefinition
`S13` `Critical` `S` [Record→](./components/COMP-013-ai-agents-registry.md)
Status: ⬜ | **Deps**: COMP-012.1
**Criteria**: `AIAgentDefinition` entity with `agentId`, `name`, `pillar`, `toolIds[]`, `systemPromptId`; `AgentRegistry.register(definition)` stores; `findByPillar(pillar)` queries; unit tests.
**Steps**: (1) Write `AIAgentDefinition` entity (2) Write `AgentRegistry` class (3) Write registry unit tests

---

#### [COMP-006.1] DIP Project package setup + DigitalProject aggregate
`S14` `Critical` `S` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-003, COMP-007
**Criteria**: `DigitalProject` aggregate with `projectId`, `institutionId`, `manifestId`; `create(institution, manifest)` factory; domain events: `ProjectCreated`, `ProjectManifestUpdated`; unit tests.
**Steps**: (1) Write `DigitalProject` aggregate (2) Write `ProjectCreated` event (3) Write unit tests

---

#### [COMP-006.2] ProjectManifest value object
`S14` `Critical` `S` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-006.1
**Criteria**: `ProjectManifest` immutable value object with `title`, `description`, `goals[]`, `dependencies[]`; `equals()` comparison; `toJSON()` serialization; unit tests.
**Steps**: (1) Write `ProjectManifest` value object (2) Add equals + serialization (3) Write tests

---

#### [COMP-006.3] DAGService (acyclicity enforcement)
`S14` `Critical` `M` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-006.2
**Criteria**: `DAGService.addEdge(from, to)` throws `CyclicDependencyError` for cycles; `getTopologicalOrder()` returns valid topological sort; `findRoots()` returns nodes with no incoming edges; tests with cyclic graphs.
**Steps**: (1) Write `DAGService` with DFS cycle detection (2) Write topological sort (3) Write cyclic graph test

---

#### [COMP-006.4] ProjectRepository (Postgres)
`S14` `High` `S` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-006.1, COMP-039.4
**Criteria**: `ProjectRepository` with `save`, `findById`, `findByInstitution`; migration creates `digital_projects` + `project_dag_edges` tables; integration test.
**Steps**: (1) Write migrations (2) Write repository (3) Write integration test

---

#### [COMP-006.5] Project event publisher
`S14` `High` `S` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-006.1, COMP-009.1
**Criteria**: Publishes `dip.project.created`, `dip.project.manifest_updated` to Kafka; unit tests with mock Kafka.
**Steps**: (1) Write `ProjectEventPublisher` (2) Map domain events to Kafka (3) Write tests

---

#### [COMP-006.6] Project REST API endpoints + integration tests
`S15` `High` `M` [Record→](./components/COMP-006-dip-project-manifest-dag.md)
Status: ⬜ | **Deps**: COMP-006.5, COMP-033.2
**Criteria**: `POST /api/v1/projects`, `GET /api/v1/projects/{id}`, `GET /api/v1/projects/{id}/dag`; DAG endpoint returns nodes+edges; integration tests.
**Steps**: (1) Write API routes (2) Write DAG endpoint (3) Write integration tests

---

#### [COMP-013.2] ToolDefinition entity + schema validation
`S15` `Critical` `S` [Record→](./components/COMP-013-ai-agents-registry.md)
Status: ⬜ | **Deps**: COMP-013.1
**Criteria**: `ToolDefinition` entity with `toolId`, `name`, `description`, `inputSchema` (Zod), `requiredRole`; `validateInput(params)` validates against schema; unit tests.
**Steps**: (1) Write `ToolDefinition` entity (2) Add Zod schema validation (3) Write validation tests

---

#### [COMP-013.3] ToolPermissionEvaluator
`S15` `Critical` `S` [Record→](./components/COMP-013-ai-agents-registry.md)
Status: ⬜ | **Deps**: COMP-013.2, COMP-037.1
**Criteria**: `ToolPermissionEvaluator.canInvoke(actorId, toolId)` checks `requiredRole` against actor's roles; returns boolean; caches decision per session; unit tests.
**Steps**: (1) Write `ToolPermissionEvaluator` (2) Integrate with RBAC (3) Write permission tests

---

#### [COMP-013.4] Agent Registry REST API (register, list, get)
`S15` `High` `S` [Record→](./components/COMP-013-ai-agents-registry.md)
Status: ⬜ | **Deps**: COMP-013.3, COMP-033.2
**Criteria**: `POST /api/v1/agents` (admin), `GET /api/v1/agents`, `GET /api/v1/agents/{id}`, `GET /api/v1/agents/{id}/tools`; admin-only for registration; public read.
**Steps**: (1) Write API routes (2) Add admin role guard (3) Write API tests

---

#### [COMP-013.5] Agent Registry integration tests
`S16` `High` `S` [Record→](./components/COMP-013-ai-agents-registry.md)
Status: ⬜ | **Deps**: COMP-013.4
**Criteria**: Register agent, list agents, invoke tool with insufficient role → 403; tool schema validation rejects invalid params; tests use real DB.
**Steps**: (1) Write registration test (2) Write permission rejection test (3) Write schema validation test

---

#### [COMP-005.1] IACP Engine package setup + IACPRecord aggregate
`S16` `Critical` `S` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-003
**Criteria**: `packages/dip-iacp` workspace; `IACPRecord` aggregate with `id`, `type`, `parties[]`, `status`; `IACPStatus` enum (`draft/pending_signatures/active/terminated`); unit tests.
**Steps**: (1) Scaffold `packages/dip-iacp` (2) Write `IACPRecord` aggregate (3) Write status tests

---

#### [COMP-005.2] IACPParty value object + multi-party signing setup
`S16` `Critical` `S` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.1
**Criteria**: `IACPParty` value object with `actorId`, `role`, `signature?`; `SignatureThreshold` value object (n-of-m); `IACPRecord.addParty()` method; unit tests.
**Steps**: (1) Write `IACPParty` value object (2) Write `SignatureThreshold` (3) Write party management tests

---

#### [COMP-005.3] IACPStateMachine (draft→pending→active→terminated)
`S17` `Critical` `M` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.2
**Criteria**: `IACPStateMachine` enforces valid transitions; `submit()` moves to `pending_signatures`; `activate()` requires signature threshold met; `terminate()` available from any state; invalid transitions throw `InvalidTransitionError`.
**Steps**: (1) Write state machine class (2) Implement transition guards (3) Write invalid transition test

---

#### [COMP-005.4] SignatureCollector (n-of-m threshold logic)
`S17` `Critical` `M` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.3
**Criteria**: `SignatureCollector.addSignature(party, signature)` validates signature; `isThresholdMet()` returns true when n signatures collected; duplicate signatures rejected; unit tests.
**Steps**: (1) Write `SignatureCollector` (2) Add signature validation (3) Write threshold tests

---

#### [COMP-005.5] IACPEngine.evaluate() consensus check
`S17` `Critical` `M` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.4
**Criteria**: `IACPEngine.evaluate(record)` checks consensus rules from `GovernanceContract`; returns `EvaluationResult`; evaluates quorum and participation threshold; unit tests with various consensus scenarios.
**Steps**: (1) Write `IACPEngine.evaluate` (2) Wire to `SmartContractEvaluator` (3) Write consensus scenarios

---

#### [COMP-005.6] IACPRepository (Postgres)
`S17` `High` `S` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.5, COMP-039.4
**Criteria**: Migration creates `iacp_records` + `iacp_parties` tables; repository `save`, `findById`, `findByInstitution`; integration test.
**Steps**: (1) Write migrations (2) Write repository (3) Write integration test

---

#### [COMP-005.7] IACPEventPublisher (Kafka)
`S17` `High` `S` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.5, COMP-009.1
**Criteria**: Publishes `dip.iacp.created`, `dip.iacp.activated`, `dip.iacp.terminated`; unit tests.
**Steps**: (1) Write `IACPEventPublisher` (2) Map events to Kafka messages (3) Write publish tests

---

#### [COMP-005.8] IACP REST API endpoints + integration tests
`S18` `High` `M` [Record→](./components/COMP-005-dip-iacp-engine.md)
Status: ⬜ | **Deps**: COMP-005.7, COMP-033.2
**Criteria**: `POST /api/v1/iacp`, `GET /api/v1/iacp/{id}`, `POST /api/v1/iacp/{id}/sign`, `POST /api/v1/iacp/{id}/activate`; full lifecycle integration test.
**Steps**: (1) Write API routes (2) Wire to state machine (3) Write integration test

---

#### [COMP-007.1] DIP Governance package setup + DigitalInstitution
`S18` `Critical` `M` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-004, COMP-005
**Criteria**: `packages/dip-governance` workspace; `DigitalInstitution` aggregate with `institutionId`, `type`, `governanceContract`, `status`; `create()` factory; domain events.
**Steps**: (1) Scaffold `packages/dip-governance` (2) Write `DigitalInstitution` aggregate (3) Write unit tests

---

#### [COMP-007.2] Proposal aggregate
`S18` `Critical` `S` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.1
**Criteria**: `Proposal` aggregate with `proposalId`, `institutionId`, `type`, `status`; `ProposalStatus` enum; `open()`, `close()`, `execute()` transitions; unit tests.
**Steps**: (1) Write `Proposal` aggregate (2) Add status transitions (3) Write transition tests

---

#### [COMP-007.3] VotingService
`S18` `Critical` `M` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.2, COMP-037.1
**Criteria**: `VotingService.castVote(proposalId, actorId, vote)` validates eligibility; prevents double-voting; tallies votes; `getVoteSummary(proposalId)` returns tally; unit tests.
**Steps**: (1) Write `VotingService` (2) Add eligibility check (3) Add double-vote prevention

---

#### [COMP-007.4] GovernanceService.executeProposal()
`S19` `Critical` `M` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.3, COMP-004.3
**Criteria**: `GovernanceService.executeProposal(proposal)` evaluates governance contract first; rejects if quorum not met; applies proposal effects; publishes `governance.proposal.executed`; unit tests.
**Steps**: (1) Write `GovernanceService` (2) Wire to `SmartContractEvaluator` (3) Write quorum enforcement test

---

#### [COMP-007.5] LegitimacyChain event chain
`S19` `Critical` `M` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.4, COMP-009
**Criteria**: `LegitimacyChain` append-only record of governance decisions; each entry references previous via hash; `append(event)` stores with causation chain; `verify()` checks chain integrity; unit tests.
**Steps**: (1) Write `LegitimacyChain` class (2) Implement hash-linked chain (3) Write integrity verification test

---

#### [COMP-007.6] GovernanceRepository (Postgres)
`S19` `High` `S` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.5, COMP-039.4
**Criteria**: Migrations for `digital_institutions`, `proposals`, `votes`, `legitimacy_chain` tables; repositories for each; integration test.
**Steps**: (1) Write all migrations (2) Write repositories (3) Write integration tests

---

#### [COMP-007.7] GovernanceEventPublisher (Kafka)
`S19` `High` `S` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.5, COMP-009.1
**Criteria**: Publishes `dip.governance.institution_created`, `dip.governance.proposal_executed`, `dip.governance.proposal_opened`; unit tests.
**Steps**: (1) Write `GovernanceEventPublisher` (2) Map events (3) Write tests

---

#### [COMP-007.8] Governance query service + read models
`S19` `High` `S` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.6
**Criteria**: `InstitutionSummary` read model with governance stats; `ProposalHistory` read model; query service with pagination; unit tests.
**Steps**: (1) Write read models (2) Write query service (3) Write query tests

---

#### [COMP-007.9] Governance REST API endpoints + integration tests
`S20` `High` `M` [Record→](./components/COMP-007-dip-institutional-governance.md)
Status: ⬜ | **Deps**: COMP-007.8, COMP-033.2
**Criteria**: `POST /api/v1/institutions`, `GET /api/v1/institutions/{id}`, `POST /api/v1/institutions/{id}/proposals`, `POST /api/v1/proposals/{id}/vote`; full voting lifecycle integration test.
**Steps**: (1) Write API routes (2) Wire to services (3) Write integration test

---

#### [COMP-008.1] Value Distribution package setup + TreasuryAccount
`S20` `Critical` `S` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-007
**Criteria**: `packages/dip-treasury` workspace; `TreasuryAccount` aggregate with `accountId`, `institutionId`, `avuBalance`; `credit()` and `debit()` methods enforce non-negative balance; unit tests.
**Steps**: (1) Scaffold `packages/dip-treasury` (2) Write `TreasuryAccount` aggregate (3) Write balance tests

---

#### [COMP-008.2] UsageRegistration event consumer
`S20` `Critical` `S` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.1, COMP-009.1
**Criteria**: `UsageRegisteredConsumer` subscribes to `dip.artifact.published`; computes usage contribution; records in `UsageRegistry`; unit tests with mock Kafka.
**Steps**: (1) Write consumer (2) Compute contribution score (3) Write consumer tests

---

#### [COMP-008.3] AVU accounting (debit/credit)
`S20` `Critical` `M` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.2
**Criteria**: `AVUAccountingService.record(transaction)` updates `TreasuryAccount` balance; all transactions journalled in `avuTransaction`; atomic via DB transaction; unit tests.
**Steps**: (1) Write `AVUAccountingService` (2) Add double-entry journalling (3) Write atomicity test

---

#### [COMP-008.4] ValueDistributionService.compute()
`S21` `Critical` `M` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.3
**Criteria**: `ValueDistributionService.compute(institutionId, period)` distributes treasury balance proportionally to contributor scores; returns `DistributionResult`; unit tests with various contribution ratios.
**Steps**: (1) Write distribution computation (2) Implement proportional split (3) Write distribution tests

---

#### [COMP-008.5] Liquidation oracle integration
`S21` `High` `M` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.3
**Criteria**: `LiquidationOracle.getRate(currency)` calls external price feed; `OracleAdapter` wraps external API; circuit breaker applied; mock oracle in tests.
**Steps**: (1) Write `LiquidationOracle` interface (2) Write `MockOracleAdapter` (3) Apply circuit breaker

---

#### [COMP-008.6] TreasuryTransfer aggregate
`S21` `High` `S` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.4
**Criteria**: `TreasuryTransfer` aggregate records debit/credit between accounts; immutable once created; publishes `dip.treasury.transfer_recorded`; unit tests.
**Steps**: (1) Write `TreasuryTransfer` aggregate (2) Add immutability guard (3) Write transfer tests

---

#### [COMP-008.7] TreasuryRepository (Postgres)
`S21` `High` `S` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.6, COMP-039.4
**Criteria**: Migrations for `treasury_accounts`, `avu_transactions`, `treasury_transfers`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-008.8] Treasury REST API endpoints + integration tests
`S22` `High` `M` [Record→](./components/COMP-008-dip-value-distribution-treasury.md)
Status: ⬜ | **Deps**: COMP-008.7, COMP-033.2
**Criteria**: `GET /api/v1/treasury/{institutionId}` returns balance + history; `POST /api/v1/treasury/{institutionId}/distribute` triggers distribution; integration test.
**Steps**: (1) Write API routes (2) Wire to distribution service (3) Write integration test

---

#### [COMP-010.1] Platform-core package setup + Portfolio aggregate
`S22` `Critical` `S` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-003, COMP-009
**Criteria**: `packages/platform-core` workspace (if not already from COMP-038.1); `Portfolio` aggregate with `userId`, `xp`, `achievements[]`, `skills[]`; `Portfolio.fromEvents(events)` factory; unit tests.
**Steps**: (1) Scaffold `packages/platform-core` (or extend) (2) Write `Portfolio` aggregate (3) Write event sourcing test

---

#### [COMP-010.2] XP calculation engine
`S22` `Critical` `M` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.1
**Criteria**: `XPCalculator.calculate(events)` returns total XP; event types have XP weights (`artifact_published: 50`, `contribution_merged: 30`, etc.); level thresholds defined; unit tests.
**Steps**: (1) Define XP weight table (2) Write `XPCalculator` (3) Write XP accumulation tests

---

#### [COMP-010.3] AchievementService
`S22` `High` `M` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.2
**Criteria**: `AchievementService.evaluate(portfolio, event)` unlocks achievements when milestones hit; achievement definitions stored in config; `AchievementUnlocked` domain event; unit tests.
**Steps**: (1) Write achievement definitions config (2) Write `AchievementService` (3) Write milestone tests

---

#### [COMP-010.4] SkillProfile computation
`S23` `High` `M` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.3
**Criteria**: `SkillProfileService.compute(userId)` extracts skill evidence from events (tags on completed fragments, contributions); returns `SkillProfile` with proficiency levels; unit tests.
**Steps**: (1) Define skill taxonomy (2) Write `SkillProfileService` (3) Write skill extraction tests

---

#### [COMP-010.5] ReputationScore calculation
`S23` `High` `M` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.4
**Criteria**: `ReputationService.calculate(portfolio)` computes weighted score from contributions, reviews, mentorship, XP; time-decayed; returns `ReputationScore`; unit tests.
**Steps**: (1) Define reputation formula (2) Write `ReputationService` (3) Write decay tests

---

#### [COMP-010.6] PortfolioEventConsumer (Kafka)
`S23` `High` `S` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.5, COMP-009.1
**Criteria**: `PortfolioEventConsumer` subscribes to `dip.artifact.*`, `hub.contribution.*`, `learn.fragment.*`; on each event, updates portfolio; registered in `WorkerRegistry`; integration test.
**Steps**: (1) Write consumer (2) Wire to portfolio update services (3) Write integration test

---

#### [COMP-010.7] PortfolioRepository (Postgres)
`S23` `High` `S` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.5, COMP-039.4
**Criteria**: Migration creates `portfolios`, `achievements`, `skill_profiles` tables; repositories with `findByUserId`; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-010.8] Portfolio REST API endpoints + integration tests
`S24` `High` `M` [Record→](./components/COMP-010-portfolio-aggregation.md)
Status: ⬜ | **Deps**: COMP-010.7, COMP-033.2
**Criteria**: `GET /api/v1/portfolios/{userId}` returns full portfolio; `GET /api/v1/portfolios/{userId}/achievements`; integration test covering event-to-portfolio flow.
**Steps**: (1) Write API routes (2) Wire to query service (3) Write integration test

---

#### [COMP-011.1] Search package setup + SearchIndex entity
`S24` `Critical` `S` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-003, COMP-009
**Criteria**: `SearchIndex` entity with `indexId`, `entityType`, `entityId`, `tsvector_content`, `embedding?`; migration creates `search_index` table with `tsvector` column; unit tests.
**Steps**: (1) Write `SearchIndex` entity (2) Write migration with `tsvector` column (3) Write entity tests

---

#### [COMP-011.2] Full-text search implementation (tsvector)
`S24` `Critical` `M` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.1
**Criteria**: `SearchService.search(query)` uses `to_tsquery` with `plainto_tsquery` fallback; ranked by `ts_rank`; supports prefix search; filters by `entityType`; integration test with real DB.
**Steps**: (1) Write `SearchService.search` with ts_query (2) Add ranking (3) Write integration test

---

#### [COMP-011.3] EventIndexingConsumer (Kafka)
`S24` `High` `S` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.1, COMP-009.1
**Criteria**: `EventIndexingConsumer` subscribes to all `*.published` events; indexes entity content into `search_index`; updates existing index on `*.updated`; registered in `WorkerRegistry`.
**Steps**: (1) Write consumer (2) Build tsvector from entity content (3) Write indexing test

---

#### [COMP-011.4] Semantic search (pgvector embeddings)
`S25` `High` `L` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.2
**Criteria**: `EmbeddingService.embed(text)` calls OpenAI embeddings API; stores in `vector(1536)` column; `SemanticSearchService.search(query)` finds nearest neighbors via `<=>` operator; hybrid score combines FTS + semantic; integration test.
**Steps**: (1) Add pgvector extension (2) Write `EmbeddingService` (3) Write hybrid search combining FTS + vector

---

#### [COMP-011.5] RecommendationSet computation
`S25` `High` `M` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.4, COMP-010
**Criteria**: `RecommendationService.compute(userId)` builds `RecommendationSet` from portfolio + search similarity; refreshed on `portfolio.updated` event; stores top-20 recommendations per user; unit tests.
**Steps**: (1) Write recommendation algorithm (2) Wire to portfolio data (3) Write recommendation tests

---

#### [COMP-011.6] SearchRepository (Postgres)
`S25` `High` `S` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.4, COMP-039.4
**Criteria**: `SearchRepository` with `save`, `findById`, `deleteByEntity`; `RecommendationRepository` with `saveForUser`, `findByUserId`; migrations; integration tests.
**Steps**: (1) Write repositories (2) Write migrations (3) Write integration tests

---

#### [COMP-011.7] Search & Recommendation REST API
`S25` `High` `M` [Record→](./components/COMP-011-search-recommendation.md)
Status: ⬜ | **Deps**: COMP-011.6, COMP-033.2
**Criteria**: `GET /api/v1/search?q=...&type=...` returns paginated results; `GET /api/v1/recommendations/{userId}` returns recommendation list; response time p99 < 200ms.
**Steps**: (1) Write search API route (2) Write recommendations API route (3) Write API performance test

---

#### [COMP-015.1] Learn package setup + Career aggregate
`S26` `Critical` `S` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-003, COMP-010
**Criteria**: `packages/learn` workspace; `Career` aggregate with `careerId`, `title`, `tracks[]`; `Track` entity; `Course` entity; hierarchical relationship enforced; unit tests.
**Steps**: (1) Scaffold `packages/learn` (2) Write `Career`, `Track`, `Course` entities (3) Write hierarchy tests

---

#### [COMP-015.2] Track and Course entities
`S26` `Critical` `S` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-015.1
**Criteria**: `Track` entity with `prerequisites: CourseId[]`; `Course` entity with `fragments: FragmentId[]`; ordering enforced; `CourseStatus` enum; unit tests.
**Steps**: (1) Write `Track` entity with prerequisites (2) Write `Course` entity (3) Write ordering tests

---

#### [COMP-015.3] FogOfWarNavigationService
`S26` `Critical` `M` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-015.2, COMP-010
**Criteria**: `FogOfWarNavigationService.getAccessible(userId, careerId)` returns unlocked + locked content with lock reasons; unlocks next content on prerequisite completion; unit tests with various progress states.
**Steps**: (1) Write `FogOfWarNavigationService` (2) Implement lock/unlock logic (3) Write progress-based unlock tests

---

#### [COMP-015.4] PrerequisiteEvaluator
`S26` `High` `S` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-015.3
**Criteria**: `PrerequisiteEvaluator.evaluate(userId, courseId)` checks if all prerequisites met via `LearnerProgressRecord`; returns `{met: bool, missing: CourseId[]}`; unit tests.
**Steps**: (1) Write `PrerequisiteEvaluator` (2) Check progress records (3) Write missing prerequisites test

---

#### [COMP-015.5] ContentHierarchyRepository (Postgres)
`S26` `High` `S` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-015.4, COMP-039.4
**Criteria**: Migrations for `careers`, `tracks`, `courses` tables; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-015.6] Content hierarchy REST API endpoints
`S26` `High` `M` [Record→](./components/COMP-015-learn-content-hierarchy.md)
Status: ⬜ | **Deps**: COMP-015.5, COMP-033.2
**Criteria**: `GET /api/v1/learn/careers`, `GET /api/v1/learn/careers/{id}/tracks`, `GET /api/v1/learn/courses/{id}`; fog-of-war applied to authenticated user; integration tests.
**Steps**: (1) Write API routes (2) Apply fog-of-war in responses (3) Write integration tests

---

#### [COMP-016.1] Fragment aggregate (IL1 invariant)
`S27` `Critical` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-015, COMP-003
**Criteria**: `Fragment` aggregate enforces IL1 (at least one DIP artifact before publish); `FragmentStatus` lifecycle; `Fragment.publish()` validates IL1 and throws `IL1ViolationError` if not met; unit tests.
**Steps**: (1) Write `Fragment` aggregate (2) Implement IL1 guard in `publish()` (3) Write IL1 violation test

---

#### [COMP-016.2] Artifact content types (Video, Text, Code, Quiz)
`S27` `Critical` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.1
**Criteria**: `VideoArtifact`, `TextArtifact`, `CodeArtifact`, `QuizArtifact` value objects; each has type-specific metadata; `ArtifactContent.validate()` per type; unit tests.
**Steps**: (1) Write 4 content type value objects (2) Add type-specific validation (3) Write content type tests

---

#### [COMP-016.3] LearnerProgressRecord
`S27` `Critical` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.2, COMP-010
**Criteria**: `LearnerProgressRecord` entity tracks completion per `(userId, fragmentId)`; `complete()` method publishes `learn.fragment.completed` event; stores completion timestamp and score; unit tests.
**Steps**: (1) Write `LearnerProgressRecord` entity (2) Add completion event (3) Write completion tests

---

#### [COMP-016.4] DIP artifact publication bridge
`S27` `High` `S` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.1, COMP-003.2
**Criteria**: `LearnArtifactBridge.publish(fragment)` creates a DIP `Artifact` from the fragment content; attaches Nostr anchor; called on `Fragment.publish()`; unit tests with mock DIP service.
**Steps**: (1) Write `LearnArtifactBridge` (2) Map fragment to DIP artifact (3) Write bridge tests

---

#### [COMP-016.5] FragmentRepository (Postgres)
`S27` `High` `S` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.4, COMP-039.4
**Criteria**: Migrations for `fragments`, `learner_progress_records`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-016.6] Fragment review workflow
`S28` `High` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.5
**Criteria**: `FragmentReviewService.submit(fragmentId)` moves to `in_review`; `approve(fragmentId)` by reviewer; `reject(fragmentId)` with reason; state machine transitions; unit tests.
**Steps**: (1) Write review state machine (2) Add role check (reviewer only) (3) Write review flow test

---

#### [COMP-016.7] Fragment REST API endpoints
`S28` `High` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.6, COMP-033.2
**Criteria**: `POST /api/v1/learn/fragments`, `GET /api/v1/learn/fragments/{id}`, `POST /api/v1/learn/fragments/{id}/complete`, `POST /api/v1/learn/fragments/{id}/submit`; auth required.
**Steps**: (1) Write API routes (2) Wire to services (3) Write API tests

---

#### [COMP-016.8] Fragment integration tests
`S28` `High` `M` [Record→](./components/COMP-016-learn-fragment-engine.md)
Status: ⬜ | **Deps**: COMP-016.7
**Criteria**: Full lifecycle: create fragment, add artifact, publish (IL1 check), learner completes → portfolio XP updated; Kafka event emitted; uses real DB.
**Steps**: (1) Write lifecycle integration test (2) Assert XP update (3) Assert Kafka event

---

#### [COMP-032.3] Learn pillar Next.js pages
`S28` `High` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.2, COMP-015, COMP-016
**Criteria**: `apps/learn` pages: `/learn` (career list), `/learn/tracks/[id]` (track detail), `/learn/courses/[id]` (course + fragments), `/learn/fragments/[id]` (fragment view + progress); fog-of-war UI.
**Steps**: (1) Write career list page (2) Write track/course pages (3) Write fragment view page

---

#### [COMP-017.1] CreatorWorkflow aggregate (5-phase lifecycle)
`S29` `High` `M` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-016, COMP-012
**Criteria**: `CreatorWorkflow` aggregate with 5 phases: `ideation`, `drafting`, `review`, `refinement`, `publication`; `transition(nextPhase)` enforces ordering; domain events per phase; unit tests.
**Steps**: (1) Write `CreatorWorkflow` aggregate (2) Implement phase transition guard (3) Write phase tests

---

#### [COMP-017.2] AIGeneratedDraft (AI Copilot integration)
`S29` `High` `M` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-017.1, COMP-012
**Criteria**: `AIGeneratedDraft` value object stores draft content + AI invocation metadata; `CreatorCopilotService.generateDraft(workflow, prompt)` calls AI agent; draft linked to workflow; unit tests with mock AI.
**Steps**: (1) Write `AIGeneratedDraft` value object (2) Write `CreatorCopilotService` (3) Write draft generation tests

---

#### [COMP-017.3] ApprovalRecord and review workflow
`S29` `High` `S` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-017.2
**Criteria**: `ApprovalRecord` entity stores reviewer decision, comments, timestamp; `ApprovalService.approve/reject(workflowId, reviewerId)` transitions workflow; role check (reviewer only); unit tests.
**Steps**: (1) Write `ApprovalRecord` entity (2) Write `ApprovalService` (3) Write role-check test

---

#### [COMP-017.4] CreatorRepository (Postgres)
`S29` `Medium` `S` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-017.3, COMP-039.4
**Criteria**: Migrations for `creator_workflows`, `approval_records`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-017.5] Creator Tools REST API
`S29` `High` `M` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-017.4, COMP-033.2
**Criteria**: `POST /api/v1/learn/creator/workflows`, `GET /api/v1/learn/creator/workflows/{id}`, `POST /api/v1/learn/creator/workflows/{id}/generate-draft`, `POST /api/v1/learn/creator/workflows/{id}/approve`; creator role required.
**Steps**: (1) Write API routes (2) Wire to services (3) Write API tests

---

#### [COMP-017.6] Creator Tools integration tests
`S29` `High` `M` [Record→](./components/COMP-017-learn-creator-tools.md)
Status: ⬜ | **Deps**: COMP-017.5
**Criteria**: Full workflow: create → generate draft (AI mock) → submit for review → approve → publish fragment; all phase transitions verified.
**Steps**: (1) Write end-to-end workflow test (2) Assert AI integration (3) Assert phase transitions

---

#### [COMP-018.1] MentorshipRelationship aggregate
`S30` `High` `M` [Record→](./components/COMP-018-learn-mentorship.md)
Status: ⬜ | **Deps**: COMP-016, COMP-002
**Criteria**: `MentorshipRelationship` aggregate with `mentorId`, `learnerId`, `status`, `startDate`; `request()`, `accept()`, `end()` transitions; `MentorRole` check on mentor; unit tests.
**Steps**: (1) Write `MentorshipRelationship` aggregate (2) Implement transition guards (3) Write role check test

---

#### [COMP-018.2] MentorReview entity
`S30` `High` `S` [Record→](./components/COMP-018-learn-mentorship.md)
Status: ⬜ | **Deps**: COMP-018.1
**Criteria**: `MentorReview` entity with `reviewId`, `relationshipId`, `fragmentId`, `feedback`, `rating`; mentor can only review fragments of their learner; unit tests.
**Steps**: (1) Write `MentorReview` entity (2) Add learner ownership check (3) Write review tests

---

#### [COMP-018.3] ArtifactGallery read model
`S30` `High` `S` [Record→](./components/COMP-018-learn-mentorship.md)
Status: ⬜ | **Deps**: COMP-018.2, COMP-003
**Criteria**: `ArtifactGallery` read model aggregates published artifacts per user; built from `dip.artifact.published` events; `getGallery(userId)` returns artifact list; unit tests.
**Steps**: (1) Write `ArtifactGallery` read model (2) Build from events (3) Write gallery query test

---

#### [COMP-018.4] MentorshipRepository (Postgres)
`S30` `Medium` `S` [Record→](./components/COMP-018-learn-mentorship.md)
Status: ⬜ | **Deps**: COMP-018.3, COMP-039.4
**Criteria**: Migrations for `mentorship_relationships`, `mentor_reviews`, `artifact_gallery`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-018.5] Mentorship REST API + integration tests
`S30` `High` `M` [Record→](./components/COMP-018-learn-mentorship.md)
Status: ⬜ | **Deps**: COMP-018.4, COMP-033.2
**Criteria**: `POST /api/v1/learn/mentorships`, `PUT /api/v1/learn/mentorships/{id}/accept`, `POST /api/v1/learn/mentorships/{id}/reviews`, `GET /api/v1/users/{id}/gallery`; integration tests.
**Steps**: (1) Write API routes (2) Wire to services (3) Write integration tests

---

#### [COMP-019.1] Issue aggregate
`S31` `Critical` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-003, COMP-007
**Criteria**: `Issue` aggregate with `issueId`, `projectId`, `title`, `type`, `status`; `IssueStatus` lifecycle; `open()`, `assign()`, `close()` transitions; `IssueType` enum; unit tests.
**Steps**: (1) Write `Issue` aggregate (2) Implement lifecycle transitions (3) Write transition tests

---

#### [COMP-019.2] Contribution aggregate
`S31` `Critical` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.1, COMP-003
**Criteria**: `Contribution` aggregate linked to `Issue`; `ContributionStatus` lifecycle; `submit()`, `requestRevision()`, `merge()` transitions; `merge()` publishes DIP artifact; unit tests.
**Steps**: (1) Write `Contribution` aggregate (2) Implement merge event (3) Write merge DIP publication test

---

#### [COMP-019.3] ContributionSandbox aggregate (business logic only)
`S31` `Critical` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.2
**Criteria**: `ContributionSandbox` aggregate with sandbox configuration, resource limits, DIP artifact bridge; business logic only (no container provisioning — wired in COMP-019.6); `ContainerOrchestrator` dependency injected as null/stub; unit tests.
**Steps**: (1) Write `ContributionSandbox` aggregate (2) Inject null orchestrator stub (3) Write business logic tests

---

#### [COMP-019.4] DIPContributionAdapter (ACL)
`S31` `High` `S` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.2, COMP-003.2
**Criteria**: `DIPContributionAdapter` translates Hub `Contribution` to DIP `Artifact` on merge; ACL layer prevents DIP concepts leaking into Hub domain; unit tests with mock DIP service.
**Steps**: (1) Write `DIPContributionAdapter` (2) Map Hub contribution to DIP artifact (3) Write ACL translation tests

---

#### [COMP-019.5] ContributionIntegrationService
`S31` `High` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.4
**Criteria**: `ContributionIntegrationService.merge(contributionId)` orchestrates: merge contribution → publish DIP artifact → update issue status → emit events; transaction boundary; unit tests.
**Steps**: (1) Write integration service (2) Add transaction handling (3) Write orchestration test

---

#### [COMP-019.7] CollaborationRepository (Postgres)
`S32` `High` `S` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.5, COMP-039.4
**Criteria**: Migrations for `issues`, `contributions`, `contribution_sandboxes`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-019.8] Collaboration REST API endpoints
`S32` `High` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.7, COMP-033.2
**Criteria**: `POST /api/v1/hub/issues`, `GET /api/v1/hub/issues`, `POST /api/v1/hub/contributions`, `POST /api/v1/hub/contributions/{id}/merge`; auth required; integration tests.
**Steps**: (1) Write API routes (2) Wire to services (3) Write integration tests

---

#### [COMP-020.1] ContractTemplate entity
`S32` `High` `S` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-007, COMP-004
**Criteria**: `ContractTemplate` entity with `templateId`, `name`, `dsl`, `type`; pre-defined templates for common institution types; `ContractTemplateRepository` stores templates; unit tests.
**Steps**: (1) Write `ContractTemplate` entity (2) Create 3 pre-defined templates (3) Write template tests

---

#### [COMP-020.2] InstitutionCreationWorkflow aggregate
`S32` `Critical` `M` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-020.1, COMP-007
**Criteria**: `InstitutionCreationWorkflow` aggregate guides institution setup; phases: `template_selected`, `founders_confirmed`, `contract_deployed`, `institution_created`; `proceed()` advances phases; unit tests.
**Steps**: (1) Write `InstitutionCreationWorkflow` aggregate (2) Implement phase transitions (3) Write flow tests

---

#### [COMP-020.3] InstitutionProfile read model
`S32` `High` `S` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-020.2, COMP-009
**Criteria**: `InstitutionProfile` read model aggregates public institution data; updated on governance events; `getProfile(institutionId)` returns display-ready data; unit tests.
**Steps**: (1) Write `InstitutionProfile` read model (2) Subscribe to governance events (3) Write read model tests

---

#### [COMP-020.4] InstitutionOrchestrationService
`S33` `Critical` `M` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-020.3, COMP-007
**Criteria**: `InstitutionOrchestrationService.createInstitution(workflow)` completes workflow: template → governance contract → DIP institution creation; each step atomic; saga pattern on failure; unit tests.
**Steps**: (1) Write orchestration service (2) Implement saga rollback (3) Write saga failure test

---

#### [COMP-020.5] InstitutionRepository (Postgres)
`S33` `High` `S` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-020.4, COMP-039.4
**Criteria**: Migrations for `contract_templates`, `institution_creation_workflows`, `institution_profiles`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-020.6] Institution Orchestration REST API
`S33` `High` `M` [Record→](./components/COMP-020-hub-institution-orchestration.md)
Status: ⬜ | **Deps**: COMP-020.5, COMP-033.2
**Criteria**: `POST /api/v1/hub/institutions/create`, `GET /api/v1/hub/institutions/{id}`, `GET /api/v1/hub/contract-templates`; integration tests including full creation flow.
**Steps**: (1) Write API routes (2) Wire to orchestration service (3) Write integration test

---

#### [COMP-021.1] DiscoveryDocument read model
`S33` `High` `M` [Record→](./components/COMP-021-hub-public-square.md)
Status: ⬜ | **Deps**: COMP-020.6, COMP-009
**Criteria**: `DiscoveryDocument` read model with `institutionId`, `name`, `prominenceScore`, `projectCount`, `contributorCount`, `recentArtifacts[]`; updated on `dip.governance.*` and `hub.contribution.*` events; unit tests.
**Steps**: (1) Write `DiscoveryDocument` read model (2) Define update triggers (3) Write update tests

---

#### [COMP-021.2] ProminenceScorer
`S34` `High` `M` [Record→](./components/COMP-021-hub-public-square.md)
Status: ⬜ | **Deps**: COMP-021.1
**Criteria**: `ProminenceScorer.score(institutionId)` computes weighted score from: artifact count (30%), contributor count (25%), governance activity (20%), recent contributions (15%), cross-links (10%); time-decayed; unit tests.
**Steps**: (1) Define scoring weights (2) Write `ProminenceScorer` (3) Write scoring scenarios

---

#### [COMP-021.3] PublicSquareIndexer (Kafka consumer)
`S34` `High` `S` [Record→](./components/COMP-021-hub-public-square.md)
Status: ⬜ | **Deps**: COMP-021.2, COMP-009.1
**Criteria**: `PublicSquareIndexer` subscribes to `dip.governance.*`, `hub.contribution.merged`; updates `DiscoveryDocument` and recomputes prominence; registered in `WorkerRegistry`; integration test.
**Steps**: (1) Write indexer consumer (2) Wire to scorer (3) Write indexing test

---

#### [COMP-021.4] DiscoveryRepository (Postgres)
`S34` `Medium` `S` [Record→](./components/COMP-021-hub-public-square.md)
Status: ⬜ | **Deps**: COMP-021.3, COMP-039.4
**Criteria**: Migration creates `discovery_documents` table; `DiscoveryRepository` with `findTop(limit)`, `findById`; integration test.
**Steps**: (1) Write migration (2) Write repository (3) Write integration test

---

#### [COMP-021.5] Public Square REST API
`S34` `High` `S` [Record→](./components/COMP-021-hub-public-square.md)
Status: ⬜ | **Deps**: COMP-021.4, COMP-033.2
**Criteria**: `GET /api/v1/hub/discover` returns top institutions by prominence; `GET /api/v1/hub/discover?search=...` FTS on institutions; public endpoint (no auth required).
**Steps**: (1) Write discover endpoint (2) Add search filter (3) Write API tests

---

#### [COMP-032.4] Hub pillar Next.js pages
`S34` `High` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.2, COMP-019, COMP-020, COMP-021
**Criteria**: `apps/hub` pages: `/hub` (discover), `/hub/institutions/[id]` (institution detail), `/hub/issues` (issue board), `/hub/contribute/[id]` (contribution flow); prominence ranking visible.
**Steps**: (1) Write discover page (2) Write issue board page (3) Write contribution flow page

---

#### [COMP-022.1] Labs package setup + SubjectArea taxonomy
`S35` `Critical` `S` [Record→](./components/COMP-022-labs-scientific-context.md)
Status: ⬜ | **Deps**: COMP-003
**Criteria**: `packages/labs` workspace; `SubjectArea` taxonomy (hierarchical: domain → field → subfield); `SubjectArea` entity with parent reference; seeded from standard taxonomy (e.g., ACM CCS); unit tests.
**Steps**: (1) Scaffold `packages/labs` (2) Write `SubjectArea` entity (3) Seed taxonomy data

---

#### [COMP-022.2] ResearchMethodology entity
`S35` `High` `S` [Record→](./components/COMP-022-labs-scientific-context.md)
Status: ⬜ | **Deps**: COMP-022.1
**Criteria**: `ResearchMethodology` entity: `name`, `type` (quantitative/qualitative/mixed), `description`; standard methodologies seeded; unit tests.
**Steps**: (1) Write `ResearchMethodology` entity (2) Seed standard methodologies (3) Write tests

---

#### [COMP-022.3] HypothesisRecord aggregate
`S35` `High` `S` [Record→](./components/COMP-022-labs-scientific-context.md)
Status: ⬜ | **Deps**: COMP-022.2
**Criteria**: `HypothesisRecord` aggregate with `hypothesisId`, `statement`, `status` (proposed/confirmed/refuted); `HypothesisStatus` lifecycle; linked to experiment; unit tests.
**Steps**: (1) Write `HypothesisRecord` aggregate (2) Add status transitions (3) Write tests

---

#### [COMP-022.4] ScientificContextRepository (Postgres)
`S35` `High` `S` [Record→](./components/COMP-022-labs-scientific-context.md)
Status: ⬜ | **Deps**: COMP-022.3, COMP-039.4
**Criteria**: Migrations for `subject_areas`, `research_methodologies`, `hypothesis_records`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-022.5] Scientific Context REST API
`S35` `High` `S` [Record→](./components/COMP-022-labs-scientific-context.md)
Status: ⬜ | **Deps**: COMP-022.4, COMP-033.2
**Criteria**: `GET /api/v1/labs/subject-areas` (tree), `GET /api/v1/labs/methodologies`, `POST /api/v1/labs/hypotheses`, `GET /api/v1/labs/hypotheses/{id}`; API tests.
**Steps**: (1) Write API routes (2) Wire to repositories (3) Write API tests

---

#### [COMP-023.1] ScientificArticle aggregate with MyST Markdown
`S36` `Critical` `M` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-022, COMP-003
**Criteria**: `ScientificArticle` aggregate with `articleId`, `title`, `content` (MyST Markdown string), `subjectAreaId`, `authorId`, `status`; `ArticleStatus` lifecycle; unit tests.
**Steps**: (1) Write `ScientificArticle` aggregate (2) Define `ArticleStatus` enum (3) Write unit tests

---

#### [COMP-023.2] ArticleVersion snapshot
`S36` `Critical` `S` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.1
**Criteria**: `ArticleVersion` entity stores immutable content snapshot with version number and timestamp; created on each `save()`; `ArticleVersion.getLatest()` returns most recent; unit tests.
**Steps**: (1) Write `ArticleVersion` entity (2) Add auto-increment versioning (3) Write version history tests

---

#### [COMP-023.3] MyST-to-HTML renderer
`S36` `Critical` `M` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.2
**Criteria**: `MystRenderer.render(mystMarkdown)` returns HTML string; supports: headings, citations `[@key]`, figures, equations, admonitions; inline math `$x^2$` rendered via KaTeX; unit tests with sample MyST.
**Steps**: (1) Add `myst-parser` library (2) Write `MystRenderer` wrapper (3) Write rendering tests

---

#### [COMP-023.4] Article DIP artifact publication
`S36` `High` `S` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.3, COMP-003.2
**Criteria**: `LabsArtifactBridge.publish(article)` creates DIP artifact on article publication; attaches Nostr anchor; content hash of MyST source; unit tests.
**Steps**: (1) Write `LabsArtifactBridge` (2) Map article to DIP artifact (3) Write bridge tests

---

#### [COMP-023.5] ArticleRepository (Postgres)
`S36` `High` `S` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.4, COMP-039.4
**Criteria**: Migrations for `scientific_articles`, `article_versions`; repositories with `save`, `findById`, `findByAuthor`; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-023.6] Article submission workflow
`S37` `High` `M` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.5
**Criteria**: `ArticleSubmissionService.submit(articleId)` transitions to `submitted`; notifies reviewers; `retract()` moves back to `draft`; `accept()` triggers DIP publication; unit tests.
**Steps**: (1) Write submission service (2) Add reviewer notification (3) Write submission flow test

---

#### [COMP-023.7] Article REST API endpoints
`S37` `High` `M` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.6, COMP-033.2
**Criteria**: `POST /api/v1/labs/articles`, `GET /api/v1/labs/articles/{id}`, `PUT /api/v1/labs/articles/{id}`, `POST /api/v1/labs/articles/{id}/submit`, `GET /api/v1/labs/articles/{id}/versions`; auth required.
**Steps**: (1) Write API routes (2) Wire to services (3) Write API tests

---

#### [COMP-023.8] Article integration tests
`S37` `High` `M` [Record→](./components/COMP-023-labs-article-editor.md)
Status: ⬜ | **Deps**: COMP-023.7
**Criteria**: Full lifecycle: create → version snapshot → render MyST → submit → DIP artifact published; Kafka event emitted; uses real DB.
**Steps**: (1) Write lifecycle integration test (2) Assert MyST render (3) Assert DIP publication

---

#### [COMP-024.1] ExperimentDesign aggregate
`S37` `High` `S` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-022, COMP-023
**Criteria**: `ExperimentDesign` aggregate with `experimentId`, `hypothesisId`, `methodology`, `protocol`, `status`; linked to article; `ExperimentStatus` enum; unit tests.
**Steps**: (1) Write `ExperimentDesign` aggregate (2) Link to hypothesis (3) Write unit tests

---

#### [COMP-024.2] ExperimentResult entity
`S38` `High` `S` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-024.1
**Criteria**: `ExperimentResult` entity with raw data, statistical summary, `pValue`; linked to experiment; immutable once created; unit tests.
**Steps**: (1) Write `ExperimentResult` entity (2) Add immutability guard (3) Write tests

---

#### [COMP-024.3] AnonymizationPolicyEnforcer
`S38` `Critical` `M` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-024.2
**Criteria**: `AnonymizationPolicyEnforcer.enforce(result)` redacts PII fields based on experiment type policy; `PersonalDataField` marked fields redacted before storage; configurable per `SubjectArea`; unit tests.
**Steps**: (1) Define `PersonalDataField` marker (2) Write `AnonymizationPolicyEnforcer` (3) Write PII redaction tests

---

#### [COMP-024.4] ExperimentRepository (Postgres)
`S38` `High` `S` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-024.3, COMP-039.4
**Criteria**: Migrations for `experiment_designs`, `experiment_results`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-024.5] Experiment Design REST API
`S38` `High` `M` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-024.4, COMP-033.2
**Criteria**: `POST /api/v1/labs/experiments`, `GET /api/v1/labs/experiments/{id}`, `POST /api/v1/labs/experiments/{id}/results`; anonymization applied transparently; API tests.
**Steps**: (1) Write API routes (2) Wire anonymization to result submission (3) Write API tests

---

#### [COMP-024.6] Experiment integration tests
`S38` `High` `M` [Record→](./components/COMP-024-labs-experiment-design.md)
Status: ⬜ | **Deps**: COMP-024.5
**Criteria**: Create experiment, submit result with PII, verify PII redacted in stored result; verify hypothesis linked; uses real DB.
**Steps**: (1) Write PII redaction integration test (2) Assert stored result has no PII (3) Assert hypothesis link

---

#### [COMP-025.1] Review aggregate
`S39` `Critical` `M` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-023, COMP-002
**Criteria**: `Review` aggregate with `reviewId`, `articleId`, `reviewerId`, `status`, `content`; `ReviewStatus` lifecycle; `submit()`, `revise()`, `publish()` transitions; unit tests.
**Steps**: (1) Write `Review` aggregate (2) Implement lifecycle transitions (3) Write status tests

---

#### [COMP-025.2] ReviewPassageLink value object
`S39` `High` `S` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.1
**Criteria**: `ReviewPassageLink` value object links review comment to specific passage in article (by offset/anchor); `getLinkedText(article, link)` returns passage text; unit tests.
**Steps**: (1) Write `ReviewPassageLink` value object (2) Add offset/anchor fields (3) Write passage retrieval tests

---

#### [COMP-025.3] AuthorResponse entity
`S39` `High` `S` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.2
**Criteria**: `AuthorResponse` entity links author reply to specific review comment; `responderId` must be article author; unit tests.
**Steps**: (1) Write `AuthorResponse` entity (2) Add author ownership check (3) Write response tests

---

#### [COMP-025.4] ReviewVisibilityEvaluator
`S39` `Critical` `M` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.3, COMP-037.1
**Criteria**: `ReviewVisibilityEvaluator.isVisible(review, requestingActorId)` enforces blind review rules; reviewer identity hidden until publication; `open` review: reviewer identity visible after publication; unit tests.
**Steps**: (1) Define visibility rules (2) Write `ReviewVisibilityEvaluator` (3) Write blind review enforcement tests

---

#### [COMP-025.5] ReviewRepository (Postgres)
`S39` `High` `S` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.4, COMP-039.4
**Criteria**: Migrations for `reviews`, `review_passage_links`, `author_responses`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-025.6] Review publication scheduler
`S40` `High` `S` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.5
**Criteria**: `ReviewPublicationScheduler` cron job (every 15min) publishes embargoed reviews when embargo period expires; updates `ReviewStatus` to `published`; registered in `CronScheduler`; unit tests.
**Steps**: (1) Write `ReviewPublicationScheduler` job (2) Register in cron (3) Write embargo expiry test

---

#### [COMP-025.7] Peer Review REST API
`S40` `High` `M` [Record→](./components/COMP-025-labs-open-peer-review.md)
Status: ⬜ | **Deps**: COMP-025.6, COMP-033.2
**Criteria**: `POST /api/v1/labs/articles/{id}/reviews`, `GET /api/v1/labs/articles/{id}/reviews` (visibility enforced), `POST /api/v1/labs/reviews/{id}/responses`; reviewer role for submission.
**Steps**: (1) Write API routes (2) Apply visibility evaluator in GET (3) Write API tests

---

#### [COMP-026.1] DOIRecord entity
`S40` `High` `S` [Record→](./components/COMP-026-labs-doi-publication.md)
Status: ⬜ | **Deps**: COMP-023
**Criteria**: `DOIRecord` entity with `doiId`, `articleId`, `doi` (string), `registeredAt`, `status`; `DOIStatus` enum; immutable once registered; unit tests.
**Steps**: (1) Write `DOIRecord` entity (2) Add immutability guard (3) Write tests

---

#### [COMP-026.2] DataCiteAdapter
`S40` `High` `M` [Record→](./components/COMP-026-labs-doi-publication.md)
Status: ⬜ | **Deps**: COMP-026.1
**Criteria**: `DataCiteAdapter` implements `DOIProvider` interface; `register(article)` calls DataCite API with metadata; `deactivate(doi)` marks as inactive; circuit breaker applied; mock adapter for tests.
**Steps**: (1) Write `DOIProvider` interface (2) Write `DataCiteAdapter` (3) Write mock adapter + circuit breaker test

---

#### [COMP-026.3] DOIRegistrationService
`S41` `High` `M` [Record→](./components/COMP-026-labs-doi-publication.md)
Status: ⬜ | **Deps**: COMP-026.2
**Criteria**: `DOIRegistrationService.register(articleId)` validates article state (must be accepted), calls `DataCiteAdapter`, stores `DOIRecord`; retries on transient failure; unit tests.
**Steps**: (1) Write `DOIRegistrationService` (2) Add state validation (3) Write retry + failure tests

---

#### [COMP-026.4] ExternalIndexingNotifier
`S41` `Medium` `S` [Record→](./components/COMP-026-labs-doi-publication.md)
Status: ⬜ | **Deps**: COMP-026.3
**Criteria**: `ExternalIndexingNotifier.notify(doiRecord)` submits to CrossRef, DOAJ via webhooks; retry policy applied; non-blocking (fire-and-forget with DLQ fallback); unit tests.
**Steps**: (1) Write `ExternalIndexingNotifier` (2) Apply retry policy (3) Write notification tests

---

#### [COMP-026.5] DOI REST API + integration tests
`S41` `High` `M` [Record→](./components/COMP-026-labs-doi-publication.md)
Status: ⬜ | **Deps**: COMP-026.4, COMP-033.2
**Criteria**: `POST /api/v1/labs/articles/{id}/doi` triggers registration; `GET /api/v1/labs/articles/{id}/doi` returns DOI status; integration test with mock DataCite.
**Steps**: (1) Write API routes (2) Wire to registration service (3) Write integration test with mock

---

#### [COMP-032.5] Labs pillar Next.js pages
`S41` `High` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.2, COMP-023, COMP-025, COMP-026
**Criteria**: `apps/labs` pages: `/labs` (article list), `/labs/articles/[id]` (article with MyST render), `/labs/articles/[id]/reviews` (peer review panel), `/labs/articles/[id]/edit` (editor); DOI badge shown.
**Steps**: (1) Write article list page (2) Write article detail + MyST render (3) Write review panel page

---

#### [COMP-027.1] Sponsorship package setup + Sponsorship aggregate
`S42` `High` `S` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-002, COMP-003
**Criteria**: `packages/sponsorship` workspace; `Sponsorship` aggregate with `sponsorId`, `sponsoredId`, `type`, `amount`, `status`; `SponsorshipStatus` lifecycle; unit tests.
**Steps**: (1) Scaffold `packages/sponsorship` (2) Write `Sponsorship` aggregate (3) Write lifecycle tests

---

#### [COMP-027.2] StripePaymentAdapter
`S42` `High` `M` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.1
**Criteria**: `StripePaymentAdapter` implements `PaymentGateway` interface; `createPaymentIntent(amount, currency)` → Stripe; `handleWebhook(event)` processes payment events; mock adapter for tests; circuit breaker applied.
**Steps**: (1) Write `PaymentGateway` interface (2) Write `StripePaymentAdapter` (3) Write mock + circuit breaker test

---

#### [COMP-027.3] ImpactMetric computation
`S42` `Medium` `M` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.2, COMP-010
**Criteria**: `ImpactMetricService.compute(sponsorshipId)` aggregates artifact views, portfolio growth, contribution activity; returns `ImpactMetric`; refreshed on `portfolio.updated`; unit tests.
**Steps**: (1) Define impact metrics (2) Write `ImpactMetricService` (3) Write computation tests

---

#### [COMP-027.4] SponsorshipRepository (Postgres)
`S42` `Medium` `S` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.3, COMP-039.4
**Criteria**: Migration creates `sponsorships`, `impact_metrics` tables; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-027.5] SponsorshipEventPublisher (Kafka)
`S42` `Medium` `S` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.4, COMP-009.1
**Criteria**: Publishes `sponsorship.created`, `sponsorship.payment.completed`; unit tests.
**Steps**: (1) Write `SponsorshipEventPublisher` (2) Map events (3) Write tests

---

#### [COMP-027.6] Sponsorship REST API
`S43` `High` `M` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.5, COMP-033.2
**Criteria**: `POST /api/v1/sponsorships`, `GET /api/v1/sponsorships/{id}`, `GET /api/v1/sponsorships/{id}/impact`, `POST /api/v1/sponsorships/{id}/payment-intent`; API tests.
**Steps**: (1) Write API routes (2) Wire to Stripe adapter (3) Write API tests

---

#### [COMP-027.7] Sponsorship integration tests
`S43` `Medium` `M` [Record→](./components/COMP-027-sponsorship.md)
Status: ⬜ | **Deps**: COMP-027.6
**Criteria**: Full flow: create sponsorship → payment intent → webhook → status update; impact metric computed; uses real DB + mock Stripe.
**Steps**: (1) Write sponsorship flow test (2) Assert Stripe mock called (3) Assert status update

---

#### [COMP-028.1] Communication package setup + Thread aggregate
`S43` `Critical` `S` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-001, COMP-002
**Criteria**: `packages/communication` workspace; `Thread` aggregate with `threadId`, `participants[]`, `type`; `ThreadType` enum (direct/group/notification); `Thread.addParticipant()`; unit tests.
**Steps**: (1) Scaffold `packages/communication` (2) Write `Thread` aggregate (3) Write participant tests

---

#### [COMP-028.2] Message entity
`S43` `Critical` `S` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.1
**Criteria**: `Message` entity with `messageId`, `threadId`, `authorId`, `content`, `sentAt`; `SoftDeletable` mixin applied; unit tests.
**Steps**: (1) Write `Message` entity (2) Apply `SoftDeletable` (3) Write message tests

---

#### [COMP-028.3] NotificationEventConsumer (Kafka)
`S44` `Critical` `M` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.2, COMP-009.1
**Criteria**: `NotificationEventConsumer` subscribes to all domain events that trigger notifications; creates `Notification` entities; maps events to notification templates; registered in `WorkerRegistry`; integration test.
**Steps**: (1) Write consumer (2) Map events to notifications (3) Write consumer integration test

---

#### [COMP-028.4] Notification delivery service
`S44` `High` `M` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.3
**Criteria**: `NotificationDeliveryService.deliver(notification)` delivers via: in-app (DB), email (SendGrid adapter), push (FCM adapter); respects user preferences; retry on failure; unit tests.
**Steps**: (1) Write `NotificationDeliveryService` (2) Add channel adapters (3) Write delivery tests

---

#### [COMP-028.5] User notification preferences
`S44` `High` `S` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.4
**Criteria**: `NotificationPreferences` entity per user; per-notification-type enable/disable; `mute_until` snooze feature; repository; unit tests.
**Steps**: (1) Write `NotificationPreferences` entity (2) Add preference check in delivery (3) Write preference tests

---

#### [COMP-028.6] Communication REST API
`S44` `High` `M` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.5, COMP-033.2
**Criteria**: `GET /api/v1/notifications` (paginated), `PUT /api/v1/notifications/{id}/read`, `POST /api/v1/messages/threads`, `GET /api/v1/messages/threads/{id}`; auth required.
**Steps**: (1) Write notification routes (2) Write message/thread routes (3) Write API tests

---

#### [COMP-028.7] SSE stream for real-time notifications
`S44` `High` `M` [Record→](./components/COMP-028-communication.md)
Status: ⬜ | **Deps**: COMP-028.6
**Criteria**: `GET /api/v1/notifications/stream` opens SSE connection; pushes new notifications within 3s of event; reconnection via `Last-Event-ID`; integration test.
**Steps**: (1) Write SSE endpoint (2) Subscribe to notification events (3) Write SSE integration test

---

#### [COMP-029.1] Task aggregate
`S45` `High` `S` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-001, COMP-002
**Criteria**: `packages/planning` workspace; `Task` aggregate with `taskId`, `userId`, `title`, `status`; `TaskStatus` enum; `start()`, `complete()`, `cancel()` transitions; unit tests.
**Steps**: (1) Scaffold `packages/planning` (2) Write `Task` aggregate (3) Write transition tests

---

#### [COMP-029.2] Goal and Sprint entities
`S45` `High` `S` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-029.1
**Criteria**: `Goal` entity with `goalId`, `userId`, `description`, `dueDate`, `progress`; `Sprint` entity with date range and `tasks[]`; `Sprint.addTask()` validates dates; unit tests.
**Steps**: (1) Write `Goal` entity (2) Write `Sprint` entity (3) Write sprint date validation tests

---

#### [COMP-029.3] StudyPlan aggregate
`S45` `High` `M` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-029.2, COMP-015
**Criteria**: `StudyPlan` aggregate with `userId`, `careerId`, `suggestedPath[]`; `StudyPlanService.generate(userId, careerId)` builds plan from learner progress + fog-of-war; unit tests.
**Steps**: (1) Write `StudyPlan` aggregate (2) Write `StudyPlanService.generate` (3) Write plan generation tests

---

#### [COMP-029.4] MentorSession scheduling
`S45` `High` `S` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-029.3, COMP-018
**Criteria**: `MentorSession` entity with `sessionId`, `mentorId`, `learnerId`, `scheduledAt`, `status`; `schedule()` checks mentor availability; `MentorSession.complete()` updates mentorship record; unit tests.
**Steps**: (1) Write `MentorSession` entity (2) Add availability check (3) Write scheduling tests

---

#### [COMP-029.5] PlanningRepository (Postgres)
`S45` `Medium` `S` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-029.4, COMP-039.4
**Criteria**: Migrations for `tasks`, `goals`, `sprints`, `study_plans`, `mentor_sessions`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-029.6] Planning REST API + integration tests
`S46` `High` `M` [Record→](./components/COMP-029-planning.md)
Status: ⬜ | **Deps**: COMP-029.5, COMP-033.2
**Criteria**: `POST /api/v1/planning/tasks`, `GET /api/v1/planning/goals`, `POST /api/v1/planning/study-plans/generate`, `POST /api/v1/planning/mentor-sessions`; integration tests.
**Steps**: (1) Write API routes (2) Wire study plan generation (3) Write integration tests

---

#### [COMP-030.1] IDE package setup + IDESession aggregate
`S46` `Critical` `S` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-001, COMP-002
**Criteria**: `packages/ide` workspace; `IDESession` aggregate with `sessionId`, `userId`, `projectId`, `status`; `IDESessionStatus` lifecycle; `create()`, `start()`, `suspend()`, `terminate()` transitions; unit tests.
**Steps**: (1) Scaffold `packages/ide` (2) Write `IDESession` aggregate (3) Write lifecycle tests

---

#### [COMP-030.2] Container value object + ContainerOrchestrator interface
`S46` `Critical` `S` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.1
**Criteria**: `Container` value object with `containerId`, `image`, `cpuLimit`, `memoryLimit`, `status`; `ContainerOrchestrator` interface with `provision()`, `stop()`, `getStatus()`; unit tests.
**Steps**: (1) Write `Container` value object (2) Write `ContainerOrchestrator` interface (3) Write interface tests

---

#### [COMP-030.3] ResourceQuotaEnforcer
`S46` `Critical` `M` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.2, COMP-037.1
**Criteria**: `ResourceQuotaEnforcer.enforce(userId)` checks active session count ≤ quota; checks CPU/memory budget; throws `QuotaExceededError` if exceeded; quota configurable per role; unit tests.
**Steps**: (1) Define quota config per role (2) Write `ResourceQuotaEnforcer` (3) Write quota exceeded test

---

#### [COMP-030.4] WorkspaceSnapshot entity
`S47` `High` `S` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.3
**Criteria**: `WorkspaceSnapshot` entity stores file system state; `save(sessionId, files)` creates snapshot; `restore(sessionId)` retrieves; snapshots versioned; unit tests.
**Steps**: (1) Write `WorkspaceSnapshot` entity (2) Add save/restore methods (3) Write snapshot tests

---

#### [COMP-030.5] ArtifactPublishBridge
`S47` `High` `S` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.4, COMP-003.2
**Criteria**: `IDEArtifactBridge.publish(session, files)` creates DIP artifact from IDE output files; called when user triggers publish from IDE; ACL translation; unit tests.
**Steps**: (1) Write `IDEArtifactBridge` (2) Map files to DIP artifact (3) Write bridge tests

---

#### [COMP-030.6] IDE session provisioning service
`S47` `Critical` `M` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.5
**Criteria**: `IDESessionProvisioningService.start(sessionId)` calls `ContainerOrchestrator.provision()`, updates session status, emits `ContainerProvisioned` event; `suspend()` stops container, saves snapshot; unit tests.
**Steps**: (1) Write `IDESessionProvisioningService` (2) Wire to orchestrator (3) Write provision + suspend tests

---

#### [COMP-030.7] IDERepository (Postgres)
`S47` `High` `S` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.6, COMP-039.4
**Criteria**: Migrations for `ide_sessions`, `workspace_snapshots`; repositories; integration test.
**Steps**: (1) Write migrations (2) Write repositories (3) Write integration test

---

#### [COMP-030.8] IDE Domain REST API
`S47` `High` `M` [Record→](./components/COMP-030-ide-domain.md)
Status: ⬜ | **Deps**: COMP-030.7, COMP-033.2
**Criteria**: `POST /api/v1/ide/sessions`, `GET /api/v1/ide/sessions/{id}`, `POST /api/v1/ide/sessions/{id}/start`, `POST /api/v1/ide/sessions/{id}/suspend`; quota enforced; API tests.
**Steps**: (1) Write API routes (2) Add quota enforcement (3) Write API tests

---

#### [COMP-019.6] ContributionSandboxOrchestrator
`S48` `High` `M` [Record→](./components/COMP-019-hub-collaboration-layer.md)
Status: ⬜ | **Deps**: COMP-019.3, COMP-030
**Criteria**: `ContributionSandboxOrchestrator.provision(sandbox)` wires `ContributionSandbox` aggregate to real `ContainerOrchestrator`; provisions container on contribution start; terminates on merge/close; unit tests.
**Steps**: (1) Write `ContributionSandboxOrchestrator` (2) Wire to IDE `ContainerOrchestrator` (3) Write orchestration tests

---

#### [COMP-014.1] Learn AI tool handlers
`S48` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-012, COMP-013, COMP-015, COMP-016
**Criteria**: Tool handlers: `search_fragments(query)`, `get_fragment(id)`, `get_learner_progress(userId)`, `suggest_next_content(userId)`; registered in agent registry; unit tests with mock domain data.
**Steps**: (1) Write 4 Learn tool handlers (2) Register in agent registry (3) Write handler tests

---

#### [COMP-014.2] Hub AI tool handlers
`S48` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-012, COMP-013, COMP-019, COMP-020
**Criteria**: Tool handlers: `get_issues(projectId)`, `get_contribution(id)`, `analyze_contribution(id)`, `get_institution_summary(id)`; registered in agent registry; unit tests.
**Steps**: (1) Write 4 Hub tool handlers (2) Register in agent registry (3) Write handler tests

---

#### [COMP-014.3] Labs AI tool handlers
`S48` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-012, COMP-013, COMP-022, COMP-023
**Criteria**: Tool handlers: `get_article(id)`, `search_articles(query)`, `get_experiment(id)`, `suggest_methodology(subjectArea)`; registered in agent registry; unit tests.
**Steps**: (1) Write 4 Labs tool handlers (2) Register in agent registry (3) Write handler tests

---

#### [COMP-014.4] Cross-pillar AI tool handlers
`S49` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-012, COMP-011
**Criteria**: Cross-pillar tools: `search_all(query)`, `get_portfolio(userId)`, `get_recommendations(userId)`; synthesize results from Search + Portfolio domains; unit tests.
**Steps**: (1) Write 3 cross-pillar handlers (2) Wire to Search + Portfolio (3) Write synthesis tests

---

#### [COMP-014.5] AI agent system prompts
`S49` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-013.3
**Criteria**: System prompts defined for all 12 agents (Learn tutor, Learn creator, Hub maintainer, Hub curator, Hub mentor, Labs editor, Labs reviewer, Labs advisor, Cross-pillar synthesizer, etc.); stored in `SystemPromptRepository`; version-controlled.
**Steps**: (1) Write system prompts for all 12 agents (2) Store in `SystemPromptRepository` (3) Wire to `AIAgentDefinition`

---

#### [COMP-014.6] IDE tool handler
`S49` `High` `M` [Record→](./components/COMP-014-ai-agents-pillar.md)
Status: ⬜ | **Deps**: COMP-012, COMP-030
**Criteria**: IDE tool handlers: `list_files(sessionId)`, `read_file(sessionId, path)`, `write_file(sessionId, path, content)`, `run_command(sessionId, cmd)`; session ownership enforced; unit tests.
**Steps**: (1) Write 4 IDE tool handlers (2) Add session ownership check (3) Write handler tests

---

#### [COMP-031.1] Gov/Mod package setup + ModerationFlag aggregate
`S49` `Critical` `S` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-001, COMP-028
**Criteria**: `packages/governance-moderation` workspace; `ModerationFlag` aggregate with `flagId`, `entityType`, `entityId`, `reason`, `status`; `FlagStatus` enum; unit tests.
**Steps**: (1) Scaffold `packages/governance-moderation` (2) Write `ModerationFlag` aggregate (3) Write flag tests

---

#### [COMP-031.2] ModerationAction entity
`S50` `Critical` `S` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-031.1
**Criteria**: `ModerationAction` entity records moderator decision (`approve`, `remove`, `warn`, `ban`); links to `ModerationFlag`; moderator role required; audit trail; unit tests.
**Steps**: (1) Write `ModerationAction` entity (2) Add moderator role check (3) Write audit trail test

---

#### [COMP-031.3] PlatformPolicy aggregate
`S50` `Critical` `M` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-031.2
**Criteria**: `PlatformPolicy` aggregate with policy rules; `PolicyRule` value objects; `PlatformPolicy.addRule()`, `removeRule()`; versioned; unit tests.
**Steps**: (1) Write `PlatformPolicy` aggregate (2) Add rule management (3) Write versioning tests

---

#### [COMP-031.4] ContentPolicyEvaluator
`S50` `Critical` `M` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-031.3
**Criteria**: `ContentPolicyEvaluator.evaluate(content, policy)` checks content against policy rules; returns `PolicyViolation[]`; supports text pattern rules and metadata rules; unit tests.
**Steps**: (1) Write `ContentPolicyEvaluator` (2) Implement text + metadata rules (3) Write violation detection tests

---

#### [COMP-031.5] CommunityProposal aggregate
`S50` `High` `M` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-031.4
**Criteria**: `CommunityProposal` aggregate with proposal lifecycle; voting mechanism; threshold check before execution; `CommunityProposalService.execute()` applies policy change; unit tests.
**Steps**: (1) Write `CommunityProposal` aggregate (2) Add voting threshold (3) Write execution tests

---

#### [COMP-031.6] Governance & Moderation REST API
`S50` `High` `M` [Record→](./components/COMP-031-governance-moderation.md)
Status: ⬜ | **Deps**: COMP-031.5, COMP-033.2
**Criteria**: `POST /api/v1/moderation/flags`, `GET /api/v1/moderation/flags` (moderator), `POST /api/v1/moderation/actions`, `POST /api/v1/community-proposals`, `POST /api/v1/community-proposals/{id}/vote`; integration tests.
**Steps**: (1) Write all API routes (2) Add role guards (3) Write integration tests

---

#### [COMP-033.4] Route registration for all domain packages
`S51` `Critical` `M` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: All domain packages
**Criteria**: All domain routers imported and registered; route prefixes: `/api/v1/auth/*`, `/api/v1/learn/*`, `/api/v1/hub/*`, `/api/v1/labs/*`, `/api/v1/ai-agents/*`, `/api/v1/sponsorships/*`, `/api/v1/notifications/*`, `/api/v1/moderation/*`; Zod validation on all routes.
**Steps**: (1) Write `router.ts` importing all domain routes (2) Register with correct prefixes (3) Run `GET /api/v1/openapi.json` and verify all paths present

---

#### [COMP-033.5] API versioning strategy
`S51` `High` `S` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: COMP-033.4
**Criteria**: Current version `/api/v1/*`; `Accept: application/vnd.syntropy.v1+json` header support; deprecated endpoints return `Deprecation: true` header; version middleware.
**Steps**: (1) Write `api-version.ts` middleware (2) Add `Deprecation` header support (3) Write version negotiation test

---

#### [COMP-033.6] OpenAPI spec generation
`S51` `Medium` `S` [Record→](./components/COMP-033-rest-api.md)
Status: ⬜ | **Deps**: COMP-033.4
**Criteria**: `GET /api/v1/openapi.json` returns OpenAPI 3.1 spec; `GET /api/v1/docs` shows Swagger UI; validated with `@redocly/cli`; exported to `docs/api/openapi.json` during build.
**Steps**: (1) Configure Fastify OpenAPI plugin (2) Add Swagger UI plugin (3) Run redocly validation

---

#### [COMP-037.2] API security headers and CSP
`S51` `High` `S` [Record→](./components/COMP-037-security.md)
Status: ⬜ | **Deps**: COMP-033
**Criteria**: Helmet.js configured; CSP `default-src 'self'` with specific allowances; `Strict-Transport-Security`; `X-Frame-Options: DENY`; all Next.js apps: CSP headers via `next.config.ts`.
**Steps**: (1) Add `@fastify/helmet` with strict config (2) Configure Next.js CSP headers (3) Validate with securityheaders.com or tests

---

#### [COMP-037.4] mTLS configuration for internal services
`S51` `High` `S` [Record→](./components/COMP-037-security.md)
Status: ⬜ | **Deps**: COMP-033
**Criteria**: `/internal/*` routes require client certificates; dev: self-signed via `mkcert`; prod: Kubernetes cert-manager; documentation for adding new services.
**Steps**: (1) Write TLS configuration in Fastify (2) Generate dev certificates (3) Document mTLS setup

---

#### [COMP-032.6] Admin dashboard pages
`S52` `High` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.2, COMP-031
**Criteria**: `apps/platform` admin section: `/admin/moderation` (flag queue), `/admin/users` (user management), `/admin/policies` (policy editor); admin role gated; data from REST API.
**Steps**: (1) Write admin layout with role check (2) Write moderation dashboard (3) Write user + policy pages

---

#### [COMP-032.7] API proxy and route handlers
`S52` `Critical` `M` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.2, COMP-033.4
**Criteria**: Next.js API routes proxy to REST API; `Authorization` header forwarded; error responses translated to Next.js compatible format; integration test.
**Steps**: (1) Write API proxy routes in Next.js (2) Forward auth header (3) Write proxy integration test

---

#### [COMP-032.8] Error boundaries and domain error pages
`S52` `High` `S` [Record→](./components/COMP-032-web-application.md)
Status: ⬜ | **Deps**: COMP-032.3, COMP-032.4, COMP-032.5
**Criteria**: React error boundaries wrap all pillar app pages; domain-specific error pages: 404, 403 (unauthorized), 500; error messages user-friendly; correlation ID shown for support.
**Steps**: (1) Write error boundary components (2) Write domain error pages (3) Add correlation ID display

---

#### [COMP-034.6] IDE session inactivity supervisor
`S52` `High` `S` [Record→](./components/COMP-034-background-services.md)
Status: ⬜ | **Deps**: COMP-034.1, COMP-030
**Criteria**: Every 2min: scans active sessions for inactivity > 30min; calls `IDESession.suspend()` + `ContainerOrchestrator.stop()`; terminated sessions cleaned after 24h; Prometheus metrics.
**Steps**: (1) Write `IDESessionSupervisor` worker (2) Add inactivity timer logic (3) Write suspension test

---

#### [COMP-034.7] Integration tests for all workers
`S53` `High` `M` [Record→](./components/COMP-034-background-services.md)
Status: ⬜ | **Deps**: COMP-034.6
**Criteria**: Each worker tested: message processing, error handling, DLQ routing; cron job tests; embedded Kafka via testcontainers; all tests < 2min total.
**Steps**: (1) Set up testcontainers Kafka (2) Write per-worker test (3) Write cron job test

---

#### [COMP-035.1] Monaco Editor React integration
`S53` `High` `M` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-032, COMP-030
**Criteria**: `MonacoEditor` React component; language support: TypeScript, Python, MyST Markdown; dark/light theme; Cmd+S → save; LSP integration via WebSocket; used in Hub + Labs.
**Steps**: (1) Add `@monaco-editor/react` to `packages/ui` (2) Write `MonacoEditor` component (3) Wire to Hub contribution editor

---

#### [COMP-035.2] WebSocket gateway
`S53` `Critical` `M` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-030
**Criteria**: `GET /api/v1/ide/sessions/{id}/ws` WebSocket upgrade; JSON-framed messages: `terminal`, `filesystem`, `lsp`, `heartbeat`; bidirectional terminal stream; auth on handshake; reconnection within 5min.
**Steps**: (1) Write Fastify WebSocket route (2) Implement message type handlers (3) Write WebSocket integration test

---

#### [COMP-035.3] Kubernetes container provisioning adapter
`S53` `Critical` `M` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-030.2
**Criteria**: `KubernetesContainerAdapter` implements `ContainerOrchestrator`; `provision()` creates K8s Pod; `stop()` terminates; Docker fallback for dev; `CONTAINER_ORCHESTRATOR` env var switches; integration test with Docker.
**Steps**: (1) Write `KubernetesContainerAdapter` (2) Write `DockerContainerAdapter` fallback (3) Write Docker integration test

---

#### [COMP-035.4] Session reconnection and state recovery
`S53` `High` `S` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-035.2
**Criteria**: Client receives `session_id` on handshake; reconnection < 5min resumes; reconnection > 5min requires new session; container files preserved; `Reconnecting...` UI indicator.
**Steps**: (1) Write reconnection handler (2) Add session-to-container state tracking (3) Write reconnection test

---

#### [COMP-035.5] Container image configuration
`S54` `High` `S` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-035.3
**Criteria**: `syntropy/ide-base` (Node.js 20, Python 3.11, CLI tools), `syntropy/ide-labs` (+ R, Jupyter), `syntropy/ide-hub` (+ build tools); images pushed to registry in CI; no high CVEs.
**Steps**: (1) Write 3 Dockerfiles (2) Add security scan to CI (3) Push to container registry

---

#### [COMP-035.6] Workspace persistence integration
`S54` `High` `S` [Record→](./components/COMP-035-embedded-ide-platform.md)
Status: ⬜ | **Deps**: COMP-035.2, COMP-030.4
**Criteria**: Auto-save every 2min while active; on suspension: full snapshot; on resume: workspace restored before WebSocket accepted; progress indicator during restore.
**Steps**: (1) Write auto-save timer (2) Wire suspension to snapshot (3) Write restore integration test

---

#### [COMP-036.1] Next.js ISR routing and data fetching
`S54` `High` `S` [Record→](./components/COMP-036-institutional-site.md)
Status: ⬜ | **Deps**: COMP-001, COMP-007, COMP-009
**Criteria**: `apps/institutional-site`; `/institutions/[slug]` with ISR (60s revalidation); `generateStaticParams()` pre-renders top-100; `revalidatePath` on `dip.governance.proposal_executed`.
**Steps**: (1) Scaffold `apps/institutional-site` (2) Write ISR page routing (3) Write revalidation webhook

---

#### [COMP-036.2] Institution page components
`S54` `High` `S` [Record→](./components/COMP-036-institutional-site.md)
Status: ⬜ | **Deps**: COMP-036.1
**Criteria**: Components: `InstitutionHero`, `GovernanceSummary`, `LegitimacyChainTimeline`, `ProjectGrid`, `ContributorHighlights`; server components with data fetching from REST API.
**Steps**: (1) Write `InstitutionHero` + `GovernanceSummary` (2) Write `LegitimacyChainTimeline` (3) Write `ProjectGrid` + `ContributorHighlights`

---

#### [COMP-036.3] SEO and structured data
`S55` `Medium` `S` [Record→](./components/COMP-036-institutional-site.md)
Status: ⬜ | **Deps**: COMP-036.2
**Criteria**: OpenGraph metadata per institution; Schema.org `Organization` structured data; `sitemap.xml` dynamically generated; `robots.txt` allows indexing.
**Steps**: (1) Write `generateMetadata()` for institution pages (2) Add Schema.org JSON-LD (3) Write `sitemap.ts`

---

#### [COMP-036.4] Performance optimization
`S55` `Medium` `S` [Record→](./components/COMP-036-institutional-site.md)
Status: ⬜ | **Deps**: COMP-036.2
**Criteria**: `next/image` with `priority` for above-fold; `next/font` preloaded; LCP < 2.5s in Lighthouse; CLS < 0.1; JS bundle < 50KB per page.
**Steps**: (1) Convert images to `next/image` (2) Preload fonts (3) Run Lighthouse and fix issues

---

#### [COMP-038.2] Correlation ID propagation middleware
`S55` `Critical` `S` [Record→](./components/COMP-038-observability.md)
Status: ⬜ | **Deps**: COMP-033, COMP-038.1
**Criteria**: `X-Correlation-ID` header generated if missing; propagated in all downstream HTTP calls; `AsyncLocalStorage` for Node.js thread-local propagation; Kafka messages include `correlation_id` header.
**Steps**: (1) Write correlation context using `AsyncLocalStorage` (2) Auto-include in all outbound HTTP calls (3) Write propagation test

---

#### [COMP-038.3] OpenTelemetry distributed tracing
`S55` `High` `M` [Record→](./components/COMP-038-observability.md)
Status: ⬜ | **Deps**: COMP-038.1
**Criteria**: OpenTelemetry SDK initialized in all apps; auto-instrumentation for HTTP, Postgres, Redis, Kafka; custom spans for key operations; traces exported to Jaeger (dev) via OTLP; 100% sampling in dev.
**Steps**: (1) Add OTel SDK + auto-instrumentation to all apps (2) Add custom spans (3) Verify Jaeger shows traces

---

#### [COMP-038.4] Prometheus metrics
`S56` `High` `S` [Record→](./components/COMP-038-observability.md)
Status: ⬜ | **Deps**: COMP-038.1
**Criteria**: `createMetrics(service)` factory; standard metrics: `http_request_duration_seconds`, `http_requests_total`; custom: `artifact_publications_total`, `ai_agent_invocations_total`; `GET /metrics` endpoint.
**Steps**: (1) Write `metrics.ts` factory in `packages/platform-core` (2) Add to API + workers (3) Verify Prometheus scrapes

---

#### [COMP-038.5] Grafana dashboards and alerting rules
`S56` `Medium` `M` [Record→](./components/COMP-038-observability.md)
Status: ⬜ | **Deps**: COMP-038.4
**Criteria**: `Platform Overview`, `DIP Activity`, `AI Agents` dashboards as JSON; alerting rules: p99 latency, error rate, DLQ depth, IDE quota; dashboards as code in repo.
**Steps**: (1) Write 3 Grafana dashboard JSONs (2) Write Prometheus alert rules YAML (3) Import dashboards in docker-compose

---

#### [COMP-038.6] Log aggregation pipeline configuration
`S56` `Medium` `S` [Record→](./components/COMP-038-observability.md)
Status: ⬜ | **Deps**: COMP-038.1
**Criteria**: `docker-compose.observability.yml` with Grafana + Loki + Promtail; Promtail scrapes Docker logs; 30-day retention; `correlation_id` searchable as Loki label.
**Steps**: (1) Write `docker-compose.observability.yml` (2) Configure Promtail scraping (3) Add LogQL queries to Grafana

---

#### [COMP-039.5] Data retention and archival policy
`S56` `High` `S` [Record→](./components/COMP-039-data-integrity.md)
Status: ⬜ | **Deps**: COMP-039.3, COMP-009.3
**Criteria**: `DataRetentionPolicy` defines retention windows per entity type; scheduled job archives expired records to cold storage (or soft-deletes); `event_log` entries: immutable, never deleted; PII records: deleted per CON-005.
**Steps**: (1) Write `DataRetentionPolicy` config (2) Write retention cron job (3) Write retention policy test

---

## Section 8 — Progress Metrics

> Last Updated: 2026-03-13 | Initialized at project start

### Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Overall Progress** | 24 / 262 items (9%) | 262 / 262 | ⬜ |
| **Current Milestone** | M1 — Foundation + Walking Skeleton | M5 | ⬜ |
| **Current Stage** | S5 — Event Bus Core | S56 | ⬜ |
| **Test Coverage** | — | ≥ 80% | ⬜ |
| **Items with Tests** | — | 100% | ⬜ |
| **Items Blocked** | 0 | 0 | ⬜ |
| **Technical Debt Items** | 0 | < 10 | ✅ |

### Recent completions

- 2026-03-13 COMP-033.1 — REST API server setup and middleware stack
- 2026-03-13 COMP-009.1 — Kafka client package setup
- 2026-03-13 COMP-034.2 — Kafka consumer worker bootstrapping
- 2026-03-13 COMP-034.1 — Background services process setup + worker registry
- 2026-03-13 COMP-040.4 — BulkheadPattern (semaphore concurrency limiter)
- 2026-03-13 COMP-040.2 — RetryPolicy with exponential backoff
- 2026-03-13 COMP-039.4 — AuditColumns mixin
- 2026-03-13 COMP-002.4 — SupabaseAuthAdapter (ACL)
- 2026-03-13 COMP-002.3 — Session aggregate and IdentityToken value object
- 2026-03-13 COMP-002.2 — RBACRole, Permission, Role entities
- 2026-03-13 COMP-002.1 — Identity package setup and User aggregate
- 2026-03-13 COMP-039.3 — PostgreSQL AppendOnlyLog implementation
- 2026-03-13 COMP-039.1 — SoftDeletable mixin
- 2026-03-13 COMP-037.5 — SAST and dependency vulnerability scanning in CI
- 2026-03-13 COMP-037.3 — Data encryption for classified fields
- 2026-03-13 COMP-037.6 — Secret management configuration
- 2026-03-13 COMP-040.3 — TimeoutWrapper utility
- 2026-03-13 COMP-040.1 — CircuitBreaker implementation
- 2026-03-13 COMP-038.1 — Structured logger library
- 2026-03-13 COMP-001.1 — Initialize Turborepo + pnpm workspaces
- 2026-03-13 COMP-001.2 — TypeScript project references and shared tsconfig
- 2026-03-13 COMP-001.3 — Docker Compose local infrastructure
- 2026-03-13 COMP-001.4 — CI/CD pipeline (GitHub Actions)
- 2026-03-13 COMP-001.5 — Development environment scripts and documentation

### Milestone Status

| Milestone | Items | Done | % | Status |
|-----------|-------|------|---|--------|
| M1 Foundation + Walking Skeleton | 45 | 23 | 51% | 🔵 In Progress |
| M2 Core: DIP + Platform Core + AI | 73 | 0 | 0% | ⬜ Not Started |
| M3 Pillars: Learn + Hub + Labs | 77 | 0 | 0% | ⬜ Not Started |
| M4 Supporting + AI Pillar Tools | 41 | 0 | 0% | ⬜ Not Started |
| M5 Delivery | 26 | 0 | 0% | ⬜ Not Started |
| **Total** | **262** | **22** | **8%** | ⬜ |

### Component Coverage

| Component | Items | Done | Status |
|-----------|-------|------|--------|
| COMP-001 Monorepo Infrastructure | 5 | 5 | ✅ Complete |
| COMP-002 Identity | 7 | 4 | 🔵 In Progress |
| COMP-003 DIP Artifact Registry | 8 | 0 | ⬜ Not Started |
| COMP-004 DIP Smart Contract Engine | 6 | 0 | ⬜ Not Started |
| COMP-005 DIP IACP Engine | 8 | 0 | ⬜ Not Started |
| COMP-006 DIP Project Manifest & DAG | 6 | 0 | ⬜ Not Started |
| COMP-007 DIP Institutional Governance | 9 | 0 | ⬜ Not Started |
| COMP-008 DIP Value Distribution & Treasury | 8 | 0 | ⬜ Not Started |
| COMP-009 Event Bus & Audit | 8 | 1 | 🔵 In Progress |
| COMP-010 Portfolio Aggregation | 8 | 0 | ⬜ Not Started |
| COMP-011 Search & Recommendation | 7 | 0 | ⬜ Not Started |
| COMP-012 AI Agents Orchestration | 8 | 0 | ⬜ Not Started |
| COMP-013 AI Agents Registry | 5 | 0 | ⬜ Not Started |
| COMP-014 AI Agents Pillar Tools | 6 | 0 | ⬜ Not Started |
| COMP-015 Learn Content Hierarchy | 6 | 0 | ⬜ Not Started |
| COMP-016 Learn Fragment & Artifact Engine | 8 | 0 | ⬜ Not Started |
| COMP-017 Learn Creator Tools | 6 | 0 | ⬜ Not Started |
| COMP-018 Learn Mentorship & Community | 5 | 0 | ⬜ Not Started |
| COMP-019 Hub Collaboration Layer | 8 | 0 | ⬜ Not Started |
| COMP-020 Hub Institution Orchestration | 6 | 0 | ⬜ Not Started |
| COMP-021 Hub Public Square | 5 | 0 | ⬜ Not Started |
| COMP-022 Labs Scientific Context | 5 | 0 | ⬜ Not Started |
| COMP-023 Labs Article Editor | 8 | 0 | ⬜ Not Started |
| COMP-024 Labs Experiment Design | 6 | 0 | ⬜ Not Started |
| COMP-025 Labs Open Peer Review | 7 | 0 | ⬜ Not Started |
| COMP-026 Labs DOI & Publication | 5 | 0 | ⬜ Not Started |
| COMP-027 Sponsorship | 7 | 0 | ⬜ Not Started |
| COMP-028 Communication | 7 | 0 | ⬜ Not Started |
| COMP-029 Planning | 6 | 0 | ⬜ Not Started |
| COMP-030 IDE Domain | 8 | 0 | ⬜ Not Started |
| COMP-031 Governance & Moderation | 6 | 0 | ⬜ Not Started |
| COMP-032 Web Application | 8 | 0 | ⬜ Not Started |
| COMP-033 REST API Gateway | 7 | 0 | ⬜ Not Started |
| COMP-034 Background Services | 7 | 2 | 🔵 In Progress |
| COMP-035 Embedded IDE Platform | 6 | 0 | ⬜ Not Started |
| COMP-036 Institutional Site | 4 | 0 | ⬜ Not Started |
| COMP-037 Security | 6 | 3 | 🔵 In Progress |
| COMP-038 Observability | 6 | 1 | 🔵 In Progress |
| COMP-039 Data Integrity | 5 | 3 | 🔵 In Progress |
| COMP-040 Resilience | 5 | 4 | 🔵 In Progress |
| **Total** | **262** | **23** | |

### Layer Coverage

| Layer | Components | Implemented | Coverage |
|-------|------------|-------------|----------|
| Domain (DIP) | 6 (COMP-003–008) | 0 | 0% |
| Domain (Pillars) | 10 (COMP-015–026) | 0 | 0% |
| Domain (Platform) | 5 (COMP-009–014) | 0 | 0% |
| Domain (Supporting) | 7 (COMP-027–033) | 0 | 0% |
| Infrastructure/Platform | 5 (COMP-034–036, COMP-001–002) | 0 | 0% |
| Cross-Cutting | 4 (COMP-037–040) | 0 | 0% |
| **Overall** | **40** | **0** | **0%** |

---

*End of Implementation Plan — Version 1.0 — 2026-03-13*
