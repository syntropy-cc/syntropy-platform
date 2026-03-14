# Hub — Collaboration Layer Implementation Record

> **Component ID**: COMP-019
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/hub/subdomains/collaboration-layer.md](../../architecture/domains/hub/subdomains/collaboration-layer.md)
> **Stage Assignment**: S8 — Hub Domain
> **Status**: 🔵 In Progress (S32: 019.7 done)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

The Collaboration Layer is the Core subdomain of Hub. It owns `Issue`, `Contribution`, and `ContributionSandbox` aggregates — the primary building blocks of open-source collaboration on the platform. A `Contribution` accepted and integrated triggers DIP Artifact publication (via ACL). A `ContributionSandbox` provisions isolated environments for challenge-based contributions (ADR-011). Includes **Hub package setup**.

**Responsibilities**:
- Manage `Issue` lifecycle: Open → InProgress → InReview → Closed
- Manage `Contribution` lifecycle: Submitted → InReview → Accepted/Rejected → Integrated
- Manage `ContributionSandbox` lifecycle: provision container, create challenge Issues, aggregate contributions
- Call DIP ACL adapter on Contribution integration to publish artifact
- Publish `hub.issue.created`, `hub.issue.closed`, `hub.contribution.submitted`, `hub.contribution.integrated`, `hub.hackin.started`, `hub.hackin.completed`

**Key Interfaces**:
- Internal API: Issue and Contribution CRUD, sandbox lifecycle
- ACL: `DIPContributionAdapter` wrapping DIP Artifact Registry

### Implementation Scope

**In Scope**:
- Hub package setup (workspace package scaffolding)
- `Issue`, `Contribution`, `ContributionSandbox` aggregates
- `ContributionIssueLink` association entity
- `ContributionIntegrationService` and `ContributionSandboxOrchestrator` domain services
- `DIPContributionAdapter` (ACL)
- Repository + API

**Out of Scope**:
- Institution Orchestration (COMP-020)
- Public Square read model (COMP-021)
- Container provisioning details (delegated to IDE domain COMP-030)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 6 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 2 |
| **Total** | **8** |

**Component Coverage**: 75% (S32: 019.7 done)

### Item List

#### [COMP-019.1] Hub package setup and Issue aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | hub/ARCHITECTURE.md, collaboration-layer.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/hub` workspace package and implement `Issue` aggregate.

**Acceptance Criteria**:
- [ ] `packages/hub` fully scaffolded with 4-layer structure
- [ ] `Issue` aggregate: `id (IssueId)`, `project_id`, `institution_id`, `title`, `description`, `acceptance_criteria`, `status (open|in_progress|in_review|closed)`, `assignee_ids[]`, `labels[]`, `created_by`
- [ ] `Issue.assign(userId)` validates user has permission
- [ ] `Issue.close(resolution)` sets closed status
- [ ] `hub.issue.created`, `hub.issue.closed` events published
- [ ] Unit tests: lifecycle transitions, assignment validation

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/issue.ts`
- `packages/hub/tests/unit/collaboration/issue.test.ts`

---

#### [COMP-019.2] Contribution aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | collaboration-layer.md, ADR-011 |
| **Dependencies** | COMP-019.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Contribution` aggregate with full lifecycle and reviewer assignment.

**Acceptance Criteria**:
- [ ] `Contribution` aggregate: `id (ContributionId)`, `project_id`, `contributor_id`, `title`, `description`, `content (JSONB)`, `status (submitted|in_review|accepted|rejected|integrated)`, `reviewer_ids[]`, `linked_issue_ids[]`, `dip_artifact_id (nullable)`
- [ ] `Contribution.accept(reviewerId)` transitions to Accepted
- [ ] `Contribution.reject(reviewerId, reason)` transitions to Rejected
- [ ] `Contribution.integrate(dipArtifactId)` transitions to Integrated, sets `dip_artifact_id`
- [ ] Events: `hub.contribution.submitted`, `hub.contribution.integrated`
- [ ] Unit tests: all lifecycle transitions

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/contribution.ts`
- `packages/hub/tests/unit/collaboration/contribution.test.ts`

---

#### [COMP-019.3] ContributionSandbox aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | collaboration-layer.md, ADR-011 |
| **Dependencies** | COMP-019.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `ContributionSandbox` aggregate — isolated challenge environment with IDE session, challenge Issues, and contribution aggregation.

**Acceptance Criteria**:
- [ ] `ContributionSandbox` aggregate: `id`, `project_id`, `title`, `challenge_description`, `status (setting_up|active|completed)`, `ide_session_id (nullable)`, `challenge_issue_ids[]`, `participant_contribution_ids[]`, `started_at`, `completed_at`
- [ ] `ContributionSandbox.activate(ideSessionId)` transitions to active
- [ ] `ContributionSandbox.complete()` aggregates all contributions, publishes `hub.hackin.completed`
- [ ] Challenge issues created automatically on activation
- [ ] Events: `hub.hackin.started`, `hub.hackin.completed`
- [ ] Unit tests: lifecycle, issue creation

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/contribution-sandbox.ts`
- `packages/hub/tests/unit/collaboration/contribution-sandbox.test.ts`

---

#### [COMP-019.4] DIPContributionAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | collaboration-layer.md |
| **Dependencies** | COMP-019.2, COMP-003 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DIPContributionAdapter` — ACL wrapping DIP Artifact Registry for contribution integration. Translates Contribution integration request into DIP artifact publication.

**Acceptance Criteria**:
- [ ] `DIPContributionAdapter` implements `ArtifactPublisher` interface
- [ ] `publishContribution(contributionId, actorId, content)` → calls DIP API, returns `ArtifactId`
- [ ] DIP vocabulary does not leak into Hub domain
- [ ] Integration test with mocked DIP API

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/artifact-publisher.ts` (interface)
- `packages/hub/src/infrastructure/dip-contribution-adapter.ts`

---

#### [COMP-019.5] ContributionIntegrationService

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | collaboration-layer.md |
| **Dependencies** | COMP-019.4, COMP-019.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ContributionIntegrationService` orchestrating: accept Contribution, call DIP adapter, close linked Issues, set `dip_artifact_id`, publish event.

**Acceptance Criteria**:
- [ ] `ContributionIntegrationService.integrate(contributionId, reviewerId)` runs full integration flow
- [ ] All linked Issues closed with resolution reference
- [ ] `hub.contribution.integrated` event: `contribution_id`, `dip_artifact_id`, `contributor_id`, `closed_issue_ids[]`
- [ ] Atomic: if DIP fails, contribution stays Accepted (not Integrated); retried via DLQ

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/services/contribution-integration-service.ts`
- `packages/hub/tests/unit/collaboration/contribution-integration-service.test.ts`

---

#### [COMP-019.6] ContributionSandboxOrchestrator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | collaboration-layer.md |
| **Dependencies** | COMP-019.3, COMP-030 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ContributionSandboxOrchestrator` that manages sandbox lifecycle: provisioning IDE container, creating challenge Issues, and completing sandbox.

**Acceptance Criteria**:
- [ ] `ContributionSandboxOrchestrator.activate(sandboxId)` calls IDE Domain API to provision container, creates challenge Issues
- [ ] `ContributionSandboxOrchestrator.complete(sandboxId)` calls `Contribution.integrate` for all accepted contributions
- [ ] `IDESessionAdapter` (ACL) wraps IDE Domain session creation API

**Files Created/Modified**:
- `packages/hub/src/domain/collaboration/services/contribution-sandbox-orchestrator.ts`
- `packages/hub/src/infrastructure/ide-session-adapter.ts`

---

#### [COMP-019.7] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | collaboration-layer.md, ADR-004 |
| **Dependencies** | COMP-019.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for Hub collaboration entities.

**Acceptance Criteria**:
- [x] `IssueRepository`, `ContributionRepository`, `ContributionSandboxRepository` interfaces (ports); Postgres implementations
- [x] Migration: `hub.issues`, `hub.contributions`, `hub.contribution_issue_links`, `hub.contribution_sandboxes` tables
- [x] `contributions.dip_artifact_id` has immutability trigger (set once on integration)
- [x] Integration tests (HUB_INTEGRATION=true, Testcontainers)

**Files Created/Modified**:
- `supabase/migrations/20260319000000_hub_collaboration.sql`
- `packages/hub/src/domain/collaboration/ports/contribution-sandbox-repository-port.ts`
- `packages/hub/src/infrastructure/hub-collaboration-db-client.ts`
- `packages/hub/src/infrastructure/repositories/postgres-issue-repository.ts`
- `packages/hub/src/infrastructure/repositories/postgres-contribution-repository.ts`
- `packages/hub/src/infrastructure/repositories/postgres-contribution-sandbox-repository.ts`
- `packages/hub/tests/integration/collaboration-repositories.integration.test.ts`

---

#### [COMP-019.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | hub/ARCHITECTURE.md |
| **Dependencies** | COMP-019.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for Hub collaboration operations.

**Acceptance Criteria**:
- [ ] `POST /internal/hub/issues`, `GET /internal/hub/issues/{id}`, `PATCH /internal/hub/issues/{id}/status` → Issue CRUD
- [ ] `POST /internal/hub/contributions`, `GET /internal/hub/contributions/{id}` → Contribution CRUD
- [ ] `POST /internal/hub/contributions/{id}/review` (accept/reject) → review decision
- [ ] `POST /internal/hub/contributions/{id}/integrate` → triggers integration
- [ ] `POST /internal/hub/sandboxes` → creates sandbox
- [ ] `POST /internal/hub/sandboxes/{id}/activate`, `/complete` → sandbox lifecycle

**Files Created/Modified**:
- `packages/hub/src/api/routes/issues.ts`
- `packages/hub/src/api/routes/contributions.ts`
- `packages/hub/src/api/routes/sandboxes.ts`

---

## Implementation Log

### 2026-03-14 — S32 Hub Collaboration Persistence (COMP-019.7)

- **Migrations**: `supabase/migrations/20260319000000_hub_collaboration.sql` — schema `hub`; tables `issues`, `contributions`, `contribution_issue_links`, `contribution_sandboxes`; trigger for `dip_artifact_id` immutability.
- **Port**: `ContributionSandboxRepositoryPort` (getById, save).
- **Infrastructure**: `HubCollaborationDbClient` interface; `PostgresIssueRepository`, `PostgresContributionRepository`, `PostgresContributionSandboxRepository`; link table for contribution–issue many-to-many.
- **Tests**: Integration tests in `tests/integration/collaboration-repositories.integration.test.ts` (run with `HUB_INTEGRATION=true`, Testcontainers).

### 2026-03-14 — S31 Hub Collaboration Core (COMP-019.1–019.5)

- **Package**: `packages/hub` — vitest, 4-layer layout (domain, application, infrastructure, tests).
- **Domain**: `Issue` (issueId, projectId, title, type, status; open/assign/close); `Contribution` (submit, assignReviewer, requestRevision, accept, reject, merge); `ContributionSandbox` (create, activate, complete; SandboxConfig, StubContainerOrchestrator); value objects `IssueId`, `ContributionId`; status enums and events.
- **Ports**: `ArtifactPublisherPort`, `ContributionRepositoryPort`, `IssueRepositoryPort`, `ContainerOrchestratorPort`.
- **Infrastructure**: `DIPContributionAdapter` implementing `ArtifactPublisherPort`; uses `DipArtifactPublishClient` (no @syntropy/dip dependency in hub; app wires DIP).
- **Application**: `ContributionIntegrationService.merge(contributionId)` — publish artifact, merge contribution, close linked issues; returns `MergeResult` (events for caller to publish).
- **Tests**: 36 unit tests (issue, contribution, contribution-sandbox, dip-contribution-adapter, contribution-integration-service).

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Hub package shell |
| COMP-002 Identity | Internal | ⬜ Not Started | User attribution |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Contribution artifact publication |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event publishing |
| COMP-030 IDE Domain | Internal | ⬜ Not Started | Container for sandbox |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-020 Hub Institution Orchestration | Institutions manage Hub projects | Delays governance UI |
| COMP-021 Hub Public Square | DiscoveryIndex reads Hub events | Delays discovery |

---

## References

### Architecture Documents

- [Hub Collaboration Layer Subdomain](../../architecture/domains/hub/subdomains/collaboration-layer.md)
- [Hub Domain Architecture](../../architecture/domains/hub/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-011](../../architecture/decisions/ADR-011-contribution-sandbox-rename-and-definition.md) | ContributionSandbox Definition | Defines ContributionSandbox semantics |
