# Hub — Public Square Implementation Record

> **Component ID**: COMP-021
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/hub/subdomains/public-square.md](../../architecture/domains/hub/subdomains/public-square.md)
> **Stage Assignment**: S8 — Hub Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

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
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 5 |
| **Total** | **5** |

**Component Coverage**: 0%

### Item List

#### [COMP-021.1] DiscoveryDocument read model

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-019.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DiscoveryDocument` read model entity and its PostgreSQL persistence.

**Acceptance Criteria**:
- [ ] `DiscoveryDocument` entity: `id`, `entity_type (institution|project|artifact)`, `dip_entity_id`, `name`, `tags[]`, `institution_type`, `prominence_score (Decimal)`, `contributor_count`, `open_issue_count`, `artifact_count`, `last_activity_at`, `is_public`
- [ ] Migration: `discovery_documents` table with indexes on `entity_type`, `prominence_score`, `tags`
- [ ] Upsert on `dip_entity_id`: idempotent re-indexing

**Files Created/Modified**:
- `packages/hub/src/domain/public-square/discovery-document.ts`
- `packages/hub/src/infrastructure/migrations/003_public_square.sql`

---

#### [COMP-021.2] ProminenceScorer domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ProminenceScorer` that computes prominence score from weighted signals.

**Acceptance Criteria**:
- [ ] `ProminenceScorer.score(discoveryDocument, signals)` returns `Decimal` score
- [ ] Signal weights: recent contribution activity (30 days) 40%, active contributor count 25%, open issue count 15%, artifact publications 15%, rating signals 5%
- [ ] Score normalized to [0.0, 100.0]
- [ ] Recomputed on each relevant event (contribution integrated, new issue, artifact published)
- [ ] Unit tests: all weight factors, normalization

**Files Created/Modified**:
- `packages/hub/src/domain/public-square/services/prominence-scorer.ts`
- `packages/hub/tests/unit/public-square/prominence-scorer.test.ts`

---

#### [COMP-021.3] PublicSquareIndexer (Kafka consumer)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.2, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `PublicSquareIndexer` Kafka consumer that subscribes to DIP and Hub events to keep DiscoveryDocuments updated.

**Acceptance Criteria**:
- [ ] Consumer group: `hub-public-square-indexer`
- [ ] Processes: `dip.artifact.anchored`, `hub.institution.created`, `hub.contribution.integrated`, `hub.issue.closed`
- [ ] Upserts DiscoveryDocument and recomputes prominence on each event
- [ ] Eventual consistency target: < 60s from event to index update

**Files Created/Modified**:
- `packages/hub/src/infrastructure/consumers/public-square-indexer.ts`

---

#### [COMP-021.4] Repository and discovery API

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository for DiscoveryDocuments and REST API for browsing.

**Acceptance Criteria**:
- [ ] `DiscoveryDocumentRepository`: `findByType`, `findByTags`, `findByProminence`, `upsert`
- [ ] `GET /internal/hub/discovery` → paginated, filterable, sortable list
- [ ] Filters: `entity_type`, `tags`, `institution_type`
- [ ] Sort: `prominence` (default), `last_activity_at`, `contributor_count`

**Files Created/Modified**:
- `packages/hub/src/infrastructure/repositories/postgres-discovery-repository.ts`
- `packages/hub/src/api/routes/discovery.ts`

---

#### [COMP-021.5] Prominence refresh background job

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | public-square.md |
| **Dependencies** | COMP-021.2 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement a background job that periodically recomputes prominence scores to account for time decay (recent activity weighted higher than old activity).

**Acceptance Criteria**:
- [ ] Daily batch job recomputes all prominence scores
- [ ] Activity signals older than 30 days have reduced weight
- [ ] Runs as background worker in COMP-034

**Files Created/Modified**:
- `packages/hub/src/application/prominence-refresh-job.ts`

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
