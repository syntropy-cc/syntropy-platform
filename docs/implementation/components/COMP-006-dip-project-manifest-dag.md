# DIP — Project Manifest & DAG Implementation Record

> **Component ID**: COMP-006
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/project-manifest-dag.md](../../architecture/domains/digital-institutions-protocol/subdomains/project-manifest-dag.md)
> **Stage Assignment**: S3 — DIP Protocol
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Project Manifest & DAG subdomain owns the `DigitalProject` aggregate and manages its directed acyclic graph (DAG) of artifact dependencies. Invariant I1: the dependency graph must always remain acyclic — every edge addition triggers a depth-first reachability check. This graph is the provenance structure used by Value Distribution & Treasury (COMP-008) to compute AVU distribution weights.

**Responsibilities**:
- Manage `DigitalProject` aggregate with its `ArtifactManifesto`
- Maintain `DependencyGraph` as a DAG: `InternalArtifact` → `ExternalArtifact` edges
- Enforce acyclicity via `DAGAcyclicityEnforcer` on every edge addition
- Build `ArtifactManifesto` (governance terms summary + dependency path)
- Publish `dip.project.dependency_added`, `dip.project.dependency_rejected` events

**Key Interfaces**:
- Internal API: `GET /internal/dip/projects/{id}`, `GET /internal/dip/projects/{id}/dependency-graph`, `POST /internal/dip/projects/{id}/artifacts`

### Implementation Scope

**In Scope**:
- `DigitalProject` aggregate, `DependencyGraph`, `InternalArtifact`, `ExternalArtifact`, `DependencyEdge` entities
- `DAGAcyclicityEnforcer` domain service (depth-first reachability check)
- `ArtifactManifestoBuilder` domain service
- Repository interface + PostgreSQL implementation with graph storage
- Internal API for Hub, Learn, Labs to query project structure

**Out of Scope**:
- AVU computation (COMP-008 uses this graph but owns the computation)
- Institutional governance (COMP-007)
- IACP protocol (COMP-005)

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

#### [COMP-006.1] DigitalProject aggregate and dependency entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | project-manifest-dag.md |
| **Dependencies** | COMP-003.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DigitalProject` aggregate, `DependencyGraph`, `InternalArtifact`, `ExternalArtifact`, and `DependencyEdge` entities.

**Acceptance Criteria**:
- [ ] `DigitalProject` aggregate: `id (ProjectId)`, `institution_id`, `name`, `project_type`, `status`, `created_at`
- [ ] `InternalArtifact` entity: `artifact_id` (references DIP Artifact Registry), `artifact_type`
- [ ] `ExternalArtifact` entity: `url_or_doi`, `title`, `artifact_type`
- [ ] `DependencyEdge` entity: `from_artifact_id`, `to_artifact_id`, `edge_type`, `created_at`
- [ ] `DependencyGraph` value object: holds adjacency list; exposes `addEdge`, `getNeighbors`, `getAllReachable`
- [ ] Unit tests: basic graph operations

**Files Created/Modified**:
- `packages/dip/src/domain/project-manifest-dag/digital-project.ts`
- `packages/dip/src/domain/project-manifest-dag/dependency-graph.ts`
- `packages/dip/src/domain/project-manifest-dag/internal-artifact.ts`
- `packages/dip/src/domain/project-manifest-dag/external-artifact.ts`
- `packages/dip/src/domain/project-manifest-dag/dependency-edge.ts`

---

#### [COMP-006.2] DAGAcyclicityEnforcer domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | project-manifest-dag.md |
| **Dependencies** | COMP-006.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DAGAcyclicityEnforcer` that runs depth-first reachability check before every edge addition. If the proposed edge would create a cycle, reject and publish `dip.project.dependency_rejected`.

**Acceptance Criteria**:
- [ ] `DAGAcyclicityEnforcer.canAddEdge(graph, from, to)` returns `{ allowed: boolean, reason?: string }`
- [ ] Uses iterative DFS to check reachability from `to` to `from`; if reachable, adding `from→to` would create a cycle
- [ ] O(V+E) time complexity — must handle graphs with up to 10,000 nodes
- [ ] `dip.project.dependency_added` event on success, `dip.project.dependency_rejected` on failure
- [ ] Unit tests: simple cycle detection, complex multi-path graphs, diamond patterns (should be allowed)

**Files Created/Modified**:
- `packages/dip/src/domain/project-manifest-dag/services/dag-acyclicity-enforcer.ts`
- `packages/dip/tests/unit/project-manifest-dag/dag-acyclicity-enforcer.test.ts`

---

#### [COMP-006.3] ArtifactManifestoBuilder domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | project-manifest-dag.md |
| **Dependencies** | COMP-006.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ArtifactManifestoBuilder` that produces the `ArtifactManifesto` — a governance-ready summary of the project's dependencies and governance terms.

**Acceptance Criteria**:
- [ ] `ArtifactManifestoBuilder.build(projectId)` returns `ArtifactManifesto` with: project metadata, dependency count by type, governance contract summary, provenance path (list of artifact IDs in dependency order)
- [ ] Used by Value Distribution Treasury (COMP-008) to determine distribution weights

**Files Created/Modified**:
- `packages/dip/src/domain/project-manifest-dag/services/artifact-manifesto-builder.ts`
- `packages/dip/tests/unit/project-manifest-dag/artifact-manifesto-builder.test.ts`

---

#### [COMP-006.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | project-manifest-dag.md, ADR-004 |
| **Dependencies** | COMP-006.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DigitalProjectRepository` and graph persistence. Use adjacency list representation in PostgreSQL.

**Acceptance Criteria**:
- [ ] `DigitalProjectRepository` interface: `findById`, `save`, `findByInstitution`
- [ ] `DependencyEdgeRepository`: `findByProject`, `appendEdge`
- [ ] Migration: `digital_projects`, `dependency_edges` tables (edges append-only)
- [ ] Efficient graph reconstruction from adjacency list on load

**Files Created/Modified**:
- `packages/dip/src/domain/project-manifest-dag/repositories/digital-project-repository.ts`
- `packages/dip/src/infrastructure/repositories/postgres-digital-project-repository.ts`
- `packages/dip/src/infrastructure/migrations/004_project_manifest_dag.sql`

---

#### [COMP-006.5] Add-dependency use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | project-manifest-dag.md |
| **Dependencies** | COMP-006.2, COMP-006.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AddArtifactDependencyUseCase` orchestrating the full flow: validate artifact exists (for InternalArtifact), check DAG acyclicity, persist edge, publish event.

**Acceptance Criteria**:
- [ ] `AddArtifactDependencyUseCase.execute(projectId, fromArtifactId, toArtifactId)` validates, enforces acyclicity, persists, publishes
- [ ] Idempotent: adding same edge twice returns success without duplicating

**Files Created/Modified**:
- `packages/dip/src/application/add-artifact-dependency-use-case.ts`

---

#### [COMP-006.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-006.5 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement internal REST API for project and dependency graph access.

**Acceptance Criteria**:
- [ ] `GET /internal/dip/projects/{id}` → project metadata
- [ ] `GET /internal/dip/projects/{id}/dependency-graph` → full adjacency list
- [ ] `POST /internal/dip/projects/{id}/artifacts` → add dependency edge
- [ ] `GET /internal/dip/projects/{id}/manifesto` → ArtifactManifesto

**Files Created/Modified**:
- `packages/dip/src/api/routes/projects.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | InternalArtifact references |
| PostgreSQL | External | ✅ Available | Graph persistence |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-008 DIP Value Distribution Treasury | Reads dependency graph for AVU weights | Blocks AVU distribution |
| COMP-019 Hub Collaboration Layer | Creates projects via Hub→DIP ACL | Blocks Hub institution creation |

---

## References

### Architecture Documents

- [DIP Project Manifest & DAG Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/project-manifest-dag.md)

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-005](./COMP-005-dip-iacp-engine.md) | DAG checked at IACP Phase 2 events |
| [COMP-008](./COMP-008-dip-value-distribution-treasury.md) | Reads DAG for distribution weights |
