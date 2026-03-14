# DIP — Institutional Governance Implementation Record

> **Component ID**: COMP-007
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/institutional-governance.md](../../architecture/domains/digital-institutions-protocol/subdomains/institutional-governance.md)
> **Stage Assignment**: S3 — DIP Protocol
> **Status**: 🔵 In Progress
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Institutional Governance owns the `DigitalInstitution` aggregate and manages the full governance lifecycle: chamber system, deliberation, voting, proposal execution, and the `LegitimacyChain`. Invariant I7: every proposal execution event is signed by the executor and anchored to Nostr before being considered final. The LegitimacyChain is an append-only hash-linked record of all governance actions, providing an externally verifiable audit trail.

**Responsibilities**:
- Manage `DigitalInstitution` aggregate and `Chamber` composition
- Run `Proposal` lifecycle: Draft → Discussion → Voting → Approved/Rejected → Executed
- Compute vote tallies with chamber-weighted voting
- Execute approved proposals via Smart Contract Engine
- Build and verify `LegitimacyChain` (Invariant I7: signed + Nostr-anchored)
- Publish `dip.governance.proposal_executed` events

**Key Interfaces**:
- Internal API: `POST /internal/dip/institutions`, `GET /internal/dip/institutions/{id}`, `/governance-contract`, `/legitimacy-chain`, `POST /internal/dip/institutions/{id}/proposals`

### Implementation Scope

**In Scope**:
- `DigitalInstitution` aggregate, `Chamber`, `Proposal`, `LegitimacyChainEntry` entities
- `VotingService` domain service (chamber-weighted tally)
- `ExecutionEventBuilder` domain service (constructs + signs execution event)
- `LegitimacyChainVerifier` domain service (hash chain integrity)
- `ContestWindowEnforcer` domain service
- Repository interface + PostgreSQL implementation
- Integration with Smart Contract Engine (COMP-004) for proposal execution
- Integration with Nostr (via COMP-003 NostrRelayAdapter)

**Out of Scope**:
- ContractTemplate selection (Hub COMP-020 owns contract templates)
- AVU/treasury operations triggered by governance (COMP-008)
- Hub-level institution orchestration UI (COMP-020)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 4 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 5 |
| **Total** | **9** |

**Component Coverage**: 44%

**Implementation Plan items (Section 7) completed**: COMP-007.1 `packages/dip-governance` workspace, DigitalInstitution aggregate (create, fromPersistence, status forming|active|dissolved), domain events. COMP-007.2 Proposal aggregate (proposalId, institutionId, type, status), ProposalStatus enum, open/close/execute transitions, unit tests. COMP-007.3 VotingService (castVote, getVoteSummary), ProposalRepositoryPort, VoteStorePort, InMemoryVoteStore, eligibility check, double-vote prevention, unit tests. COMP-007.4 GovernanceService.executeProposal() with contract evaluation (SmartContractEvaluator), quorum enforcement, ProposalExecutionRejectedError, GovernanceContractResolverPort, ProposalExecutedPublisherPort, TotalEligibleResolverPort, ProposalExecutedEvent; unit tests (success, quorum rejected, not closed, not found, contract not found).

### Item List

#### [COMP-007.1] DigitalInstitution aggregate and Chamber

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | institutional-governance.md |
| **Dependencies** | COMP-003.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DigitalInstitution` aggregate root and `Chamber` entity representing groups of members with roles and voting weights.

**Acceptance Criteria**:
- [ ] `DigitalInstitution` aggregate: `id (InstitutionId)`, `name`, `institution_type`, `governance_contract_id`, `status (forming|active|dissolved)`, `legitimacy_chain_head_hash`
- [ ] `Chamber` entity: `institution_id`, `name`, `role_definitions (JSONB)`, `voting_weights (JSONB)`, `member_count`
- [ ] `DigitalInstitution.addChamber(chamber)` validates no duplicate names
- [ ] `DigitalInstitution.dissolve()` transitions to dissolved (only allowed via governance proposal)
- [ ] Unit tests: chamber addition, dissolution invariant

**Files Created/Modified**:
- `packages/dip/src/domain/institutional-governance/digital-institution.ts`
- `packages/dip/src/domain/institutional-governance/chamber.ts`
- `packages/dip/tests/unit/institutional-governance/digital-institution.test.ts`

---

#### [COMP-007.2] Proposal aggregate and lifecycle

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | institutional-governance.md |
| **Dependencies** | COMP-007.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `Proposal` aggregate with full lifecycle state machine: Draft → Discussion → Voting → Approved/Rejected → [Contested →] Executed.

**Acceptance Criteria**:
- [ ] `Proposal` aggregate: `id`, `institution_id`, `proposer_actor_id`, `title`, `description`, `proposal_type`, `status`, `vote_tally (JSONB)`, `contest_deadline`
- [ ] State machine enforces valid transitions only
- [ ] `Proposal.castVote(voterActorId, chamberRole, vote)` records vote in tally
- [ ] `Proposal.openContestWindow(deadline)` transitions Approved → Contested with deadline
- [ ] Contest window expiry → Executed (handled by background service / scheduler)
- [ ] Unit tests: all lifecycle transitions, invalid transitions throw

**Files Created/Modified**:
- `packages/dip/src/domain/institutional-governance/proposal.ts`
- `packages/dip/tests/unit/institutional-governance/proposal.test.ts`

---

#### [COMP-007.3] VotingService and ContestWindowEnforcer

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | institutional-governance.md |
| **Dependencies** | COMP-007.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `VotingService` for chamber-weighted vote tally computation and `ContestWindowEnforcer` for deadline validation.

**Acceptance Criteria**:
- [ ] `VotingService.tally(proposal, chambers)` computes weighted result per chamber voting weight
- [ ] `VotingService.determineOutcome(tally, quorumRules)` returns `Approved | Rejected`
- [ ] `ContestWindowEnforcer.isWithinContestWindow(proposal)` checks current time against `contest_deadline`
- [ ] Unit tests: various quorum configurations, majority/supermajority

**Files Created/Modified**:
- `packages/dip/src/domain/institutional-governance/services/voting-service.ts`
- `packages/dip/src/domain/institutional-governance/services/contest-window-enforcer.ts`
- `packages/dip/tests/unit/institutional-governance/voting-service.test.ts`

---

#### [COMP-007.4] LegitimacyChain and ExecutionEventBuilder

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | institutional-governance.md, ADR-010 |
| **Dependencies** | COMP-007.2 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `LegitimacyChainEntry` entity and `ExecutionEventBuilder` domain service. Every proposal execution produces a signed, Nostr-anchored chain entry per Invariant I7. Formula: `e_exec = Sign_executor(pid ∥ Hash(Inst_{k-1}) ∥ Hash(Inst_k) ∥ timestamp)`.

**Acceptance Criteria**:
- [ ] `LegitimacyChainEntry` entity: `institution_id`, `proposal_id`, `executor_signature`, `previous_chain_hash`, `chain_hash`, `nostr_event_id`, `executed_at`
- [ ] `ExecutionEventBuilder.build(proposal, institutionStateBefore, institutionStateAfter, executorSignature)` constructs entry and computes hashes
- [ ] Nostr anchoring completes before `LegitimacyChainEntry` is considered finalized
- [ ] `DigitalInstitution.legitimacy_chain_head_hash` updated atomically with each execution
- [ ] `LegitimacyChainVerifier.verify(chainEntries)` validates entire hash chain integrity
- [ ] Unit tests: hash computation, invalid chain (tampered entry) detected

**Files Created/Modified**:
- `packages/dip/src/domain/institutional-governance/legitimacy-chain-entry.ts`
- `packages/dip/src/domain/institutional-governance/services/execution-event-builder.ts`
- `packages/dip/src/domain/institutional-governance/services/legitimacy-chain-verifier.ts`
- `packages/dip/tests/unit/institutional-governance/legitimacy-chain.test.ts`

---

#### [COMP-007.5] Proposal execution use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | institutional-governance.md |
| **Dependencies** | COMP-007.4, COMP-004 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ExecuteProposalUseCase` — the critical path that validates approval, calls Smart Contract Engine, builds LegitimacyChainEntry, anchors to Nostr, publishes event.

**Acceptance Criteria**:
- [ ] `ExecuteProposalUseCase.execute(proposalId, executorSignature)` validates approved state, calls SmartContractEngine.evaluate, builds chain entry, anchors, publishes `dip.governance.proposal_executed`
- [ ] `dip.governance.proposal_executed` event: `institution_id`, `proposal_id`, `proposal_type`, `chain_entry_hash`, `nostr_event_id`
- [ ] Treasury distribution proposals trigger `dip.governance.proposal_executed` with `proposal_type: treasury_distribution`
- [ ] Execution is atomic: if Nostr anchoring fails, proposal execution is rolled back

**Files Created/Modified**:
- `packages/dip/src/application/execute-proposal-use-case.ts`

---

#### [COMP-007.6] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institutional-governance.md, ADR-004 |
| **Dependencies** | COMP-007.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for institutions, proposals, chambers, and LegitimacyChain. Create migration.

**Acceptance Criteria**:
- [ ] `DigitalInstitutionRepository` interface: `findById`, `save`, `findBySlug`
- [ ] `ProposalRepository` interface: `findById`, `findByInstitution`, `save`
- [ ] Migration: `digital_institutions`, `chambers`, `proposals`, `legitimacy_chain_entries` tables
- [ ] `legitimacy_chain_entries` rows are immutable (no update/delete)
- [ ] Integration tests: institution creation, proposal lifecycle

**Files Created/Modified**:
- `packages/dip/src/domain/institutional-governance/repositories/`
- `packages/dip/src/infrastructure/repositories/postgres-institution-repository.ts`
- `packages/dip/src/infrastructure/migrations/005_institutional_governance.sql`

---

#### [COMP-007.7] Institution creation use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institutional-governance.md |
| **Dependencies** | COMP-007.6, COMP-004 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `CreateInstitutionUseCase` — takes a governance contract template (from Hub's `ContractTemplate`), creates `GovernanceContract` via Smart Contract Engine, creates `DigitalInstitution` with initial chambers.

**Acceptance Criteria**:
- [ ] `CreateInstitutionUseCase.execute(name, type, contractRules, initialChambers)` creates GovernanceContract, creates Institution, publishes event
- [ ] `hub.institution.created` event published (Hub domain subscribes)

**Files Created/Modified**:
- `packages/dip/src/application/create-institution-use-case.ts`

---

#### [COMP-007.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-007.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for institution and governance operations.

**Acceptance Criteria**:
- [ ] `POST /internal/dip/institutions` → creates institution
- [ ] `GET /internal/dip/institutions/{id}` → institution metadata
- [ ] `GET /internal/dip/institutions/{id}/governance-contract` → current GovernanceContract
- [ ] `GET /internal/dip/institutions/{id}/legitimacy-chain` → full chain
- [ ] `POST /internal/dip/institutions/{id}/proposals` → creates proposal
- [ ] `POST /internal/dip/institutions/{id}/proposals/{pid}/votes` → casts vote
- [ ] `POST /internal/dip/institutions/{id}/proposals/{pid}/execute` → executes approved proposal

**Files Created/Modified**:
- `packages/dip/src/api/routes/institutions.ts`

---

#### [COMP-007.9] Governance test suite

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-007.8 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Complete test suite for institutional governance domain logic.

**Acceptance Criteria**:
- [ ] ≥90% branch coverage on Proposal state machine and VotingService
- [ ] Invariant I7 tested: execution without anchoring throws
- [ ] LegitimacyChain hash integrity test with intentional tampering

**Files Created/Modified**:
- `packages/dip/tests/unit/institutional-governance/*.test.ts`
- `packages/dip/tests/integration/institutional-governance/*.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-004 DIP Smart Contract Engine | Internal | ⬜ Not Started | Proposal execution validation |
| COMP-005 DIP IACP Engine | Internal | ⬜ Not Started | IACP within governance context |
| Nostr Relays | External | ✅ Available | LegitimacyChain anchoring |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-008 DIP Value Distribution Treasury | Governance proposals trigger treasury operations | Blocks AVU distribution |
| COMP-020 Hub Institution Orchestration | Hub creates institutions via DIP | Blocks Hub institution UI |

---

## References

### Architecture Documents

- [DIP Institutional Governance Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/institutional-governance.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-010](../../architecture/decisions/ADR-010-event-signing-and-immutability.md) | Two-Level Signing | LegitimacyChain actor signing (Invariant I7) |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-004](./COMP-004-dip-smart-contract-engine.md) | Contract evaluation on proposal execution |
| [COMP-008](./COMP-008-dip-value-distribution-treasury.md) | Downstream treasury trigger |
| [COMP-020](./COMP-020-hub-institution-orchestration.md) | Hub orchestrates institution creation |
