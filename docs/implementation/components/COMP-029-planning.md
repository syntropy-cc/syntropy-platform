# Planning Implementation Record

> **Component ID**: COMP-029
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/planning/ARCHITECTURE.md](../../architecture/domains/planning/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Planning is a **Supporting Subdomain** providing task management, goal tracking, study planning, and sprint management for individual users and teams within institutions. It integrates with the Learn (track progress), Hub (issue assignment), and Labs (experiment timelines) domains as a cross-pillar coordination layer. `MentorSession` scheduling coordinates with the Learn Mentorship subdomain.

**Responsibilities**:
- Manage `Task` (assignable, trackable) and `Goal` (outcome-focused) entities
- Manage `Sprint` for time-bounded work cycles (institution-level)
- Manage `StudyPlan` (user's personal learning roadmap)
- Manage `MentorSession` scheduling
- Publish `planning.sprint.started`, `planning.goal.achieved` events

**Key Interfaces**:
- Internal API: task, goal, sprint, study plan, mentor session management

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

#### [COMP-029.1] Package setup and Task, Goal entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | planning/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/planning` and implement `Task` and `Goal` entities.

**Acceptance Criteria**:
- [ ] `packages/planning` fully scaffolded
- [ ] `Task` entity: `id`, `owner_id`, `title`, `description`, `anchor_type` (nullable, e.g., hub.issue), `anchor_id`, `status (todo|in_progress|done)`, `due_date`, `sprint_id (nullable)`, `created_at`
- [ ] `Goal` entity: `id`, `user_id`, `title`, `target_metric`, `target_value`, `current_value`, `status (active|achieved|abandoned)`, `deadline`
- [ ] `Goal.checkAchievement(currentValue)` transitions to Achieved if target met
- [ ] Events: `planning.goal.achieved`
- [ ] Unit tests: goal achievement trigger

**Files Created/Modified**:
- `packages/planning/src/domain/task.ts`
- `packages/planning/src/domain/goal.ts`

---

#### [COMP-029.2] Sprint and StudyPlan aggregates

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | planning/ARCHITECTURE.md |
| **Dependencies** | COMP-029.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Sprint` aggregate (institution-level) and `StudyPlan` aggregate (personal learning roadmap).

**Acceptance Criteria**:
- [ ] `Sprint` aggregate: `id`, `institution_id`, `name`, `start_date`, `end_date`, `task_ids[]`, `status (planning|active|completed)`, `velocity`
- [ ] `Sprint.start()` transitions to active, publishes `planning.sprint.started`
- [ ] `StudyPlan` aggregate: `id`, `user_id`, `track_ids[]`, `weekly_hours_target`, `milestones[]`, `start_date`, `estimated_completion_date`
- [ ] `StudyPlan.updateProgress(completedFragments)` recalculates estimated completion date

**Files Created/Modified**:
- `packages/planning/src/domain/sprint.ts`
- `packages/planning/src/domain/study-plan.ts`

---

#### [COMP-029.3] MentorSession entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | planning/ARCHITECTURE.md |
| **Dependencies** | COMP-029.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `MentorSession` entity for scheduling mentor-mentee meetings.

**Acceptance Criteria**:
- [ ] `MentorSession` entity: `id`, `mentorship_relationship_id`, `mentor_id`, `mentee_id`, `scheduled_at`, `duration_minutes`, `status (scheduled|completed|cancelled)`, `notes`, `meeting_url`
- [ ] Calendar integration: generates `meeting_url` via configured provider (Google Meet, Jitsi)
- [ ] `communication.notification` sent to both parties on scheduling

**Files Created/Modified**:
- `packages/planning/src/domain/mentor-session.ts`

---

#### [COMP-029.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | planning/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-029.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for planning entities.

**Acceptance Criteria**:
- [ ] Repositories for Task, Goal, Sprint, StudyPlan, MentorSession
- [ ] Migration: corresponding tables with proper indexes

**Files Created/Modified**:
- `packages/planning/src/infrastructure/repositories/`
- `packages/planning/src/infrastructure/migrations/001_planning.sql`

---

#### [COMP-029.5] Goal achievement consumer

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | planning/ARCHITECTURE.md |
| **Dependencies** | COMP-029.2, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Kafka consumer that checks goals against platform events and triggers achievement evaluation.

**Acceptance Criteria**:
- [ ] Consumer group: `planning-goal-tracker`
- [ ] `learn.track.completed` → check StudyPlan milestones
- [ ] `hub.contribution.integrated` → check contribution-count goals
- [ ] `platform_core.portfolio.updated` → check XP goals
- [ ] Calls `Goal.checkAchievement(currentValue)` on relevant events

**Files Created/Modified**:
- `packages/planning/src/infrastructure/consumers/goal-achievement-consumer.ts`

---

#### [COMP-029.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | planning/ARCHITECTURE.md |
| **Dependencies** | COMP-029.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: REST API for planning operations.

**Acceptance Criteria**:
- [ ] Task CRUD: `POST/GET/PATCH/DELETE /internal/planning/tasks`
- [ ] Goal CRUD: `POST/GET/PATCH /internal/planning/goals`
- [ ] Sprint CRUD: `POST/GET/PATCH /internal/planning/sprints`
- [ ] Study plan: `GET/PATCH /internal/planning/study-plans/{user_id}`
- [ ] Mentor sessions: `POST/GET/PATCH /internal/planning/mentor-sessions`

**Files Created/Modified**:
- `packages/planning/src/api/routes/`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-002 Identity | Internal | ⬜ Not Started | User identity |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Progress event consumers |

---

## References

### Architecture Documents

- [Planning Domain Architecture](../../architecture/domains/planning/ARCHITECTURE.md)
