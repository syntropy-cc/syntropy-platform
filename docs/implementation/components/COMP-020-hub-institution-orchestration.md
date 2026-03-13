# Hub — Institution Orchestration Implementation Record

> **Component ID**: COMP-020
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/hub/subdomains/institution-orchestration.md](../../architecture/domains/hub/subdomains/institution-orchestration.md)
> **Stage Assignment**: S8 — Hub Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Institution Orchestration is a Supporting subdomain in Hub. It provides the UI-facing orchestration for creating and managing Digital Institutions — guiding admins through selecting a `ContractTemplate`, configuring governance parameters, and submitting to DIP. The `InstitutionProfile` is a read model (projection over DIP data) — Hub never persists governance state itself. `ContractTemplate` is Hub's own entity: pre-audited governance blueprints.

**Responsibilities**:
- Catalog `ContractTemplate` entities (pre-audited governance blueprints for institutions)
- Orchestrate `InstitutionCreationWorkflow` — multi-step UI flow that ends with DIP call
- Project `InstitutionProfile` read model from DIP data for display
- Call DIP Institutional Governance API (COMP-007) to create/manage institutions

**Key Interfaces**:
- Internal API: contract template catalog, institution creation workflow, institution profile

### Implementation Scope

**In Scope**:
- `ContractTemplate` entity (Hub-owned)
- `InstitutionCreationWorkflow` entity
- `InstitutionProfile` read model
- `InstitutionCreationOrchestrator` application service
- `InstitutionProfileProjector` application service
- `DIPInstitutionAdapter` (ACL to DIP Institutional Governance)
- Repository + API

**Out of Scope**:
- Governance contract execution (DIP COMP-007)
- Chamber management (DIP COMP-007)
- Proposal voting (DIP COMP-007)

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

#### [COMP-020.1] ContractTemplate entity and catalog

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institution-orchestration.md |
| **Dependencies** | COMP-019.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ContractTemplate` entity and seed initial templates for common institution types.

**Acceptance Criteria**:
- [ ] `ContractTemplate` entity: `id`, `name`, `institution_type`, `description`, `governance_parameters (JSONB)`, `parameter_validation_rules (JSONB)`, `is_audited`, `created_at`
- [ ] Invariant: only `is_audited = true` templates can be used in production institution creation
- [ ] Initial seed: OpenSourceProject template, ResearchLaboratory template, EducationalInstitution template
- [ ] Unit tests: non-audited template use in production throws

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/contract-template.ts`
- `packages/hub/src/infrastructure/migrations/002_institution_orchestration.sql`
- `packages/hub/src/infrastructure/seeds/contract-templates.ts`

---

#### [COMP-020.2] InstitutionCreationWorkflow entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institution-orchestration.md |
| **Dependencies** | COMP-020.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `InstitutionCreationWorkflow` entity tracking the multi-step creation process.

**Acceptance Criteria**:
- [ ] `InstitutionCreationWorkflow` entity: `id`, `admin_id`, `template_id`, `configuration (JSONB)`, `status (draft|submitting|completed|failed)`, `dip_institution_id (nullable)`, `started_at`, `completed_at`
- [ ] `InstitutionCreationWorkflow.complete(dipInstitutionId)` sets `dip_institution_id` and status
- [ ] `hub.institution.created` event published on completion

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/institution-creation-workflow.ts`

---

#### [COMP-020.3] InstitutionProfile read model and projector

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institution-orchestration.md |
| **Dependencies** | COMP-020.2, COMP-007 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `InstitutionProfile` read model and `InstitutionProfileProjector` that queries DIP to build real-time display data.

**Acceptance Criteria**:
- [ ] `InstitutionProfile` read model: `dip_institution_id`, `name`, `institution_type`, `member_count`, `active_proposals_count`, `legitimacy_chain_length`, `governance_contract_summary`, `treasury_balance_avu`, `open_issue_count`
- [ ] `InstitutionProfileProjector.project(institutionId)` calls DIP, Platform Core, and Hub APIs to build composite view
- [ ] Cached with 2-minute TTL; invalidated on `hub.institution.created` or DIP governance events
- [ ] `DIPInstitutionAdapter` (ACL) wraps DIP institution API calls

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/institution-profile.ts`
- `packages/hub/src/application/institution-profile-projector.ts`
- `packages/hub/src/infrastructure/dip-institution-adapter.ts`

---

#### [COMP-020.4] InstitutionCreationOrchestrator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institution-orchestration.md |
| **Dependencies** | COMP-020.2, COMP-020.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `InstitutionCreationOrchestrator` application service that validates template selection, builds DIP creation request, and submits.

**Acceptance Criteria**:
- [ ] `InstitutionCreationOrchestrator.create(adminId, templateId, configuration)` validates parameters against template rules, calls DIPInstitutionAdapter.createInstitution, records workflow completion
- [ ] Validation: all required governance_parameters filled, template is audited
- [ ] On DIP success: workflow completed, `hub.institution.created` published

**Files Created/Modified**:
- `packages/hub/src/application/institution-creation-orchestrator.ts`

---

#### [COMP-020.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institution-orchestration.md, ADR-004 |
| **Dependencies** | COMP-020.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interface and PostgreSQL for Hub institution orchestration entities.

**Acceptance Criteria**:
- [ ] `ContractTemplateRepository`, `InstitutionCreationWorkflowRepository` interfaces
- [ ] Integration tests

**Files Created/Modified**:
- `packages/hub/src/infrastructure/repositories/postgres-institution-orchestration-repository.ts`

---

#### [COMP-020.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | hub/ARCHITECTURE.md |
| **Dependencies** | COMP-020.4, COMP-020.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for institution orchestration.

**Acceptance Criteria**:
- [ ] `GET /internal/hub/contract-templates` → list all audited templates
- [ ] `POST /internal/hub/institutions` → starts creation workflow, calls DIP, returns institution profile
- [ ] `GET /internal/hub/institutions/{id}/profile` → projected InstitutionProfile

**Files Created/Modified**:
- `packages/hub/src/api/routes/institutions.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-007 DIP Institutional Governance | Internal | ⬜ Not Started | Creates institutions in DIP |
| COMP-019 Hub Collaboration Layer | Internal | ⬜ Not Started | Hub package foundation |

---

## References

### Architecture Documents

- [Hub Institution Orchestration Subdomain](../../architecture/domains/hub/subdomains/institution-orchestration.md)
