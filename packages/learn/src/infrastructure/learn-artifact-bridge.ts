/**
 * LearnArtifactBridge — ACL that publishes Fragment content to DIP (COMP-016.4).
 * Architecture: fragment-artifact-engine.md.
 */

import type { Fragment } from "../domain/fragment-artifact/fragment.js";
import type { ArtifactPublisherPort } from "../domain/fragment-artifact/ports/artifact-publisher-port.js";

/**
 * Minimal interface for creating and publishing an artifact in DIP.
 * Implemented by app wiring with @syntropy/dip; mocked in tests.
 */
export interface DipArtifactClientPort {
  createAndPublishArtifact(authorId: string, content: string): Promise<string>;
}

/**
 * Maps a Fragment to a DIP artifact: serializes content, calls DIP client,
 * returns the published artifact id. Nostr anchoring is done by the DIP client impl.
 */
export class LearnArtifactBridge implements ArtifactPublisherPort {
  constructor(private readonly dipClient: DipArtifactClientPort) {}

  async publish(fragment: Fragment): Promise<string> {
    const content = this.serializeFragmentContent(fragment);
    return this.dipClient.createAndPublishArtifact(
      fragment.creatorId,
      content
    );
  }

  private serializeFragmentContent(fragment: Fragment): string {
    return JSON.stringify({
      title: fragment.title,
      problem: fragment.problemSection.content,
      theory: fragment.theorySection.content,
      artifact: fragment.artifactSection.content,
    });
  }
}
