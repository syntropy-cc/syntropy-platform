# Data Integrity Cross-Cutting Implementation Record

> **Component ID**: COMP-039
> **Architecture Reference**: [cross-cutting/data-integrity/ARCHITECTURE.md](../../architecture/cross-cutting/data-integrity/ARCHITECTURE.md)
> **Stage Assignment**: S13 — Cross-Cutting Concerns
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Data Integrity cross-cutting concerns enforce the three-layer immutability strategy across the platform: (1) Nostr anchoring via `NostrAnchor` utility, (2) hash-chained `AppendOnlyLog` (COMP-009), and (3) soft-delete with temporal records for all audit-required data. This component provides the shared library code that makes immutability patterns reusable across DIP, Platform Core, and other domains.

**Responsibilities**:
- `NostrAnchor` utility for publishing hash-signed events to Nostr relays (used by DIP and Governance)
- `AppendOnlyLog` abstract base class (concrete instances in COMP-009)
- `SoftDeletable` base class with `deleted_at` temporal records
- Database migration pattern for audit columns (`created_at`, `updated_at`, `deleted_at`)
- Data retention policy enforcement (CON-005)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 2 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 3 |
| **Total** | **5** |

**Component Coverage**: 40%

### Item List

#### [COMP-039.1] NostrAnchor utility library

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/data-integrity/ARCHITECTURE.md, ADR-003 |
| **Dependencies** | COMP-001 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `NostrAnchor` utility for publishing verifiable hash commitments to Nostr relays (ADR-003).

**Acceptance Criteria**:
- [ ] `NostrAnchor.publish(content: string, privateKey: Buffer): Promise<NostrEventId>` — signs and publishes to configured Nostr relay(s)
- [ ] `NostrAnchor.verify(eventId: NostrEventId, content: string): Promise<boolean>` — verifies content matches anchored hash
- [ ] `computeContentHash(content: string): string` — SHA-256 hex digest
- [ ] Configurable relay list via `NOSTR_RELAY_URLS` environment variable
- [ ] Retry with exponential backoff (3 attempts) on relay connection failure
- [ ] Dev mode: optional mock relay for testing (no real Nostr required)
- [ ] Unit tests covering sign, verify, and relay failure scenarios

**Files Created/Modified**:
- `packages/platform-core/src/data-integrity/nostr-anchor.ts`
- `packages/platform-core/src/data-integrity/nostr-anchor.test.ts`

---

#### [COMP-039.2] AppendOnlyLog abstract base

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/data-integrity/ARCHITECTURE.md, COMP-009 |
| **Dependencies** | COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Define the `AppendOnlyLog` abstract base with hash-chain verification, used by concrete log implementations in COMP-009.

**Acceptance Criteria**:
- [ ] `AppendOnlyLog<T>` generic abstract class
- [ ] `append(entry: T): Promise<AppendOnlyLogEntry<T>>` — persists entry, computes `previous_hash || sha256(payload)` hash
- [ ] `verify(from: number, to: number): Promise<VerificationResult>` — verifies hash chain integrity for a range
- [ ] `AppendOnlyLogEntry<T>`: `{ sequence: number, payload: T, hash: string, previous_hash: string, timestamp: Date }`
- [ ] Cannot delete or update entries (TypeScript `readonly` + DB constraint `DELETE DISABLE`)
- [ ] Tests: chain integrity, tamper detection

**Files Created/Modified**:
- `packages/platform-core/src/data-integrity/append-only-log.ts`

---

#### [COMP-039.3] SoftDeletable pattern

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | cross-cutting/data-integrity/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement the soft-delete pattern base for all domain entities that require data retention compliance.

**Acceptance Criteria**:
- [ ] `SoftDeletable` mixin/base adds: `deleted_at: DateTime | null`, `deleted_by: ActorId | null`
- [ ] `softDelete(actorId)` method sets `deleted_at` and publishes `EntityDeleted` event
- [ ] Database query filters automatically exclude `deleted_at IS NOT NULL` entries via default scope
- [ ] `includeDeleted()` query option for admin queries
- [ ] Cascade soft-delete: when parent is deleted, child `deleted_at` set to parent's timestamp
- [ ] Applied to: User, Fragment, Issue, Contribution, Article, Experiment

**Files Created/Modified**:
- `packages/platform-core/src/data-integrity/soft-deletable.ts`
- `packages/platform-core/src/data-integrity/soft-deletable.test.ts`

---

#### [COMP-039.4] Temporal record audit columns migration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | cross-cutting/data-integrity/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Define and document the standard audit column pattern applied via database migrations.

**Acceptance Criteria**:
- [ ] All domain tables include: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `created_by UUID NOT NULL`
- [ ] Trigger created via migration for `updated_at` auto-update
- [ ] `SoftDeletable` tables also include: `deleted_at TIMESTAMPTZ`, `deleted_by UUID`
- [ ] Drizzle ORM migration template in `packages/platform-core` for reuse
- [ ] Documentation: data retention policy enforcement (CON-005)

**Files Created/Modified**:
- `packages/platform-core/src/infrastructure/migrations/audit-columns.sql`
- `packages/platform-core/src/data-integrity/audit-columns.ts` (Drizzle schema extension)

---

#### [COMP-039.5] Data retention policy enforcement

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/data-integrity/ARCHITECTURE.md, CON-005 |
| **Dependencies** | COMP-034, COMP-039.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement data retention policy enforcement for personal data (right to deletion, GDPR-style).

**Acceptance Criteria**:
- [ ] `DataRetentionService` with `purgeUserData(userId)` for right-to-deletion
- [ ] Purge cascades: soft-delete → hard-delete after retention period
- [ ] Retention periods enforced:
  - Personal data (email, name): 7 years after account deletion
  - Session logs: 90 days
  - Moderation logs: 3 years
- [ ] Scheduled job (daily) in COMP-034: `DataRetentionPurgeJob`
- [ ] Audit log of all purge operations (immutable)

**Files Created/Modified**:
- `packages/platform-core/src/data-integrity/data-retention-service.ts`
- `apps/workers/src/jobs/data-retention-purge.ts`

---

## Implementation Log

### 2026-03-13 — S2 Stage (COMP-039.1, COMP-039.3 per Implementation Plan)

- **SoftDeletable**: Implemented `SoftDeletableMixin`, `SoftDeletable` interface, and `WithDeletedOption` in `packages/platform-core/src/data-integrity/soft-deletable.ts`. Unit tests verify `deleted_at`, `softDelete()`, and idempotence.
- **PostgreSQL append_only_log**: Added migration `supabase/migrations/20260313160000_platform_core_append_only_log.sql` (table with id, actor_id, event_type, payload, schema_version, correlation_id, causation_id, recorded_at; UPDATE/DELETE revoked). Added `appendToLog()` and `AppendOnlyLogEntry`/`AppendOnlyLogClient` in `packages/platform-core/src/data-integrity/append-only-log.ts`. Unit tests verify insert params shape.

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package setup |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | AppendOnlyLog concrete implementations |
| COMP-034 Background Services | Internal | ⬜ Not Started | Retention purge job |

---

## References

### Architecture Documents

- [Data Integrity Cross-Cutting Architecture](../../architecture/cross-cutting/data-integrity/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-003](../../architecture/decisions/ADR-003-nostr-identity-anchoring.md) | Nostr Identity Anchoring | NostrAnchor implementation |
