# ADR-010: Two-Level Event Signing Hierarchy and Immutability Architecture

## Status

Accepted

## Date

2026-03-12

## Context

The Syntropy Ecosystem has two fundamentally different classes of events that require different immutability and verifiability guarantees:

**Class 1: DIP Protocol Events**
These events record the execution of legally and economically significant actions: artifact identity anchoring (`IdentityRecord`), IACP phase transitions (UsageAgreementEvent, UsageEvent), governance contract executions (LegitimacyChain entries), and treasury distributions. These events must be:
- **Externally verifiable**: A third party (a court, a funding agency, a research institution) must be able to verify that a specific event occurred at a specific time, involving a specific creator's key — **without contacting Syntropy's servers**
- **Actor-signed**: The signature must be produced by the artifact creator's private key, not by a platform service key — this is what makes authorship claims non-repudiable
- **Censorship-resistant**: Syntropy cannot unilaterally delete or modify these records, even if compelled

**Class 2: Ecosystem Events**
These events record platform activity: Fragment completed, Contribution accepted, Course enrolled, Review submitted, Issue opened, etc. These events drive the Portfolio Aggregation, Search & Recommendation, and gamification subsystems. They require:
- **Tamper-evidence**: The platform must be able to prove internally that the event log has not been modified since events were recorded
- **Causation tracking**: Events must be linkable to the event that caused them (correlation_id, causation_id chains)
- **High-throughput write performance**: Hundreds of ecosystem events may be recorded per second at community scale
- **Service-level accountability**: Proving which platform service recorded an event is sufficient — individual user key signing is not required

The fundamental tension: **actor-signed events (Class 1) require user cryptographic keys, which adds friction and key management complexity. Service-signed events (Class 2) are operationally simpler but cannot provide external verifiability.**

Additionally, the Event Schema Registry must govern what event types exist and what their schemas look like — serving as the inter-domain contract (Published Language, per Context Map) that all 12 domains must speak.

## Decision

We will implement a **two-level event signing hierarchy** with distinct signing mechanisms per event class, combined with a **versioned Event Schema Registry** as the Published Language for all inter-domain communication.

### Level 1: DIP Protocol Events (Actor-Signed, Nostr-Anchored)

DIP protocol events (`IdentityRecord`, `UsageAgreementEvent`, `UsageEvent`, `LegitimacyChain` execution entries) are:

1. **Signed by the actor's Nostr private key** (secp256k1):
   ```
   event_id = SHA256(serialized_event)
   signature = Sign_actor_private_key(event_id)
   nostr_event = { id: event_id, pubkey: actor_public_key, sig: signature, ... }
   ```
2. **Anchored to Nostr relays** (ADR-003) before or concurrently with storage in the PostgreSQL DIP schema
3. **Additionally stored in the AppendOnlyLog** with a reference to the Nostr event ID — so the event bus audit trail includes all DIP events alongside ecosystem events
4. **Verifiable without Syntropy**: Anyone can query Nostr relays with the event ID and verify the signature against the creator's public key

### Level 2: Ecosystem Events (Service-Signed, Hash-Chained)

All non-DIP ecosystem events are:

1. **Signed by the emitting platform service** using HMAC-SHA256 with a service-specific key:
   ```
   service_signature = HMAC-SHA256(service_key, event_payload ∥ timestamp ∥ sequence_number)
   ```
2. **Hash-chained** in the AppendOnlyLog:
   ```
   entry_hash = SHA256(event_payload ∥ previous_hash ∥ service_signature ∥ timestamp)
   ```
3. **Stored in PostgreSQL** (`platform_core.append_only_log`) with monotonically increasing sequence numbers and the hash chain

The hash chain provides tamper evidence: any modification to a historical entry breaks all subsequent entry hashes, making tampering immediately detectable.

### Event Schema Registry (Published Language)

The Event Schema Registry (`EventSchemaVersion` aggregate in Platform Core → Event Bus & Audit) is the inter-domain contract governing all event types:

1. **Schema registration**: Before a new event type can be emitted, the owning domain must register a schema version in the registry. Schema registration is a controlled operation (requires architectural review for breaking changes).
2. **Schema immutability**: A published schema version is immutable. Breaking changes (field removal, type changes) require a new version number.
3. **Schema enforcement**: At the event bus publication boundary, the `SchemaValidationService` validates every incoming event payload against its registered schema. Invalid events are rejected — never silently dropped.
4. **Event type naming**: `{domain}.{subdomain}.{entity}_{action}` (e.g., `learn.fragment-artifact-engine.artifact_published`, `dip.iacp-engine.usage_agreement_created`)

### Summary of Hierarchy

| Property | Level 1: DIP Protocol Events | Level 2: Ecosystem Events |
|----------|------------------------------|---------------------------|
| Who signs | Actor (creator's Nostr private key) | Emitting platform service (HMAC-SHA256) |
| External verifiability | Yes (Nostr relay query) | No (internal audit only) |
| Storage | Nostr relays + AppendOnlyLog | AppendOnlyLog only |
| Hash chaining | Via Nostr event ID chain | Yes (full hash chain) |
| Throughput | Low-moderate (DIP operations are relatively rare) | High (hundreds/second) |
| Key management | User keys (per ADR-003 / security architecture) | Service keys (platform operations) |

## Alternatives Considered

### Alternative 1: Full Actor Signing for All Events

Apply actor cryptographic signing (Nostr-level) to every event in the ecosystem — Fragment completed, Contribution accepted, Review submitted, etc.

**Pros**:
- Uniform signing model — simpler conceptual architecture
- Every event is externally verifiable

**Cons**:
- Ecosystem events occur at high frequency (hundreds per second at community scale); requiring a cryptographic signing operation per event would add significant latency to every user action
- User keys would need to be available to the platform server for signing — contradicting the security model where private keys never leave user devices
- Most ecosystem events (gamification XP grants, search index updates) do not require external verification — applying actor signing to them is security theater that adds cost without benefit
- Key management overhead: every system action by every user requires a valid key; key rotation and recovery become operational nightmares

**Why rejected**: The security model of actor signing (private key on user device) is incompatible with high-frequency server-side event recording. Applying it uniformly also violates the principle of proportionate security: not every event requires external verifiability, and treating them equally conflates qualitatively different trust requirements.

### Alternative 2: No Signing — Hash Chain Only

Use only hash chaining (without any cryptographic signing) for all events. Each event's hash provides tamper evidence.

**Pros**:
- Very simple implementation
- No key management required
- Hash chaining alone provides tamper detection

**Cons**:
- Hash chaining provides tamper evidence but not authorship proof: anyone with write access to the log can recompute all subsequent hashes after modifying an entry — the chain can be re-forged by an insider with database access
- DIP protocol events (artifact identity, governance executions) explicitly require authorship proof, not just tamper evidence — "this specific creator published this specific artifact" must be provable without trusting Syntropy
- Internal audit trails (Level 2) benefit from service-level signing to prove which service recorded the event — hash chain alone does not attribute events to specific services

**Why rejected**: For DIP protocol events, hash chaining alone cannot satisfy the "verify without trusting Syntropy" requirement. The Nostr actor signing specifically addresses insider threat and platform failure scenarios. For ecosystem events, service signing + hash chaining together provide stronger tamper evidence than hash chaining alone.

### Alternative 3: Nostr Anchoring for All Events

Anchor all events (including ecosystem events) to Nostr relays.

**Pros**:
- Uniform external verifiability for all events
- Complete independence from Syntropy's infrastructure for any event

**Cons**:
- Nostr relay publication latency (100–500ms per relay, with retry) is unacceptable for high-frequency ecosystem events (Fragment save, XP grant, search update)
- Nostr relays have rate limits; anchoring every ecosystem event would quickly exceed relay rate limits
- The vast majority of ecosystem events (gamification, search indexing) have no requirement for external verifiability — anchoring them to Nostr is wasteful
- Nostr relay costs (bandwidth, compute) at high event volume would become significant

**Why rejected**: Nostr anchoring is designed for low-frequency, high-significance events where external verifiability has real-world consequences (legal ownership, governance decisions). Applying it to all events would impose latency and cost penalties that harm the user experience without providing proportionate benefit.

## Consequences

### Positive

- The two-level hierarchy precisely matches security measures to security requirements: high-assurance external verifiability only where needed (DIP), operational efficiency where sufficient (ecosystem events).
- Service-signed hash chains provide a strong internal audit trail at low operational cost — any tampering with historical ecosystem events is immediately detectable.
- The Event Schema Registry as Published Language means all 12 domain packages share a single, authoritative, versioned vocabulary for inter-domain communication — preventing the schema drift that typically plagues event-driven systems.
- Schema validation at the publication boundary ensures that malformed events cannot enter the log — catching integration errors at the source rather than at the consumer.

### Negative

- Two different signing mechanisms must be implemented and maintained. Service key rotation for ecosystem events must be managed carefully.
  - **Mitigation**: Service keys are managed in a secrets manager (e.g., Supabase Vault, AWS Secrets Manager). Key rotation does not require re-signing historical entries — each entry's signature is valid for the key that was active at the time of signing. A key version field in the LogEntry enables verification of historical signatures.
- Schema registration creates a governance overhead: teams must request schema registration before implementing new event types.
  - **Mitigation**: Schema registration is a lightweight process (open a PR adding the schema to `packages/events/schemas/`). The review requirement prevents uncoordinated schema proliferation, which is the actual risk.

### Neutral

- The AppendOnlyLog stores all events (both Level 1 and Level 2) in a single table with a `signing_level` field distinguishing actor-signed from service-signed entries. Querying is uniform; the verification process differs by level.
- DIP protocol events that have been Nostr-anchored carry a `nostr_event_id` reference in the AppendOnlyLog entry. This enables lookup of the Nostr-anchored record for external verification.

## Implementation Notes

### LogEntry Schema Extension for Level 1 Events

```sql
ALTER TABLE platform_core.append_only_log
ADD COLUMN signing_level VARCHAR(10) NOT NULL DEFAULT 'service',  -- 'actor' | 'service'
ADD COLUMN nostr_event_id VARCHAR(64),       -- Nostr event ID (for actor-signed events)
ADD COLUMN actor_public_key VARCHAR(66);     -- secp256k1 public key (for actor-signed events)
```

### Event Type Naming Convention

| Pattern | Example |
|---------|---------|
| `{domain}.{subdomain}.{entity}_{past_verb}` | `dip.artifact-registry.identity_record_anchored` |
| `{domain}.{subdomain}.{entity}_{past_verb}` | `learn.fragment-artifact-engine.artifact_published` |
| `{domain}.{subdomain}.{entity}_{past_verb}` | `hub.collaboration-layer.contribution_accepted` |
| `{domain}.{subdomain}.{entity}_{past_verb}` | `identity.rbac.role_granted` |

### Schema Registration Workflow

1. Add schema file to `packages/events/schemas/{domain}/{event-type}.v{N}.json`
2. Open pull request with schema; domain architect reviews for breaking changes
3. Merge registers the schema version; `EventSchemaVersion` record is created in production
4. Domain package can now emit events of this type

## References

- Vision Document: Section 10 (Data traceability requirement); Section 13–18 (DIP external verifiability requirement)
- `docs/architecture/domains/platform-core/subdomains/event-bus-audit.md` — AppendOnlyLog and EventSchema Registry design
- `docs/architecture/cross-cutting/data-integrity/ARCHITECTURE.md` — Three-layer immutability model
- ADR-003: Artifact Identity Anchoring — Nostr relay infrastructure for Level 1 events
- ADR-002: Event Bus Technology — Kafka as transport; AppendOnlyLog as store of record

## Derived Rules

- `architecture.mdc`: ARCH-003 — Event bus is the required async communication channel; all events must conform to registered schemas
- `architecture.mdc`: ARCH-009 — Observability requires correlation IDs in every event (causation_id + correlation_id fields in LogEntry)
- `architecture.mdc`: ARCH-010 — Security by default: all events are signed; no unsigned events enter the AppendOnlyLog

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Two-level hierarchy precisely calibrates security guarantees to requirements; Event Schema Registry establishes the inter-domain Published Language contract |
