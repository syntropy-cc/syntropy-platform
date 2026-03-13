# ADR-003: Artifact Identity Anchoring via Nostr Relays

## Status

Accepted

## Date

2026-03-12

## Context

The Digital Institutions Protocol (DIP) must provide cryptographic proof of artifact ownership and creation priority that is **verifiable by anyone, without trusting the Syntropy platform**. This is a core competitive differentiator stated in Vision Section 10 (Inviolable Decisions): "Creators own their artifacts cryptographically."

Two distinct record types require external, immutable anchoring:

1. **Artifact IdentityRecord** — created when an artifact is published. Contains the artifact's unique identifier, creator's public key, content hash, and timestamp. Once anchored, this record is immutable.
2. **LegitimacyChain execution events** — signed records of each governance contract execution, of the form `e_exec = Sign_executor(pid ∥ Hash(Inst_{k-1}) ∥ Hash(Inst_k) ∥ timestamp)`. These prove institutional decision history without platform dependency.

The key requirement is: a third party (another researcher, a university, a funding agency) must be able to verify that a specific creator published a specific artifact at a specific time — **without contacting Syntropy's servers**. The anchoring mechanism must be:

- **Decentralized**: not controlled by a single operator (including Syntropy itself)
- **Permissionless**: no approval required to write or read records
- **Censorship-resistant**: records cannot be deleted by any party, including Syntropy
- **Cryptographically verifiable**: records are signed by the artifact creator's key, not by a platform key
- **Append-only**: records cannot be modified after publication

Additionally, the chosen mechanism must be wrapped behind an Anti-Corruption Layer (ACL) adapter (per ARCH-012) so that changes to the ledger technology do not propagate into the DIP domain model. The DIP domain must speak its own ubiquitous language; "Nostr" must not appear in DIP domain entities or services.

## Decision

We will use **Nostr (Notes and Other Stuff Transmitted by Relays)** as the external identity anchoring protocol for DIP IdentityRecord and LegitimacyChain execution events.

Specifically:

1. **Nostr protocol**: Each artifact IdentityRecord is published as a Nostr event (kind: application-specific, e.g., kind 30023 for long-form content or a custom kind in the 30000–39999 range). The event is signed by the creator's Nostr private key (secp256k1). The event ID is the SHA-256 hash of the serialized event.

2. **Multiple relay publication**: Each anchoring event is published to at least 3 Nostr relay servers simultaneously. The `IdentityRecord` stores the set of relay URLs and the Nostr event ID, enabling independent verification from any relay.

3. **Anti-Corruption Layer adapter** (`NostrAnchoringAdapter` in `packages/dip/infrastructure/`):
   - DIP domain speaks of `AnchoringResult`, `AnchoringReference`, `AnchorVerification`
   - The adapter translates these to Nostr-specific structures (NIP-01 events, relay connection protocols)
   - If Nostr is replaced, only this adapter changes; the DIP domain model is unaffected

4. **Anchoring occurs during artifact publication** (DIP Artifact Registry subdomain):
   - Before the `IdentityRecord` is marked as anchored, the `NostrAnchoringAdapter` must receive confirmation from at least 1 relay (optimistic) or 2 relays (conservative mode, configurable)
   - Anchoring is performed asynchronously after PostgreSQL write; the artifact is marked "pending_anchoring" until confirmation is received
   - If anchoring fails after retries (circuit breaker per ADR for resilience), the artifact publication is rolled back or flagged for manual intervention

5. **Verification** is supported through a public endpoint that accepts an artifact ID and returns the Nostr event ID, relay list, creator public key, and content hash — allowing any third party to verify independently.

6. **Key management**: Each Syntropy user who publishes artifacts is issued (or provides) a Nostr key pair. The private key never leaves the user's control; Syntropy signs on behalf of users only if delegated via Nostr's NIP-26 delegation mechanism. The key management strategy is detailed in `cross-cutting/security/ARCHITECTURE.md`.

## Alternatives Considered

### Alternative 1: Private Permissioned Blockchain

Deploy a private blockchain (Hyperledger Fabric, Quorum) controlled by Syntropy and partner institutions. Artifact identity records are written as blockchain transactions.

**Pros**:
- Full control over the ledger infrastructure
- Can implement custom record structures and query patterns
- Established governance mechanisms for permissioned networks

**Cons**:
- Permissioned means Syntropy controls who writes and reads — this directly contradicts the "verifiable without trusting Syntropy" requirement
- Operational overhead: running a blockchain network is significantly more complex than publishing to a public relay network
- Partnership bootstrapping problem: a private chain with one operator (Syntropy) provides no meaningful decentralization guarantee
- Creator keys are only meaningful within the Syntropy network — no portability to other systems

**Why rejected**: The core requirement is external verifiability **without trusting Syntropy**. A permissioned chain controlled by Syntropy cannot satisfy this. The decentralization guarantee is exactly the point.

### Alternative 2: Centralized Database with Cryptographic Hash Chains

Store IdentityRecords in the Syntropy PostgreSQL database (Supabase). Apply hash chaining (each record contains the hash of the previous record) and publish a daily/weekly Merkle root to a public ledger (e.g., publish the root hash to a Bitcoin OP_RETURN transaction).

**Pros**:
- Very simple to implement (no external protocol dependencies)
- Complete control over the data structure
- PostgreSQL append-only table is already in the technology stack

**Cons**:
- The hash chain is only verifiable if the platform provides the chain — if Syntropy goes down or is compromised, the chain cannot be independently verified
- Bitcoin OP_RETURN anchoring (timestamping service) provides temporal proof but not content proof for individual records — an intermediary (Syntropy) is required to produce the inclusion proof
- Creator records are not independently readable without Syntropy serving them

**Why rejected**: The ecosystem's append-only hash-chained log already provides this pattern for ecosystem-level events (ADR-010). Duplicating it for artifact identity does not add external verifiability — it just adds another internal ledger. The distinctive value is censorship-resistance and platform-independence. A centralized database, even hash-chained, does not provide these.

### Alternative 3: IPFS for Content Addressing

Publish artifact content to IPFS (InterPlanetary File System). Use the CID (Content Identifier) as the identity anchor.

**Pros**:
- Content addressing: the CID is a hash of the content, making tampering detectable
- Decentralized storage network
- Well-understood protocol with large ecosystem

**Cons**:
- IPFS provides content addressing, not **authorship proving**. A CID proves what the content is, not who published it or when
- IPFS does not provide cryptographic signing by the creator — the same content published by two people produces the same CID, making authorship claims ambiguous
- Content pinning: unless pinned by multiple nodes, content disappears when the publishing node goes offline
- Does not address the LegitimacyChain execution event signing requirement at all

**Why rejected**: IPFS solves content integrity but not authorship priority or governance event signing. Nostr events are explicitly designed for author-signed public records, which is exactly the use case.

## Consequences

### Positive

- Artifact creators can prove ownership of their work to any third party without depending on Syntropy's infrastructure.
- The `NostrAnchoringAdapter` ACL pattern means the DIP domain is fully insulated from Nostr-specific implementation details.
- Nostr's lightweight relay protocol requires no special infrastructure — relays are HTTP-compatible WebSocket servers that anyone can run, and multiple public relays exist.
- Migration path is explicit and contained: if Nostr is superseded by a better protocol, only `NostrAnchoringAdapter` needs replacement; the IdentityRecord entity stores a generic `anchoring_reference` field, not Nostr-specific fields.

### Negative

- Dependency on external Nostr relays: if all targeted relays are unavailable, artifact publication must queue anchoring for retry.
  - **Mitigation**: Circuit breaker pattern (per resilience cross-cutting architecture). Publish to 3+ relays; partial success (≥1 relay) is acceptable for optimistic mode. The artifact is marked "pending_anchoring" and retried asynchronously.
- User key management: users must maintain their Nostr private keys. Key loss means inability to prove authorship on future artifacts.
  - **Mitigation**: Syntropy supports NIP-26 delegated signing for users who do not want to manage raw key pairs. The UX delegates key custody to the user's Nostr-compatible wallet or the platform's optional key custodian (with explicit user consent).
- Nostr is a relatively young protocol. NIPs (Nostr Implementation Possibilities) evolve and specific kinds may be superseded.
  - **Mitigation**: The ACL adapter insulates the domain from protocol evolution. Custom Nostr kinds (30000–39999 range for parameterized replaceable events) are used for IdentityRecords, giving control over the record format.

### Neutral

- The Nostr event ID (SHA-256 of the serialized event) becomes the canonical reference for artifact identity in external systems. The DIP's internal `artifact_id` (UUID) is mapped to the Nostr event ID in the IdentityRecord.
- LegitimacyChain execution events use the same anchoring mechanism but different event kind — governance history and artifact identity are independently verifiable without coupling their data structures.

## Implementation Notes

### IdentityRecord Structure

```typescript
// DIP domain entity (no Nostr-specific fields)
interface IdentityRecord {
  artifact_id: ArtifactId;          // DIP internal UUID
  creator_public_key: PublicKey;    // Creator's public key (Nostr-compatible secp256k1)
  content_hash: ContentHash;        // SHA-256 of the artifact content at publication time
  anchoring_reference: string;      // Nostr event ID (returned by adapter)
  anchoring_relay_urls: string[];   // List of relays where the event was confirmed
  anchored_at: Timestamp;           // Time of first relay confirmation
  anchoring_status: 'pending' | 'anchored' | 'failed';
}
```

### NostrAnchoringAdapter Interface

```typescript
// Infrastructure adapter (in packages/dip/infrastructure/nostr-anchoring-adapter.ts)
interface IAnchoringAdapter {
  anchor(record: AnchoringRequest): Promise<AnchoringResult>;
  verify(reference: AnchoringReference): Promise<AnchorVerification>;
}

// Nostr-specific implementation — only this file contains Nostr terminology
class NostrAnchoringAdapter implements IAnchoringAdapter {
  async anchor(record: AnchoringRequest): Promise<AnchoringResult> { ... }
  async verify(reference: AnchoringReference): Promise<AnchorVerification> { ... }
}
```

### Migration Path

If Nostr is replaced:
1. Implement `NewProtocolAnchoringAdapter implements IAnchoringAdapter`
2. Update `IdentityRecord.anchoring_reference` format documentation (value remains opaque string in DIP domain)
3. Existing records remain valid — their `anchoring_relay_urls` still point to Nostr relays for historical verification
4. New records use the new protocol; both adapters can be active during transition

## References

- Vision Document: Section 10 (Inviolable Decisions: "Creators own their artifacts cryptographically")
- Vision Document: Section 13–18 (Digital Institutions Protocol capabilities)
- `docs/architecture/domains/digital-institutions-protocol/subdomains/artifact-registry.md` — IdentityRecord anchoring design
- `docs/architecture/domains/digital-institutions-protocol/subdomains/institutional-governance.md` — LegitimacyChain signing
- `docs/architecture/cross-cutting/security/ARCHITECTURE.md` — Key management and cryptographic standards
- ADR-010: Two-level event signing hierarchy (context for why DIP events use actor signing while ecosystem events use service signing)
- Nostr Protocol: https://github.com/nostr-protocol/nostr
- NIP-01 (Basic Protocol), NIP-26 (Delegated Event Signing)

## Derived Rules

- `architecture.mdc`: ARCH-012 — Mandatory ACL when Core Domain consumes Generic Subdomain or external system (NostrAnchoringAdapter is the required ACL)
- `architecture.mdc`: ARCH-005 — IdentityRecord is the single source of truth for artifact authorship; never duplicate anchoring logic elsewhere

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Nostr selected for censorship-resistance and creator key portability; ACL pattern isolates domain from protocol specifics |
