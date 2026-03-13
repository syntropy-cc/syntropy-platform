# Syntropy Platform — Implementation Roadmap

> **Version**: 1.0 | **Created**: 2026-03-13 | **Status**: Active
> **Source of Truth for milestones**: [`IMPLEMENTATION-PLAN.md`](./IMPLEMENTATION-PLAN.md)

---

## Overview

The Syntropy Platform is implemented across **5 milestones** in an inside-out order: foundational infrastructure first, then the core DIP protocol, then the three knowledge pillars, then supporting domains, and finally production hardening.

```
M1 Foundation      M2 DIP Core        M3 Pillars         M4 Supporting      M5 Delivery
S1–S8 (45 items)   S9–S25 (73 items)  S26–S41 (77 items) S42–S50 (41 items) S51–S56 (26 items)
     ↓                   ↓                  ↓                   ↓                  ↓
Working login      Artifacts + Gov    Learn/Hub/Labs     IDE + AI Tools     Full API + Obs
```

**Total**: 262 work items across 56 stages and 40 components.

---

## M1 — Foundation + Walking Skeleton

**Stages**: S1–S8 | **Items**: 45 | **Target Sessions**: 5–8

### Objective

Establish the development foundation and deliver the first browser-accessible increment. By the end of M1, developers can run the full stack locally, navigate to `http://localhost:3000`, log in, and see a working API.

### Deliverables

| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Turborepo monorepo | `pnpm install && turbo run build` from root | S1 |
| Docker Compose infra | Postgres 15, Redis 7, Kafka, Zookeeper, pgvector | S1 |
| CI/CD pipeline | GitHub Actions: lint + type-check + test + build | S1 |
| Shared libraries | Logger, CircuitBreaker, RetryPolicy, encryption, SoftDeletable | S2 |
| Identity domain | User aggregate, RBAC, Session, SupabaseAuth ACL | S3 |
| Event Bus core | Kafka client, AppendOnlyLog, actor signatures, schema registry | S4–S6 |
| Background services | Workers process, DLQ, scheduled jobs, Prometheus metrics | S4–S6 |
| REST API gateway | Fastify server, auth middleware, rate limiting, health checks | S4, S7–S8 |
| Walking skeleton UI | Next.js apps scaffolded, Supabase Auth login/logout, design system | S8 |

### Components Completed in M1

| Component | Items | Status |
|-----------|-------|--------|
| COMP-001 Monorepo Infrastructure | 5/5 | ✅ Complete |
| COMP-002 Identity | 7/7 | ✅ Complete |
| COMP-009 Event Bus & Audit | 8/8 | ✅ Complete |
| COMP-033 REST API (partial) | 4/7 | 🔵 Partial (033.1–033.3, 033.7) |
| COMP-032 Web Application (partial) | 2/8 | 🔵 Partial (032.1, 032.2) |
| COMP-034 Background Services (partial) | 5/7 | 🔵 Partial (034.1–034.5) |
| COMP-037 Security (partial) | 4/6 | 🔵 Partial (037.1, 037.3, 037.5, 037.6) |
| COMP-038 Observability (partial) | 1/6 | 🔵 Partial (038.1) |
| COMP-039 Data Integrity (partial) | 4/5 | 🔵 Partial (039.1–039.4) |
| COMP-040 Resilience (partial) | 4/5 | 🔵 Partial (040.1–040.4) |

### Success Criteria

- [ ] `pnpm install && turbo run build` completes with zero errors
- [ ] `docker compose up` starts all infrastructure services with health checks passing
- [ ] `http://localhost:3000` loads Next.js app (landing page stub)
- [ ] `http://localhost:3000/login` shows Supabase Auth login form
- [ ] `http://localhost:8080/health` returns `{ "status": "ok" }`
- [ ] `http://localhost:8080/api/v1/auth/me` returns `401` (auth middleware active)
- [ ] All unit tests pass with `pnpm test`

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase Auth integration complexity | Medium | High | Use official `@supabase/ssr` package, follow Next.js Auth guide |
| Kafka setup in local dev | Medium | Medium | Use KRaft mode (no Zookeeper) or bitnami/kafka Docker image |
| pnpm workspace TypeScript references | Low | Medium | Use `turbo run typecheck` incrementally, not full `tsc --build` |

---

## M2 — Core: DIP + Platform Core + AI Foundation

**Stages**: S9–S25 | **Items**: 73 | **Target Sessions**: 10–18

### Objective

The Digital Institutions Protocol is fully operational. Artifacts can be published with Nostr anchors, governance contracts evaluated, proposals voted on and executed, portfolios computed, and AI agent sessions created. The core of the platform's unique value proposition is working.

### Deliverables

| Deliverable | Description | Stage |
|-------------|-------------|-------|
| DIP Artifact Registry | Artifact lifecycle, Nostr anchoring, event publishing | S9–S10 |
| DIP Smart Contract Engine | GovernanceContract DSL, SmartContractEvaluator | S11 |
| DIP Project Manifest & DAG | DigitalProject, acyclicity enforcement, project API | S14–S15 |
| DIP IACP Engine | Multi-party signing, 4-phase state machine | S16–S18 |
| DIP Institutional Governance | DigitalInstitution, Proposal voting, LegitimacyChain | S18–S20 |
| DIP Value Distribution & Treasury | AVU accounting, distribution computation, oracle | S20–S22 |
| Portfolio Aggregation | XP, achievements, skills, reputation, event consumer | S22–S24 |
| Search & Recommendation | FTS + semantic search (pgvector), recommendations | S24–S25 |
| AI Agents Orchestration | AgentSession, LLMAdapter, ToolRouter, AgentOrchestrator | S10, S12–S13 |
| AI Agents Registry | AIAgentDefinition, ToolDefinition, ToolPermissionEvaluator | S13, S15–S16 |

### Components Completed in M2

| Component | Items | Status |
|-----------|-------|--------|
| COMP-003 DIP Artifact Registry | 8/8 | ✅ Complete |
| COMP-004 DIP Smart Contract Engine | 6/6 | ✅ Complete |
| COMP-005 DIP IACP Engine | 8/8 | ✅ Complete |
| COMP-006 DIP Project Manifest & DAG | 6/6 | ✅ Complete |
| COMP-007 DIP Institutional Governance | 9/9 | ✅ Complete |
| COMP-008 DIP Value Distribution & Treasury | 8/8 | ✅ Complete |
| COMP-010 Portfolio Aggregation | 8/8 | ✅ Complete |
| COMP-011 Search & Recommendation | 7/7 | ✅ Complete |
| COMP-012 AI Agents Orchestration | 8/8 | ✅ Complete |
| COMP-013 AI Agents Registry | 5/5 | ✅ Complete |

### Success Criteria

- [ ] `POST /api/v1/artifacts` creates artifact with Nostr anchor hash stored
- [ ] `POST /api/v1/institutions` creates `DigitalInstitution` with governance contract
- [ ] `POST /api/v1/proposals/{id}/vote` records vote and enforces quorum
- [ ] `GET /api/v1/portfolios/{userId}` returns XP + skills + reputation
- [ ] `GET /api/v1/search?q=machine+learning` returns FTS + semantic results
- [ ] `POST /api/v1/ai-agents/sessions` creates session; `POST /invoke` returns AI response

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| pgvector embedding cost | High | Medium | Mock OpenAI embeddings in dev, cache aggressively |
| LLM API rate limits | Medium | Medium | Use mock adapter in tests, circuit breaker on real calls |
| DIP domain complexity | High | High | Follow component records strictly; one aggregate at a time |
| Governance quorum edge cases | Medium | Medium | Write comprehensive unit tests before implementation |

---

## M3 — Pillars: Learn, Hub, Labs

**Stages**: S26–S41 | **Items**: 77 | **Target Sessions**: 15–22

### Objective

All three knowledge pillars are functionally complete with browser-accessible UIs. Learners can browse content with fog-of-war navigation, creators can publish fragments, hub contributors can open issues and submit contributions, and labs authors can write articles for peer review.

### Deliverables

**Learn Pillar**:
| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Content Hierarchy | Career → Track → Course with fog-of-war navigation | S26 |
| Fragment Engine | Fragment aggregate with IL1 invariant, progress tracking, review workflow | S27–S28 |
| Creator Tools | 5-phase CreatorWorkflow, AI Copilot, ApprovalRecord | S29 |
| Mentorship | MentorshipRelationship, MentorReview, ArtifactGallery | S30 |
| Learn UI | Next.js pages: careers, tracks, courses, fragments | S28 |

**Hub Pillar**:
| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Collaboration Layer | Issue, Contribution, ContributionSandbox (stub), DIPContributionAdapter | S31 |
| Institution Orchestration | ContractTemplate, InstitutionCreationWorkflow, InstitutionProfile | S32–S33 |
| Public Square | DiscoveryDocument, ProminenceScorer, PublicSquareIndexer | S33–S34 |
| Hub UI | Next.js pages: discover, institution, issues, contribute | S34 |

**Labs Pillar**:
| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Scientific Context | SubjectArea taxonomy, ResearchMethodology, HypothesisRecord | S35 |
| Article Editor | ScientificArticle with MyST Markdown, versioning, DIP publication | S36–S37 |
| Experiment Design | ExperimentDesign, ExperimentResult, AnonymizationPolicyEnforcer | S37–S38 |
| Open Peer Review | Review, ReviewPassageLink, AuthorResponse, ReviewVisibilityEvaluator | S39–S40 |
| DOI Publication | DOIRecord, DataCiteAdapter, ExternalIndexingNotifier | S40–S41 |
| Labs UI | Next.js pages: article list, article detail (MyST), reviews, editor | S41 |

### Components Completed in M3

| Component | Items | Notes |
|-----------|-------|-------|
| COMP-015–018 Learn | 25/25 | ✅ All Learn complete |
| COMP-019 Hub Collaboration | 7/8 | 🔵 COMP-019.6 deferred to M4 (requires IDE Domain) |
| COMP-020–021 Hub Institution + Square | 11/11 | ✅ Complete |
| COMP-022–026 Labs | 31/31 | ✅ All Labs complete |
| COMP-032 Web Application (partial) | 5/8 | 🔵 032.3, 032.4, 032.5 done |

### Success Criteria

- [ ] Navigate to `http://localhost:3001/learn` — career list renders with fog-of-war
- [ ] Complete a fragment → `LearnerProgressRecord` created + portfolio XP updated
- [ ] Navigate to `http://localhost:3002/hub/discover` — public square with prominence ranking
- [ ] Merge a contribution → DIP artifact published + Kafka event emitted
- [ ] Navigate to `http://localhost:3003/labs/articles/{id}` — article renders MyST content
- [ ] Submit article for peer review → reviewer receives notification

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MyST Markdown rendering edge cases | Medium | Medium | Use established `myst-parser` library, test with real scientific content |
| Fog-of-war navigation complexity | Medium | High | Write unit tests for all prerequisite combinations first |
| Hub/DIP integration through ACL | High | Medium | Follow `DIPContributionAdapter` pattern strictly |
| Peer review blind mode enforcement | Medium | High | `ReviewVisibilityEvaluator` must be tested with all role combinations |

---

## M4 — Supporting Domains + AI Pillar Tools

**Stages**: S42–S50 | **Items**: 41 | **Target Sessions**: 8–12

### Objective

All supporting domains (Sponsorship, Communication, Planning, IDE Domain, Governance/Moderation) are complete. AI pillar tool handlers are wired to all three pillars and the IDE. The full system is functionally complete — only production hardening remains.

### Deliverables

| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Sponsorship | Sponsorship, StripePaymentAdapter, ImpactMetric | S42–S43 |
| Communication | Thread, Notification delivery, SSE stream, preferences | S43–S44 |
| Planning | Task, Goal, Sprint, StudyPlan, MentorSession scheduling | S45–S46 |
| IDE Domain | IDESession, Container, ResourceQuotaEnforcer, provisioning | S46–S47 |
| ContributionSandboxOrchestrator | Wires Hub ContributionSandbox to real IDE containers | S48 |
| AI Pillar Tools | Tool handlers for Learn + Hub + Labs + Cross-pillar + IDE | S48–S49 |
| Governance & Moderation | ModerationFlag, PlatformPolicy, CommunityProposal | S49–S50 |

### Components Completed in M4

| Component | Items | Status |
|-----------|-------|--------|
| COMP-019.6 ContributionSandboxOrchestrator | 1/1 | ✅ Complete (deferred from M3) |
| COMP-014 AI Agents Pillar Tools | 6/6 | ✅ Complete |
| COMP-027 Sponsorship | 7/7 | ✅ Complete |
| COMP-028 Communication | 7/7 | ✅ Complete |
| COMP-029 Planning | 6/6 | ✅ Complete |
| COMP-030 IDE Domain | 8/8 | ✅ Complete |
| COMP-031 Governance & Moderation | 6/6 | ✅ Complete |

### Success Criteria

- [ ] `POST /api/v1/ai-agents/sessions/{id}/invoke` with Learn tool returns fragment data
- [ ] `GET /api/v1/notifications/stream` SSE stream delivers notification within 3s
- [ ] `POST /api/v1/ide/sessions` provisions container (Docker in dev); returns session
- [ ] `POST /api/v1/hub/contributions/{id}/merge` → sandbox container provisioned
- [ ] `GET /api/v1/moderation/flags` returns queue (admin role required, 403 without)
- [ ] `POST /api/v1/sponsorships/{id}/payment-intent` calls Stripe and returns intent

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Container provisioning in CI | High | Medium | Use Docker adapter in dev/test, K8s only in prod |
| Stripe webhook testing | Medium | Medium | Use Stripe CLI for local webhook forwarding |
| AI tool handler context window | Medium | High | Keep tool results paginated and summarized |
| SSE connection management | Medium | Medium | Use heartbeat ping every 30s to detect dead connections |

---

## M5 — Delivery: Full API, IDE Platform, Institutional Site, Observability

**Stages**: S51–S56 | **Items**: 26 | **Target Sessions**: 5–8

### Objective

The system is production-ready. All API routes are registered with OpenAPI documentation, the IDE WebSocket gateway and Monaco Editor are live, the Institutional Site serves ISR pages, and the full observability stack (tracing, metrics, dashboards, alerting) is operational.

### Deliverables

| Deliverable | Description | Stage |
|-------------|-------------|-------|
| Full API Route Registration | All domain routes registered, OpenAPI 3.1 spec, versioning | S51 |
| Security Hardening | CSP headers, mTLS for `/internal/*` | S51 |
| Web App Completion | Admin pages, API proxy, error boundaries | S52 |
| IDE Supervisor | Background worker for IDE session inactivity management | S52 |
| Monaco Editor | React component with TypeScript LSP in Hub + Labs | S53 |
| WebSocket Gateway | Terminal + filesystem + LSP over single WS connection | S53 |
| Kubernetes Adapter | Container provisioning with K8s/Docker abstraction | S53 |
| Workspace Persistence | Auto-save + snapshot + restore integration | S54 |
| Institutional Site | Next.js ISR site with SEO, performance < 2.5s LCP | S54–S55 |
| OpenTelemetry Tracing | Distributed traces across API + domain + event bus | S55 |
| Prometheus + Grafana | Metrics collection, 3 dashboards, alerting rules | S56 |
| Log Aggregation | Loki + Promtail, correlation ID searchable | S56 |
| Data Retention Policy | Archival cron job, PII deletion per compliance rules | S56 |

### Components Completed in M5

| Component | Items | Status |
|-----------|-------|--------|
| COMP-033 REST API (completion) | 7/7 | ✅ Complete |
| COMP-032 Web Application (completion) | 8/8 | ✅ Complete |
| COMP-034 Background Services (completion) | 7/7 | ✅ Complete |
| COMP-035 Embedded IDE Platform | 6/6 | ✅ Complete |
| COMP-036 Institutional Site | 4/4 | ✅ Complete |
| COMP-037 Security (completion) | 6/6 | ✅ Complete |
| COMP-038 Observability (completion) | 6/6 | ✅ Complete |
| COMP-039 Data Integrity (completion) | 5/5 | ✅ Complete |

### Success Criteria

- [ ] `GET /api/v1/openapi.json` returns spec with all domain routes documented
- [ ] `GET /api/v1/docs` shows Swagger UI with working try-it-out
- [ ] WebSocket upgrade to `/api/v1/ide/sessions/{id}/ws` succeeds; terminal streams
- [ ] Monaco Editor loads with TypeScript LSP in `http://localhost:3002/hub/contribute/{id}/editor`
- [ ] `http://localhost:4000/institutions/{slug}` ISR page loads in < 2.5s (Lighthouse)
- [ ] Grafana Platform Overview dashboard shows live request rate and error rate
- [ ] Jaeger (dev) shows end-to-end distributed trace for artifact publication
- [ ] All 262 work items in `IMPLEMENTATION-PLAN.md` marked Done

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebSocket + K8s complexity | High | High | Start with Docker adapter, test WebSocket in isolation first |
| Monaco LSP latency | Medium | Medium | Use TypeScript language server over WebSocket, test round-trip time |
| ISR revalidation in monorepo | Low | Low | Use Next.js `revalidatePath` webhook, test with Postman |
| Grafana dashboard accuracy | Low | Medium | Use `prom-client` `collectDefaultMetrics()` as baseline |

---

## Timeline Sketch

```
M1 Foundation      M2 DIP Core        M3 Pillars         M4 Supporting      M5 Delivery
═══════════════════════════════════════════════════════════════════════════════════════
Weeks 1-2          Weeks 3-6          Weeks 7-12         Weeks 13-16        Weeks 17-19
(5-8 sessions)     (10-18 sessions)   (15-22 sessions)   (8-12 sessions)    (5-8 sessions)
45 items           73 items           77 items           41 items           26 items
17% of total       28% of total       29% of total       16% of total       10% of total
```

> **Note**: Timeline assumes 2-3 Cursor sessions per week. Actual pace depends on complexity encountered. M3 (Pillars) is the longest milestone due to domain breadth.

---

## Cross-Milestone Dependencies

```
M1 must be complete before M2 can start (Infrastructure → DIP)
M2 must be complete before M3 can start (DIP → Pillars consume DIP)
M3 must be mostly complete before M4 can complete (IDE sandbox needs hub contributions done)
M4 must be complete before M5 can complete (route registration needs all domain packages)
```

**Critical Path**:
```
COMP-001 → Identity (002.1-002.4) → Event Bus (009.1) → DIP Registry (003.*)
         → Smart Contracts (004.*) → IACP (005.*) → Governance (007.*)
         → Learn (015.*→016.*→017.*) → Hub (019.*→020.*) → Labs (022.*→025.*)
         → IDE Domain (030.*) → Pillar Tools (014.*)
         → Full API (033.4) → IDE Platform (035.*) → Observability (038.*)
```

---

## Architecture References

- [Root Architecture](../architecture/ARCHITECTURE.md)
- [Implementation Plan](./IMPLEMENTATION-PLAN.md)
- [ADR-001](../architecture/decisions/ADR-001-modular-monolith.md) — Modular Monolith with Turborepo
- [ADR-002](../architecture/decisions/ADR-002-event-bus-technology.md) — Kafka as Event Bus
- [ADR-007](../architecture/decisions/ADR-007-ide-platform.md) — Embedded IDE Platform

---

*Roadmap Version 1.0 — 2026-03-13*
