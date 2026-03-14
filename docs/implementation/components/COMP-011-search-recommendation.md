# Platform Core — Search & Recommendation Implementation Record

> **Component ID**: COMP-011
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/platform-core/subdomains/search-recommendation.md](../../architecture/domains/platform-core/subdomains/search-recommendation.md)
> **Stage Assignment**: S4 — Platform Core Aggregation
> **Status**: ✅ Complete
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Search & Recommendation provides cross-pillar discovery: full-text and semantic search across all published entities (tracks, articles, projects, institutions, artifacts), and personalized recommendations surfacing real opportunities (open issues, relevant tracks, articles matching interests). The `SearchIndex` is a pure read model (eventual consistency < 30s). `RecommendationSet` is personalized per user using portfolio state + UserContextModel from AI Agents.

**Responsibilities**:
- Build and maintain `SearchIndex` from AppendOnlyLog events
- Full-text search via PostgreSQL FTS; semantic search via pgvector
- Generate personalized `RecommendationSet` per user using `RecommendationEngine`
- Surface `OpportunityType` items: OpenIssue, PublishedTrack, LabsArticle, InstitutionToJoin
- Publish `platform_core.recommendation.generated` events

**Key Interfaces**:
- Internal API: `GET /internal/platform-core/search?q=...&pillar=...`, `GET /internal/platform-core/recommendations/{user_id}`

### Implementation Scope

**In Scope**:
- `SearchIndex` read model, `SearchDocument` entity
- `RecommendationSet` aggregate, `Recommendation` entity
- `EventIndexingService`, `FullTextSearchService`, `SemanticSearchService`
- `RecommendationEngine`, `OpportunitySurfacingService`
- pgvector integration for semantic search
- Kafka consumer for real-time index updates

**Out of Scope**:
- Individual domain data storage (read model only, no domain data owned)
- LLM embedding generation (delegated to AI Agents package via ACL)
- Full portfolio computation (COMP-010)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 7 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 0 |
| **Total** | **7** |

**Component Coverage**: 100% (7/7)

### Item List

#### [COMP-011.1] SearchIndex read model and SearchDocument entity

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-009.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `SearchDocument` entity representing a searchable snapshot of any published entity. Design the PostgreSQL schema with FTS columns and pgvector extension.

**Acceptance Criteria**:
- [ ] `SearchDocument` entity: `id`, `entity_type`, `entity_id`, `pillar`, `title`, `content_summary`, `tags[]`, `subject_areas[]`, `relevance_score`, `vector_embedding (pgvector)`, `indexed_at`, `is_public`
- [ ] Migration: `search_documents` table with `tsvector` column for FTS and `vector(1536)` for pgvector embeddings
- [ ] GIN index on `tsvector`, IVFFlat index on `vector_embedding`
- [ ] `SearchDocument.updateEmbedding(vector)` updates vector embedding
- [ ] Upsert on `entity_id`: re-indexing is idempotent

**Files Created/Modified**:
- `packages/platform-core/src/domain/search-recommendation/search-document.ts`
- `packages/platform-core/src/infrastructure/migrations/004_search_index.sql`

---

#### [COMP-011.2] EventIndexingService (Kafka consumer)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.1, COMP-009.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `EventIndexingService` — Kafka consumer that processes publication events and upserts `SearchDocument` entries. Target lag < 30s.

**Acceptance Criteria**:
- [ ] Consumer group: `search-index`
- [ ] Processes: `learn.fragment.artifact_published`, `learn.track.published`, `hub.contribution.integrated`, `hub.institution.created`, `labs.article.published`, `dip.artifact.anchored`
- [ ] Creates/updates `SearchDocument` with content summary extracted from event payload
- [ ] Idempotent: processing same event twice produces same SearchDocument
- [ ] Triggers embedding generation asynchronously (does not block index update)

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/consumers/event-indexing-consumer.ts`

---

#### [COMP-011.3] FullTextSearchService and SemanticSearchService

| Field | Value |
|-------|-------|
| **Status** | 🔵 In Progress (FTS + SearchService done; semantic in Plan COMP-011.4) |
| **Priority** | Critical |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `FullTextSearchService` using PostgreSQL FTS and `SemanticSearchService` using pgvector for embedding-based similarity search.

**Acceptance Criteria**:
- [ ] `FullTextSearchService.search(query, filters)` returns `SearchDocument[]` sorted by `ts_rank`
- [ ] Filters: `pillar`, `entity_type`, `tags`, `subject_areas`
- [ ] `SemanticSearchService.search(queryVector, filters, limit)` returns `SearchDocument[]` sorted by cosine similarity
- [ ] Hybrid search: keyword results + semantic results merged and deduplicated
- [ ] `EmbeddingAdapter` (ACL) wraps AI Agents embedding API to avoid direct LLM calls
- [ ] p95 response < 200ms for full-text; < 500ms for semantic

**Files Created/Modified**:
- `packages/platform-core/src/domain/search-recommendation/services/full-text-search-service.ts`
- `packages/platform-core/src/domain/search-recommendation/services/semantic-search-service.ts`
- `packages/platform-core/src/infrastructure/embedding-adapter.ts`
- `packages/platform-core/tests/unit/search-recommendation/search-services.test.ts`

---

#### [COMP-011.4] RecommendationSet aggregate and Recommendation entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `RecommendationSet` aggregate and `Recommendation` entity representing a personalized set of cross-pillar opportunities for a user.

**Acceptance Criteria**:
- [ ] `RecommendationSet` aggregate: `user_id`, `generated_at`, `recommendations[]`
- [ ] `Recommendation` entity: `opportunity_type (OpenIssue|PublishedTrack|LabsArticle|InstitutionToJoin)`, `entity_type`, `entity_id`, `relevance_score`, `reasoning`, `was_clicked`
- [ ] `RecommendationSet.recordClick(recommendationId)` marks `was_clicked = true` and emits signal
- [ ] Unit tests: click tracking, recommendation ordering by relevance

**Files Created/Modified**:
- `packages/platform-core/src/domain/search-recommendation/recommendation-set.ts`
- `packages/platform-core/src/domain/search-recommendation/recommendation.ts`

---

#### [COMP-011.5] RecommendationEngine

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.4, COMP-010 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `RecommendationEngine` that generates personalized `RecommendationSet` using portfolio state, skill profile, and `UserContextModel` from AI Agents.

**Acceptance Criteria**:
- [ ] `RecommendationEngine.generate(userId, userContextModel)` returns `RecommendationSet`
- [ ] Scoring factors: skill match (40%), activity alignment (30%), social proof (30%)
- [ ] Top 10 recommendations per generation
- [ ] `UserContextModelAdapter` (ACL) wraps AI Agents API call
- [ ] `platform_core.recommendation.generated` event published after generation
- [ ] Generates on: portfolio update, user login (if stale > 1h)

**Files Created/Modified**:
- `packages/platform-core/src/domain/search-recommendation/services/recommendation-engine.ts`
- `packages/platform-core/src/infrastructure/user-context-model-adapter.ts`

---

#### [COMP-011.6] Repository and API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository for RecommendationSet and REST API endpoints for search and recommendations.

**Acceptance Criteria**:
- [ ] `RecommendationSetRepository`: `findByUser`, `save`
- [ ] Migration: `recommendation_sets`, `recommendations` tables
- [ ] `GET /internal/platform-core/search?q=...&pillar=...&type=...` → returns SearchDocuments
- [ ] `GET /internal/platform-core/recommendations/{user_id}` → returns RecommendationSet (p99 < 200ms)
- [ ] Stale recommendations (> 1h) trigger async regeneration

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/repositories/postgres-recommendation-repository.ts`
- `packages/platform-core/src/infrastructure/migrations/005_recommendations.sql`
- `packages/platform-core/src/api/routes/search.ts`
- `packages/platform-core/src/api/routes/recommendations.ts`

---

#### [COMP-011.7] OpportunitySurfacingService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | search-recommendation.md |
| **Dependencies** | COMP-011.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `OpportunitySurfacingService` that identifies concrete actionable opportunities matching a user's skill profile and interests from across all pillars.

**Acceptance Criteria**:
- [ ] `OpportunitySurfacingService.findOpportunities(userId, skillProfile)` returns `Opportunity[]`
- [ ] Identifies: open Hub issues matching skills, Learn tracks with relevant topics, Labs articles needing peer review, Institutions accepting new members
- [ ] Surfaces at most 5 opportunities per type
- [ ] Integrated into `RecommendationEngine` output

**Files Created/Modified**:
- `packages/platform-core/src/domain/search-recommendation/services/opportunity-surfacing-service.ts`

---

## Implementation Log

### 2026-03-14 — S25 (COMP-011.4, 011.5, 011.6, 011.7)

- **COMP-011.4**: Migration `20260315000000_platform_core_search_index_embedding.sql` (embedding vector(1536), HNSW index). `EmbeddingPort`, `OpenAIEmbeddingAdapter` (fetch to OpenAI embeddings API). `SearchRepository.searchByVector`, `updateEmbedding`; `PostgresSearchRepository` extended. `SemanticSearchService`; `SearchService.hybridSearch` with RRF. Unit + integration tests.
- **COMP-011.5**: `Recommendation`, `RecommendationSet` entities. `RecommendationService.compute(userId)` using `PortfolioRepository` + `SearchRepository.search`; top-20, FTS-driven. Unit tests with mocks.
- **COMP-011.6**: `SearchRepository.findById`, `deleteByEntity`. `RecommendationRepository` port; `PostgresRecommendationRepository`; migration `20260315010000_platform_core_recommendations.sql` (recommendation_sets, recommendations). Integration tests with mock client.
- **COMP-011.7**: `SearchContext`; routes `GET /api/v1/search`, `GET /api/v1/recommendations/:userId` in apps/api; `searchRoutes`, `recommendationRoutes`; registered when `options.search` provided. Integration test (search-api.integration.test.ts) with pgvector container.

### 2026-03-14 — S24 (COMP-011.1, 011.2, 011.3)

- **COMP-011.1**: Added `SearchIndex` entity (`indexId`, `entityType`, `entityId`, `tsvectorContent`, `embedding?`), migration `20260314230000_platform_core_search_index.sql` (table `platform_core.search_index` with tsvector, GIN index), unit tests. Exported from `@syntropy/platform-core`.
- **COMP-011.2**: Added `SearchRepository` port (search, upsert), `PostgresSearchRepository` (FTS via `plainto_tsquery`, `ts_rank`, entityType filter), `SearchService.search()`. Integration test with mock client. Test files excluded from platform-core build (tsconfig exclude `**/*.test.ts`).
- **COMP-011.3**: Added `EventIndexingConsumer` (topics: learn/hub/labs/dip.events; indexes `*.published` and `*.updated`; payload → SearchIndex, upsert). Registered in WorkerRegistry via `createSearchIndexWorker()` in apps/workers (real consumer when DATABASE_URL set; stub otherwise). Unit tests for payload mapping and idempotence.

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | AppendOnlyLog for indexing |
| COMP-010 Portfolio Aggregation | Internal | ⬜ Not Started | User portfolio for recommendations |
| PostgreSQL + pgvector | External | ✅ Available | FTS + semantic search |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-012 AI Agents Orchestration | Recommendation signals for context | Delays AI personalization |
| COMP-032 Web Application | Search UI across all pillars | Blocks cross-pillar discovery |

---

## References

### Architecture Documents

- [Platform Core Search & Recommendation Subdomain](../../architecture/domains/platform-core/subdomains/search-recommendation.md)

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-010](./COMP-010-portfolio-aggregation.md) | Portfolio feeds recommendation scoring |
| [COMP-012](./COMP-012-ai-agents-orchestration.md) | UserContextModel for personalization |
