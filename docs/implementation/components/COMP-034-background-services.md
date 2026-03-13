# Background Services Platform Service Implementation Record

> **Component ID**: COMP-034
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/background-services/ARCHITECTURE.md](../../architecture/platform/background-services/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: 🔵 In Progress
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Background Services hosts all Kafka consumers, scheduled jobs, and long-running workers that operate outside the request/response cycle (ADR-002). This is a **process-level** service: a single Node.js process that bootstraps all consumers and workers at startup. Workers include: audit log consumer, portfolio event processor, search indexer, notification triggers, AVU computation, review publication scheduler, and prominence refresh.

**Responsibilities**:
- Bootstrap and run all Kafka consumer groups (7+ workers)
- Run scheduled cron jobs (prominence refresh, portfolio rebuild, review publication)
- Manage Dead Letter Queue (DLQ) processing and retry logic
- Expose metrics endpoint for Prometheus scraping

**Key Interfaces**:
- No HTTP API (internal process)
- Exposes `GET /metrics` (Prometheus format)
- Exposes `GET /health` (liveness/readiness)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 1 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 6 |
| **Total** | **7** |

**Component Coverage**: 14%

### Item List

#### [COMP-034.1] Background services process setup and worker registry

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | background-services/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Set up the background services process with worker registry pattern for bootstrapping all consumers.

**Acceptance Criteria**:
- [x] `apps/workers` workspace app with `src/main.ts` entry point
- [x] `WorkerRegistry` pattern: workers registered at startup, all started concurrently
- [x] Graceful shutdown: `SIGTERM` handler waits for in-flight messages to complete (max 30s)
- [x] Each worker reports health status
- [x] Unhandled rejections crash the process (let orchestrator restart it)

**Files Created/Modified**:
- `apps/workers/package.json`, `apps/workers/tsconfig.json`, `apps/workers/vitest.config.ts`
- `apps/workers/src/types.ts` — `Worker` interface, `WorkerHealth` type
- `apps/workers/src/worker-registry.ts` — `WorkerRegistry` (register, startAll, stopAll with 30s timeout, getHealth)
- `apps/workers/src/main.ts` — entry point, stub worker, SIGTERM/SIGINT handlers, unhandledRejection → exit(1)
- `apps/workers/src/worker-registry.test.ts` — unit tests for registry

**Implementation Notes**: Worker contract: `name`, `start()`, `stop()`, `health()`. Shutdown uses a single 30s timeout for all workers; after timeout the process exits. `platform-core` package.json was given `main` and `types` for workspace resolution; bulkhead.test.ts unused-variable fixes applied so platform-core builds.

---

#### [COMP-034.2] Kafka consumer worker bootstrapping

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | background-services/ARCHITECTURE.md, ADR-002 |
| **Dependencies** | COMP-034.1, COMP-009, COMP-010, COMP-011 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Bootstrap all Kafka consumer workers defined in domain packages.

**Acceptance Criteria**:
- [ ] Workers bootstrapped from domain packages:
  - `platform-core`: `AuditLogConsumer`, `PortfolioEventConsumer`, `EventIndexingConsumer`
  - `dip`: `UsageRegisteredConsumer`, `GovernanceProposalConsumer`
  - `hub`: `PublicSquareIndexer`
  - `communication`: `NotificationEventConsumer`
  - `ai-agents`: `ContextRefreshConsumer`
- [ ] All consumers started in parallel
- [ ] Consumer group IDs unique per worker
- [ ] Prometheus counter per worker: `worker_messages_processed_total`, `worker_message_errors_total`

**Files Created/Modified**:
- `apps/workers/src/workers/kafka-workers.ts`

---

#### [COMP-034.3] DLQ processor

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | background-services/ARCHITECTURE.md |
| **Dependencies** | COMP-034.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Dead Letter Queue processor that retries failed messages with exponential backoff.

**Acceptance Criteria**:
- [ ] DLQ consumer group subscribes to all `*.dlq` topics
- [ ] Retry policy: 3 attempts with exponential backoff (5s, 30s, 5min)
- [ ] After max retries: message persisted to `dlq_archive` table with error context
- [ ] Alert triggered (via notification or metrics) when DLQ depth > 100 messages

**Files Created/Modified**:
- `apps/workers/src/workers/dlq-processor.ts`
- `packages/platform-core/src/infrastructure/migrations/` (dlq_archive table)

---

#### [COMP-034.4] Scheduled job runner

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | background-services/ARCHITECTURE.md |
| **Dependencies** | COMP-034.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement cron-based scheduler for periodic background jobs.

**Acceptance Criteria**:
- [ ] `CronScheduler` using `node-cron` with distributed locking (Redis)
- [ ] Registered cron jobs:
  - Daily `00:00 UTC`: Hub `ProminenceRefreshJob`
  - Every 6h: `PortfolioRebuildJob` for recently active users
  - Every 15min: `ReviewPublicationScheduler` (publishes embargoed reviews)
  - Daily `06:00 UTC`: `StudyPlanProgressCalculator`
- [ ] Distributed lock: only one instance runs per job (Redis SETNX)
- [ ] Job execution time logged; alert if job takes > 5min

**Files Created/Modified**:
- `apps/workers/src/cron-scheduler.ts`
- `apps/workers/src/jobs/` (job implementations imported from domain packages)

---

#### [COMP-034.5] Prometheus metrics and health endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | background-services/ARCHITECTURE.md |
| **Dependencies** | COMP-034.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Expose Prometheus metrics and health check endpoints from the workers process.

**Acceptance Criteria**:
- [ ] `GET /metrics` → Prometheus text format with all worker counters and histograms
- [ ] `GET /health` → all workers running + DLQ depth + Redis/Kafka connectivity
- [ ] Default metrics: CPU, memory, event loop lag
- [ ] Custom metrics: per-worker processing rate, DLQ depth, cron job duration

**Files Created/Modified**:
- `apps/workers/src/metrics.ts`
- `apps/workers/src/health.ts`

---

#### [COMP-034.6] IDE session inactivity supervisor

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-034.1, COMP-030 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement background worker that monitors IDE session inactivity and triggers suspension.

**Acceptance Criteria**:
- [ ] Every 2 minutes: scans active IDE sessions for inactivity > 30min
- [ ] Inactive sessions → calls `IDESession.suspend()` and `ContainerProvisioningAdapter.stop()`
- [ ] Terminated sessions cleaned up after 24h
- [ ] Metrics: `ide_sessions_active_total`, `ide_sessions_suspended_total`

**Files Created/Modified**:
- `apps/workers/src/workers/ide-session-supervisor.ts`

---

#### [COMP-034.7] Integration tests for all workers

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-034.6 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Integration test suite for all background workers with embedded Kafka and mock dependencies.

**Acceptance Criteria**:
- [ ] Each worker tested: message processing, error handling, DLQ routing
- [ ] Cron job tests: correct schedule, distributed lock behavior
- [ ] Test setup uses embedded Kafka (testcontainers)
- [ ] All worker tests pass in < 2 minutes

**Files Created/Modified**:
- `apps/workers/tests/integration/`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Workers app shell |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Kafka infrastructure |
| All domain package consumers | Internal | ⬜ Not Started | Consumer worker code |

---

## References

### Architecture Documents

- [Background Services Platform Architecture](../../architecture/platform/background-services/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-002](../../architecture/decisions/ADR-002-event-bus-technology.md) | Kafka as Event Bus | Consumer infrastructure |
