# DIP — Smart Contract Engine Implementation Record

> **Component ID**: COMP-004
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/smart-contract-engine.md](../../architecture/domains/digital-institutions-protocol/subdomains/smart-contract-engine.md)
> **Stage Assignment**: S11 — DIP Smart Contract Engine (M2)
> **Status**: 🔵 In Progress
> **Package**: `packages/dip-contracts`
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Smart Contract Engine owns `GovernanceContract` and implements deterministic contract evaluation (DIP Invariant I5). A governance contract is a pure function: given a request and the current institution state, it returns `(permitted | denied)` and a new state. Evaluation history is append-only. This component is called by both the IACP Engine (Phase 2: contract negotiation) and Institutional Governance (proposal execution).

**Responsibilities**:
- Manage `GovernanceContract` lifecycle (creation, version enactment)
- Execute deterministic `ContractEvaluator` function: `C: Request × State → {permitted, denied} × State′`
- Maintain append-only `ContractEvaluationHistory`
- Publish `dip.contract.evaluation_completed`, `dip.contract.version_enacted` events
- Provide `ContractVersionManager` for upgrading contracts after governance approval

**Key Interfaces**:
- Internal: `POST /internal/dip/contracts/{id}/evaluate` — called by IACP Engine and Institutional Governance
- Internal: `GET /internal/dip/contracts/{id}` — read contract state
- Event: `dip.contract.evaluation_completed` — consumed by IACP Engine

### Implementation Scope

**In Scope**:
- `GovernanceContract` aggregate, `ContractEvaluationRecord` entity
- `ContractEvaluator` domain service (pure function evaluation)
- `ContractVersionManager` domain service
- Repository interface and PostgreSQL implementation
- Internal API endpoints for contract evaluation
- Database migration: `governance_contracts`, `contract_evaluations` tables

**Out of Scope**:
- Institutional governance chamber/deliberation (COMP-007)
- IACP protocol phases (COMP-005)
- AVU/treasury distribution (COMP-008)

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

#### [COMP-004.1] Smart Contract Engine package setup (Done)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | smart-contract-engine.md |
| **Dependencies** | COMP-003.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `GovernanceContract` aggregate and `ContractEvaluationRecord` entity. The contract holds versioned rules (JSONB) and current institution state. Evaluation history is append-only (Invariant I5).

**Acceptance Criteria**:
- [ ] `GovernanceContract` aggregate: `id`, `institution_id`, `rules (JSONB)`, `current_state (JSONB)`, `version`, `is_active`
- [ ] `ContractEvaluationRecord` entity: `contract_id`, `request (JSONB)`, `result (permitted|denied)`, `state_before (JSONB)`, `state_after (JSONB)`, `evaluated_at`
- [ ] Invariant: evaluation records are never deleted or modified
- [ ] Invariant: contract only evaluates for its own institution (cross-institution call throws)
- [ ] Unit tests: invariants enforced

**Files Created/Modified** (per IMPLEMENTATION-PLAN.md Section 7, COMP-004.1 = package setup):
- `packages/dip-contracts/package.json`, `tsconfig.json`, `vitest.config.ts`
- `packages/dip-contracts/src/domain/types.ts` — `ContractClause`, `EvaluationResult`
- `packages/dip-contracts/src/domain/governance-contract.ts` — empty `GovernanceContract` scaffold
- `packages/dip-contracts/src/domain/index.ts`, `src/index.ts`
- `packages/dip-contracts/tests/unit/governance-contract.test.ts`

---

#### [COMP-004.2] GovernanceContract aggregate + clause value objects (Done)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | IMPLEMENTATION-PLAN.md Section 7 |
| **Dependencies** | COMP-004.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement clause value objects and wire them into the existing `GovernanceContract` aggregate. Four immutable clause types: `TransparencyClause`, `ParticipationThreshold`, `VetoRight`, `AmendmentProcedure`. Unit tests for each clause type and for the aggregate.

**Acceptance Criteria** (per Implementation Plan):
- [x] `GovernanceContract` aggregate with `clauses: ContractClause[]`
- [x] Clause types: `TransparencyClause`, `ParticipationThreshold`, `VetoRight`, `AmendmentProcedure` (each immutable value object)
- [x] Unit tests for aggregate and clauses

**Files Created/Modified**:
- `packages/dip-contracts/src/domain/types.ts` — four clause interfaces + `ContractClause` union
- `packages/dip-contracts/src/domain/index.ts` — export clause types
- `packages/dip-contracts/src/domain/governance-contract.ts` — docstring, defensive copy of clauses in `create()`
- `packages/dip-contracts/tests/unit/governance-contract.test.ts` — clause value object tests, contract-with-clauses tests

---

#### [COMP-004.3] SmartContractEvaluator (Done)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | IMPLEMENTATION-PLAN.md Section 7 |
| **Dependencies** | COMP-004.2 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Domain service that evaluates a `GovernanceContract` against an `EvaluationContext`; returns aggregate `EvaluationResult` (permitted only if all clauses pass). Enforces cross-institution invariant. Clause evaluators: TransparencyClause (public record + requiredDisclosures), ParticipationThreshold (quorum + minParticipants), VetoRight, AmendmentProcedure.

**Acceptance Criteria** (per Implementation Plan):
- [x] `SmartContractEvaluator.evaluate(contract, context)` returns `EvaluationResult` per clause
- [x] ParticipationThreshold evaluated against quorum; TransparencyClause checks public record
- [x] Unit tests with varied contexts (cross-institution, empty clauses, each clause type, combined)

**Files Created/Modified**:
- `packages/dip-contracts/src/domain/types.ts` — added `EvaluationContext`
- `packages/dip-contracts/src/domain/smart-contract-evaluator.ts` — `SmartContractEvaluator` class
- `packages/dip-contracts/src/domain/index.ts`, `src/index.ts` — exports
- `packages/dip-contracts/tests/unit/smart-contract-evaluator.test.ts` — 22 unit tests

---

#### [COMP-004.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | smart-contract-engine.md, ADR-004 |
| **Dependencies** | COMP-004.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Define `GovernanceContractRepository` interface and implement with PostgreSQL. Create database migration.

**Acceptance Criteria**:
- [ ] `GovernanceContractRepository` interface: `findById`, `findByInstitution`, `save`
- [ ] `ContractEvaluationRepository` interface: `append(record)`, `findByContract(contractId)`
- [ ] Migration: `governance_contracts` table, `contract_evaluations` table (append-only, no delete trigger)
- [ ] Integration tests: roundtrip save/query

**Files Created/Modified**:
- `packages/dip/src/domain/smart-contract-engine/repositories/governance-contract-repository.ts`
- `packages/dip/src/infrastructure/repositories/postgres-governance-contract-repository.ts`
- `packages/dip/src/infrastructure/migrations/002_smart_contract_engine.sql`

---

#### [COMP-004.5] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-004.2, COMP-004.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement internal REST API for contract evaluation and lookup. Called by IACP Engine (COMP-005) and Institutional Governance (COMP-007).

**Acceptance Criteria**:
- [ ] `POST /internal/dip/contracts/{id}/evaluate` → returns `EvaluationResult`
- [ ] `GET /internal/dip/contracts/{id}` → returns contract metadata and current state
- [ ] `GET /internal/dip/contracts/{id}/evaluations` → returns evaluation history
- [ ] `POST /internal/dip/contracts/{id}/enact-version` → upgrades contract version
- [ ] Service-to-service auth required

**Files Created/Modified**:
- `packages/dip/src/api/routes/contracts.ts`

---

#### [COMP-004.6] Unit and integration test suite

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-004.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Complete test suite achieving ≥90% branch coverage for smart contract engine domain logic.

**Acceptance Criteria**:
- [ ] ≥90% branch coverage on `ContractEvaluator` (critical domain logic)
- [ ] All invariants have negative test cases (cross-institution call, evaluation record modification)
- [ ] Integration test: full evaluation round-trip via API

**Files Created/Modified**:
- `packages/dip/tests/unit/smart-contract-engine/*.test.ts`
- `packages/dip/tests/integration/smart-contract-engine/*.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Shared DIP package patterns |
| PostgreSQL | External | ✅ Available | Contract persistence |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-005 IACP Engine | Calls contract evaluation in Phase 2 | Blocks IACP protocol |
| COMP-007 Institutional Governance | Calls on proposal execution | Blocks governance workflow |

---

## References

### Architecture Documents

- [DIP Smart Contract Engine Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/smart-contract-engine.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-009](../../architecture/decisions/ADR-009-value-distribution-model.md) | Value Distribution | Contract rules govern AVU distribution |
| [ADR-010](../../architecture/decisions/ADR-010-event-signing-and-immutability.md) | Event Signing | Contract evaluation events are level-2 signed |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-003](./COMP-003-dip-artifact-registry.md) | Provides DIP package foundation |
| [COMP-005](./COMP-005-dip-iacp-engine.md) | Calls evaluate during IACP Phase 2 |
| [COMP-007](./COMP-007-dip-institutional-governance.md) | Calls evaluate on proposal execution |
