/**
 * NostrRelayAdapter — ACL for Nostr relay; submits artifact identity, returns event id.
 * Architecture: COMP-003.3, ADR-003 (ACL: Nostr vocabulary confined to infrastructure)
 */

import { createHash } from "node:crypto";
import type { NostrRelayPort } from "../domain/artifact-registry/ports/nostr-relay-port.js";
import { createNostrEventId } from "../domain/artifact-registry/value-objects/nostr-event-id.js";
import type { NostrEventId } from "../domain/artifact-registry/value-objects/nostr-event-id.js";

/**
 * Adapter that implements NostrRelayPort. Minimal implementation: produces a
 * deterministic 64-char hex id from payload (no real Nostr connection required for S9).
 * Replace with real Nostr client (e.g. NIP-01) when wiring to relays.
 */
export class NostrRelayAdapter implements NostrRelayPort {
  async submit(payload: Parameters<NostrRelayPort["submit"]>[0]): Promise<NostrEventId> {
    const canonical = `${payload.artifactId}:${payload.authorId}:${payload.contentHash}`;
    const hash = createHash("sha256").update(canonical, "utf8").digest("hex");
    return createNostrEventId(hash);
  }
}
