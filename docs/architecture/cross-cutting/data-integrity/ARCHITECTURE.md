# Data Integrity — Cross-Cutting Architecture

> **Document Type**: Cross-Cutting Concern Architecture Document
> **Parent**: [System Architecture](../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12
> **Owner**: Syntropy Core Team

---

## Purpose

Data integrity defines the immutability guarantees, data consistency policies, and data quality standards that apply across the Syntropy Ecosystem. The ecosystem provides three distinct, independent immutability layers — each with different trust properties and enforcement mechanisms. Together, they ensure that no action in the ecosystem can be retroactively falsified or erased from the record.

---

## Scope

This document applies to all data stores, the event log, and all integration points across the 12 domains. It specifically governs the three immutability layers and their coordination.

---

## Principles

| Principle | Description |
|-----------|-------------|
| **Three-layer immutability** | Three independent and complementary immutability systems; no single point of failure |
| **No retroactive modification** | No event, identity record, or governance execution may be modified after creation |
| **Pseudonymization over deletion** | When data must be removed (GDPR/LGPD), user identity is pseudonymized; the structural record is preserved |
| **Eventual consistency is explicit** | Domain read models (Portfolio, DiscoveryIndex) are explicitly eventually consistent; the log is immediately consistent |
| **Idempotent event processing** | All event handlers must be idempotent — processing the same event twice must produce the same result |

---

## Three Immutability Layers

### Layer 1 — Nostr-Anchored DIP Protocol Events

**What**: Identity records for DIP Artifacts and Governance execution events (LegitimacyChain entries)

**Trust model**: Externally verifiable without trusting the platform. Anyone with access to Nostr relays can verify the event. The platform is not the authority — the relay network is.

**Mechanism**:
- Actor generates a Nostr event signed with their private key (secp256k1)
- Event is published to Nostr relays
- Platform records the Nostr event_id in the IdentityRecord or LegitimacyChainEntry
- Any verifier can fetch the Nostr event by event_id and verify the signature

**Applies to**:
- `IdentityRecord` (DIP Artifact Registry) — Invariant I2
- `LegitimacyChainEntry` (DIP Institutional Governance) — Invariant I7
- `UsageAgreementEvent` (DIP IACP Engine)
- `UsageEvent` (DIP IACP Engine)

**Violation detection**: If a DIP record exists in the database but cannot be verified on Nostr relays, it is considered suspect. The platform must alert on this discrepancy.

### Layer 2 — Hash-Chained AppendOnlyLog

**What**: All EcosystemEvents emitted by any domain

**Trust model**: Internally verifiable by the platform and any holder of the log. Tamper-evident: any modification to any entry breaks the hash chain and is immediately detectable.

**Mechanism**:
- Each LogEntry's hash is computed as `SHA-256(event_payload ∥ previous_hash ∥ service_signature ∥ logged_at)`
- The previous_hash of entry N is the hash of entry N-1
- Any modification to a historical entry changes its hash, breaking the chain from that point forward
- Hash chain integrity check runs as a background job on a scheduled basis and on-demand

**Applies to**:
- All LogEntries in `platform_core.append_only_log`

**Violation detection**: Scheduled hash chain verifier runs every 5 minutes. Any mismatch triggers a Critical alert (see Observability architecture). Log writes are halted until the cause is investigated.

### Layer 3 — Soft-Delete with Temporal Records

**What**: Domain entity mutations (edits, deletions) in all domain databases

**Trust model**: Platform-internal. Subject to GDPR/LGPD compliance requirements.

**Mechanism**:
- Entities are never hard-deleted unless explicitly required by compliance (then PII is anonymized, structural record retained)
- `deleted_at` timestamps are used for soft deletion
- Compliance erasure replaces PII fields with hashed identifiers while preserving record structure
- Published entities (artifacts, articles, reviews) are immutable after publication — no edit operations permitted

**Applies to**:
- All domain entity tables
- Specific immutability enforcement at: Fragment (after publication), ArticleVersion (after submission), Review (after submission), IACP terms (after Agreement), GovernanceContract (after enactment)

---

## Data Consistency Policies

### Consistency Levels by Entity Type

| Entity Type | Consistency Level | Lag Tolerance | Rationale |
|-------------|------------------|---------------|-----------|
| AppendOnlyLog | **Strong** | 0ms | Immutable log is the source of truth |
| DIP Entities (Artifact, Institution, Project) | **Strong** | 0ms | Financial and legal implications |
| Portfolio (Platform Core) | **Eventual** | < 5s | Derived from log; rebuilding from log is the recovery path |
| SearchIndex (Platform Core) | **Eventual** | < 30s | Search results can be slightly stale |
| DiscoveryIndex (Hub) | **Eventual** | < 60s | Prominence scores are approximations |
| InstitutionProfile (Hub read model) | **Eventual** | < 10s | Read-only projection of DIP data |

### Domain Entity Immutability Rules

| Entity | Immutable After | Enforcement |
|--------|-----------------|-------------|
| `IdentityRecord` | Creation | Database trigger + application-level guard |
| `LegitimacyChainEntry` | Creation | Database trigger + application-level guard |
| `LogEntry` | Creation | Append-only table (no UPDATE/DELETE permissions on the table) |
| `Fragment` (artifact_content, published_artifact_id) | Fragment status = Published | Application-level guard in Fragment aggregate |
| `ArticleVersion` (myst_content, embedded_artifacts) | ArticleVersion.is_published = true | Application-level guard |
| `Review` | Submission | Application-level guard; no admin override |
| `EventSchemaVersion` | Publication | Application-level guard |
| `ContractEvaluationHistory` | Each entry on creation | Append-only table |

---

## Data Quality Standards

### Schema Validation

All data entering a domain must be validated against:
1. **API boundary validation** (Pydantic/Zod schemas for all request/response types)
2. **Database constraints** (NOT NULL, UNIQUE, CHECK constraints at DB level)
3. **Domain aggregate invariants** (business rule enforcement in aggregate root methods)

### Cross-Domain Reference Integrity

Cross-domain references (e.g., Learn's `dip_reference_project_id`, Labs' `dip_project_id`) are validated at the application level. The event log provides eventual consistency for detecting broken references.

### Data Retention Policies

See [Security Architecture — Data Retention Policies](../security/ARCHITECTURE.md).

---

## Monitoring

### Hash Chain Integrity Monitor

- **Frequency**: Every 5 minutes (scheduled job)
- **Action on mismatch**: Critical alert; log write halt; incident page
- **Recovery**: Investigate from last known-good hash; contact on-call

### Nostr Anchor Verification Monitor

- **Frequency**: Spot-check daily (sample 1% of IdentityRecords)
- **Action on failure**: Alert; investigation; mark affected records as "unverified"

---

## Related Documents

| Document | Relationship |
|----------|-------------|
| [Event Bus & Audit](../../domains/platform-core/subdomains/event-bus-audit.md) | Layer 2 (hash-chained AppendOnlyLog) implementation |
| [Artifact Registry](../../domains/digital-institutions-protocol/subdomains/artifact-registry.md) | Layer 1 (Nostr anchoring) implementation |
| [Institutional Governance](../../domains/digital-institutions-protocol/subdomains/institutional-governance.md) | Layer 1 (LegitimacyChain anchoring) implementation |
| [Security](../security/ARCHITECTURE.md) | Data classification, retention policies, GDPR compliance |
| [Observability](../observability/ARCHITECTURE.md) | Hash chain monitoring, anchor verification |

## Key Decisions

| ADR | Summary |
|-----|---------|
| ADR-003 *(Prompt 01-C)* | Nostr relay anchoring for DIP protocol events |
| ADR-010 *(Prompt 01-C)* | Hash-chained AppendOnlyLog; two-level signing hierarchy |
