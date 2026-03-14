# Labs — Experiment Design Implementation Record

> **Component ID**: COMP-024
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/labs/subdomains/experiment-design.md](../../architecture/domains/labs/subdomains/experiment-design.md)
> **Stage Assignment**: S10 — Labs Research
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Experiment Design is a Core subdomain in Labs that manages the full lifecycle of scientific experiments from design to results. Key feature: `AnonymizationPolicyEnforcer` ensures participant data is properly anonymized before any experiment result can be shared externally. Results linked to a `ScientificArticle` are embedded as `EmbeddedArtifactRef`. When experiment results are published as a dataset, they become DIP artifacts.

**Responsibilities**:
- Manage `ExperimentDesign` aggregate: design parameters, protocol, metadata
- Manage `ExperimentResult` aggregate: collected data, analysis outputs
- Enforce anonymization policy via `AnonymizationPolicyEnforcer` before any result sharing
- Link results to articles via `EmbeddedArtifactRef`
- Publish results as DIP dataset artifact when approved

**Key Interfaces**:
- Internal API: experiment CRUD, result recording, anonymization status

### Implementation Scope

**In Scope**:
- `ExperimentDesign`, `ExperimentResult` aggregates
- `AnonymizationPolicyEnforcer` domain service
- `ExperimentResultPublicationService`
- Repository + API

**Out of Scope**:
- IDE execution environment (COMP-030 / COMP-035 for container-based computation)
- Article authoring (COMP-023)
- Peer review (COMP-025)

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

#### [COMP-024.1] ExperimentDesign aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | experiment-design.md |
| **Dependencies** | COMP-022.1 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Implement `ExperimentDesign` aggregate capturing experiment structure, protocol, and pre-registration.

**Acceptance Criteria**:
- [ ] `ExperimentDesign` aggregate: `id (ExperimentId)`, `article_id`, `researcher_id`, `title`, `methodology_id`, `hypothesis_record_id (nullable)`, `protocol (JSONB)`, `variables (JSONB)`, `ethical_approval_status`, `status (designing|registered|running|completed)`, `pre_registered_at`
- [ ] `ExperimentDesign.register()` transitions to Registered; locks protocol and variables (immutable)
- [ ] Invariant: once registered, `protocol` and `variables` cannot be changed
- [ ] Unit tests: registration lock, protocol immutability

**Files Created/Modified**:
- `packages/labs/src/domain/experiment-design/experiment-design.ts`
- `packages/labs/tests/unit/experiment-design/experiment-design.test.ts`

---

#### [COMP-024.2] ExperimentResult aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | experiment-design.md |
| **Dependencies** | COMP-024.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ExperimentResult` aggregate for collected data and analysis outputs.

**Acceptance Criteria**:
- [ ] `ExperimentResult` aggregate: `id`, `experiment_id`, `raw_data_location`, `analysis_outputs (JSONB)`, `anonymization_status (not_applied|pending|completed)`, `can_share_externally`, `dip_dataset_artifact_id (nullable)`, `collected_at`
- [ ] `ExperimentResult.markAnonymized()` sets `anonymization_status = completed` and `can_share_externally = true`
- [ ] Invariant: `can_share_externally` only `true` when anonymization completed
- [ ] Unit tests: sharing without anonymization throws

**Files Created/Modified**:
- `packages/labs/src/domain/experiment-design/experiment-result.ts`
- `packages/labs/tests/unit/experiment-design/experiment-result.test.ts`

---

#### [COMP-024.3] AnonymizationPolicyEnforcer

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | experiment-design.md |
| **Dependencies** | COMP-024.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AnonymizationPolicyEnforcer` domain service that validates and applies anonymization policies to experiment results.

**Acceptance Criteria**:
- [ ] `AnonymizationPolicyEnforcer.check(result)` returns `{ compliant: boolean, issues[] }` — checks for PII fields in `raw_data_location` and `analysis_outputs`
- [ ] `AnonymizationPolicyEnforcer.apply(result)` applies configured anonymization steps and marks as completed
- [ ] Policy validation: participant IDs replaced with pseudonymous IDs, direct identifiers removed
- [ ] Must pass before `ExperimentResult.markAnonymized()` is called
- [ ] Unit tests: non-anonymized check returns issues, applied anonymization passes check

**Files Created/Modified**:
- `packages/labs/src/domain/experiment-design/services/anonymization-policy-enforcer.ts`
- `packages/labs/tests/unit/experiment-design/anonymization-policy-enforcer.test.ts`

---

#### [COMP-024.4] ExperimentResultPublicationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | experiment-design.md |
| **Dependencies** | COMP-024.3, COMP-003 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ExperimentResultPublicationService` that publishes anonymized datasets as DIP artifacts.

**Acceptance Criteria**:
- [ ] Validates anonymization complete before calling DIP
- [ ] `DIPDatasetAdapter` (ACL) publishes result dataset to DIP
- [ ] Sets `dip_dataset_artifact_id` on successful publication
- [ ] `labs.experiment.dataset_published` event published

**Files Created/Modified**:
- `packages/labs/src/domain/experiment-design/services/experiment-result-publication-service.ts`
- `packages/labs/src/infrastructure/dip-dataset-adapter.ts`

---

#### [COMP-024.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | experiment-design.md, ADR-004 |
| **Dependencies** | COMP-024.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and migration for experiment design entities.

**Acceptance Criteria**:
- [ ] `ExperimentDesignRepository`, `ExperimentResultRepository` interfaces and implementations
- [ ] Migration: `experiment_designs`, `experiment_results` tables
- [ ] `experiment_designs`: trigger prevents modification of `protocol` and `variables` after `pre_registered_at IS NOT NULL`

**Files Created/Modified**:
- `packages/labs/src/infrastructure/repositories/`
- `packages/labs/src/infrastructure/migrations/003_experiment_design.sql`

---

#### [COMP-024.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | labs/ARCHITECTURE.md |
| **Dependencies** | COMP-024.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for experiment lifecycle management.

**Acceptance Criteria**:
- [ ] `POST /internal/labs/experiments` → create experiment design
- [ ] `POST /internal/labs/experiments/{id}/register` → pre-register
- [ ] `POST /internal/labs/experiments/{id}/results` → record result
- [ ] `POST /internal/labs/experiments/{id}/results/{rid}/anonymize` → apply anonymization
- [ ] `POST /internal/labs/experiments/{id}/results/{rid}/publish` → publish as DIP dataset

**Files Created/Modified**:
- `packages/labs/src/api/routes/experiments.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-022 Labs Scientific Context | Internal | ⬜ Not Started | Methodology and hypothesis |
| COMP-023 Labs Article Editor | Internal | ⬜ Not Started | Results linked to articles |
| COMP-030 IDE Domain | Internal | ⬜ Not Started | Container for computation execution |

---

## References

### Architecture Documents

- [Labs Experiment Design Subdomain](../../architecture/domains/labs/subdomains/experiment-design.md)
