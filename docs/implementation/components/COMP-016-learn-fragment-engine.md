# Learn — Fragment & Artifact Engine Implementation Record

> **Component ID**: COMP-016
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/fragment-artifact-engine.md](../../architecture/domains/learn/subdomains/fragment-artifact-engine.md)
> **Stage Assignment**: S6 — Learn Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

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
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 8 |
| **Total** | **8** |

**Component Coverage**: 0%

### Item List

#### [COMP-016.1] Fragment aggregate and FragmentSection entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
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

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/fragment.ts`
- `packages/learn/src/domain/fragment-artifact/fragment-section.ts`
- `packages/learn/tests/unit/fragment-artifact/fragment.test.ts`

---

#### [COMP-016.2] CollectibleDefinition entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-016.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `CollectibleDefinition` entity — the template for collectible rewards. Instances (awarded to users) are owned by Platform Core (COMP-010).

**Acceptance Criteria**:
- [ ] `CollectibleDefinition` entity: `id`, `name`, `description`, `image_url`, `award_conditions (JSONB)`, `is_published`, `published_at`
- [ ] Invariant (IL4): `award_conditions` immutable after publication
- [ ] `learn.collectible_definition.published` event published when definition goes live
- [ ] Unit tests: conditions immutability after publication

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/collectible-definition.ts`
- `packages/learn/tests/unit/fragment-artifact/collectible-definition.test.ts`

---

#### [COMP-016.3] LearnerProgressRecord entity and ProgressTrackingService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-016.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `LearnerProgressRecord` entity and `ProgressTrackingService` that tracks fragment, course, and track completion.

**Acceptance Criteria**:
- [ ] `LearnerProgressRecord` entity: `user_id`, `entity_id` (fragment/course/track), `entity_type`, `status (not_started|in_progress|completed)`, `started_at`, `completed_at`
- [ ] `ProgressTrackingService.markFragmentStarted(userId, fragmentId)` creates/updates record
- [ ] `ProgressTrackingService.markFragmentCompleted(userId, fragmentId)` marks complete; checks if course complete
- [ ] Course completion: all fragments completed → marks course complete; checks if track complete
- [ ] Track completion: all courses complete → publishes `learn.track.completed`
- [ ] Unit tests: cascade completion (fragment → course → track)

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/learner-progress-record.ts`
- `packages/learn/src/domain/fragment-artifact/services/progress-tracking-service.ts`
- `packages/learn/tests/unit/fragment-artifact/progress-tracking-service.test.ts`

---

#### [COMP-016.4] DIPPublicationAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-016.1, COMP-003 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DIPPublicationAdapter` — ACL wrapping the DIP Artifact Registry internal API. Translates Fragment publication request into DIP artifact creation call.

**Acceptance Criteria**:
- [ ] `DIPPublicationAdapter` implements `ArtifactPublisher` interface (defined in Learn domain)
- [ ] `publish(fragmentId, authorActorId, content)` → calls DIP internal API, returns `ArtifactId`
- [ ] DIP vocabulary does not appear in Learn domain types
- [ ] Error handling: DIP unavailable → `ServiceUnavailableError` (fragment stays in InReview)
- [ ] Integration test with mocked DIP API

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/artifact-publisher.ts` (interface)
- `packages/learn/src/infrastructure/dip-publication-adapter.ts`
- `packages/learn/tests/integration/dip-publication-adapter.test.ts`

---

#### [COMP-016.5] FragmentPublicationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-016.4, COMP-016.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `FragmentPublicationService` that orchestrates fragment review and publication: validates IL1, calls DIP adapter, sets `published_artifact_id`, publishes `learn.fragment.artifact_published` event.

**Acceptance Criteria**:
- [ ] `FragmentPublicationService.publish(fragmentId, creatorActorId)` validates sections, calls DIP, sets artifact ID, publishes event
- [ ] `learn.fragment.artifact_published` event: `fragment_id`, `artifact_id`, `creator_actor_id`, `track_id`, `correlation_id`
- [ ] On DIP failure: Fragment remains InReview, error logged and retried (DLQ)
- [ ] Unit tests: IL1 validation, success path, DIP failure handling

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/services/fragment-publication-service.ts`
- `packages/learn/tests/unit/fragment-artifact/fragment-publication-service.test.ts`

---

#### [COMP-016.6] CollectibleAwardEvaluator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | fragment-artifact-engine.md |
| **Dependencies** | COMP-016.3, COMP-016.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `CollectibleAwardEvaluator` that checks `award_conditions` of published `CollectibleDefinition`s after portfolio events and signals Platform Core to award collectibles.

**Acceptance Criteria**:
- [ ] `CollectibleAwardEvaluator.evaluate(userId, event)` checks all active CollectibleDefinitions
- [ ] Signals Platform Core via event when condition met: `learn.collectible.award_signal`
- [ ] Platform Core consumes signal and creates `CollectibleInstance`
- [ ] Unit tests: condition evaluation for each type

**Files Created/Modified**:
- `packages/learn/src/domain/fragment-artifact/services/collectible-award-evaluator.ts`

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
