/**
 * NostrAnchorService — anchors artifact identity to relay; returns NostrEventId.
 * Architecture: COMP-003.3, DIP Artifact Registry
 */

import { createHash } from "node:crypto";
import type { Artifact } from "../domain/artifact-registry/artifact.js";
import type { NostrRelayPort } from "../domain/artifact-registry/ports/nostr-relay-port.js";
import { createContentHash } from "../domain/artifact-registry/value-objects/content-hash.js";
import type { NostrEventId } from "../domain/artifact-registry/value-objects/nostr-event-id.js";

/**
 * Thrown when anchoring is requested but artifact has no content hash and no content provided.
 */
export class AnchoringContentRequiredError extends Error {
  constructor(public readonly artifactId: string) {
    super(
      `Anchoring requires content hash or content: artifact ${artifactId} has no contentHash and no content was provided`,
    );
    this.name = "AnchoringContentRequiredError";
    Object.setPrototypeOf(this, AnchoringContentRequiredError.prototype);
  }
}

/**
 * Anchors an artifact: computes content hash if needed, submits to relay, returns NostrEventId.
 */
export class NostrAnchorService {
  constructor(private readonly relay: NostrRelayPort) {}

  /**
   * Anchors the artifact. Uses artifact.contentHash if set; otherwise computes SHA-256 from content.
   *
   * @param artifact - Artifact to anchor
   * @param content - Optional; required when artifact.contentHash is null
   * @returns NostrEventId from the relay
   * @throws AnchoringContentRequiredError when contentHash is null and content is missing
   */
  async anchor(artifact: Artifact, content?: string): Promise<NostrEventId> {
    let contentHash = artifact.contentHash;
    if (!contentHash) {
      if (content === undefined || content === "") {
        throw new AnchoringContentRequiredError(artifact.id);
      }
      contentHash = createContentHash(this.sha256Hex(content));
    }
    return this.relay.submit({
      contentHash,
      artifactId: artifact.id,
      authorId: artifact.authorId,
    });
  }

  private sha256Hex(input: string): string {
    return createHash("sha256").update(input, "utf8").digest("hex");
  }
}
