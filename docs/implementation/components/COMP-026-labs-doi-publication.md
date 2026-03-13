# Labs — DOI & External Publication Implementation Record

> **Component ID**: COMP-026
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/labs/subdomains/doi-external-publication.md](../../architecture/domains/labs/subdomains/doi-external-publication.md)
> **Stage Assignment**: S10 — Labs Research
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

DOI & External Publication is a Supporting subdomain managing the assignment of persistent identifiers (DOIs) to published scientific articles and their notification to external academic indexes. The `DOIRecord` captures the DOI minted via DataCite. `DataCiteAdapter` is the ACL wrapping the DataCite API. `ExternalIndexingNotifier` sends notifications to academic indexers (arXiv, DOAJ, OpenAlex) when articles are published.

**Responsibilities**:
- Mint DOIs via DataCite API (`DataCiteAdapter` ACL)
- Store `DOIRecord` per article
- Notify external academic indexes via `ExternalIndexingNotifier`
- Update article with DOI reference

**Key Interfaces**:
- Internal API: DOI minting, article export
- External: DataCite Metadata API, academic index notification webhooks

### Implementation Scope

**In Scope**:
- `DOIRecord` entity
- `DataCiteAdapter` (ACL)
- `ExternalIndexingNotifier` infrastructure service
- Repository + API

**Out of Scope**:
- Article authoring (COMP-023)
- Peer review (COMP-025)

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

#### [COMP-026.1] DOIRecord entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | doi-external-publication.md |
| **Dependencies** | COMP-022.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `DOIRecord` entity capturing minted DOI and DataCite metadata.

**Acceptance Criteria**:
- [ ] `DOIRecord` entity: `id`, `article_id`, `doi (string, immutable after mint)`, `datacite_id`, `state (draft|registered|findable)`, `minted_at`, `updated_at`
- [ ] One DOIRecord per article (unique constraint)
- [ ] `doi` field immutable after minting

**Files Created/Modified**:
- `packages/labs/src/domain/doi-publication/doi-record.ts`

---

#### [COMP-026.2] DataCiteAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | doi-external-publication.md |
| **Dependencies** | COMP-026.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `DataCiteAdapter` ACL wrapping the DataCite Metadata API for DOI minting.

**Acceptance Criteria**:
- [ ] `DataCiteAdapter` implements `DOIProvider` interface
- [ ] `mintDOI(articleId, metadata)` calls DataCite API, returns DOI string
- [ ] `updateDOIState(doi, state)` transitions DOI to `findable` on article publication
- [ ] Circuit breaker for DataCite API calls
- [ ] DataCite vocabulary does not leak into Labs domain
- [ ] Integration test with mocked DataCite API

**Files Created/Modified**:
- `packages/labs/src/domain/doi-publication/doi-provider.ts` (interface)
- `packages/labs/src/infrastructure/datacite-adapter.ts`
- `packages/labs/tests/integration/datacite-adapter.test.ts`

---

#### [COMP-026.3] ExternalIndexingNotifier

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | doi-external-publication.md |
| **Dependencies** | COMP-026.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ExternalIndexingNotifier` that sends publication notifications to configured academic indexes.

**Acceptance Criteria**:
- [ ] `ExternalIndexingNotifier.notify(article, doiRecord)` sends notification to: arXiv RSS endpoint, DOAJ CRUD API (if applicable), OpenAlex metadata notification
- [ ] Each notifier independent: one failure does not block others
- [ ] Notifications are best-effort + retry (max 3 attempts with exponential backoff)
- [ ] `labs.article.external_indexed` event published per successful notification

**Files Created/Modified**:
- `packages/labs/src/infrastructure/external-indexing-notifier.ts`

---

#### [COMP-026.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | doi-external-publication.md, ADR-004 |
| **Dependencies** | COMP-026.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for DOI records.

**Acceptance Criteria**:
- [ ] `DOIRecordRepository` interface and PostgreSQL implementation
- [ ] Migration: `doi_records` table with unique constraint on `article_id`
- [ ] Integration tests

**Files Created/Modified**:
- `packages/labs/src/infrastructure/repositories/postgres-doi-repository.ts`
- `packages/labs/src/infrastructure/migrations/005_doi_publication.sql`

---

#### [COMP-026.5] DOI minting use case and API

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | doi-external-publication.md |
| **Dependencies** | COMP-026.3, COMP-026.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `MintDOIUseCase` and internal API for DOI operations.

**Acceptance Criteria**:
- [ ] `MintDOIUseCase.execute(articleId)` validates article is published, calls DataCite, creates DOIRecord, updates article DOI field, notifies indexers
- [ ] `POST /internal/labs/articles/{id}/doi` → mints DOI
- [ ] `GET /internal/labs/articles/{id}/doi` → current DOI state
- [ ] `labs.article.doi_minted` event published

**Files Created/Modified**:
- `packages/labs/src/application/mint-doi-use-case.ts`
- `packages/labs/src/api/routes/doi.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-023 Labs Article Editor | Internal | ⬜ Not Started | Article must be published before DOI |
| DataCite API | External | ✅ Available | DOI minting service |

---

## References

### Architecture Documents

- [Labs DOI & External Publication Subdomain](../../architecture/domains/labs/subdomains/doi-external-publication.md)
