# IDE Domain Implementation Record

> **Component ID**: COMP-030
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/ide/ARCHITECTURE.md](../../architecture/domains/ide/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

IDE Domain is a **Supporting Subdomain** managing IDE session lifecycle and container provisioning (ADR-007). It owns the domain logic: `IDESession` aggregate, `Container` aggregate, and `Workspace` snapshot. The `ResourceQuotaEnforcer` ensures containers respect memory/CPU limits. When a creator completes an artifact in the IDE, the `ArtifactPublishBridge` triggers DIP publication. This component focuses on **domain logic only** — the Monaco Editor integration and WebSocket gateway are in COMP-035 (platform service).

**Responsibilities**:
- Manage `IDESession` lifecycle: Provisioning → Active → Suspended → Terminated
- Manage `Container` lifecycle and resource allocation
- Enforce resource quotas via `ResourceQuotaEnforcer`
- Bridge artifact publication to DIP via `ArtifactPublishBridge`
- Manage `Workspace` snapshot (save/restore state)

**Key Interfaces**:
- Internal API: session creation, container management, workspace persistence
- Called by: Hub Collaboration Layer (COMP-019), AI Agents Pillar (COMP-014)

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

#### [COMP-030.1] Package setup and IDESession aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/ide` and implement `IDESession` aggregate.

**Acceptance Criteria**:
- [ ] `packages/ide` fully scaffolded
- [ ] `IDESession` aggregate: `id (SessionId)`, `user_id`, `project_id`, `context_type (contribution_sandbox|experiment|free_mode)`, `status (provisioning|active|suspended|terminated)`, `container_id`, `workspace_id`, `started_at`, `last_active_at`, `terminated_at`
- [ ] `IDESession.suspend()` transitions to Suspended
- [ ] `IDESession.terminate(reason)` transitions to Terminated
- [ ] Auto-suspension after 30 minutes of inactivity
- [ ] Events: `ide.session.started`, `ide.session.terminated`
- [ ] Unit tests: lifecycle transitions, inactivity timeout logic

**Files Created/Modified**:
- `packages/ide/src/domain/ide-session.ts`
- `packages/ide/tests/unit/ide-session.test.ts`

---

#### [COMP-030.2] Container aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-030.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Container` aggregate managing container lifecycle and resource allocation.

**Acceptance Criteria**:
- [ ] `Container` aggregate: `id`, `session_id`, `image`, `cpu_limit`, `memory_limit_mb`, `status (creating|running|stopped)`, `external_container_id`, `created_at`
- [ ] Resource defaults: 1 CPU, 512MB RAM (configurable per context_type)
- [ ] `ContainerProvisioningAdapter` (ACL) wraps Docker/Kubernetes API
- [ ] `Container.stop()` terminates the container process

**Files Created/Modified**:
- `packages/ide/src/domain/container.ts`
- `packages/ide/src/infrastructure/container-provisioning-adapter.ts`

---

#### [COMP-030.3] ResourceQuotaEnforcer domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-030.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ResourceQuotaEnforcer` that validates resource requests against user/institution quotas.

**Acceptance Criteria**:
- [ ] `ResourceQuotaEnforcer.validate(userId, requestedCpu, requestedMemory)` checks active sessions count and total resource usage
- [ ] Per-user limits: max 2 concurrent sessions, max 2 CPU total, max 2GB RAM total
- [ ] Institution-level override: InstitutionAdmin can grant higher limits
- [ ] Throws `QuotaExceededError` with current usage info when exceeded
- [ ] Unit tests: quota boundary conditions

**Files Created/Modified**:
- `packages/ide/src/domain/services/resource-quota-enforcer.ts`
- `packages/ide/tests/unit/resource-quota-enforcer.test.ts`

---

#### [COMP-030.4] Workspace entity and snapshot management

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-030.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Workspace` entity managing workspace snapshots for session persistence.

**Acceptance Criteria**:
- [ ] `Workspace` entity: `id`, `user_id`, `project_id`, `snapshot_url`, `file_manifest (JSONB)`, `last_saved_at`
- [ ] `WorkspaceSnapshotService.save(sessionId)` persists current workspace state to object storage
- [ ] `WorkspaceSnapshotService.restore(workspaceId, sessionId)` restores previous state
- [ ] Snapshot stored in S3-compatible storage

**Files Created/Modified**:
- `packages/ide/src/domain/workspace.ts`
- `packages/ide/src/application/workspace-snapshot-service.ts`

---

#### [COMP-030.5] ArtifactPublishBridge

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-030.1, COMP-003 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArtifactPublishBridge` that bridges IDE artifact publication to DIP, triggered by creator action within the IDE.

**Acceptance Criteria**:
- [ ] `ArtifactPublishBridge.publish(sessionId, fileContent, metadata)` validates session active, calls DIP adapter, returns `ArtifactId`
- [ ] `DIPArtifactBridgeAdapter` (ACL) wraps DIP internal API
- [ ] Published artifact ID stored in Workspace metadata
- [ ] `ide.artifact.published` event emitted

**Files Created/Modified**:
- `packages/ide/src/domain/services/artifact-publish-bridge.ts`
- `packages/ide/src/infrastructure/dip-artifact-bridge-adapter.ts`

---

#### [COMP-030.6] Session provisioning use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-030.3, COMP-030.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ProvisionIDESessionUseCase` orchestrating quota check, container provisioning, workspace restore, and session activation.

**Acceptance Criteria**:
- [ ] `ProvisionIDESessionUseCase.execute(userId, projectId, contextType)` → validates quota → provisions container → restores/creates workspace → returns session
- [ ] Total provisioning time < 30s (ADR-007)
- [ ] If container provisioning fails: session transitions to Terminated with reason
- [ ] Integration test: full provision flow with mocked container orchestrator

**Files Created/Modified**:
- `packages/ide/src/application/provision-ide-session-use-case.ts`

---

#### [COMP-030.7] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-030.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for IDE domain entities.

**Acceptance Criteria**:
- [ ] `IDESessionRepository`, `ContainerRepository`, `WorkspaceRepository` interfaces and implementations
- [ ] Migration: `ide_sessions`, `containers`, `workspaces` tables
- [ ] Integration tests

**Files Created/Modified**:
- `packages/ide/src/infrastructure/repositories/`
- `packages/ide/src/infrastructure/migrations/001_ide_domain.sql`

---

#### [COMP-030.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ide/ARCHITECTURE.md |
| **Dependencies** | COMP-030.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for IDE session and workspace management.

**Acceptance Criteria**:
- [ ] `POST /internal/ide/sessions` → provision session
- [ ] `GET /internal/ide/sessions/{id}` → session state
- [ ] `DELETE /internal/ide/sessions/{id}` → terminate session
- [ ] `POST /internal/ide/sessions/{id}/suspend` → suspend session
- [ ] `POST /internal/ide/sessions/{id}/artifacts/publish` → publish artifact via bridge
- [ ] `GET /internal/ide/sessions/{id}/workspace` → workspace context (for AI agents)

**Files Created/Modified**:
- `packages/ide/src/api/routes/sessions.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-002 Identity | Internal | ⬜ Not Started | Session authentication |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Artifact publication bridge |
| Docker/Kubernetes | External | ✅ Available | Container orchestration |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-035 Embedded IDE Platform | IDE domain logic → platform integration | Blocks Monaco/WebSocket integration |
| COMP-019 Hub Collaboration Layer | Sandbox provisioning | Blocks ContributionSandbox |

---

## References

### Architecture Documents

- [IDE Domain Architecture](../../architecture/domains/ide/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-007](../../architecture/decisions/ADR-007-ide-platform.md) | Embedded IDE Platform | Container selection and provisioning strategy |
