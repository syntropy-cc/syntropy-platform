# Hub — Institution Orchestration Implementation Record

> **Component ID**: COMP-020
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/hub/subdomains/institution-orchestration.md](../../architecture/domains/hub/subdomains/institution-orchestration.md)
> **Stage Assignment**: S8 — Hub Domain
> **Status**: 🔵 In Progress (S32: 020.1–020.3 done)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

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
| ✅ Done | 3 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 3 |
| **Total** | **6** |

**Component Coverage**: 50%

### Item List

#### [COMP-020.1] ContractTemplate entity and catalog

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | institution-orchestration.md, IMP Section 7 |
| **Dependencies** | COMP-019.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ContractTemplate` entity and pre-defined templates (IMP: templateId, name, dsl, type).

**Acceptance Criteria**:
- [x] `ContractTemplate` entity: `templateId`, `name`, `dsl`, `type` (ContractTemplateType)
- [x] ContractTemplateRepositoryPort; InMemoryContractTemplateRepository with 3 pre-defined templates (Open Source Project, Research Laboratory, Educational Institution)
- [x] Unit tests: create, validation, repository list/getById

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/contract-template.ts`
- `packages/hub/src/domain/institution-orchestration/ports/contract-template-repository-port.ts`
- `packages/hub/src/infrastructure/institution-orchestration/contract-template-repository-in-memory.ts`
- `packages/hub/tests/unit/institution-orchestration/contract-template.test.ts`

---

#### [COMP-020.2] InstitutionCreationWorkflow entity

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | institution-orchestration.md, IMP Section 7 |
| **Dependencies** | COMP-020.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `InstitutionCreationWorkflow` aggregate with phases and proceed().

**Acceptance Criteria**:
- [x] Phases: `template_selected`, `founders_confirmed`, `contract_deployed`, `institution_created`
- [x] `proceed(context?)` advances phases with validation (founderIds, contractDeployed, dipInstitutionId as required)
- [x] InvalidWorkflowTransitionError; unit tests for full flow and invalid transitions

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/institution-creation-workflow.ts`
- `packages/hub/tests/unit/institution-orchestration/institution-creation-workflow.test.ts`

---

#### [COMP-020.3] InstitutionProfile read model and projector

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | institution-orchestration.md, IMP Section 7 |
| **Dependencies** | COMP-020.2, COMP-007 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `InstitutionProfile` read model and `InstitutionProfileProjector.getProfile()`.

**Acceptance Criteria**:
- [x] `InstitutionProfile` interface: institutionId, name, institutionType, memberCount, activeProposalsCount, legitimacyChainLength, governanceContractSummary, treasuryBalanceAvu, openIssueCount
- [x] `InstitutionProfileReaderPort`; `InstitutionProfileProjector.getProfile(institutionId)` delegates to reader (stub in unit tests)
- [x] Unit tests: profile shape, getProfile returns reader data, null for empty id

**Files Created/Modified**:
- `packages/hub/src/domain/institution-orchestration/institution-profile.ts`
- `packages/hub/src/domain/institution-orchestration/ports/institution-profile-reader-port.ts`
- `packages/hub/src/application/institution-profile-projector.ts`
- `packages/hub/tests/unit/institution-orchestration/institution-profile.test.ts`

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

## Implementation Log

### 2026-03-14 — S32 Institution Orchestration start (COMP-020.1, 020.2, 020.3)

- **COMP-020.1**: ContractTemplate entity (templateId, name, dsl, type); ContractTemplateType enum; ContractTemplateRepositoryPort; InMemoryContractTemplateRepository with 3 pre-defined templates; unit tests.
- **COMP-020.2**: InstitutionCreationWorkflow aggregate; phases template_selected → founders_confirmed → contract_deployed → institution_created; proceed(context) with validation; InvalidWorkflowTransitionError; unit tests.
- **COMP-020.3**: InstitutionProfile interface (read model); InstitutionProfileReaderPort; InstitutionProfileProjector.getProfile(); unit tests with stub reader. DIPInstitutionAdapter and caching left for COMP-020.4+.

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
