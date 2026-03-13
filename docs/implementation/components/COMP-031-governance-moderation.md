# Governance & Moderation Implementation Record

> **Component ID**: COMP-031
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/governance-moderation/ARCHITECTURE.md](../../architecture/domains/governance-moderation/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Governance & Moderation is a **Supporting Subdomain** providing platform-level content policy enforcement and community proposals. `ModerationFlag` allows users/moderators to flag content violations. `ModerationAction` records platform moderation decisions. `PlatformPolicy` defines content rules. `CommunityProposal` enables community participation in platform governance (distinct from DIP institutional governance).

**Responsibilities**:
- Manage content moderation: `ModerationFlag`, `ModerationAction`
- Manage `PlatformPolicy` versioning
- Manage `CommunityProposal` for platform governance
- Publish `moderation.flag.created`, `moderation.action.taken`, `moderation.policy.updated` events

**Key Interfaces**:
- Internal API: moderation workflows, policy management

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

#### [COMP-031.1] Package setup and ModerationFlag aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | governance-moderation/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/governance-moderation` and implement `ModerationFlag` aggregate.

**Acceptance Criteria**:
- [ ] `packages/governance-moderation` fully scaffolded
- [ ] `ModerationFlag` aggregate: `id`, `reporter_id`, `content_type`, `content_id`, `violation_type (spam|harassment|misinformation|copyright|inappropriate)`, `description`, `status (pending|under_review|resolved|dismissed)`, `created_at`
- [ ] `ModerationFlag.startReview(moderatorId)` transitions to under_review
- [ ] Events: `moderation.flag.created`
- [ ] Unit tests: lifecycle transitions

**Files Created/Modified**:
- `packages/governance-moderation/src/domain/moderation-flag.ts`

---

#### [COMP-031.2] ModerationAction entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | governance-moderation/ARCHITECTURE.md |
| **Dependencies** | COMP-031.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ModerationAction` entity capturing moderation decisions.

**Acceptance Criteria**:
- [ ] `ModerationAction` entity: `id`, `flag_id`, `moderator_id`, `action_type (warn|content_removal|suspension|ban)`, `reason`, `duration (nullable, for suspension)`, `created_at`
- [ ] Actions applied via `ModerationActionService` that executes the action across relevant domain (calls Identity for bans, Communication for content removal)
- [ ] `moderation.action.taken` event published

**Files Created/Modified**:
- `packages/governance-moderation/src/domain/moderation-action.ts`
- `packages/governance-moderation/src/application/moderation-action-service.ts`

---

#### [COMP-031.3] PlatformPolicy entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | governance-moderation/ARCHITECTURE.md |
| **Dependencies** | COMP-031.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `PlatformPolicy` entity for versioned content rules.

**Acceptance Criteria**:
- [ ] `PlatformPolicy` entity: `id`, `policy_type (content|privacy|terms_of_service)`, `version`, `content_markdown`, `effective_from`, `is_active`
- [ ] Only one active policy per `policy_type`
- [ ] `moderation.policy.updated` event on new version activation
- [ ] Seed: initial content policy, privacy policy, ToS

**Files Created/Modified**:
- `packages/governance-moderation/src/domain/platform-policy.ts`

---

#### [COMP-031.4] CommunityProposal entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | governance-moderation/ARCHITECTURE.md |
| **Dependencies** | COMP-031.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `CommunityProposal` for platform governance proposals (feature requests, policy changes).

**Acceptance Criteria**:
- [ ] `CommunityProposal` entity: `id`, `author_id`, `title`, `description`, `proposal_type (feature_request|policy_change|content_rule)`, `status (draft|discussion|voting|accepted|rejected)`, `vote_count`, `discussion_thread_id`
- [ ] `CommunityProposal.openDiscussion()` creates Communication thread and transitions to discussion
- [ ] Simple majority vote with minimum 10 votes to advance

**Files Created/Modified**:
- `packages/governance-moderation/src/domain/community-proposal.ts`

---

#### [COMP-031.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | governance-moderation/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-031.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for governance and moderation entities.

**Acceptance Criteria**:
- [ ] Repositories for all entities with proper interfaces
- [ ] Migration: corresponding tables with audit indexes

**Files Created/Modified**:
- `packages/governance-moderation/src/infrastructure/repositories/`
- `packages/governance-moderation/src/infrastructure/migrations/001_governance_moderation.sql`

---

#### [COMP-031.6] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | governance-moderation/ARCHITECTURE.md |
| **Dependencies** | COMP-031.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: REST API for moderation and governance operations.

**Acceptance Criteria**:
- [ ] `POST /api/v1/moderation/flags` → report content
- [ ] `POST /internal/moderation/flags/{id}/review` (moderator) → start review
- [ ] `POST /internal/moderation/actions` (moderator) → take action
- [ ] `GET /api/v1/platform-policies/{type}` → current active policy
- [ ] `POST /api/v1/community-proposals` → create proposal
- [ ] `POST /api/v1/community-proposals/{id}/vote` → cast vote

**Files Created/Modified**:
- `packages/governance-moderation/src/api/routes/`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-002 Identity | Internal | ⬜ Not Started | Moderation actions (ban/suspension) |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event publishing |
| COMP-028 Communication | Internal | ⬜ Not Started | Discussion threads for proposals |

---

## References

### Architecture Documents

- [Governance & Moderation Domain Architecture](../../architecture/domains/governance-moderation/ARCHITECTURE.md)
