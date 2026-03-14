# Learn — Fragment & Artifact Engine Implementation Record

> **Component ID**: COMP-016
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/fragment-artifact-engine.md](../../architecture/domains/learn/subdomains/fragment-artifact-engine.md)
> **Stage Assignment**: S6 — Learn Domain
> **Status**: 🔵 In Progress (S27 complete: COMP-016.1–016.5)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Fragment & Artifact Engine is the heart of the Learn Core Domain. It owns the `Fragment` aggregate — the minimum learning unit with three required sections (Problem, Theory, Artifact) enforced by Invariant IL1. When a Fragment's Artifact section is complete and published, it triggers DIP Artifact publication via ACL. The `LearnerProgressRecord` tracks each learner's journey through fragments, courses, and tracks.

**Responsibilities**:
- Manage `Fragment` lifecycle: Draft → InReview → Published
- Enforce IL1: Fragment requires Problem + Theory + Artifact sections
- Publish Artifact to DIP via `DIPPublicationAdapter` (ACL) on fragment publication
- Track learner progress via `LearnerProgressRecord` and `ProgressTrackingService`
- Manage `CollectibleDefinition` templates (instances awarded by Platform Core)
- Publish `learn.fragment.artifact_published`, `learn.track.completed` events

**Key Interfaces**:
- Internal API: Fragment CRUD, progress tracking
- ACL: `DIPPublicationAdapter` wrapping DIP Artifact Registry API

### Implementation Scope

**In Scope**:
- `Fragment` aggregate, `FragmentSection` (Problem/Theory/Artifact), `CollectibleDefinition`, `LearnerProgressRecord` entities
- `FragmentPublicationService` domain service (validates completeness, calls DIP)
- `ProgressTrackingService` domain service
- `CollectibleAwardEvaluator` domain service
- `DIPPublicationAdapter` (ACL)
- Repository interfaces + PostgreSQL implementation
- Internal API

**Out of Scope**:
- Course/Track/Career hierarchy (COMP-015)
- Creator tools and AI copilot workflow (COMP-017)
- CollectibleInstance (owned by Platform Core, COMP-010)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 5 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 3 |
| **Total** | **8** |

**Component Coverage**: 62% (S27 items COMP-016.1–016.5 done)

### Item List

#### [COMP-016.1] Fragment aggregate (IL1 invariant)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done (2026-03-14) |
| **Priority** | Critical |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-015.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Fragment` aggregate with `FragmentSection` entities and IL1 invariant enforcement.

**Acceptance Criteria**:
- [ ] `Fragment` aggregate: `id (FragmentId)`, `course_id`, `creator_id`, `title`, `status (draft|in_review|published)`, `sections (FragmentSection[])`, `published_artifact_id (ArtifactId?)` — immutable after publication (IL3)
- [ ] `FragmentSection` entity: `section_type (problem|theory|artifact)`, `content (JSONB)`, `is_complete`
- [ ] IL1: `Fragment.publish()` throws `FragmentInvariantError` if any section is incomplete
- [ ] IL3: `published_artifact_id` set exactly once on publication
- [ ] `Fragment.markSectionComplete(sectionType)` updates section status
- [ ] Unit tests: IL1 (missing section throws), IL3 (double-publish throws)

**Files Created/Modified**: `fragment.ts`, `fragment-section.ts`, `fragment-status.ts`, `errors.ts` (IL1ViolationError), `fragment.test.ts`.

---

#### [COMP-016.2] Artifact content types (Video, Text, Code, Quiz)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done (2026-03-14) |
| **Priority** | Critical |
| **Origin** | IMPLEMENTATION-PLAN Section 7 |

**Files Created/Modified**: `artifact-content-types.ts`, `artifact-content-types.test.ts`.

---

#### [COMP-016.3] LearnerProgressRecord entity and ProgressTrackingService

| Field | Value |
|-------|-------|
| **Status** | ✅ Done (2026-03-14) |
| **Priority** | Critical |

**Files Created/Modified**: `learner-progress-record.ts`, `services/progress-tracking-service.ts`, ports `ProgressEventsPort`, `LearnerProgressRepositoryPort`, `CourseHierarchyPort`; unit tests.

---

#### [COMP-016.4] DIP artifact publication bridge (LearnArtifactBridge)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done (2026-03-14) |

**Files Created/Modified**: `ports/artifact-publisher-port.ts`, `infrastructure/learn-artifact-bridge.ts` (implements port, uses `DipArtifactClientPort` for DIP); unit test with mock.

---

#### [COMP-016.5] FragmentRepository (Postgres) + migrations

| Field | Value |
|-------|-------|
| **Status** | ✅ Done (2026-03-14) |

**Files Created/Modified**: `ports/fragment-repository-port.ts`, `supabase/migrations/20260315110000_learn_fragment_artifact.sql`, `postgres-fragment-repository.ts`, `postgres-learner-progress-repository.ts`, `fragment-repository.integration.test.ts`.

---

#### [COMP-016.6] Fragment review workflow

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | IMPLEMENTATION-PLAN Section 7, S28 |
| **Dependencies** | COMP-016.5 |

**Description**: `FragmentReviewService.submit(fragmentId)` moves to `in_review`; `approve(fragmentId)` by reviewer; `reject(fragmentId)` with reason; state machine transitions; unit tests.

---

#### [COMP-016.7] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | fragment-artifact-engine.md, ADR-004 |
| **Dependencies** | COMP-016.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for fragments, progress records, and collectible definitions.

**Acceptance Criteria**:
- [ ] `FragmentRepository`, `ProgressRepository`, `CollectibleDefinitionRepository` interfaces
- [ ] Migration: `fragments`, `fragment_sections`, `learner_progress_records`, `collectible_definitions` tables
- [ ] `fragments.published_artifact_id` has immutability trigger (can only be set once)
- [ ] Progress records use UPSERT on `(user_id, entity_id, entity_type)`
- [ ] Integration tests

**Files Created/Modified**:
- `packages/learn/src/infrastructure/repositories/`
- `packages/learn/src/infrastructure/migrations/002_fragment_artifact.sql`

---

#### [COMP-016.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | learn/ARCHITECTURE.md |
| **Dependencies** | COMP-016.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for fragment management and progress tracking.

**Acceptance Criteria**:
- [ ] `GET /internal/learn/fragments/{id}` → fragment with sections
- [ ] `POST /internal/learn/fragments` → create draft fragment
- [ ] `PATCH /internal/learn/fragments/{id}/sections/{type}` → update section content
- [ ] `POST /internal/learn/fragments/{id}/publish` → publish fragment
- [ ] `GET /internal/learn/progress/{user_id}/tracks/{track_id}` → progress summary
- [ ] AI agent tool: `learn.get_fragment_context`, `learn.save_fragment_draft` return handlers registered

**Files Created/Modified**:
- `packages/learn/src/api/routes/fragments.ts`
- `packages/learn/src/api/routes/progress.ts`

---

## Implementation Log

### 2026-03-14 — S27 complete (COMP-016.1–016.5)

- **Fragment aggregate**: `Fragment`, `FragmentSection`, `FragmentStatus`; IL1 enforced in `publish()` (all three sections non-empty); IL3 in `setPublishedArtifactId()` (immutable once set). `IL1ViolationError` in domain errors.
- **Artifact content types**: `VideoArtifact`, `TextArtifact`, `CodeArtifact`, `QuizArtifact` value objects with `validate()` per type.
- **LearnerProgressRecord + ProgressTrackingService**: Entity and service with ports `ProgressEventsPort`, `LearnerProgressRepositoryPort`, `CourseHierarchyPort`; cascade fragment → course → track completion and event emission.
- **LearnArtifactBridge**: Implements `ArtifactPublisherPort`; uses `DipArtifactClientPort` (injectable, no @syntropy/dip in learn). Serializes fragment to JSON content; returns published artifact id.
- **Repositories + migration**: `learn.fragments` (id, course_id, creator_id, title, status, problem_content, theory_content, artifact_content, published_artifact_id), `learn.learner_progress_records` (user_id, entity_id, entity_type, status, started_at, completed_at, score). `PostgresFragmentRepository`, `PostgresLearnerProgressRepository`. Integration test in `fragment-repository.integration.test.ts` (run with LEARN_INTEGRATION=true).

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-015 Learn Content Hierarchy | Internal | ⬜ Not Started | Fragment belongs to Course |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | DIP publication via ACL |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event publishing |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-017 Learn Creator Tools | Creator workflow publishes fragments | Blocks creator experience |
| COMP-014 AI Agents Pillar | Fragment Author tool calls fragment API | Blocks AI-assisted authoring |

---

## References

### Architecture Documents

- [Learn Fragment & Artifact Engine Subdomain](../../architecture/domains/learn/subdomains/fragment-artifact-engine.md)
