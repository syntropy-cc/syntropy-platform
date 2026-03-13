# Sponsorship Implementation Record

> **Component ID**: COMP-027
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/sponsorship/ARCHITECTURE.md](../../architecture/domains/sponsorship/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Sponsorship is a **Supporting Subdomain** managing financial support flows: sponsors fund creators and institutions, and the system tracks impact metrics. Stripe payments are wrapped by `StripePaymentAdapter` (ACL). Sponsor contributions create `Treasury` credits in the DIP Value Distribution module (via event). Impact metrics derive from Platform Core events (contribution counts, artifact publications, learner completions).

**Responsibilities**:
- Manage `Sponsorship` relationships between sponsors and creators/institutions
- Process payments via `StripePaymentAdapter` (ACL)
- Track `ImpactMetric` per sponsorship and per creator/institution
- Publish `sponsorship.payment.completed`, `sponsorship.cancelled` events

**Key Interfaces**:
- Public API: `/api/v1/sponsorships` — sponsor-facing creation and management
- Internal API: `/internal/sponsorship/` — impact queries

### Implementation Scope

**In Scope**:
- `Sponsorship`, `ImpactMetric`, `SponsorshipTier` entities
- `StripePaymentAdapter` (ACL)
- `ImpactMetricAggregator` domain service
- Repository + API
- Stripe webhook consumer for payment confirmation

**Out of Scope**:
- AVU treasury operations (DIP COMP-008)
- Creator pricing strategy (creator-owned)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 7 |
| **Total** | **7** |

**Component Coverage**: 0%

### Item List

#### [COMP-027.1] Package setup and Sponsorship aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/sponsorship` and implement `Sponsorship` aggregate and `SponsorshipTier` entity.

**Acceptance Criteria**:
- [ ] `packages/sponsorship` fully scaffolded
- [ ] `Sponsorship` aggregate: `id`, `sponsor_id`, `beneficiary_id`, `beneficiary_type (creator|institution)`, `tier_id`, `amount_usd`, `status (pending|active|paused|cancelled)`, `stripe_subscription_id`, `started_at`, `cancelled_at`
- [ ] `SponsorshipTier` entity: `id`, `name`, `amount_usd`, `benefits (JSONB)`, `is_active`
- [ ] Events: `sponsorship.created`, `sponsorship.cancelled`
- [ ] Unit tests: state transitions

**Files Created/Modified**:
- `packages/sponsorship/src/domain/sponsorship.ts`
- `packages/sponsorship/src/domain/sponsorship-tier.ts`

---

#### [COMP-027.2] StripePaymentAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-027.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `StripePaymentAdapter` ACL wrapping Stripe subscription and payment APIs.

**Acceptance Criteria**:
- [ ] `StripePaymentAdapter` implements `PaymentGateway` interface
- [ ] `createSubscription(sponsorId, tierId)` creates Stripe subscription
- [ ] `cancelSubscription(subscriptionId)` cancels Stripe subscription
- [ ] `handleWebhook(payload)` processes `payment_intent.succeeded`, `customer.subscription.deleted` events
- [ ] Stripe vocabulary does not leak into domain
- [ ] Webhook signature validation (`stripe-signature` header)
- [ ] Integration test with mocked Stripe SDK

**Files Created/Modified**:
- `packages/sponsorship/src/domain/payment-gateway.ts` (interface)
- `packages/sponsorship/src/infrastructure/stripe-payment-adapter.ts`

---

#### [COMP-027.3] ImpactMetric entity and aggregator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-027.1, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ImpactMetric` entity and `ImpactMetricAggregator` that builds metrics from ecosystem events.

**Acceptance Criteria**:
- [ ] `ImpactMetric` entity: `beneficiary_id`, `period`, `artifact_publications`, `contributions_integrated`, `learner_completions`, `xp_awarded`, `avu_earned`
- [ ] `ImpactMetricAggregator` subscribes to Platform Core events to compute metrics
- [ ] Monthly metric snapshots stored
- [ ] Metrics surfaced to sponsors via API

**Files Created/Modified**:
- `packages/sponsorship/src/domain/impact-metric.ts`
- `packages/sponsorship/src/application/impact-metric-aggregator.ts`

---

#### [COMP-027.4] Payment processing use case

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-027.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement payment creation and webhook handling use cases.

**Acceptance Criteria**:
- [ ] `CreateSponsorshipUseCase.execute()` creates Stripe subscription, creates Sponsorship in pending state
- [ ] `ConfirmPaymentUseCase.execute(webhookPayload)` transitions Sponsorship to active on Stripe confirmation
- [ ] `sponsorship.payment.completed` event → DIP Treasury credits sponsor contribution as AVU
- [ ] Idempotent: processing same webhook twice is safe

**Files Created/Modified**:
- `packages/sponsorship/src/application/create-sponsorship-use-case.ts`
- `packages/sponsorship/src/application/confirm-payment-use-case.ts`

---

#### [COMP-027.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | sponsorship/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-027.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for sponsorship entities.

**Acceptance Criteria**:
- [ ] `SponsorshipRepository`, `ImpactMetricRepository` interfaces and implementations
- [ ] Migration: `sponsorships`, `sponsorship_tiers`, `impact_metrics` tables

**Files Created/Modified**:
- `packages/sponsorship/src/infrastructure/repositories/`
- `packages/sponsorship/src/infrastructure/migrations/001_sponsorship.sql`

---

#### [COMP-027.6] Public and internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-027.4, COMP-027.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Public-facing and internal REST API for sponsorships.

**Acceptance Criteria**:
- [ ] `GET /api/v1/sponsorships/tiers` → available tiers
- [ ] `POST /api/v1/sponsorships` → create sponsorship (authenticated sponsor)
- [ ] `DELETE /api/v1/sponsorships/{id}` → cancel
- [ ] `GET /internal/sponsorship/{beneficiary_id}/impact` → impact metrics

**Files Created/Modified**:
- `packages/sponsorship/src/api/routes/`

---

#### [COMP-027.7] Stripe webhook consumer

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | sponsorship/ARCHITECTURE.md |
| **Dependencies** | COMP-027.4 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Stripe webhook endpoint and consumer for payment events.

**Acceptance Criteria**:
- [ ] `POST /api/v1/sponsorships/webhook` → Stripe webhook endpoint
- [ ] Validates Stripe-Signature header
- [ ] Processes: `payment_intent.succeeded`, `customer.subscription.deleted`

**Files Created/Modified**:
- `packages/sponsorship/src/api/routes/webhook.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-002 Identity | Internal | ⬜ Not Started | Sponsor/beneficiary identity |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Impact metric events |
| Stripe | External | ✅ Available | Payment processing |

---

## References

### Architecture Documents

- [Sponsorship Domain Architecture](../../architecture/domains/sponsorship/ARCHITECTURE.md)
