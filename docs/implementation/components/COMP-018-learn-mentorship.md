# Learn — Mentorship & Community Implementation Record

> **Component ID**: COMP-018
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/mentorship-community.md](../../architecture/domains/learn/subdomains/mentorship-community.md)
> **Stage Assignment**: S30 — Learn Mentorship & Community
> **Status**: ✅ Complete
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Mentorship & Community is a Supporting subdomain in Learn. It manages `MentorshipRelationship` between mentors and mentees, with lifecycle: Proposed → Active → Concluded/Declined. Mentors can have at most 3 active relationships simultaneously. The `ArtifactGallery` is a read model that surfaces published artifacts and portfolios for community browsing — it never owns DIP or Platform Core data but projects it for display.

**Responsibilities**:
- Manage `MentorshipRelationship` lifecycle with capacity limits
- Record `MentorReview` feedback on concluded relationships
- Provide `ArtifactGallery` read model (projecting DIP artifacts + Platform Core portfolio)
- Publish `learn.mentorship.proposed`, `learn.mentorship.started`, `learn.mentorship.concluded` events

**Key Interfaces**:
- Internal API: mentorship lifecycle, gallery queries

### Implementation Scope

**In Scope**:
- `MentorshipRelationship`, `MentorReview` entities
- `ArtifactGallery` read model (projection of DIP + Platform Core data)
- Capacity enforcement (max 3 active per mentor)
- Repository + API

**Out of Scope**:
- DIP artifact content (read-only projection)
- Portfolio computation (COMP-010)
- Scheduling of mentor sessions (COMP-029 Planning)

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

#### [COMP-018.1] MentorshipRelationship aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | mentorship-community.md |
| **Dependencies** | COMP-015.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `MentorshipRelationship` aggregate with lifecycle and capacity invariants.

**Acceptance Criteria**:
- [ ] `MentorshipRelationship` aggregate: `id`, `mentor_id`, `mentee_id`, `track_id`, `status (proposed|active|concluded|declined)`, `proposed_at`, `started_at`, `concluded_at`
- [ ] Invariant: mentor cannot have > 3 active relationships — enforced on `accept()` 
- [ ] `MentorshipRelationship.accept()` transitions Proposed → Active; checks mentor capacity
- [ ] `MentorshipRelationship.conclude(reason)` transitions Active → Concluded
- [ ] `MentorshipRelationship.decline()` transitions Proposed → Declined
- [ ] Events: `learn.mentorship.proposed`, `learn.mentorship.started`, `learn.mentorship.concluded`
- [ ] Unit tests: capacity limit, all lifecycle transitions

**Files Created/Modified**:
- `packages/learn/src/domain/mentorship/mentorship-relationship.ts`
- `packages/learn/tests/unit/mentorship/mentorship-relationship.test.ts`

---

#### [COMP-018.2] MentorReview entity

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | mentorship-community.md |
| **Dependencies** | COMP-018.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `MentorReview` entity — post-relationship feedback from mentee about the mentor.

**Acceptance Criteria**:
- [ ] `MentorReview` entity: `relationship_id`, `reviewer_id (mentee)`, `rating (1-5)`, `comment`, `created_at`
- [ ] One review per concluded relationship (unique constraint)
- [ ] Review contributes to `ReputationSignal` for mentor (consumed by COMP-010)

**Files Created/Modified**:
- `packages/learn/src/domain/mentorship/mentor-review.ts`

---

#### [COMP-018.3] ArtifactGallery read model

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | mentorship-community.md |
| **Dependencies** | COMP-015.1, COMP-003, COMP-010 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArtifactGallery` as a read model that projects published artifacts and learner portfolios for community browsing. Queries DIP and Platform Core APIs.

**Acceptance Criteria**:
- [ ] `ArtifactGallery` read model: `artifact_id`, `title`, `creator_id`, `track_id`, `artifact_type`, `published_at`, `creator_skill_level`, `creator_xp`
- [ ] `ArtifactGalleryService.getForTrack(trackId)` returns published artifacts for a track with creator portfolio data
- [ ] `ArtifactGalleryService.getForCreator(creatorId)` returns creator's published artifacts
- [ ] Data sourced from DIP API (artifact metadata) + Platform Core portfolio API
- [ ] Eventual consistency: cached with 5-minute TTL

**Files Created/Modified**:
- `packages/learn/src/domain/mentorship/artifact-gallery.ts`
- `packages/learn/src/application/artifact-gallery-service.ts`

---

#### [COMP-018.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | mentorship-community.md, ADR-004 |
| **Dependencies** | COMP-018.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interface and PostgreSQL implementation for mentorship entities.

**Acceptance Criteria**:
- [ ] `MentorshipRepository` interface: `findById`, `findByMentor`, `findByMentee`, `countActiveByMentor`, `save`
- [ ] Migration: `mentorship_relationships`, `mentor_reviews` tables
- [ ] Index on `(mentor_id, status)` for capacity queries
- [ ] Integration tests: capacity limit enforcement at DB level

**Files Created/Modified**:
- `packages/learn/src/infrastructure/repositories/postgres-mentorship-repository.ts`
- `packages/learn/src/infrastructure/migrations/004_mentorship.sql`

---

#### [COMP-018.5] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | learn/ARCHITECTURE.md |
| **Dependencies** | COMP-018.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal API for mentorship lifecycle and gallery access.

**Acceptance Criteria**:
- [ ] `POST /internal/learn/mentorships` → proposes mentorship
- [ ] `POST /internal/learn/mentorships/{id}/accept` → mentor accepts
- [ ] `POST /internal/learn/mentorships/{id}/conclude` → concludes relationship
- [ ] `POST /internal/learn/mentorships/{id}/reviews` → submits review
- [ ] `GET /internal/learn/gallery?track_id={id}` → artifact gallery for track
- [ ] `GET /internal/learn/gallery?creator_id={id}` → creator's gallery

**Files Created/Modified**:
- `packages/learn/src/api/routes/mentorships.ts`
- `packages/learn/src/api/routes/gallery.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-015 Learn Content Hierarchy | Internal | ⬜ Not Started | Track references in mentorship |
| COMP-002 Identity | Internal | ⬜ Not Started | Mentor/mentee user identity |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Artifact data for gallery |
| COMP-010 Portfolio Aggregation | Internal | ⬜ Not Started | Creator portfolio in gallery |

---

## Implementation Log

### 2026-03-14 — S30 implementation complete

- **COMP-018.1**: MentorshipRelationship aggregate in `packages/learn/src/domain/mentorship/` (mentorship-relationship.ts, mentorship-relationship-status.ts, events.ts). MentorshipRelationshipId, MentorReviewId in @syntropy/types. Errors: InvalidMentorshipTransitionError, MentorCapacityExceededError, NotMentorError. Unit tests: 14.
- **COMP-018.2**: MentorReview entity (mentor-review.ts); reviewer must be mentor, relationship must be concluded; rating 1–5. Unit tests: 7.
- **COMP-018.3**: ArtifactGalleryItem, ArtifactGallery types; ArtifactQueryPort, PortfolioQueryPort; ArtifactGalleryService (getGallery, getForTrack, getForCreator) with enrichment. Unit tests: 4.
- **COMP-018.4**: Migration `supabase/migrations/20260318000000_learn_mentorship.sql` (mentorship_relationships, mentor_reviews, artifact_gallery). MentorshipRepositoryPort; PostgresMentorshipRepository. Integration test: mentorship-repository.integration.test.ts (skipped unless LEARN_INTEGRATION=true).
- **COMP-018.5**: MentorshipService (propose, accept, decline, conclude, submitReview). LearnContext extended with mentorshipService, artifactGalleryService. Routes in apps/api/src/routes/learn.ts: POST/GET mentorships, PUT accept, POST decline, POST conclude, POST reviews, GET users/:id/gallery. Integration test: apps/api/src/integration/mentorship-api.integration.test.ts.

**Files created**: packages/types (MentorshipRelationshipId, MentorReviewId); packages/learn domain/mentorship/*, application/mentorship-service.ts, artifact-gallery-service.ts, ports/artifact-gallery-ports.ts, infrastructure postgres-mentorship-repository; supabase migration; apps/api routes (in learn.ts), integration test.

## References

### Architecture Documents

- [Learn Mentorship & Community Subdomain](../../architecture/domains/learn/subdomains/mentorship-community.md)
