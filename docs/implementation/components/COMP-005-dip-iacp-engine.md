# DIP — IACP Engine Implementation Record

> **Component ID**: COMP-005
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/iacp-engine.md](../../architecture/domains/digital-institutions-protocol/subdomains/iacp-engine.md)
> **Stage Assignment**: S3 — DIP Protocol
> **Status**: 🔵 In Progress
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

The IACP Engine implements the **Institutional Artifact Consumption Protocol** — a four-phase state machine that governs how artifacts are used within institutional contexts. Phases: Identification → ContractNegotiation → Authorized → UsageRegistered. Invariant I3: phases must execute in order, no skipping. `UsageAgreementEvent` and `UsageEvent` are co-signed by requester and author, then anchored to Nostr (level-1 signing per ADR-010).

**Responsibilities**:
- Manage `IACP` aggregate lifecycle across 4 phases
- Coordinate `UsageAgreementEvent` co-signing and Nostr anchoring
- Coordinate `UsageEvent` signing and anchoring at usage registration
- Call Smart Contract Engine for Phase 2 validation
- Publish `dip.iacp.identified`, `dip.iacp.agreement_created`, `dip.usage.registered` events
- Trigger AVU computation via events after `dip.usage.registered`

**Key Interfaces**:
- Internal API: `POST /internal/dip/iacp/initiate`, `/internal/dip/iacp/{id}/negotiate`, `/internal/dip/iacp/{id}/authorize`, `/internal/dip/iacp/{id}/register-usage`
- Event: `dip.usage.registered` — consumed by Value Distribution & Treasury (COMP-008)

### Implementation Scope

**In Scope**:
- `IACP` aggregate state machine
- `UsageAgreementEvent` and `UsageEvent` entities with signing flow
- `PhaseTransitionValidator` domain service
- `UsageAgreementSigner` domain service (coordinates multi-party signing)
- Repository interface and PostgreSQL implementation
- Integration with Nostr anchoring (via `NostrRelayAdapter` from COMP-003)
- Integration with Smart Contract Engine (COMP-004) for Phase 2
- Internal API endpoints

**Out of Scope**:
- AVU computation triggered by `dip.usage.registered` (COMP-008)
- DependencyGraph DAG (COMP-006)
- GovernanceContract management (COMP-004)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 2 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 6 |
| **Total** | **8** |

**Component Coverage**: 25%

**Implementation Plan items (Section 7) completed**: COMP-005.1 (dip-iacp package, IACPRecord, IACPStatus), COMP-005.2 (IACPParty, SignatureThreshold, IACPRecord.addParty()). Package: `packages/dip-iacp`. IACPRecord is immutable; addParty() returns a new instance and rejects duplicate actorId.

### Item List

#### [COMP-005.1] IACP aggregate and state machine

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | iacp-engine.md |
| **Dependencies** | COMP-003.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `IACP` aggregate as a state machine with 4 phases. Enforce Invariant I3: phases must execute in order; instance is sealed after UsageRegistration.

**Acceptance Criteria**:
- [ ] `IACP` aggregate: `id`, `artifact_id`, `requester_actor_id`, `author_actor_id`, `phase (Identification|ContractNegotiation|Authorized|UsageRegistered)`, `created_at`, `sealed_at`
- [ ] `PhaseTransitionValidator` enforces: Identification→ContractNegotiation→Authorized→UsageRegistered (no skips)
- [ ] Attempting to transition from sealed instance throws `IACPSealedError`
- [ ] `IACP.seal()` sets `sealed_at` when UsageRegistered phase is entered
- [ ] Unit tests: all valid transitions, all invalid skip attempts throw

**Files Created/Modified**:
- `packages/dip/src/domain/iacp-engine/iacp.ts`
- `packages/dip/src/domain/iacp-engine/services/phase-transition-validator.ts`
- `packages/dip/tests/unit/iacp-engine/iacp.test.ts`

---

#### [COMP-005.2] UsageAgreementEvent entity and co-signing

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | iacp-engine.md, ADR-010 |
| **Dependencies** | COMP-005.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `UsageAgreementEvent` entity representing the Phase 2 (ContractNegotiation) outcome. Two-party signing: requester signature + author signature, then Nostr anchoring.

**Acceptance Criteria**:
- [ ] `UsageAgreementEvent` entity: `iacp_id`, `requester_signature (ActorSignature)`, `author_signature (ActorSignature)`, `nostr_event_id`, `agreed_at`
- [ ] `UsageAgreementSigner.collectRequesterSignature(iacpId, sig)` stores requester signature
- [ ] `UsageAgreementSigner.collectAuthorSignature(iacpId, sig)` stores author signature; if both present, triggers Nostr anchoring
- [ ] After Nostr confirmation, `IACP` transitions to Authorized
- [ ] `dip.iacp.agreement_created` event published with both signatures and nostr_event_id
- [ ] Unit tests: partial signing (requester only, author only), full signing triggers transition

**Files Created/Modified**:
- `packages/dip/src/domain/iacp-engine/usage-agreement-event.ts`
- `packages/dip/src/domain/iacp-engine/services/usage-agreement-signer.ts`
- `packages/dip/tests/unit/iacp-engine/usage-agreement-signer.test.ts`

---

#### [COMP-005.3] UsageEvent entity and registration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | iacp-engine.md, ADR-010 |
| **Dependencies** | COMP-005.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `UsageEvent` entity for Phase 4 (UsageRegistered). Requester signs + Nostr anchoring, then `dip.usage.registered` published.

**Acceptance Criteria**:
- [ ] `UsageEvent` entity: `iacp_id`, `requester_signature`, `nostr_event_id`, `registered_at`, `usage_weight`
- [ ] `UsageRegistrationService.register(iacpId, usageWeight, requesterSignature)` validates IACP is Authorized, creates UsageEvent, anchors, seals IACP
- [ ] `dip.usage.registered` event published: `iacp_id`, `artifact_id`, `requester_actor_id`, `author_actor_id`, `usage_weight`, `nostr_event_id`
- [ ] This event triggers AVU computation in COMP-008

**Files Created/Modified**:
- `packages/dip/src/domain/iacp-engine/usage-event.ts`
- `packages/dip/src/domain/iacp-engine/services/usage-registration-service.ts`
- `packages/dip/tests/unit/iacp-engine/usage-registration-service.test.ts`

---

#### [COMP-005.4] Smart Contract Engine integration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | iacp-engine.md |
| **Dependencies** | COMP-005.1, COMP-004 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Phase 2 integration: IACP Engine calls Smart Contract Engine to validate the usage agreement request against the institution's governance contract before advancing to ContractNegotiation.

**Acceptance Criteria**:
- [ ] `SmartContractEngineAdapter` (ACL) wraps internal API call to COMP-004
- [ ] Phase 2 initiation calls `SmartContractEngineAdapter.evaluate(contractId, request)`
- [ ] If `denied`, IACP transitions to `ContractDenied` terminal state
- [ ] If `permitted`, IACP proceeds to ContractNegotiation
- [ ] Integration test with mocked Smart Contract Engine

**Files Created/Modified**:
- `packages/dip/src/infrastructure/smart-contract-engine-adapter.ts`
- `packages/dip/tests/integration/iacp-engine/smart-contract-integration.test.ts`

---

#### [COMP-005.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | iacp-engine.md, ADR-004 |
| **Dependencies** | COMP-005.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Define `IACPRepository` interface and implement with PostgreSQL. Create database migration.

**Acceptance Criteria**:
- [ ] `IACPRepository` interface: `findById`, `findByArtifact`, `findByRequester`, `save`
- [ ] Migration: `iacp_instances`, `usage_agreement_events`, `usage_events` tables
- [ ] `iacp_instances` row is sealed (no further writes) when `sealed_at` is set
- [ ] Integration tests

**Files Created/Modified**:
- `packages/dip/src/domain/iacp-engine/repositories/iacp-repository.ts`
- `packages/dip/src/infrastructure/repositories/postgres-iacp-repository.ts`
- `packages/dip/src/infrastructure/migrations/003_iacp_engine.sql`

---

#### [COMP-005.6] IACP initiation use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | iacp-engine.md |
| **Dependencies** | COMP-005.4, COMP-005.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `IACPInitiationUseCase` that validates the artifact is anchored (`dip.artifact.anchored` received), creates the IACP instance in Identification phase, and publishes `dip.iacp.identified`.

**Acceptance Criteria**:
- [ ] Only anchored artifacts can have IACP initiated
- [ ] `dip.iacp.identified` published with `iacp_id`, `artifact_id`, `requester_actor_id`
- [ ] Duplicate initiation for same artifact+requester pair is idempotent

**Files Created/Modified**:
- `packages/dip/src/application/iacp-initiation-use-case.ts`

---

#### [COMP-005.7] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-005.6 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement IACP lifecycle REST API endpoints.

**Acceptance Criteria**:
- [ ] `POST /internal/dip/iacp/initiate` → creates IACP, returns `iacp_id`
- [ ] `POST /internal/dip/iacp/{id}/negotiate` → records signatures, advances to ContractNegotiation
- [ ] `POST /internal/dip/iacp/{id}/authorize` → confirms Nostr anchoring, advances to Authorized
- [ ] `POST /internal/dip/iacp/{id}/register-usage` → records UsageEvent, seals, publishes event
- [ ] `GET /internal/dip/iacp/{id}` → current IACP state

**Files Created/Modified**:
- `packages/dip/src/api/routes/iacp.ts`

---

#### [COMP-005.8] IACP test suite

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-005.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Complete unit and integration test suite for IACP state machine.

**Acceptance Criteria**:
- [ ] ≥90% branch coverage on IACP state machine
- [ ] All illegal phase skip attempts have test cases
- [ ] Full happy-path integration test: Identification→UsageRegistered
- [ ] `dip.usage.registered` event schema validated

**Files Created/Modified**:
- `packages/dip/tests/unit/iacp-engine/*.test.ts`
- `packages/dip/tests/integration/iacp-engine/*.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Artifact anchoring prerequisite |
| COMP-004 DIP Smart Contract Engine | Internal | ⬜ Not Started | Phase 2 contract validation |
| Nostr Relays | External | ✅ Available | UsageAgreementEvent anchoring |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-007 DIP Institutional Governance | IACP runs within governance context | Blocks full DIP flow |
| COMP-008 DIP Value Distribution Treasury | Consumes `dip.usage.registered` | Blocks AVU computation |

---

## References

### Architecture Documents

- [DIP IACP Engine Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/iacp-engine.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-003](../../architecture/decisions/ADR-003-artifact-identity-anchoring.md) | Nostr Anchoring | UsageAgreementEvent anchoring |
| [ADR-010](../../architecture/decisions/ADR-010-event-signing-and-immutability.md) | Two-Level Signing | Actor co-signing for agreements |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-004](./COMP-004-dip-smart-contract-engine.md) | Phase 2 contract evaluator |
| [COMP-008](./COMP-008-dip-value-distribution-treasury.md) | Downstream AVU trigger |
