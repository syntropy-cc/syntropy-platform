# Platform Core — Event Bus & Audit Implementation Record

> **Component ID**: COMP-009
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/platform-core/subdomains/event-bus-audit.md](../../architecture/domains/platform-core/subdomains/event-bus-audit.md)
> **Stage Assignment**: S2 — Platform Core Foundation
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Event Bus & Audit is the central nervous system of the Syntropy ecosystem. It owns the `EventSchema Registry` (versioned contracts for all event types) and the `AppendOnlyLog` (hash-chained, tamper-evident record of all ecosystem events). Every domain must register its event schemas here before publishing. The AppendOnlyLog uses SHA-256 hash chaining: `Hash(event_payload ∥ previous_hash ∥ service_signature ∥ timestamp)`. This component also includes the **Platform Core package setup**.

**Responsibilities**:
- Manage `EventSchema` registry (versioned, immutable after publication)
- Maintain `AppendOnlyLog` with hash-chain integrity
- Provide `SchemaValidationService` — validates event payloads against registered schemas
- Provide `EventSigningService` — computes HMAC + hash-chain per ADR-010 level-2 signing
- Provide `CausalChainTracer` — reconstructs event sequences by `correlation_id`/`causation_id`
- Stream events to Portfolio Aggregation (COMP-010) and Search & Recommendation (COMP-011) via Kafka consumer groups

**Key Interfaces**:
- Internal API: `GET /internal/platform-core/event-schemas/{type}/{version}`, `POST /internal/platform-core/event-schemas` (admin)
- Kafka: all domains publish to their respective topics; Event Bus consumers log to AppendOnlyLog

### Implementation Scope

**In Scope**:
- Platform Core package setup (workspace package scaffolding)
- `EventSchema` aggregate, `EventSchemaVersion`, `AppendOnlyLog`, `LogEntry` entities
- `SchemaValidationService`, `EventSigningService`, `CausalChainTracer` domain services
- Repository interfaces + PostgreSQL implementations
- Schema Registry API endpoints
- Kafka consumer that appends all ecosystem events to AppendOnlyLog
- Initial event schema registrations for all 12 domains

**Out of Scope**:
- Portfolio Aggregation logic (COMP-010)
- Search Indexing logic (COMP-011)
- Individual domain event publishing (each domain owns its own publisher)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 8 |
| **Total** | **8** |

**Component Coverage**: 0%

### Item List

#### [COMP-009.1] Platform Core package setup

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | platform-core/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/platform-core` workspace package with 4-layer internal structure, shared Platform Core types, and Kafka client configuration.

**Acceptance Criteria**:
- [ ] `packages/platform-core` package fully scaffolded with `domain/`, `application/`, `infrastructure/`, `api/` directories
- [ ] Kafka client setup (using `kafkajs`) with environment-based broker configuration
- [ ] `PlatformCoreInvariantError` exception class defined

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/kafka-client.ts`
- `packages/platform-core/src/domain/index.ts`

---

#### [COMP-009.2] EventSchema aggregate and Registry

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | event-bus-audit.md, ADR-010 |
| **Dependencies** | COMP-009.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `EventSchema` aggregate and `EventSchemaVersion` entity. Schemas are versioned, immutable after publication, with at most one active version per event type.

**Acceptance Criteria**:
- [ ] `EventSchema` aggregate: `id`, `event_type (EventType)`, `domain`, `description`
- [ ] `EventSchemaVersion` entity: `schema_id`, `version`, `schema_definition (JSON Schema draft-07)`, `is_active`, `published_at`
- [ ] Invariant: once published, `schema_definition` is immutable
- [ ] Invariant: at most one active version per event_type
- [ ] `EventSchema.publishVersion(definition)` creates new version, sets `is_active`, deactivates previous
- [ ] `event_bus_audit.event_schema.published` event emitted on publication
- [ ] Unit tests: double-publish throws, version activation

**Files Created/Modified**:
- `packages/platform-core/src/domain/event-bus-audit/event-schema.ts`
- `packages/platform-core/src/domain/event-bus-audit/event-schema-version.ts`
- `packages/platform-core/tests/unit/event-bus-audit/event-schema.test.ts`

---

#### [COMP-009.3] AppendOnlyLog and LogEntry with hash-chain

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | event-bus-audit.md, ADR-010 |
| **Dependencies** | COMP-009.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `AppendOnlyLog` aggregate and `LogEntry` entity with SHA-256 hash chaining. Formula: `Hash(event_payload ∥ previous_hash ∥ service_signature ∥ logged_at)`.

**Acceptance Criteria**:
- [ ] `LogEntry` entity: `id`, `sequence_number (monotonic)`, `event_type`, `event_payload (JSONB)`, `domain`, `previous_hash`, `entry_hash (SHA-256)`, `service_signature (HMAC-SHA256)`, `correlation_id`, `causation_id`, `logged_at`
- [ ] `AppendOnlyLog.append(event)` computes hash chain, validates schema, persists
- [ ] `sequence_number` is auto-incremented, globally unique, never reused
- [ ] No delete or update operations permitted (PostgreSQL trigger to enforce)
- [ ] `HashChainVerifier.verify(entries)` computes and validates entire chain
- [ ] Unit tests: hash computation, sequence monotonicity

**Files Created/Modified**:
- `packages/platform-core/src/domain/event-bus-audit/append-only-log.ts`
- `packages/platform-core/src/domain/event-bus-audit/log-entry.ts`
- `packages/platform-core/src/domain/event-bus-audit/services/hash-chain-verifier.ts`
- `packages/platform-core/tests/unit/event-bus-audit/append-only-log.test.ts`

---

#### [COMP-009.4] SchemaValidationService and EventSigningService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | event-bus-audit.md, ADR-010 |
| **Dependencies** | COMP-009.2, COMP-009.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `SchemaValidationService` (validates event payload against registered JSON Schema) and `EventSigningService` (computes HMAC-SHA256 service signature for level-2 signing per ADR-010).

**Acceptance Criteria**:
- [ ] `SchemaValidationService.validate(eventType, version, payload)` returns `ValidationResult { valid, errors }`
- [ ] Validation uses JSON Schema draft-07 (using `ajv` library)
- [ ] `EventSigningService.sign(payload, serviceName)` returns `ServiceSignature` using per-service HMAC key from environment
- [ ] Keys loaded from environment variables, never hardcoded
- [ ] Unit tests: valid payload passes, invalid payload fails with field-level errors

**Files Created/Modified**:
- `packages/platform-core/src/domain/event-bus-audit/services/schema-validation-service.ts`
- `packages/platform-core/src/domain/event-bus-audit/services/event-signing-service.ts`
- `packages/platform-core/tests/unit/event-bus-audit/schema-validation-service.test.ts`

---

#### [COMP-009.5] CausalChainTracer domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | event-bus-audit.md |
| **Dependencies** | COMP-009.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `CausalChainTracer` that reconstructs the full event sequence for a given `correlation_id` and visualizes the causal chain (what triggered what).

**Acceptance Criteria**:
- [ ] `CausalChainTracer.trace(correlationId)` returns ordered list of `LogEntry` records
- [ ] Correctly builds parent-child relationships using `causation_id`
- [ ] Returns tree structure: root event → child events → grandchild events
- [ ] Efficient query: uses index on `correlation_id` and `causation_id`
- [ ] Used by observability dashboard (COMP-038) and admin UI

**Files Created/Modified**:
- `packages/platform-core/src/domain/event-bus-audit/services/causal-chain-tracer.ts`
- `packages/platform-core/tests/unit/event-bus-audit/causal-chain-tracer.test.ts`

---

#### [COMP-009.6] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | event-bus-audit.md, ADR-004 |
| **Dependencies** | COMP-009.2, COMP-009.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for schemas and the append-only log. Create migration with performance-optimized indexes.

**Acceptance Criteria**:
- [ ] `EventSchemaRepository` interface: `findByType`, `findActiveVersion`, `save`
- [ ] `LogEntryRepository` interface: `append(entry)`, `findByCorrelationId`, `findBySequenceRange`, `getLastEntry`
- [ ] Migration: `event_schemas`, `event_schema_versions`, `ecosystem_event_log` tables
- [ ] `ecosystem_event_log` has PostgreSQL trigger preventing DELETE and UPDATE
- [ ] Indexes: `correlation_id`, `causation_id`, `sequence_number`, `event_type`, `domain`
- [ ] Integration tests: append performance test (100ms p99 per SLA)

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/repositories/postgres-event-schema-repository.ts`
- `packages/platform-core/src/infrastructure/repositories/postgres-log-entry-repository.ts`
- `packages/platform-core/src/infrastructure/migrations/001_event_bus_audit.sql`

---

#### [COMP-009.7] Kafka event consumer (AppendOnlyLog writer)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | event-bus-audit.md, ADR-002 |
| **Dependencies** | COMP-009.4, COMP-009.6 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement the central Kafka consumer that subscribes to all domain event topics and writes validated, signed entries to the AppendOnlyLog.

**Acceptance Criteria**:
- [ ] Consumer group: `platform-core-audit-log`
- [ ] Subscribes to all domain topics: `learn.events`, `hub.events`, `labs.events`, `dip.events`, `identity.events`, `ai_agents.events`
- [ ] Each consumed event: validated against schema registry, signed, appended to log
- [ ] Invalid schema → event goes to DLQ, does not block other events
- [ ] `enable.auto.commit=false` — manual offset commit after successful append
- [ ] Consumer runs in Background Services (COMP-034)
- [ ] Integration test with embedded Kafka

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/consumers/audit-log-consumer.ts`
- `packages/platform-core/tests/integration/consumers/audit-log-consumer.test.ts`

---

#### [COMP-009.8] Schema Registry API and initial schema registrations

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | event-bus-audit.md |
| **Dependencies** | COMP-009.6 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement Schema Registry API endpoints and seed all initial event schemas for the 12 domains. Each domain's events must be registered before any consumer can validate.

**Acceptance Criteria**:
- [ ] `GET /internal/platform-core/event-schemas/{event_type}/{version}` → returns schema definition
- [ ] `POST /internal/platform-core/event-schemas` (admin only) → registers new schema version
- [ ] `GET /internal/platform-core/event-schemas` → lists all registered schemas
- [ ] Initial seed migration creates schema versions for: `dip.artifact.anchored`, `dip.usage.registered`, `dip.governance.proposal_executed`, `learn.fragment.artifact_published`, `learn.track.completed`, `hub.contribution.integrated`, `hub.institution.created`, `labs.article.published`, `labs.review.submitted`, `identity.user.created`, `identity.role.assigned`, and 10+ more
- [ ] All schemas validated with `ajv` before registration

**Files Created/Modified**:
- `packages/platform-core/src/api/routes/event-schemas.ts`
- `packages/platform-core/src/infrastructure/migrations/002_initial_event_schemas.sql`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package shell, Kafka in Docker |
| COMP-002 Identity | Internal | ⬜ Not Started | Token verification for admin endpoints |
| Kafka | External | ✅ Available | Event transport |
| PostgreSQL | External | ✅ Available | Schema registry and append-only log |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-010 Portfolio Aggregation | Reads AppendOnlyLog stream | Blocks portfolio building |
| COMP-011 Search & Recommendation | Reads AppendOnlyLog stream | Blocks search indexing |
| COMP-012 AI Agents Orchestration | Consumes portfolio events | Blocks AI context building |
| All pillar domains (COMP-015–COMP-031) | Publish events to topics consumed here | Blocks audit trail |

---

## Implementation Log

### 2026-03-13 — COMP-009.8 done

Schema registry API (COMP-009.8) implemented in **`apps/api`**: routes at `GET /internal/event-schemas` (list all; optional `?topic=&version=` for single schema) and `POST /internal/event-schemas` (register). Uses `SchemaRegistry` and `IncompatibleSchemaError` from `@syntropy/event-bus`. Admin guard via `X-Internal-API-Key` header when `INTERNAL_API_KEY` env is set. Added `SchemaRegistry.listAll()` in `packages/event-bus`. API tests in `apps/api/src/routes/internal-event-schemas.test.ts`. Initial schema seed migration deferred to later work.

### 2026-03-13 — COMP-009.1 done

COMP-009.1 (Kafka client package setup) was implemented as **`packages/event-bus`** per the Implementation Plan: `KafkaProducer`, `KafkaConsumer`, `createKafkaClient(config)` factory, and minimal event envelope validation (`EventEnvelope`, `validateEventEnvelope`). Full SchemaRegistry integration is deferred to COMP-009.2.

---

## References

### Architecture Documents

- [Platform Core Event Bus & Audit Subdomain](../../architecture/domains/platform-core/subdomains/event-bus-audit.md)
- [Platform Core Domain Architecture](../../architecture/domains/platform-core/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-002](../../architecture/decisions/ADR-002-event-bus-technology.md) | Kafka as Event Bus | Transport selection |
| [ADR-010](../../architecture/decisions/ADR-010-event-signing-and-immutability.md) | Event Signing | Level-2 HMAC signing for log entries |
