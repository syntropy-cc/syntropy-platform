# Labs — Article Editor Implementation Record

> **Component ID**: COMP-023
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/labs/subdomains/article-editor.md](../../architecture/domains/labs/subdomains/article-editor.md)
> **Stage Assignment**: S9 — Labs Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Article Editor is the Core subdomain of Labs. It owns the `ScientificArticle` aggregate — the primary output of the Labs pillar. Articles are authored in **MyST Markdown** (ADR-008): a semantic scientific markup supporting mathematical expressions, structured metadata, embedded artifact references, and export to HTML/PDF/LaTeX. `ArticleVersion` entities support full version history. `EmbeddedArtifactRef` links article sections to DIP artifacts. When published, the article becomes a DIP artifact via `DIPArticlePublicationAdapter` (ACL).

**Responsibilities**:
- Manage `ScientificArticle` lifecycle: Draft → UnderReview → Published
- Store `ArticleVersion`s with MyST content
- Render MyST preview via `MySTPrerenderService`
- Publish as DIP artifact via `DIPArticlePublicationAdapter`
- Publish `labs.article.published`, `labs.article.version_saved` events

**Key Interfaces**:
- Internal API: Article CRUD, version management, MyST prerender
- ACL: `DIPArticlePublicationAdapter` wrapping DIP Artifact Registry

### Implementation Scope

**In Scope**:
- `ScientificArticle` aggregate, `ArticleVersion`, `EmbeddedArtifactRef` entities
- `ArticleContentValidator` domain service (MyST structure validation)
- `MySTPrerenderService` infrastructure service (MyST → HTML)
- `DIPArticlePublicationAdapter` (ACL)
- Repository + API

**Out of Scope**:
- DOI assignment (COMP-026)
- Peer review workflow (COMP-025)
- Scientific context (COMP-022) — referenced, not owned

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

#### [COMP-023.1] ScientificArticle aggregate and ArticleVersion entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | article-editor.md, ADR-008 |
| **Dependencies** | COMP-022.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ScientificArticle` aggregate and `ArticleVersion` entity with MyST content storage.

**Acceptance Criteria**:
- [ ] `ScientificArticle` aggregate: `id (ArticleId)`, `project_id`, `author_ids[]`, `title`, `abstract`, `subject_area_id`, `methodology_id (nullable)`, `status (draft|under_review|published)`, `published_artifact_id (nullable)`, `doi (nullable)`, `current_version_number`
- [ ] `ArticleVersion` entity: `article_id`, `version_number`, `myst_content (text)`, `created_by`, `created_at`, `content_hash`
- [ ] Invariant: `published_artifact_id` set once, immutable
- [ ] `ScientificArticle.saveVersion(mystContent, authorId)` increments version, stores
- [ ] `ScientificArticle.publish(artifactId)` transitions to Published
- [ ] Unit tests: version increment, double-publish prevention

**Files Created/Modified**:
- `packages/labs/src/domain/article-editor/scientific-article.ts`
- `packages/labs/src/domain/article-editor/article-version.ts`
- `packages/labs/tests/unit/article-editor/scientific-article.test.ts`

---

#### [COMP-023.2] EmbeddedArtifactRef entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | article-editor.md |
| **Dependencies** | COMP-023.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `EmbeddedArtifactRef` entity linking article sections to DIP artifacts.

**Acceptance Criteria**:
- [ ] `EmbeddedArtifactRef` entity: `article_id`, `dip_artifact_id`, `section_id`, `ref_type (figure|data|code|experiment)`, `caption`
- [ ] Article section references artifact by DIP ID (no content duplication)
- [ ] On article publication: all referenced artifact IDs included in DIP publication metadata

**Files Created/Modified**:
- `packages/labs/src/domain/article-editor/embedded-artifact-ref.ts`

---

#### [COMP-023.3] ArticleContentValidator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | article-editor.md, ADR-008 |
| **Dependencies** | COMP-023.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArticleContentValidator` that validates MyST Markdown structure before publication.

**Acceptance Criteria**:
- [ ] `ArticleContentValidator.validate(mystContent)` returns `ValidationResult { valid, errors[] }`
- [ ] Required sections: title, abstract, introduction, methodology, results, discussion, references
- [ ] Validates MyST directive syntax (using `myst-parser` library)
- [ ] Validates math expressions (LaTeX syntax check)
- [ ] Validates `EmbeddedArtifactRef` directives exist in DIP registry
- [ ] Unit tests: all required section absence throws, malformed MyST directive caught

**Files Created/Modified**:
- `packages/labs/src/domain/article-editor/services/article-content-validator.ts`
- `packages/labs/tests/unit/article-editor/article-content-validator.test.ts`

---

#### [COMP-023.4] MySTPrerenderService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | article-editor.md, ADR-008 |
| **Dependencies** | COMP-023.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `MySTPrerenderService` that converts MyST Markdown to HTML (for live preview) and validates export readiness.

**Acceptance Criteria**:
- [ ] `MySTPrerenderService.toHTML(mystContent, options)` returns rendered HTML string
- [ ] Math rendering via KaTeX (server-side)
- [ ] Code blocks syntax highlighted
- [ ] `EmbeddedArtifactRef` directives rendered as placeholder with DIP artifact link
- [ ] Export format support: HTML (live preview), PDF-ready HTML (for print), LaTeX (for journal submission)
- [ ] Render time p95 < 2s for 10,000 word article

**Files Created/Modified**:
- `packages/labs/src/infrastructure/myst-prerender-service.ts`
- `packages/labs/tests/integration/myst-prerender-service.test.ts`

---

#### [COMP-023.5] DIPArticlePublicationAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | article-editor.md |
| **Dependencies** | COMP-023.1, COMP-003 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DIPArticlePublicationAdapter` — ACL wrapping DIP Artifact Registry to publish articles as DIP artifacts.

**Acceptance Criteria**:
- [ ] `DIPArticlePublicationAdapter` implements `ArticlePublisher` interface
- [ ] `publish(articleId, authorActorId, mystContent, embeddedRefs[])` → DIP artifact creation, returns `ArtifactId`
- [ ] DIP vocabulary does not appear in Labs domain types
- [ ] Integration test with mocked DIP

**Files Created/Modified**:
- `packages/labs/src/domain/article-editor/article-publisher.ts` (interface)
- `packages/labs/src/infrastructure/dip-article-publication-adapter.ts`

---

#### [COMP-023.6] ArticlePublicationUseCase

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | article-editor.md |
| **Dependencies** | COMP-023.3, COMP-023.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArticlePublicationUseCase` orchestrating validation, DIP publication, and event emission.

**Acceptance Criteria**:
- [ ] `ArticlePublicationUseCase.execute(articleId, authorActorId)` validates MyST, calls DIP adapter, sets artifact ID, publishes `labs.article.published`
- [ ] `labs.article.published` event: `article_id`, `artifact_id`, `author_actor_id`, `subject_area_id`
- [ ] On DIP failure: article stays UnderReview with error logged

**Files Created/Modified**:
- `packages/labs/src/application/article-publication-use-case.ts`

---

#### [COMP-023.7] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | article-editor.md, ADR-004 |
| **Dependencies** | COMP-023.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for articles, versions, and artifact refs.

**Acceptance Criteria**:
- [ ] `ScientificArticleRepository`, `ArticleVersionRepository`, `EmbeddedArtifactRefRepository` interfaces
- [ ] Migration: `scientific_articles`, `article_versions`, `embedded_artifact_refs` tables
- [ ] `article_versions` append-only (no updates/deletes)
- [ ] Integration tests

**Files Created/Modified**:
- `packages/labs/src/infrastructure/repositories/`
- `packages/labs/src/infrastructure/migrations/002_article_editor.sql`

---

#### [COMP-023.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | labs/ARCHITECTURE.md |
| **Dependencies** | COMP-023.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for article editor operations.

**Acceptance Criteria**:
- [ ] `POST /internal/labs/articles` → create draft article
- [ ] `PATCH /internal/labs/articles/{id}/content` → save version
- [ ] `GET /internal/labs/articles/{id}` → article with current version
- [ ] `GET /internal/labs/articles/{id}/versions` → version history
- [ ] `POST /internal/labs/articles/{id}/preview` → MyST HTML preview
- [ ] `POST /internal/labs/articles/{id}/publish` → publish article

**Files Created/Modified**:
- `packages/labs/src/api/routes/articles.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-022 Labs Scientific Context | Internal | ⬜ Not Started | Subject areas and methodologies |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Article publication as DIP artifact |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event publishing |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-024 Labs Experiment Design | Experiments linked to articles | Delays experiment reporting |
| COMP-025 Labs Open Peer Review | Reviews target articles | Blocks peer review |
| COMP-026 Labs DOI Publication | DOI assigned to published articles | Blocks external publication |

---

## References

### Architecture Documents

- [Labs Article Editor Subdomain](../../architecture/domains/labs/subdomains/article-editor.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-008](../../architecture/decisions/ADR-008-scientific-writing-format.md) | MyST Markdown | Article content format |
