# Platform Core — Portfolio Aggregation Implementation Record

> **Component ID**: COMP-010
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/platform-core/subdomains/portfolio-aggregation.md](../../architecture/domains/platform-core/subdomains/portfolio-aggregation.md)
> **Stage Assignment**: S4 — Platform Core Aggregation
> **Status**: 🔵 In Progress (S23 done: 010.4–010.7)
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Portfolio Aggregation builds and maintains each user's verifiable dynamic portfolio by consuming the AppendOnlyLog event stream. Every action recorded in the ecosystem automatically enriches the portfolio — XP, achievements, skills, reputation — without any manual curation. The portfolio is an event-sourced projection: it can be fully rebuilt from the AppendOnlyLog at any time via `PortfolioRebuildService`.

**Responsibilities**:
- Aggregate `Portfolio` per user from ecosystem events (XP rules, achievement conditions, skill signals)
- Evaluate `XPRule` against incoming events via `XPEvaluationService`
- Evaluate `AchievementCondition` after each portfolio update via `AchievementEvaluationService`
- Derive `SkillRecord` from signals via `SkillDerivationService`
- Compute `ReputationScore [0.0–1.0]` via `ReputationComputationService`
- Rebuild portfolio from scratch via `PortfolioRebuildService` (event sourcing)
- Publish `platform_core.achievement.unlocked`, `platform_core.collectible.awarded`, `platform_core.portfolio.updated`

**Key Interfaces**:
- Internal API: `GET /internal/platform-core/portfolio/{user_id}`, `/skills`, `/reputation`
- Event stream: Kafka consumer group `portfolio-agg` on all domain topics

### Implementation Scope

**In Scope**:
- `Portfolio` aggregate, `Achievement`, `CollectibleInstance`, `SkillRecord` entities
- `XPTotal`, `ReputationScore`, `SkillLevel` value objects
- `XPEvaluationService`, `AchievementEvaluationService`, `SkillDerivationService`, `ReputationComputationService` domain services
- `PortfolioRebuildService` (replay from AppendOnlyLog)
- Kafka consumer + repository + API

**Out of Scope**:
- `CollectibleDefinition` templates (owned by Learn, COMP-016)
- Search indexing of portfolio data (COMP-011)
- AI context model building from portfolio (COMP-012)

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

#### [COMP-010.1] Portfolio aggregate and value objects

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-009.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Portfolio` aggregate, `Achievement`, `CollectibleInstance`, `SkillRecord` entities, and `XPTotal`, `ReputationScore`, `SkillLevel` value objects.

**Acceptance Criteria**:
- [ ] `Portfolio` aggregate: `user_id`, `xp_total (XPTotal ≥ 0)`, `reputation_score (ReputationScore [0.0–1.0])`, `skill_records[]`, `achievements[]`, `collectible_instances[]`
- [ ] `Achievement` entity: `achievement_type`, `unlocked_at` — can only be unlocked once (invariant)
- [ ] `CollectibleInstance` entity: `definition_id`, `awarded_at` — permanent once awarded
- [ ] `SkillRecord` entity: `skill_name`, `level (SkillLevel)`, `evidence_event_ids[]`
- [ ] `XPTotal.add(delta)` validates delta > 0
- [ ] `Portfolio.unlockAchievement(type)` throws if already unlocked
- [ ] Unit tests: achievement double-unlock prevention, XP accumulation

**Files Created/Modified**:
- `packages/platform-core/src/domain/portfolio-aggregation/portfolio.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/achievement.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/collectible-instance.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/skill-record.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/value-objects/`
- `packages/platform-core/tests/unit/portfolio-aggregation/portfolio.test.ts`

---

#### [COMP-010.2] XPEvaluationService and XP rules

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-010.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `XPEvaluationService` that maps ecosystem events to XP deltas via configurable `XPRule` definitions.

**Acceptance Criteria**:
- [ ] `XPRule` definition: `event_type`, `conditions`, `xp_delta`
- [ ] `XPEvaluationService.evaluate(event, xpRules)` returns `XPDelta | null`
- [ ] Initial XP rules defined for: `learn.fragment.artifact_published` (+50 XP), `hub.contribution.integrated` (+75 XP), `labs.review.submitted` (+30 XP), `learn.track.completed` (+200 XP), `labs.article.published` (+150 XP)
- [ ] Rules are configurable (stored in database, not hardcoded)
- [ ] Unit tests: all initial rules produce expected XP

**Files Created/Modified**:
- `packages/platform-core/src/domain/portfolio-aggregation/xp-rule.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/services/xp-evaluation-service.ts`
- `packages/platform-core/tests/unit/portfolio-aggregation/xp-evaluation-service.test.ts`

---

#### [COMP-010.3] AchievementEvaluationService and SkillDerivationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-010.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AchievementEvaluationService` and `SkillDerivationService`. Achievements are evaluated after every portfolio update; skills are derived from accumulated signal events.

**Acceptance Criteria**:
- [ ] `AchievementEvaluationService.evaluate(portfolio, event)` checks all `AchievementCondition` definitions; unlocks if condition met and not already unlocked
- [ ] Initial achievement conditions: "First Fragment Published", "First Contribution Integrated", "10 Contributions", "First Article Published", "Mentor"
- [ ] `SkillDerivationService.derive(skillSignals)` aggregates signals → `SkillLevel` (Beginner/Intermediate/Advanced/Expert)
- [ ] Unit tests: achievement unlock conditions, skill level derivation thresholds

**Files Created/Modified**:
- `packages/platform-core/src/domain/portfolio-aggregation/services/achievement-evaluation-service.ts`
- `packages/platform-core/src/domain/portfolio-aggregation/services/skill-derivation-service.ts`
- `packages/platform-core/tests/unit/portfolio-aggregation/achievement-evaluation-service.test.ts`

---

#### [COMP-010.4] ReputationComputationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-010.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ReputationComputationService` that computes `ReputationScore [0.0–1.0]` from weighted reputation signals (review acceptance rate, contribution quality, peer feedback).

**Acceptance Criteria**:
- [ ] `ReputationComputationService.compute(reputationSignals)` returns `ReputationScore`
- [ ] Score bounded to [0.0, 1.0] — normalization applied
- [ ] Weighted formula: contributions (40%), review quality (35%), peer feedback (25%)
- [ ] Score decays if no activity for 180+ days (exponential decay factor)
- [ ] Used by Labs Open Peer Review (COMP-025) to determine review visibility
- [ ] Unit tests: boundary values, decay, weighted computation

**Files Created/Modified**:
- `packages/platform-core/src/domain/portfolio-aggregation/services/reputation-computation-service.ts`
- `packages/platform-core/tests/unit/portfolio-aggregation/reputation-computation-service.test.ts`

---

#### [COMP-010.5] PortfolioRebuildService (event sourcing replay)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-010.2, COMP-010.3, COMP-009.6 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `PortfolioRebuildService` that replays the entire AppendOnlyLog for a given user to reconstruct their portfolio from scratch. Used for recovery and consistency verification.

**Acceptance Criteria**:
- [ ] `PortfolioRebuildService.rebuild(userId)` replays all log entries for user, recomputes portfolio from scratch
- [ ] Idempotent: rebuilding twice produces same result
- [ ] Used in background job for periodic consistency checks
- [ ] Performance: handles users with 10,000+ events within 60 seconds
- [ ] Integration test: full portfolio rebuild from seed events

**Files Created/Modified**:
- `packages/platform-core/src/domain/portfolio-aggregation/services/portfolio-rebuild-service.ts`
- `packages/platform-core/tests/integration/portfolio-aggregation/portfolio-rebuild.test.ts`

---

#### [COMP-010.6] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | portfolio-aggregation.md, ADR-004 |
| **Dependencies** | COMP-010.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for portfolios. Eventual consistency target: < 5s from event to portfolio update.

**Acceptance Criteria**:
- [ ] `PortfolioRepository` interface: `findByUserId`, `save`, `findAchievements`, `findSkills`
- [ ] Migration: `portfolios`, `achievements`, `collectible_instances`, `skill_records`, `xp_rules`, `achievement_conditions` tables
- [ ] Portfolio updates use optimistic locking (version field) to prevent race conditions from concurrent event processing
- [ ] Integration tests

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/repositories/postgres-portfolio-repository.ts`
- `packages/platform-core/src/infrastructure/migrations/003_portfolio_aggregation.sql`

---

#### [COMP-010.7] Kafka consumer (portfolio event processor)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | portfolio-aggregation.md |
| **Dependencies** | COMP-010.2, COMP-010.6, COMP-009.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Kafka consumer group `portfolio-agg` that subscribes to all domain event topics and applies XP, achievement, and skill evaluations.

**Acceptance Criteria**:
- [ ] Consumer group: `portfolio-agg`
- [ ] Topics: `learn.events`, `hub.events`, `labs.events`, `dip.events`
- [ ] Per event: evaluate XP rules, evaluate achievements, derive skills, update reputation signals
- [ ] Idempotent processing using event `id` deduplication
- [ ] `platform_core.portfolio.updated` event published after each update
- [ ] `platform_core.achievement.unlocked` published on unlock
- [ ] DLQ for failed events

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/consumers/portfolio-event-consumer.ts`

---

#### [COMP-010.8] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | platform-core/ARCHITECTURE.md |
| **Dependencies** | COMP-010.6 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Internal REST API for portfolio data access consumed by AI Agents, Labs Peer Review, and frontend.

**Acceptance Criteria**:
- [ ] `GET /internal/platform-core/portfolio/{user_id}` → full portfolio (p99 < 200ms)
- [ ] `GET /internal/platform-core/portfolio/{user_id}/skills` → skill records
- [ ] `GET /internal/platform-core/portfolio/{user_id}/reputation` → reputation score
- [ ] `GET /internal/platform-core/portfolio/{user_id}/achievements` → unlocked achievements

**Files Created/Modified**:
- `packages/platform-core/src/api/routes/portfolio.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | AppendOnlyLog stream |
| PostgreSQL | External | ✅ Available | Portfolio persistence |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-011 Search & Recommendation | Reads reputation for ranking | Impacts recommendation quality |
| COMP-012 AI Agents Orchestration | Portfolio in UserContextModel | Blocks AI personalization |
| COMP-025 Labs Open Peer Review | Reputation for review visibility | Blocks review filtering |

---

## Implementation Log

### 2026-03-14 — S23 (COMP-010.4–010.7)

**COMP-010.4** — SkillProfile computation (per IMPLEMENTATION-PLAN Section 7)
- `skill-taxonomy.ts`: levelFromSignalCount, normalizeSkillName, SIGNAL_COUNT_TO_LEVEL.
- `skill-profile.ts`: SkillProfile, createSkillProfile.
- `services/skill-profile-service.ts`: compute(userId, events), SkillProfileService; extracts tags/skills from learn.fragment.artifact_published and hub.contribution.integrated.
- Unit tests: skill-profile-service.test.ts.

**COMP-010.5** — ReputationScore calculation
- `reputation-signals.ts`: ReputationSignals, REPUTATION_WEIGHTS, DECAY_AFTER_DAYS.
- `services/reputation-service.ts`: calculate(signals), time decay after 180 days.
- Unit tests: reputation-service.test.ts.

**COMP-010.6** — PortfolioEventConsumer (Kafka)
- `portfolio-update.ts`: applyEvent(portfolio, event) — XP, achievements, skills merge, reputation.
- `infrastructure/consumers/portfolio-event-consumer.ts`: subscribes to learn/hub/labs/dip.events, parses eventType/payload, applies event and saves.
- Unit tests: portfolio-update.test.ts.

**COMP-010.7** — PortfolioRepository (Postgres)
- Migration: supabase/migrations/20260314220000_platform_core_portfolio_aggregation.sql (portfolios, achievements, skill_records).
- `ports/portfolio-repository.ts`: PortfolioRepository interface.
- `infrastructure/repositories/postgres-portfolio-repository.ts`: PostgresPortfolioRepository, optimistic locking (version).
- Portfolio.create(params), Portfolio.version for persistence.
- Integration test: postgres-portfolio-repository.test.ts (mock client).

### 2026-03-14 — S22 (COMP-010.1–010.3)

**COMP-010.1** — Portfolio aggregate and value objects
- `packages/platform-core/src/domain/portfolio-aggregation/`: Portfolio, XPTotal, ReputationScore, SkillLevel, Achievement, SkillRecord. `Portfolio.fromEvents(userId, events, xpWeightByEventType)` and `Portfolio.empty(userId)`. `unlockAchievement(type)` throws if already unlocked; `addXp(delta)`. Unit tests in `portfolio.test.ts`.

**COMP-010.2** — XP calculation engine
- `xp-weights.ts`: DEFAULT_XP_WEIGHTS (artifact_published 50, contribution_merged 30, learn.*, hub.*, labs.*), LEVEL_THRESHOLDS, levelFromXp(). `xp-calculator.ts`: calculate(events, weights), XPCalculator class. Unit tests in `xp-calculator.test.ts`.

**COMP-010.3** — AchievementService
- `achievement-definitions.ts`: DEFAULT_ACHIEVEMENT_DEFINITIONS (first_fragment, first_contribution, ten_contributions, first_article, mentor). `achievement-service.ts`: evaluate(portfolio, event, definitions), AchievementService class; EVENT_TO_CONDITION maps event types to condition types; contributions_count uses payload.contributionCount. `events/achievement-unlocked.ts`: ACHIEVEMENT_UNLOCKED, createAchievementUnlockedEvent. Unit tests in `achievement-service.test.ts`.

---

## References

### Architecture Documents

- [Platform Core Portfolio Aggregation Subdomain](../../architecture/domains/platform-core/subdomains/portfolio-aggregation.md)

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-009](./COMP-009-event-bus-audit.md) | Provides AppendOnlyLog event stream |
| [COMP-011](./COMP-011-search-recommendation.md) | Sibling Platform Core subdomain |
| [COMP-012](./COMP-012-ai-agents-orchestration.md) | Consumes portfolio for UserContextModel |
