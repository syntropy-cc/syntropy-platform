# DIP — Artifact Registry Implementation Record

> **Component ID**: COMP-003
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/artifact-registry.md](../../architecture/domains/digital-institutions-protocol/subdomains/artifact-registry.md)
> **Stage Assignment**: S2 — DIP Foundation
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Artifact Registry is the first DIP subdomain and owns the lifecycle of all `Artifact` entities in the ecosystem. Every piece of content — from a Fragment's completed project to a scientific article to a code contribution — becomes a DIP Artifact when published. Artifacts achieve cryptographic identity via `IdentityRecord`, anchored to Nostr relays (ADR-003). After anchoring, the `IdentityRecord` is immutable forever.

This component also includes the **DIP package setup** (shared types, aggregate root patterns, base repository interface, event publisher scaffold for the `packages/dip` workspace package).

**Responsibilities**:
- Manage `Artifact` lifecycle: Draft → Published (with anchoring)
- Create immutable `IdentityRecord` via `AnchoringService` → Nostr relay
- Compute and verify SHA-256 `ContentHash` of artifact content
- Publish `dip.artifact.created`, `dip.artifact.anchored` events (actor-signed, level-2 signing per ADR-010)
- Provide internal API for other domains (Learn, Hub, Labs, IDE) to publish artifacts via their ACL adapters

**Key Interfaces**:
- Internal API: `POST /dip/artifacts`, `GET /dip/artifacts/{id}`, `GET /dip/artifacts/{id}/identity-record`, `GET /dip/artifacts/{id}/versions`
- Domain event: `dip.artifact.anchored` — consumed by IACP Engine to mark artifact eligible for IACP

### Implementation Scope

**In Scope**:
- DIP package setup (workspace package scaffolding, shared DIP types, base patterns)
- `Artifact` aggregate, `ArtifactVersion`, `IdentityRecord` entities
- `ArtifactType` value object (scientific-article, dataset, experiment, code, document)
- `ContentHash` value object (SHA-256)
- `AuthorPublicKey` value object (derived from Identity `ActorId`)
- `AnchoringService` domain service + `NostrRelayAdapter` infrastructure ACL
- `ArtifactRepository` interface + PostgreSQL implementation
- Internal API handlers for artifact creation and lookup
- Database migration: `artifacts`, `artifact_versions`, `identity_records` tables

**Out of Scope**:
- IACP protocol execution (COMP-005)
- DependencyGraph / DAG (COMP-006)
- GovernanceContract evaluation (COMP-004)
- Institutional Governance (COMP-007)
- AVU/Treasury (COMP-008)

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

#### [COMP-003.1] DIP package setup and shared patterns

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up the `packages/dip` workspace package with internal directory structure, shared DIP types (`DIPEntityId`, `ActorSignature`, `NostrEventId`), aggregate root base class, and DIP-specific invariant guard pattern.

**Acceptance Criteria**:
- [ ] `packages/dip` workspace package scaffold complete
- [ ] Shared DIP value objects exported: `DIPEntityId`, `ActorSignature`, `NostrEventId`, `ContentHash`
- [ ] `DIPInvariantError` exception class defined
- [ ] DIP domain invariants I1–I7 documented as code constants/comments
- [ ] Package builds and exports cleanly

**Files Created/Modified**:
- `packages/dip/src/domain/shared/dip-entity-id.ts`
- `packages/dip/src/domain/shared/actor-signature.ts`
- `packages/dip/src/domain/shared/content-hash.ts`
- `packages/dip/src/domain/shared/dip-invariant-error.ts`
- `packages/dip/src/domain/index.ts`

---

#### [COMP-003.2] Artifact aggregate and value objects

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | artifact-registry.md |
| **Dependencies** | COMP-003.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Artifact` aggregate root, `ArtifactVersion` entity, `IdentityRecord` entity, and associated value objects.

**Acceptance Criteria**:
- [ ] `Artifact` aggregate: `id (ArtifactId)`, `author_id (ActorId)`, `artifact_type (ArtifactType)`, `status (draft|published)`, `published_at` (set once, immutable)
- [ ] `ArtifactType` enum: scientific-article, dataset, experiment, code, document
- [ ] `ArtifactVersion` entity: `version_number`, `content_hash (ContentHash)`, `created_at`
- [ ] `IdentityRecord` entity: `artifact_id`, `author_public_key`, `nostr_event_id`, `anchoring_status (Pending|Confirmed|Failed)`, `anchored_at`
- [ ] Invariant: `published_at` is set exactly once; `artifact_type` is immutable after creation
- [ ] `Artifact.publish()` transitions status to published, sets `published_at`
- [ ] Unit tests: invariants tested (double-publish throws, type change throws)

**Files Created/Modified**:
- `packages/dip/src/domain/artifact-registry/artifact.ts`
- `packages/dip/src/domain/artifact-registry/artifact-version.ts`
- `packages/dip/src/domain/artifact-registry/identity-record.ts`
- `packages/dip/src/domain/artifact-registry/value-objects/artifact-type.ts`
- `packages/dip/src/domain/artifact-registry/value-objects/author-public-key.ts`
- `packages/dip/tests/unit/artifact-registry/artifact.test.ts`

---

#### [COMP-003.3] ArtifactRepository interface

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | artifact-registry.md |
| **Dependencies** | COMP-003.2 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Define `ArtifactRepository` interface in the domain layer (ARCH-002: depend on abstractions).

**Acceptance Criteria**:
- [ ] `ArtifactRepository` interface: `findById(id)`, `findByAuthor(actorId)`, `save(artifact)`, `findIdentityRecord(artifactId)`
- [ ] All methods return domain types (no database row leakage)
- [ ] Interface exported from domain layer

**Files Created/Modified**:
- `packages/dip/src/domain/artifact-registry/repositories/artifact-repository.ts`

---

#### [COMP-003.4] NostrRelayAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | artifact-registry.md, ADR-003 |
| **Dependencies** | COMP-003.2 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `NostrRelayAdapter` as the ACL wrapping Nostr relay interaction. Submits signed events (secp256k1, ADR-010 level-1 signing) to configured relays, polls for confirmation, and handles `AnchoringStatus` transitions.

**Acceptance Criteria**:
- [ ] `NostrRelayAdapter` implements `AnchoringProvider` interface
- [ ] Signs artifact identity event using secp256k1 from `AuthorPublicKey`
- [ ] Submits to multiple Nostr relays (configured via `NOSTR_RELAY_URLS`)
- [ ] Polls for relay confirmation with exponential backoff (max 5 attempts per resilience ARCH)
- [ ] Updates `IdentityRecord.anchoring_status`: Pending → Confirmed | Failed
- [ ] Nostr event schema: `kind: 1`, `tags: [["artifact_id", id], ["content_hash", hash]]`
- [ ] Nostr vocabulary does not leak into domain types
- [ ] Integration test with mocked Nostr relay (no real relay required in CI)

**Files Created/Modified**:
- `packages/dip/src/domain/artifact-registry/anchoring-provider.ts` (interface)
- `packages/dip/src/infrastructure/nostr-relay-adapter.ts`
- `packages/dip/tests/integration/nostr-relay-adapter.test.ts`

---

#### [COMP-003.5] AnchoringService and ContentHashService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | artifact-registry.md |
| **Dependencies** | COMP-003.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AnchoringService` (orchestrates anchoring flow) and `ContentHashService` (computes and verifies SHA-256 content hashes).

**Acceptance Criteria**:
- [ ] `ContentHashService.compute(content: Buffer)` returns `ContentHash` (SHA-256 hex)
- [ ] `ContentHashService.verify(content, hash)` returns `boolean`
- [ ] `AnchoringService.initiateAnchoring(artifact, authorPublicKey)` creates `IdentityRecord` in Pending state and calls `NostrRelayAdapter`
- [ ] `AnchoringService.confirmAnchoring(artifactId, nostrEventId)` transitions to Confirmed
- [ ] Idempotent: calling initiateAnchoring twice on same artifact is a no-op if already anchored
- [ ] Unit tests: hash computation, double-anchoring idempotency

**Files Created/Modified**:
- `packages/dip/src/domain/artifact-registry/services/anchoring-service.ts`
- `packages/dip/src/domain/artifact-registry/services/content-hash-service.ts`
- `packages/dip/tests/unit/artifact-registry/anchoring-service.test.ts`

---

#### [COMP-003.6] PostgreSQL repository implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | artifact-registry.md, ADR-004 |
| **Dependencies** | COMP-003.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `PostgresArtifactRepository` and create database migration for the artifact registry tables.

**Acceptance Criteria**:
- [ ] `PostgresArtifactRepository` implements `ArtifactRepository` interface
- [ ] Migration creates: `artifacts` (id, author_actor_id, artifact_type, status, published_at), `artifact_versions` (artifact_id FK, version_number, content_hash), `identity_records` (artifact_id FK, author_public_key, nostr_event_id, anchoring_status, anchored_at)
- [ ] Indexes: `artifacts(author_actor_id)`, `artifacts(status)`, `identity_records(anchoring_status)`
- [ ] `IdentityRecord` rows are never updated (append only); only `anchoring_status` transitions are allowed
- [ ] Integration tests: roundtrip save/find

**Files Created/Modified**:
- `packages/dip/src/infrastructure/repositories/postgres-artifact-repository.ts`
- `packages/dip/src/infrastructure/migrations/001_artifact_registry.sql`
- `packages/dip/tests/integration/repositories/artifact-repository.test.ts`

---

#### [COMP-003.7] Artifact publication use case and event publisher

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | artifact-registry.md |
| **Dependencies** | COMP-003.5, COMP-003.6 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArtifactPublicationUseCase` application service that orchestrates artifact creation, content hashing, and anchoring initiation. Implement `DIPEventPublisher` for Kafka event emission.

**Acceptance Criteria**:
- [ ] `ArtifactPublicationUseCase.execute(request)`: validates, creates Artifact, computes ContentHash, saves, initiates anchoring, publishes `dip.artifact.created` event
- [ ] `AnchoringConfirmationUseCase.execute(artifactId, nostrEventId)`: confirms anchoring, publishes `dip.artifact.anchored` event
- [ ] `dip.artifact.anchored` event contains: `artifact_id`, `author_actor_id`, `nostr_event_id`, `artifact_type`, `correlation_id`
- [ ] Events signed at level-2 (service HMAC) per ADR-010
- [ ] Unit tests for use case happy path and error scenarios

**Files Created/Modified**:
- `packages/dip/src/application/artifact-publication-use-case.ts`
- `packages/dip/src/application/anchoring-confirmation-use-case.ts`
- `packages/dip/src/infrastructure/dip-event-publisher.ts`
- `packages/dip/tests/unit/application/artifact-publication-use-case.test.ts`

---

#### [COMP-003.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-003.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement REST API handlers for the DIP Artifact Registry internal API consumed by Learn, Hub, Labs, and IDE via their ACL adapters.

**Acceptance Criteria**:
- [ ] `POST /internal/dip/artifacts` → creates and initiates publication
- [ ] `GET /internal/dip/artifacts/{id}` → returns artifact metadata
- [ ] `GET /internal/dip/artifacts/{id}/identity-record` → returns IdentityRecord
- [ ] `GET /internal/dip/artifacts/{id}/versions` → returns version list
- [ ] All endpoints require `IdentityToken` (service-to-service mTLS or valid JWT)
- [ ] Response format follows CONV-017 envelope

**Files Created/Modified**:
- `packages/dip/src/api/routes/artifacts.ts`
- `packages/dip/src/api/index.ts`
- `packages/dip/tests/integration/api/artifacts.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | DIP package shell |
| COMP-002 Identity | Internal | ⬜ Not Started | `ActorId` for author attribution |
| Nostr Relays | External | ✅ Available | Artifact anchoring target |
| PostgreSQL (Supabase) | External | ✅ Available | Artifact persistence |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-004 Smart Contract Engine | Sibling DIP subdomain | Blocks GovernanceContract evaluation |
| COMP-005 IACP Engine | Consumes `dip.artifact.anchored` | Blocks IACP protocol |
| COMP-006 Project Manifest DAG | Reads artifact metadata | Blocks dependency graph |
| COMP-016 Learn Fragment Engine | Publishes via ACL | Blocks Fragment publication |
| COMP-019 Hub Collaboration Layer | Publishes contributions via ACL | Blocks Contribution integration |
| COMP-023 Labs Article Editor | Publishes articles via ACL | Blocks article publication |
| COMP-030 IDE Domain | Artifact publish bridge | Blocks IDE publish flow |

---

## Technical Details

### File Structure

```
packages/dip/
├── src/
│   ├── domain/
│   │   ├── shared/
│   │   │   ├── dip-entity-id.ts
│   │   │   ├── actor-signature.ts
│   │   │   ├── content-hash.ts
│   │   │   └── dip-invariant-error.ts
│   │   ├── artifact-registry/
│   │   │   ├── artifact.ts
│   │   │   ├── artifact-version.ts
│   │   │   ├── identity-record.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── artifact-type.ts
│   │   │   │   └── author-public-key.ts
│   │   │   ├── repositories/
│   │   │   │   └── artifact-repository.ts
│   │   │   ├── services/
│   │   │   │   ├── anchoring-service.ts
│   │   │   │   └── content-hash-service.ts
│   │   │   └── anchoring-provider.ts  (interface)
│   │   └── index.ts
│   ├── application/
│   │   ├── artifact-publication-use-case.ts
│   │   └── anchoring-confirmation-use-case.ts
│   ├── infrastructure/
│   │   ├── nostr-relay-adapter.ts
│   │   ├── dip-event-publisher.ts
│   │   ├── repositories/
│   │   │   └── postgres-artifact-repository.ts
│   │   └── migrations/
│   │       └── 001_artifact_registry.sql
│   ├── api/
│   │   ├── routes/
│   │   │   └── artifacts.ts
│   │   └── index.ts
│   └── index.ts
└── tests/
    ├── unit/
    │   ├── artifact-registry/
    │   │   ├── artifact.test.ts
    │   │   └── anchoring-service.test.ts
    │   └── application/
    │       └── artifact-publication-use-case.test.ts
    └── integration/
        ├── nostr-relay-adapter.test.ts
        ├── repositories/
        │   └── artifact-repository.test.ts
        └── api/
            └── artifacts.test.ts
```

---

## Implementation Log

### 2026-03-13 - COMP-003.8 completed (Integration tests for Artifact Registry)

- **Location**: `apps/api/src/integration/artifact-lifecycle.integration.test.ts`.
- **Setup**: Testcontainers Postgres; two DIP migrations run in order; real `PgArtifactDbClient`, `PostgresArtifactRepository`, `ArtifactLifecycleService`; capturing `ArtifactLifecycleEventPublisher` (no real Kafka); `createApp` with mock auth and DIP context.
- **Tests**: (1) Full lifecycle via API: POST → GET draft → PUT submit → PUT publish → GET published; status and `publishedAt` asserted at each step. (2) Event assertions: capturing publisher receives `dip.artifact.drafted`, `dip.artifact.submitted`, `dip.artifact.published` in order with matching `artifactId`. (3) Nostr anchor: after publish, artifact updated with `withNostrEventId` and saved via repository; GET returns `nostrEventId` in response.
- **Dependencies**: `@testcontainers/postgresql` added to `apps/api` devDependencies; Vitest config includes `src/**/*.integration.test.ts` and `hookTimeout: 60_000`. Run integration tests with Docker available; for long first pull use `--hook-timeout=90000` if needed.
- Implementation Plan is authority for item numbering; component record item labels may differ.

### 2026-03-13 - COMP-003.7 completed (Artifact REST API endpoints)

- **Location**: `apps/api` (API app owns the HTTP layer; DIP provides application services).
- **Endpoints**: `POST /api/v1/artifacts`, `GET /api/v1/artifacts/:id`, `PUT /api/v1/artifacts/:id/submit`, `PUT /api/v1/artifacts/:id/publish`; all require auth via `requireAuth`; responses use CONV-017 envelope (`successEnvelope` / `errorEnvelope`).
- **Wiring**: `CreateAppOptions.dip` optional; when present, `artifactRoutes` registered with `{ dip }`. `DipContext` type in `apps/api/src/types/dip-context.ts` to avoid circular dependency.
- **Files**: `apps/api/src/routes/artifacts.ts` (handlers + `artifactToDto`), `apps/api/src/routes/artifacts.test.ts` (13 API tests with mocked DIP), `apps/api/src/types/dip-context.ts`, `apps/api/package.json` (added `@syntropy/dip`).
- **Errors**: `ArtifactNotFoundError` → 404, `InvalidLifecycleTransitionError` → 409, invalid UUID → 400.
- **Production wiring**: Not done in this item; main.ts unchanged. Real DIP services can be wired in a follow-up (e.g. COMP-003.8 or dedicated wiring task).

### 2026-03-13 - COMP-003.6 completed (Artifact query service)

- **ArtifactQueryService**: `findPublished(filter?, pagination?)` returns `{ items: ArtifactSummary[], nextCursor? }`; filter by `authorId`, `type`, `tag`; cursor-based pagination (default limit 20, max 100).
- **Schema**: Migration `20260313230000_dip_artifacts_type_and_tags.sql` added `artifact_type` (TEXT) and `tags` (TEXT[]) to `dip.artifacts` with indexes.
- **Domain**: `ArtifactType` value object (scientific-article, dataset, experiment, code, document); `Artifact` aggregate extended with optional `artifactType` and `tags`; `ArtifactSummary` DTO and `ArtifactQueryFilter`; `ArtifactRepository.findPublished` now takes `FindPublishedOptions` (filter, cursor, limit) and returns `FindPublishedResult` (items, nextCursor).
- **Infrastructure**: `PostgresArtifactRepository` updated for new columns, dynamic WHERE for filter, keyset pagination via cursor (encode/decode `(published_at, id)`).
- **Tests**: Unit tests for `ArtifactQueryService` (5 tests); integration tests for repository `findPublished` with cursor pagination updated.
- Implementation Plan is authority for item numbering; component record item labels may differ.

### 2026-03-13 - COMP-003.3, 003.4, 003.5 completed (Implementation Plan)

- **COMP-003.3** (NostrAnchor integration): Added `NostrEventId` value object; `NostrRelayPort` (domain port) and `NostrRelayAdapter` (infrastructure); `Artifact.nostrEventId`, `Artifact.withNostrEventId()`, `Artifact.fromPersistence()`; `NostrAnchorService.anchor(artifact, content?)` with SHA-256 content hash and relay submit; unit tests for NostrAnchorService (mock relay) and Artifact.withNostrEventId.
- **COMP-003.4** (ArtifactRepository Postgres): Extended `ArtifactRepository` with `findByAuthor`, `findPublished(options)`; migration `supabase/migrations/20260313220000_dip_artifacts.sql` (dip.artifacts table); `ArtifactDbClient` interface; `PostgresArtifactRepository`, `PgArtifactDbClient`; integration tests with mock DB client (roundtrip, findByAuthor, findPublished).
- **COMP-003.5** (ArtifactEventPublisher): `ArtifactEventPublisher` implements `ArtifactLifecycleEventPublisher`; publishes to topic `dip.artifact.events` with schema version 1 and payload (artifactId, authorId, timestamp); unit tests with mock Kafka producer.
- Note: Component record item numbering differs from Implementation Plan; Plan is authority for execution order.

### 2026-03-13 - COMP-003.2 completed (Implementation Plan)

- **COMP-003.2** (per IMPLEMENTATION-PLAN.md): ArtifactLifecycleService done.
- Added: `ArtifactStatus.Submitted`; `Artifact.submit()`, `publish()`, `archive()` with `InvalidLifecycleTransitionError`; `ArtifactRepository` interface; `ArtifactLifecycleEvent` payloads and `ArtifactLifecycleEventPublisher` interface; `ArtifactLifecycleService` with `draft(authorId, content?)`, `submit(artifactId)`, `publish(artifactId)`, `archive(artifactId)`; each transition saves and publishes domain event (`dip.artifact.drafted`, `submitted`, `published`, `archived`). Content hash in draft via SHA-256 when content provided.
- Unit tests: Artifact transitions (submit/publish/archive valid and invalid); ArtifactLifecycleService with mocked repository and event publisher (9 tests). All 38 tests pass.

### 2026-03-13 - COMP-003.1 completed (Implementation Plan)

- **COMP-003.1** (per IMPLEMENTATION-PLAN.md): DIP package setup + Artifact aggregate done.
- Added: `packages/dip` domain layout; value objects `ArtifactId`, `ContentHash`, `AuthorId`; `ArtifactStatus` enum; `Artifact` aggregate with `Artifact.draft()` factory.
- Vitest added; 22 unit tests (value objects + Artifact). Build and tests pass.
- Note: Component record item numbering (003.1 = setup, 003.2 = Artifact) differs from Plan; Plan is authority for execution order.

### 2026-03-13 - Component Created

- Created initial implementation record
- Extracted 8 work items from artifact-registry.md, ADR-003, ADR-010
- DIP package setup included in COMP-003.1 as it is the first DIP subdomain

---

## References

### Architecture Documents

- [DIP Artifact Registry Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/artifact-registry.md)
- [DIP Domain Architecture](../../architecture/domains/digital-institutions-protocol/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-003](../../architecture/decisions/ADR-003-artifact-identity-anchoring.md) | Nostr Anchoring | Anchoring strategy for IdentityRecord |
| [ADR-010](../../architecture/decisions/ADR-010-event-signing-and-immutability.md) | Two-Level Event Signing | Level-1 actor signing for Nostr events |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-004](./COMP-004-dip-smart-contract-engine.md) | Sibling DIP subdomain |
| [COMP-005](./COMP-005-dip-iacp-engine.md) | Consumes `dip.artifact.anchored` |
| [COMP-016](./COMP-016-learn-fragment-engine.md) | Publishes artifacts via ACL |
