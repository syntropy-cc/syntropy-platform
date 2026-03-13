# ADR-009: Value Distribution Model — AVU Accounting with Oracle-Based Liquidation

## Status

Accepted

## Date

2026-03-12

## Context

The Digital Institutions Protocol (DIP) includes a value distribution mechanism that compensates creators when their artifacts are used by others through the IACP (Identification, Agreement, Contract negotiation, Usage registration) protocol. Vision Section 18 (Capability 18: Value Distribution) describes this mechanism.

The value distribution system operates under the following constraints from Vision Section 10 (Inviolable Decisions):

1. **No platform token**: The platform must not create or issue a blockchain token (cryptocurrency). Creating a token would subject the platform to securities regulation in most jurisdictions, create speculative dynamics that are misaligned with the ecosystem's purpose, and require significant legal and compliance overhead.
2. **No fiat currency in distribution logic**: The value distribution engine must not handle concrete currencies (USD, EUR, BRL). Concrete currency handling requires payment processor licenses and compliance frameworks (PSD2, FinCEN) that are premature for an early-stage platform.
3. **Value must be traceable**: Every value unit's origin (which usage event generated it), movement (which distribution rule applied it), and destination (which wallet received it) must be fully auditable.
4. **Institution-based distribution**: Value flows to participants according to the institution's governance contract — contribution percentage, role-based splits, and configurable distribution policies are set by the institution, not by the platform.

Additional technical requirements:
- The DIP `Smart Contract Engine` evaluates governance contracts deterministically — the same input state must always produce the same output — meaning floating-point arithmetic is prohibited in value computation
- Value distribution must integrate with the IACP protocol: only when a `UsageEvent` is registered (Phase 4 of IACP) does value accrue to contributors
- A liquidation mechanism must exist that converts abstract value units to concrete currencies for users who want to withdraw — but this conversion must happen at the boundary, not inside the distribution logic

The central design challenge: **how to represent value within the distribution system such that it is auditable, deterministic, institution-configured, and currency-agnostic, while still ultimately enabling real monetary compensation for creators?**

## Decision

We will use an **Abstract Value Unit (AVU) accounting model** with **oracle-based liquidation** at the treasury boundary. AVUs are the internal unit of account for all value distribution within the DIP domain. Concrete currencies never appear inside the distribution logic.

Specifically:

1. **Abstract Value Unit (AVU)**:
   - AVU is a dimensionless integer-valued unit of account (no decimal arithmetic inside the system)
   - AVUs are created by `UsageEvents` (IACP Phase 4): each `UsageEvent` generates a configurable number of AVUs based on the usage type and agreement terms
   - AVUs are distributed to contributor wallets according to the institution's governance contract `DistributionPolicy`
   - AVUs in wallets represent a claim on value — not a currency, not a transferable token, not a security

2. **Treasury** (DIP domain aggregate):
   - The `Treasury` is the per-institution entity that holds the pool of undistributed AVUs
   - `DistributionPolicy` defines the split: e.g., "artifact creator: 60%; institution: 30%; platform operations: 10%"
   - Distribution runs are triggered by governance contract terms (event-driven or periodic)
   - **Invariant I4 (Value Conservation)**: `sum(all AVUs in all wallets) + sum(treasury balances) = sum(all UsageEvent AVU grants)`. AVUs are never created or destroyed outside of UsageEvents and liquidations.
   - **Invariant I6 (AVU Exclusivity)**: Concrete currencies never appear in distribution logic, wallet balances, or governance contract terms. Only AVUs.

3. **Oracle-based liquidation**:
   - An `AVU → concrete currency` conversion is performed at the `Treasury` boundary, exclusively during liquidation requests
   - The conversion rate is determined by an **oracle**: a configurable rate (initially manually set by platform operations; later, market-determined) that maps 1 AVU to a concrete currency amount
   - The oracle rate is stored in `dip.treasury_oracle_rates` and is updated by platform governance, not by individual users
   - Liquidation request: a user requests withdrawal of N AVUs; the system checks the oracle rate, creates a payment order for `N × rate` in the requested currency, and delegates to Stripe (via ACL) for disbursement
   - Liquidation reduces the user's AVU wallet balance by N and records the liquidation event

4. **Stripe integration** (Infrastructure ACL in `packages/dip/infrastructure/payment-adapter.ts`):
   - The `PaymentAdapter` wraps Stripe's Connect payouts API
   - DIP domain speaks of `LiquidationRequest`, `LiquidationResult` — not Stripe-specific objects
   - The payment adapter is optional at launch: the initial deployment may operate without liquidation (AVU balances accumulate; liquidation is enabled when payment infrastructure is ready)

5. **Auditability**: Every AVU creation (UsageEvent), transfer (DistributionRun), and liquidation is an immutable event in the AppendOnlyLog (Platform Core Event Bus & Audit subdomain). The full AVU lifecycle is reconstructible from the event log.

## Alternatives Considered

### Alternative 1: Blockchain Token (ERC-20 or Similar)

Issue a platform token (e.g., SYN token on Ethereum, Polygon, or a custom chain) to represent value. Contributors earn tokens; tokens can be traded on exchanges.

**Pros**:
- Tokens are transferable: contributors can sell them on the open market
- Smart contracts provide on-chain governance and automatic distribution
- Transparent and auditable by anyone on-chain

**Cons**:
- **Directly prohibited by Vision Section 10** (Inviolable Decisions): "No platform token"
- Securities regulation risk: depending on jurisdiction, issuing tokens may constitute offering an unregistered security — creating massive legal and compliance overhead
- Speculative dynamics: token price volatility creates misaligned incentives (contributors motivated by token speculation rather than contributions)
- Technical complexity: bridging the off-chain world (Syntropy's database of contributions) to an on-chain token distribution requires oracles, gas fee management, and blockchain node operation
- Excludes users in jurisdictions with crypto restrictions

**Why rejected**: Explicitly prohibited by Vision Section 10. The legal, regulatory, and speculative risks are not acceptable for a platform whose mission is knowledge work, not financial speculation.

### Alternative 2: Direct Fiat Payments (Stripe Connect)

Use Stripe Connect to distribute fiat currency (USD, EUR) directly to contributors' connected accounts when their artifacts are used.

**Pros**:
- Immediate real-world value for contributors
- Stripe Connect handles compliance (KYC/AML) for connected accounts
- Simple mental model: contributors earn dollars, not abstract units

**Cons**:
- **Prohibited by Vision Section 10**: "No concrete currencies in distribution logic"
- Regulatory complexity: direct money transmission requires licenses in multiple jurisdictions (FinCEN MSB license, EU EMI license, etc.)
- Currency conversion: a Brazilian researcher and a German researcher using the same artifact generate payments in different currencies — requires real-time FX management
- Minimum payout thresholds: Stripe Connect payouts have minimum amounts; micro-payments for small artifact usages may not meet thresholds and create negative user experiences
- IACP Phase 4 can generate thousands of UsageEvents per day — direct Stripe payouts at this volume create high transaction fees

**Why rejected**: Direct fiat handling inside the distribution logic requires financial licenses that the platform does not have and should not pursue at this stage. The AVU model defers concrete currency handling to the liquidation boundary, where it can be gated behind proper compliance infrastructure without contaminating the distribution logic.

### Alternative 3: Points System (Non-Liquidatable Reward Points)

Implement a pure points system (like airline miles or loyalty points) that represents recognition and reputation but cannot be converted to money.

**Pros**:
- No financial regulation: non-monetary rewards are not subject to money transmission rules
- Simple to implement
- Avoids all currency handling complexity

**Cons**:
- Vision Section 4 (Voluntary Sponsorship and Monetization) and Section 18 (Value Distribution) require that creators can receive real monetary compensation for their artifacts' usage — a non-liquidatable points system does not satisfy this
- Contributors lose the incentive to publish valuable artifacts if recognition is the only reward
- The platform's promise of "creators own their artifacts and receive fair compensation" is broken

**Why rejected**: A non-liquidatable points system fails the Vision's explicit monetization requirement. AVUs are designed to be convertible to real value via oracle liquidation — they are not mere reputation points.

### Alternative 4: Prepaid Credits (Users Pre-Purchase Credits)

Users purchase credits (using Stripe) before using artifacts under IACP agreements. Credits are distributed directly to contributors without an intermediate abstract unit.

**Pros**:
- Real value flows immediately upon usage (credit → contributor)
- No oracle required for conversion
- Stripe handles the payment processing

**Cons**:
- Requires users to pre-purchase credits before using any IACP-governed artifact — creates friction that discourages usage
- Credit pricing must be set at the time of purchase; future changes in value distribution policies require complex credit migration
- Institutional distribution (multiple contributors sharing revenue) requires splitting credits in real time — fractional credit handling creates decimal arithmetic complexity
- Credits are effectively concrete currency pre-converted to platform units — the "no concrete currencies in distribution logic" invariant is violated in spirit

**Why rejected**: Pre-purchase friction contradicts the Vision's goal of frictionless knowledge access. The AVU model allows usage to occur freely and distribution to be computed post-hoc, with liquidation as an opt-in step — a significantly better user experience.

## Consequences

### Positive

- AVU accounting is pure integer arithmetic — no floating-point errors, no currency rounding issues, no FX management inside the distribution engine. The distribution logic is deterministic and auditable.
- The oracle-based liquidation boundary cleanly separates the distribution concern (how AVUs flow between contributors and institutions) from the payment concern (how AVUs become money) — each can evolve independently.
- The initial deployment can run without Stripe integration: AVU balances accumulate in user wallets, and liquidation can be enabled in a later release when compliance infrastructure is ready.
- Full auditability via AppendOnlyLog: every AVU transaction is a logged event, enabling complete financial audit trails for institutional governance reporting.

### Negative

- The oracle rate (AVU → currency) is set by platform governance, not by a market mechanism — this means AVU value can be unilaterally changed by the platform.
  - **Mitigation**: Oracle rate changes are governed by the platform governance process, are transparent (published as ecosystem events), and have a notice period. Long-term, the oracle rate can be made market-determined (e.g., based on actual liquidation demand).
- "Abstract value units" may be confusing to users who expect to see dollar amounts.
  - **Mitigation**: The UX layer translates AVU balances to approximate fiat equivalents using the current oracle rate, displayed as secondary information. The canonical balance remains AVUs.
- Liquidation requires Stripe Connect account setup by contributors — a non-trivial onboarding step.
  - **Mitigation**: Liquidation is opt-in. Contributors who do not complete Stripe onboarding accumulate AVU balances and can onboard later. AVU balances are never expired or forfeited.

### Neutral

- The AVU model means the platform does not directly handle money until liquidation is requested. This is a deliberate design choice that minimizes regulatory surface area at launch.
- The `DistributionPolicy` in governance contracts is institution-configured, not platform-configured. Platform operations set the oracle rate; institutions set the distribution split. This separation of concerns aligns governance responsibilities correctly.

## Implementation Notes

### AVU Invariant Enforcement

```sql
-- Trigger enforces I4 (Value Conservation) after each distribution event
CREATE FUNCTION dip.check_avu_conservation()
RETURNS trigger AS $$
DECLARE
  total_avu BIGINT;
  expected_avu BIGINT;
BEGIN
  SELECT SUM(avu_balance) INTO total_avu FROM dip.wallets;
  SELECT SUM(avu_amount) INTO expected_avu FROM dip.usage_event_avu_grants;
  IF total_avu <> expected_avu THEN
    RAISE EXCEPTION 'AVU conservation invariant violated: wallets=% expected=%', total_avu, expected_avu;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Treasury Oracle Rate Schema

```sql
CREATE TABLE dip.treasury_oracle_rates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency    CHAR(3) NOT NULL,          -- ISO 4217 currency code (USD, EUR, BRL)
  avu_to_unit NUMERIC(18, 8) NOT NULL,   -- 1 AVU = avu_to_unit of currency
  effective_from TIMESTAMPTZ NOT NULL,
  set_by      UUID NOT NULL,             -- platform governance actor
  notice_given_at TIMESTAMPTZ,
  CONSTRAINT positive_rate CHECK (avu_to_unit > 0)
);
```

## References

- Vision Document: Section 18 (Value Distribution); Section 10 (Inviolable: no platform token; no concrete currencies in distribution logic)
- `docs/architecture/domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md` — Treasury and AVU model design
- `docs/architecture/domains/digital-institutions-protocol/subdomains/iacp-engine.md` — UsageEvent (IACP Phase 4) generates AVUs
- ADR-010: Event signing — AVU distribution events are signed ecosystem events in AppendOnlyLog

## Derived Rules

- `architecture.mdc`: ARCH-003 — No concrete currencies in distribution logic (equivalent to cross-domain boundary enforcement: monetary concerns are separated from distribution concerns)
- `architecture.mdc`: ARCH-005 — Treasury is the single source of truth for AVU balances; no duplicate wallet tracking in other domains

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | AVU model satisfies all Vision invariants; oracle liquidation cleanly separates distribution logic from payment processing |
