/**
 * NostrRelayPort — port for submitting artifact identity to an anchoring relay.
 * Architecture: COMP-003.3, ADR-003 (ACL: adapter in infrastructure)
 */

import type { ArtifactId } from "../value-objects/artifact-id.js";
import type { AuthorId } from "../value-objects/author-id.js";
import type { ContentHash } from "../value-objects/content-hash.js";
import type { NostrEventId } from "../value-objects/nostr-event-id.js";

/**
 * Payload required to anchor an artifact identity.
 */
export interface AnchoringPayload {
  contentHash: ContentHash;
  artifactId: ArtifactId;
  authorId: AuthorId;
}

/**
 * Port for the anchoring relay (e.g. Nostr). Implementations in infrastructure.
 */
export interface NostrRelayPort {
  /**
   * Submits artifact identity to the relay; returns the anchoring reference (e.g. event id).
   */
  submit(payload: AnchoringPayload): Promise<NostrEventId>;
}
