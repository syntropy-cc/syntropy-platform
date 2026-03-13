/**
 * Unit tests for NostrAnchorService.
 * Tests for: COMP-003.3
 */

import { describe, expect, it, vi } from "vitest";
import { Artifact } from "../../src/domain/artifact-registry/artifact.js";
import type { NostrRelayPort } from "../../src/domain/artifact-registry/ports/nostr-relay-port.js";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import { createContentHash } from "../../src/domain/artifact-registry/value-objects/content-hash.js";
import { createNostrEventId } from "../../src/domain/artifact-registry/value-objects/nostr-event-id.js";
import {
  NostrAnchorService,
  AnchoringContentRequiredError,
} from "../../src/application/nostr-anchor-service.js";

const SAMPLE_ARTIFACT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const SAMPLE_AUTHOR_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const SAMPLE_CONTENT_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function createMockRelay(returnId: string): NostrRelayPort {
  return {
    submit: vi.fn(async () => createNostrEventId(returnId)),
  };
}

describe("NostrAnchorService.anchor", () => {
  it("uses artifact contentHash when present and calls relay with correct payload", async () => {
    const relayId = "c".repeat(64);
    const relay = createMockRelay(relayId);
    const service = new NostrAnchorService(relay);
    const contentHash = createContentHash(SAMPLE_CONTENT_HASH);
    const artifact = Artifact.draft({
      id: createArtifactId(SAMPLE_ARTIFACT_ID),
      authorId: createAuthorId(SAMPLE_AUTHOR_ID),
      contentHash,
    });

    const result = await service.anchor(artifact);

    expect(result).toBe(relayId);
    expect(relay.submit).toHaveBeenCalledTimes(1);
    expect(relay.submit).toHaveBeenCalledWith({
      contentHash,
      artifactId: artifact.id,
      authorId: artifact.authorId,
    });
  });

  it("computes content hash from content when artifact has no contentHash", async () => {
    const relayId = "d".repeat(64);
    const relay = createMockRelay(relayId);
    const service = new NostrAnchorService(relay);
    const artifact = Artifact.draft({
      id: createArtifactId(SAMPLE_ARTIFACT_ID),
      authorId: createAuthorId(SAMPLE_AUTHOR_ID),
      contentHash: null,
    });
    const content = "hello world";

    const result = await service.anchor(artifact, content);

    expect(result).toBe(relayId);
    expect(relay.submit).toHaveBeenCalledTimes(1);
    const call = (relay.submit as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(call.artifactId).toBe(artifact.id);
    expect(call.authorId).toBe(artifact.authorId);
  });

  it("returns NostrEventId from relay", async () => {
    const relayId = "e".repeat(64);
    const relay = createMockRelay(relayId);
    const service = new NostrAnchorService(relay);
    const artifact = Artifact.draft({
      id: createArtifactId(SAMPLE_ARTIFACT_ID),
      authorId: createAuthorId(SAMPLE_AUTHOR_ID),
      contentHash: createContentHash(SAMPLE_CONTENT_HASH),
    });

    const result = await service.anchor(artifact);

    expect(result).toBe(relayId);
  });

  it("throws AnchoringContentRequiredError when contentHash is null and no content", async () => {
    const relay = createMockRelay("f".repeat(64));
    const service = new NostrAnchorService(relay);
    const artifact = Artifact.draft({
      id: createArtifactId(SAMPLE_ARTIFACT_ID),
      authorId: createAuthorId(SAMPLE_AUTHOR_ID),
      contentHash: null,
    });

    await expect(service.anchor(artifact)).rejects.toThrow(
      AnchoringContentRequiredError,
    );
    await expect(service.anchor(artifact)).rejects.toThrow(
      "Anchoring requires content hash or content",
    );
    expect(relay.submit).not.toHaveBeenCalled();
  });

  it("throws when content is empty string and contentHash is null", async () => {
    const relay = createMockRelay("f".repeat(64));
    const service = new NostrAnchorService(relay);
    const artifact = Artifact.draft({
      id: createArtifactId(SAMPLE_ARTIFACT_ID),
      authorId: createAuthorId(SAMPLE_AUTHOR_ID),
      contentHash: null,
    });

    await expect(service.anchor(artifact, "")).rejects.toThrow(
      AnchoringContentRequiredError,
    );
    expect(relay.submit).not.toHaveBeenCalled();
  });
});
