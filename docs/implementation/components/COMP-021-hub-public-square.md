# Hub — Public Square Implementation Record

> **Component ID**: COMP-021
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/hub/subdomains/public-square.md](../../architecture/domains/hub/subdomains/public-square.md)
> **Stage Assignment**: S8 — Hub Domain
> **Status**: ✅ Complete (COMP-021.1–021.5 done)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Public Square is a Supporting subdomain in Hub providing the **discovery layer** for public institutions, projects, and artifacts. The `DiscoveryDocument` read model aggregates signals from DIP and Platform Core to compute a `prominence_score` that drives the ranking of discoverable entities. It is purely a read model — no business data is owned here.

**Responsibilities**:
- Build and maintain `DiscoveryDocument` index from DIP entities + Hub events
- Compute `prominence_score` per entity via `ProminenceScorer`
- `PublicSquareIndexer` subscribes to relevant events and upserts DiscoveryDocuments
- Provide discovery browse and filter API

**Key Interfaces**:
- Internal API: `GET /internal/hub/discovery?type=...&tags=...&sort=prominence`

### Implementation Scope

**In Scope**:
- `DiscoveryDocument` read model entity
- `ProminenceScorer` domain service
- `PublicSquareIndexer` Kafka consumer
- Repository + API

**Out of Scope**:
- DIP institution/project data ownership (read-only)
- Full-text search (COMP-011 handles cross-pillar search)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 5 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 0 |
| **Total** | **5** |

**Component Coverage**: 100%

### Item List

#### [COMP-021.1] DiscoveryDocument read model

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | public-square.md, IMP Section 7 |
| **Dependencies** | COMP-020.6, COMP-009 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `DiscoveryDocument` read model with update logic for dip.governance.* and hub.contribution.* events (persistence in COMP-021.4).

**Acceptance Criteria**:
- [x] `DiscoveryDocument` with institutionId, name, prominenceScore, projectCount, contributorCount, recentArtifacts[]
- [x] Event payloads: DipGovernanceEventPayload, HubContributionEventPayload
- [x] applyDiscoveryEvent(current, event); createEmptyDocument; withProminenceScore, withProjectCount
- [x] Unit tests for event application and helpers

**Files Created/Modified**:
- `packages/hub/src/domain/public-square/discovery-document.ts`
- `packages/hub/tests/unit/public-square/discovery-document.test.ts`

---

#### [COMP-021.2] ProminenceScorer domain service

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ProminenceScorer` that computes prominence score from weighted signals.

**Acceptance Criteria**:
- [x] `ProminenceScorer.score(signals)` returns score in [0, 100]; weights artifact 30%, contributor 25%, governance 20%, recent 15%, cross-links 10%; time-decayed
- [x] Unit tests: all weight factors, normalization, time decay

**Files Created/Modified**:
- `packages/hub/src/domain/public-square/services/prominence-scorer.ts`
- `packages/hub/tests/unit/public-square/prominence-scorer.test.ts`

---

#### [COMP-021.3] PublicSquareIndexer (Kafka consumer)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.2, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `PublicSquareIndexer` Kafka consumer that subscribes to DIP and Hub events to keep DiscoveryDocuments updated.

**Acceptance Criteria**:
- [x] Consumer group: `hub-public-square-indexer`; subscribes to `dip.governance.events`, `hub.events`
- [x] Processes dip.governance.* and hub.contribution.integrated/merged; upserts DiscoveryDocument and recomputes prominence
- [x] Registered in WorkerRegistry (apps/workers); integration test

**Files Created/Modified**:
- `packages/hub/src/domain/public-square/ports/discovery-repository-port.ts`
- `packages/hub/src/infrastructure/consumers/public-square-indexer.ts`
- `packages/hub/src/infrastructure/repositories/in-memory-discovery-repository.ts`
- `apps/workers/src/workers/public-square-indexer-consumer.ts`
- `packages/hub/tests/integration/public-square-indexer.integration.test.ts`

---

#### [COMP-021.4] Repository and discovery API

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository for DiscoveryDocuments and REST API for browsing.

**Acceptance Criteria**:
- [x] Migration `hub.discovery_documents`; `DiscoveryRepositoryPort`: `findTop(limit)`, `findById`, `upsert`
- [x] `PostgresDiscoveryRepository`, `InMemoryDiscoveryRepository`; integration test

**Files Created/Modified**:
- `supabase/migrations/20260321000000_hub_discovery_documents.sql`
- `packages/hub/src/infrastructure/repositories/postgres-discovery-repository.ts`
- `packages/hub/tests/integration/discovery-repository.integration.test.ts`

---

#### [COMP-021.5] Public Square REST API (discover)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.2 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: GET /api/v1/hub/discover returns top institutions by prominence; optional search; public endpoint.

**Acceptance Criteria**:
- [x] `GET /api/v1/hub/discover` returns list ranked by prominence; `?search=` filter; `?limit=`; public (no auth)
- [x] hub-discover-api integration test

**Files Created/Modified**:
- `apps/api/src/routes/hub-discover.ts`
- `apps/api/src/types/hub-context.ts` (discoveryRepository)
- `apps/api/src/integration/hub-discover-api.integration.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-019 Hub Collaboration Layer | Internal | ⬜ Not Started | Hub events for indexing |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | AppendOnlyLog for activity signals |

---

## References

### Architecture Documents

- [Hub Public Square Subdomain](../../architecture/domains/hub/subdomains/public-square.md)
