# Learn — Content Hierarchy & Navigation Implementation Record

> **Component ID**: COMP-015
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/content-hierarchy-navigation.md](../../architecture/domains/learn/subdomains/content-hierarchy-navigation.md)
> **Stage Assignment**: S6 — Learn Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Content Hierarchy & Navigation is the foundation of the Learn domain. It owns the `Career → Track → Course` hierarchy — the organizational structure that maps learning journeys to real DIP DigitalProjects. The `FogOfWarNavigationService` controls content visibility based on learner progress, revealing courses and fragments progressively. Includes **Learn package setup**. Invariant IL2: every Track must reference a valid DIP DigitalProject.

**Responsibilities**:
- Manage `Career`, `Track`, `Course` aggregates
- Validate DIP DigitalProject ID on Track creation via `TrackProjectLinkValidator` ACL
- Control content visibility via `FogOfWarNavigationService` (progress-gated navigation)
- Publish `learn.track.published`, `learn.course.completed` events

**Key Interfaces**:
- Internal API: `GET /internal/learn/tracks/{id}`, `GET /internal/learn/careers`, `GET /internal/learn/courses/{id}`
- Tool handler: `learn.get_track_context` (used by AI Agents COMP-014)

### Implementation Scope

**In Scope**:
- Learn package setup (workspace package scaffolding, shared Learn types)
- `Career`, `Track`, `Course` domain entities
- `FogOfWarNavigationService` domain service
- `TrackProjectLinkValidator` (ACL to DIP)
- Repository interfaces + PostgreSQL implementation
- Internal API endpoints

**Out of Scope**:
- Fragment content and publication (COMP-016)
- Creator tools and AI copilot (COMP-017)
- Mentorship (COMP-018)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 6 |
| **Total** | **6** |

**Component Coverage**: 0%

### Item List

#### [COMP-015.1] Learn package setup

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | learn/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/learn` workspace package with 4-layer internal structure and shared Learn types.

**Acceptance Criteria**:
- [ ] `packages/learn` fully scaffolded
- [ ] `LearnDomainError` exception class defined
- [ ] Learn-specific branded IDs: `TrackId`, `CourseId`, `FragmentId`, `CareerId` added to `packages/types`

**Files Created/Modified**:
- `packages/learn/src/domain/index.ts`
- `packages/types/src/ids.ts` (updated)

---

#### [COMP-015.2] Career, Track, Course aggregates

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | content-hierarchy-navigation.md |
| **Dependencies** | COMP-015.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Career`, `Track`, `Course` domain entities with their invariants.

**Acceptance Criteria**:
- [ ] `Career` entity: `id (CareerId)`, `name`, `domain_area`, `status`, `track_ids[]`; published only if ≥1 published Track
- [ ] `Track` entity: `id (TrackId)`, `career_id`, `name`, `dip_reference_project_id (ProjectId)`, `status (draft|published)`, `course_ids[]`; `dip_reference_project_id` immutable after creation (IL2)
- [ ] `Course` entity: `id (CourseId)`, `track_id`, `title`, `description`, `order_position`, `fragment_ids[]`, `status`
- [ ] `Track.publish()` validates: ≥1 Course, DIP project link is valid
- [ ] Unit tests: IL2 violation (dip_reference_project_id change), empty track publish

**Files Created/Modified**:
- `packages/learn/src/domain/content-hierarchy/career.ts`
- `packages/learn/src/domain/content-hierarchy/track.ts`
- `packages/learn/src/domain/content-hierarchy/course.ts`
- `packages/learn/tests/unit/content-hierarchy/track.test.ts`

---

#### [COMP-015.3] TrackProjectLinkValidator (ACL to DIP)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | content-hierarchy-navigation.md |
| **Dependencies** | COMP-015.2, COMP-006 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `TrackProjectLinkValidator` ACL that validates a DIP DigitalProject ID exists before allowing Track creation with that reference.

**Acceptance Criteria**:
- [ ] `TrackProjectLinkValidator.validate(projectId)` calls DIP internal API and returns `{ valid: boolean }`
- [ ] DIP project vocabulary does not leak into Learn domain
- [ ] On DIP unavailability: throws `ServiceUnavailableError` (circuit breaker per COMP-040)
- [ ] Integration test with mocked DIP API

**Files Created/Modified**:
- `packages/learn/src/infrastructure/track-project-link-validator.ts`

---

#### [COMP-015.4] FogOfWarNavigationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | content-hierarchy-navigation.md |
| **Dependencies** | COMP-015.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `FogOfWarNavigationService` that determines which Courses and Fragments are visible to a given learner based on their `LearnerProgressRecord`.

**Acceptance Criteria**:
- [ ] `FogOfWarNavigationService.getVisibleCourses(trackId, userId)` returns `Course[]` filtered by progress
- [ ] Visibility rule: first Course always visible; subsequent Courses unlock when previous ≥ 80% complete
- [ ] Returns metadata about locked courses (title visible, content locked)
- [ ] Efficient query: uses progress records from COMP-016 (via internal API)
- [ ] Unit tests: 100% complete unlocks next, 79% keeps locked

**Files Created/Modified**:
- `packages/learn/src/domain/content-hierarchy/services/fog-of-war-navigation-service.ts`
- `packages/learn/tests/unit/content-hierarchy/fog-of-war-navigation-service.test.ts`

---

#### [COMP-015.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | content-hierarchy-navigation.md, ADR-004 |
| **Dependencies** | COMP-015.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for careers, tracks, and courses. Create migration.

**Acceptance Criteria**:
- [ ] `CareerRepository`, `TrackRepository`, `CourseRepository` interfaces
- [ ] PostgreSQL implementations with proper joins
- [ ] Migration: `careers`, `tracks`, `courses` tables; `tracks.dip_reference_project_id` has immutability trigger
- [ ] Integration tests: track creation with DIP link

**Files Created/Modified**:
- `packages/learn/src/infrastructure/repositories/`
- `packages/learn/src/infrastructure/migrations/001_content_hierarchy.sql`

---

#### [COMP-015.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | learn/ARCHITECTURE.md |
| **Dependencies** | COMP-015.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for content hierarchy access consumed by AI Agents tool handlers and frontend.

**Acceptance Criteria**:
- [ ] `GET /internal/learn/careers` → career list with published track counts
- [ ] `GET /internal/learn/tracks/{id}` → track with course structure (FogOfWar applied for user)
- [ ] `GET /internal/learn/courses/{id}` → course with fragment list
- [ ] `POST /internal/learn/tracks` → creates new Track (validates DIP project link)
- [ ] `learn.track.published` event published on track publication

**Files Created/Modified**:
- `packages/learn/src/api/routes/careers.ts`
- `packages/learn/src/api/routes/tracks.ts`
- `packages/learn/src/api/routes/courses.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package shell |
| COMP-002 Identity | Internal | ⬜ Not Started | Author attribution |
| COMP-006 DIP Project Manifest DAG | Internal | ⬜ Not Started | DIP project validation |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event publishing |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-016 Learn Fragment Engine | Fragment belongs to Course | Blocks Fragment implementation |
| COMP-017 Learn Creator Tools | Creator workflow needs Track/Course | Blocks creator experience |
| COMP-018 Learn Mentorship | ArtifactGallery references Tracks | Blocks mentorship views |

---

## References

### Architecture Documents

- [Learn Content Hierarchy Subdomain](../../architecture/domains/learn/subdomains/content-hierarchy-navigation.md)
- [Learn Domain Architecture](../../architecture/domains/learn/ARCHITECTURE.md)
