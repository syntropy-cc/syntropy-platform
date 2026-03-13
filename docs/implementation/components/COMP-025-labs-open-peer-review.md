# Labs — Open Peer Review Implementation Record

> **Component ID**: COMP-025
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/labs/subdomains/open-peer-review.md](../../architecture/domains/labs/subdomains/open-peer-review.md)
> **Stage Assignment**: S10 — Labs Research
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Open Peer Review is a Core subdomain in Labs. It manages the transparent peer review process where all review activity is publicly visible (except during embargo periods). Key entities: `Review`, `ReviewPassageLink` (links reviewer's comments to specific article passages), `AuthorResponse`. The `ReviewVisibilityEvaluator` gates visibility based on the reviewer's `ReputationScore` from Platform Core — reviewers below threshold have visibility delayed.

**Responsibilities**:
- Manage `Review` lifecycle: InProgress → Submitted → Published
- Manage `ReviewPassageLink` for fine-grained annotation
- Manage `AuthorResponse` to reviews
- Evaluate reviewer visibility via `ReviewVisibilityEvaluator` (reputation-gated)
- Publish `labs.review.submitted`, `labs.review.published` events

**Key Interfaces**:
- Internal API: review management, author responses

### Implementation Scope

**In Scope**:
- `Review`, `ReviewPassageLink`, `AuthorResponse` entities
- `ReviewVisibilityEvaluator` domain service
- Repository + API

**Out of Scope**:
- ReputationScore computation (COMP-010)
- Article authoring (COMP-023)
- DOI publication (COMP-026)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 7 |
| **Total** | **7** |

**Component Coverage**: 0%

### Item List

#### [COMP-025.1] Review aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | open-peer-review.md |
| **Dependencies** | COMP-023.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Review` aggregate with lifecycle and visibility control.

**Acceptance Criteria**:
- [ ] `Review` aggregate: `id (ReviewId)`, `article_id`, `reviewer_id`, `verdict (accept|major_revision|minor_revision|reject)`, `general_comment`, `status (in_progress|submitted|published|embargoed)`, `submitted_at`, `published_at`, `visibility_score_threshold`
- [ ] `Review.submit(verdict, comment)` transitions to Submitted
- [ ] `Review.publish()` transitions to Published (only if reviewer reputation meets threshold)
- [ ] `Review.embargo(until)` sets visibility delay
- [ ] `labs.review.submitted`, `labs.review.published` events published

**Files Created/Modified**:
- `packages/labs/src/domain/open-peer-review/review.ts`
- `packages/labs/tests/unit/open-peer-review/review.test.ts`

---

#### [COMP-025.2] ReviewPassageLink entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | open-peer-review.md |
| **Dependencies** | COMP-025.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ReviewPassageLink` entity for fine-grained article annotation.

**Acceptance Criteria**:
- [ ] `ReviewPassageLink` entity: `id`, `review_id`, `article_id`, `section_id`, `passage_start`, `passage_end`, `comment`, `severity (critical|major|minor|suggestion)`, `created_at`
- [ ] Passage coordinates reference MyST content structure (section + character offset)
- [ ] Multiple links per review allowed

**Files Created/Modified**:
- `packages/labs/src/domain/open-peer-review/review-passage-link.ts`

---

#### [COMP-025.3] AuthorResponse entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | open-peer-review.md |
| **Dependencies** | COMP-025.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `AuthorResponse` entity for author replies to reviews and passage comments.

**Acceptance Criteria**:
- [ ] `AuthorResponse` entity: `id`, `article_id`, `review_id`, `reviewer_link_id (nullable)`, `author_id`, `response_text`, `status (draft|published)`, `published_at`
- [ ] One response per review (plus per-passage-link responses)
- [ ] Responses published only after article revision submitted

**Files Created/Modified**:
- `packages/labs/src/domain/open-peer-review/author-response.ts`

---

#### [COMP-025.4] ReviewVisibilityEvaluator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | open-peer-review.md |
| **Dependencies** | COMP-025.1, COMP-010 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ReviewVisibilityEvaluator` that checks reviewer reputation before allowing review publication.

**Acceptance Criteria**:
- [ ] `ReviewVisibilityEvaluator.canPublish(reviewerId)` calls Platform Core reputation API; returns `{ allowed: boolean, reputation_score: number }`
- [ ] Threshold: reputation_score ≥ 0.3 allows immediate publication
- [ ] Below threshold: review published after 7-day delay (embargo period)
- [ ] `PortfolioReputationAdapter` (ACL) wraps Platform Core portfolio API
- [ ] Unit tests: above threshold immediate, below threshold delayed

**Files Created/Modified**:
- `packages/labs/src/domain/open-peer-review/services/review-visibility-evaluator.ts`
- `packages/labs/src/infrastructure/portfolio-reputation-adapter.ts`
- `packages/labs/tests/unit/open-peer-review/review-visibility-evaluator.test.ts`

---

#### [COMP-025.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | open-peer-review.md, ADR-004 |
| **Dependencies** | COMP-025.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and migration for peer review entities.

**Acceptance Criteria**:
- [ ] `ReviewRepository`, `ReviewPassageLinkRepository`, `AuthorResponseRepository` interfaces and implementations
- [ ] Migration: `reviews`, `review_passage_links`, `author_responses` tables
- [ ] Index on `(article_id, status)` for article review counts

**Files Created/Modified**:
- `packages/labs/src/infrastructure/repositories/`
- `packages/labs/src/infrastructure/migrations/004_open_peer_review.sql`

---

#### [COMP-025.6] Review lifecycle use cases

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | open-peer-review.md |
| **Dependencies** | COMP-025.4, COMP-025.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement use cases for review invitation, submission, and publication.

**Acceptance Criteria**:
- [ ] `InviteReviewerUseCase` — creates Review in InProgress, notifies reviewer via Communication domain
- [ ] `SubmitReviewUseCase` — submits review, checks visibility, schedules publication
- [ ] `PublishReviewUseCase` — triggered by scheduler or immediate, transitions to Published
- [ ] Background job for scheduled (embargoed) review publication in COMP-034

**Files Created/Modified**:
- `packages/labs/src/application/review-use-cases.ts`

---

#### [COMP-025.7] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | labs/ARCHITECTURE.md |
| **Dependencies** | COMP-025.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for peer review operations.

**Acceptance Criteria**:
- [ ] `POST /internal/labs/articles/{id}/reviews/invite` → invite reviewer
- [ ] `POST /internal/labs/reviews/{id}/submit` → submit review with passage links
- [ ] `POST /internal/labs/reviews/{id}/responses` → author response
- [ ] `GET /internal/labs/articles/{id}/reviews` → all reviews for article

**Files Created/Modified**:
- `packages/labs/src/api/routes/reviews.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-023 Labs Article Editor | Internal | ⬜ Not Started | Reviews target articles |
| COMP-010 Portfolio Aggregation | Internal | ⬜ Not Started | ReputationScore for visibility |

---

## References

### Architecture Documents

- [Labs Open Peer Review Subdomain](../../architecture/domains/labs/subdomains/open-peer-review.md)
