# DIP — Value Distribution & Treasury Implementation Record

> **Component ID**: COMP-008
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md](../../architecture/domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md)
> **Stage Assignment**: S20–S21 (per IMPLEMENTATION-PLAN.md)
> **Status**: 🔵 In Progress (S22 done: 008.1–008.8)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Value Distribution & Treasury owns the `Treasury` aggregate and manages AVU (Abstract Value Unit) accounting for projects and institutions. AVU is never a concrete currency (Invariant I6) — it is a unit of abstraction that tracks value contributions across the dependency graph. Conversion to real currency happens only via oracle-based liquidation (ADR-009). Invariant I4: Treasury balance is always `sum(credits) - sum(debits)` — AVU is conserved, never created or destroyed outside the defined rules.

**Responsibilities**:
- Compute AVU delta for each `UsageEvent` via `AVUComputationService`
- Distribute AVU across the dependency graph via `DistributionService`
- Maintain `Treasury` balances (per project and institution)
- Execute oracle-based currency liquidation via `LiquidationService`
- Publish `dip.treasury.avu_credited`, `dip.treasury.liquidation_completed` events

**Key Interfaces**:
- Event-driven: consumes `dip.usage.registered` to trigger computation
- Internal API: `GET /internal/dip/treasury/{entity_id}` — balance queries
- Internal API: `POST /internal/dip/treasury/liquidate` — initiate liquidation

### Implementation Scope

**In Scope**:
- `Treasury` aggregate, `AVUTransaction`, `AVUComputationRecord`, `LiquidationRecord` entities
- `AVUComputationService` domain service (formula: `AVU = base_rate × usage_weight × dependency_factor`)
- `DistributionService` domain service (distributes across DependencyGraph weights)
- `LiquidationService` domain service + `OracleLiquidationAdapter` infrastructure ACL
- Repository interface + PostgreSQL implementation
- Event consumer for `dip.usage.registered`
- Event consumer for `dip.governance.proposal_executed` (treasury_distribution type)

**Out of Scope**:
- Stripe payment processing for sponsor contributions (COMP-027 Sponsorship)
- AVU display in portfolio (COMP-010 Platform Core Portfolio)
- DependencyGraph ownership (COMP-006)

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

#### [COMP-008.1] Treasury aggregate and AVU transaction entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | value-distribution-treasury.md, ADR-009 |
| **Dependencies** | COMP-003.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Treasury` aggregate and `AVUTransaction`, `AVUComputationRecord` entities. Enforce Invariants I4 and I6.

**Acceptance Criteria**:
- [ ] `Treasury` aggregate: `id`, `entity_id` (project or institution), `entity_type`, `balance_avu (Decimal ≥ 0)`, `total_credits_avu`, `total_debits_avu`
- [ ] `AVUTransaction` entity: `treasury_id`, `transaction_type (credit|debit)`, `amount_avu`, `source_event_id`, `created_at`
- [ ] Invariant I4: `balance = sum(credits) - sum(debits)` enforced; debit attempt when balance < amount throws
- [ ] Invariant I6: `AVUTransaction.amount_avu` is always in AVU — no currency fields in this entity
- [ ] `AVUComputationRecord` entity: `usage_event_id`, `base_rate`, `usage_weight`, `dependency_factor`, `computed_avu_delta` — idempotent (same input → same output)
- [ ] Unit tests: debit below zero throws, credit increases balance, computation record idempotency

**Files Created/Modified**:
- `packages/dip/src/domain/value-distribution-treasury/treasury.ts`
- `packages/dip/src/domain/value-distribution-treasury/avu-transaction.ts`
- `packages/dip/src/domain/value-distribution-treasury/avu-computation-record.ts`
- `packages/dip/tests/unit/value-distribution-treasury/treasury.test.ts`

---

#### [COMP-008.2] AVUComputationService domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | value-distribution-treasury.md, ADR-009 |
| **Dependencies** | COMP-008.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AVUComputationService` that computes AVU delta from a `UsageEvent`. Formula: `AVU(usage_event) = base_rate × usage_weight × dependency_factor`. Idempotent: same `usage_event_id` always produces the same result.

**Acceptance Criteria**:
- [ ] `AVUComputationService.compute(usageEvent, dependencyFactor)` returns `AVUComputationRecord`
- [ ] Formula applied precisely using `Decimal` arithmetic (no floating-point rounding)
- [ ] Idempotent: calling with same `usage_event_id` twice returns existing `AVUComputationRecord` without recomputing
- [ ] `dependency_factor` sourced from `ArtifactManifesto` (COMP-006)
- [ ] Unit tests: formula precision, idempotency

**Files Created/Modified**:
- `packages/dip/src/domain/value-distribution-treasury/services/avu-computation-service.ts`
- `packages/dip/tests/unit/value-distribution-treasury/avu-computation-service.test.ts`

---

#### [COMP-008.3] DistributionService domain service

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | value-distribution-treasury.md |
| **Dependencies** | COMP-008.2, COMP-006 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `DistributionService` that distributes computed AVU across multiple beneficiary treasuries according to the DependencyGraph weights.

**Acceptance Criteria**:
- [ ] `DistributionService.distribute(computationRecord, dependencyGraph)` credits each treasury proportionally to dependency weights
- [ ] Sum of all credits equals total computed AVU delta (conservation invariant)
- [ ] `dip.treasury.avu_credited` event published for each credit
- [ ] Distribution is atomic: all credits succeed or all fail (transactional)
- [ ] Unit tests: even distribution, weighted distribution, single beneficiary

**Files Created/Modified**:
- `packages/dip/src/domain/value-distribution-treasury/services/distribution-service.ts`
- `packages/dip/tests/unit/value-distribution-treasury/distribution-service.test.ts`

---

#### [COMP-008.4] LiquidationService and OracleLiquidationAdapter

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | value-distribution-treasury.md, ADR-009 |
| **Dependencies** | COMP-008.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `LiquidationService` and `OracleLiquidationAdapter` (ACL wrapping the oracle exchange rate provider). Liquidation converts AVU to real currency at the current oracle rate.

**Acceptance Criteria**:
- [ ] `LiquidationRecord` entity: `treasury_id`, `avu_amount`, `exchange_rate`, `currency_amount`, `currency`, `oracle_source`, `liquidated_at`
- [ ] `OracleLiquidationAdapter` fetches exchange rate from configured oracle endpoint
- [ ] `LiquidationService.liquidate(treasuryId, avuAmount, targetCurrency)` validates balance, fetches rate, creates LiquidationRecord, debits Treasury
- [ ] Real currency values appear only in `LiquidationRecord`, never in `AVUTransaction`
- [ ] Circuit breaker for oracle API calls (COMP-040)
- [ ] `dip.treasury.liquidation_completed` event published
- [ ] Integration test with mocked oracle

**Files Created/Modified**:
- `packages/dip/src/domain/value-distribution-treasury/liquidation-record.ts`
- `packages/dip/src/domain/value-distribution-treasury/services/liquidation-service.ts`
- `packages/dip/src/infrastructure/oracle-liquidation-adapter.ts`

---

#### [COMP-008.5] Event consumers (dip.usage.registered, dip.governance.proposal_executed)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | value-distribution-treasury.md |
| **Dependencies** | COMP-008.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Kafka event consumers that trigger AVU computation and distribution upon usage registration and governance treasury distribution proposals.

**Acceptance Criteria**:
- [ ] `UsageRegisteredConsumer` subscribes to `dip.events` topic, filters `dip.usage.registered`, calls `AVUComputationService` + `DistributionService`
- [ ] `GovernanceProposalExecutedConsumer` filters `proposal_type: treasury_distribution`, executes treasury distribution
- [ ] Both consumers are idempotent (check for existing `AVUComputationRecord` before reprocessing)
- [ ] Consumer group: `dip-treasury-computation`
- [ ] Failed events → DLQ per resilience patterns

**Files Created/Modified**:
- `packages/dip/src/infrastructure/consumers/usage-registered-consumer.ts`
- `packages/dip/src/infrastructure/consumers/governance-proposal-consumer.ts`

---

#### [COMP-008.6] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | value-distribution-treasury.md, ADR-004 |
| **Dependencies** | COMP-008.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for Treasury and all transaction records.

**Acceptance Criteria**:
- [ ] `TreasuryRepository` interface: `findByEntity`, `findById`, `save`
- [ ] `AVUTransactionRepository`: append-only `add(transaction)`, `findByTreasury`
- [ ] Migration: `treasuries`, `avu_transactions`, `avu_computation_records`, `liquidation_records` tables
- [ ] Strong consistency required (no eventual consistency for balance operations)

**Files Created/Modified**:
- `packages/dip/src/domain/value-distribution-treasury/repositories/treasury-repository.ts`
- `packages/dip/src/infrastructure/repositories/postgres-treasury-repository.ts`
- `packages/dip/src/infrastructure/migrations/006_value_distribution_treasury.sql`

---

#### [COMP-008.7] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | DIP ARCHITECTURE.md |
| **Dependencies** | COMP-008.6 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for treasury balance queries and liquidation requests.

**Acceptance Criteria**:
- [ ] `GET /internal/dip/treasury/{entity_id}` → current balance and recent transactions
- [ ] `POST /internal/dip/treasury/liquidate` → initiates liquidation
- [ ] `GET /internal/dip/treasury/{entity_id}/transactions` → full transaction history

**Files Created/Modified**:
- `packages/dip/src/api/routes/treasury.ts`

---

#### [COMP-008.8] Treasury test suite

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-008.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Complete test suite for value distribution and treasury domain logic.

**Acceptance Criteria**:
- [ ] ≥90% branch coverage on AVUComputationService and DistributionService
- [ ] Conservation invariant tested: sum of distributed AVU equals computed delta
- [ ] Debit-below-zero invariant tested
- [ ] Oracle liquidation integration test with mocked oracle

**Files Created/Modified**:
- `packages/dip/tests/unit/value-distribution-treasury/*.test.ts`
- `packages/dip/tests/integration/value-distribution-treasury/*.test.ts`

---

## Implementation Log

### 2026-03-13 — S20 implementation (COMP-008.1–008.3)

**Package**: `packages/dip-treasury` (new workspace). Execution follows IMPLEMENTATION-PLAN.md Section 7; plan uses `TreasuryAccount` (not Treasury) and `packages/dip-treasury` as source of truth.

**COMP-008.1** — Value Distribution package setup + TreasuryAccount
- Created `packages/dip-treasury` with package.json, tsconfig.json, vitest.config.ts.
- `TreasuryAccount` aggregate: `accountId`, `institutionId`, `avuBalance` (integer); `credit(amount)`, `debit(amount)`; `InsufficientBalanceError` on debit that would go negative.
- Unit tests: 9 tests in `tests/unit/treasury-account.test.ts`.

**COMP-008.2** — UsageRegistration event consumer
- `UsageRegistryPort` and `UsageContributionRecord`; `InMemoryUsageRegistry`.
- `UsageRegisteredConsumer`: handles messages with `type: "dip.artifact.published"`, computes contribution (fixed 1 per event), records via `UsageRegistryPort`. Topic: consume from `dip.events` (filter by type in payload).
- Unit tests: 5 tests in `tests/unit/usage-registered-consumer.test.ts` (mock message payloads, no live Kafka).

**COMP-008.3** — AVU accounting (debit/credit)
- `AVUTransaction` entity; `TreasuryAccountRepositoryPort`, `AVUTransactionJournalPort`.
- `AVUAccountingService.record(params)`: load account, apply credit/debit (throws before journal if debit insufficient), append transaction to journal, save account. Copy account before mutate so failed journal append does not persist balance change.
- In-memory implementations: `InMemoryTreasuryAccountRepository`, `InMemoryAVUJournal`.
- Unit tests: 5 tests in `tests/unit/avu-accounting-service.test.ts` (balance update, journal append, debit guard, missing account, failing journal).

**COMP-008.4** — ValueDistributionService.compute()
- `ContributorScoreQueryPort`, `DistributionResult`, `ValueDistributionService.compute(institutionId, period)`; proportional split by contributor scores (floor to integer AVU); `findByInstitutionId` on repository.
- Unit tests: 8 tests in `tests/unit/value-distribution-service.test.ts`.

**COMP-008.5** — Liquidation oracle integration
- `LiquidationOraclePort` (getRate(currency)); `OracleLiquidationAdapter` (HTTP GET {baseUrl}/rates/{currency}, circuit breaker + timeout via @syntropy/platform-core).
- Unit tests: 5 tests in `tests/unit/oracle-adapter.test.ts` (valid rate, invalid response, circuit open after failures).

**COMP-008.6** — TreasuryTransfer aggregate
- `TreasuryTransfer.record()`, immutable; `toTransferRecordedEvent()` for `dip.treasury.transfer_recorded`; `treasury-transfer-events.ts`.
- Unit tests: 9 tests in `tests/unit/treasury-transfer.test.ts`.

**COMP-008.7** — TreasuryRepository (Postgres)
- Migration `supabase/migrations/20260314210000_dip_treasury.sql` (dip.treasury_accounts, avu_transactions, treasury_transfers); `TreasuryDbClient`, `PgTreasuryDbClient`; `PostgresTreasuryAccountRepository`, `PostgresAVUJournal`, `PostgresTreasuryTransferRepository`; `TreasuryTransferRepositoryPort`.
- Integration test: `tests/integration/treasury-repository.test.ts` (mock client).

**Files created (S20+S21)**: `src/domain/treasury-account.ts`, `src/domain/avu-transaction.ts`, `src/domain/treasury-transfer.ts`, `src/domain/distribution-result.ts`, `src/domain/ports/*`, `src/domain/services/value-distribution-service.ts`, `src/domain/events/treasury-transfer-events.ts`, `src/infrastructure/oracle-adapter.ts`, `src/infrastructure/treasury-db-client.ts`, `src/infrastructure/pg-treasury-db-client.ts`, `src/infrastructure/repositories/postgres-*.ts`, in-memory impls, consumer, index; migrations; unit and integration tests.

### 2026-03-14 — S22 (COMP-008.8)

**COMP-008.8** — Treasury REST API endpoints + integration tests
- Added `AVUTransactionQueryPort` and `PostgresAVUTransactionQuery` for transaction history by account.
- Added `TreasuryDistributionExecutor`: runs `ValueDistributionService.compute()`, then debits institution account and credits each contributor (contributorId = institution id of recipient account). All contributor accounts must exist.
- apps/api: `TreasuryContext`, `treasuryRoutes` (GET /api/v1/treasury/:institutionId, POST .../distribute), registered when `options.treasury` provided. Integration test in `apps/api/src/integration/treasury-api.integration.test.ts` (Testcontainers Postgres, GET balance+history, POST distribute result shape).

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-005 DIP IACP Engine | Internal | ⬜ Not Started | `dip.usage.registered` trigger |
| COMP-006 DIP Project Manifest DAG | Internal | ⬜ Not Started | Dependency weights for distribution |
| COMP-007 DIP Institutional Governance | Internal | ⬜ Not Started | Treasury distribution proposals |
| Oracle API | External | ✅ Available | Exchange rate for liquidation |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-027 Sponsorship | Sponsor contributions flow into treasuries | Blocks monetization |

---

## References

### Architecture Documents

- [DIP Value Distribution & Treasury Subdomain](../../architecture/domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-009](../../architecture/decisions/ADR-009-value-distribution-model.md) | AVU Accounting Model | Core design decision for this component |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-005](./COMP-005-dip-iacp-engine.md) | Triggers AVU computation via events |
| [COMP-006](./COMP-006-dip-project-manifest-dag.md) | Provides dependency weights |
| [COMP-007](./COMP-007-dip-institutional-governance.md) | Treasury distribution via governance |
