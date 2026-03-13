/**
 * Unit tests for Artifact aggregate.
 * Tests for: COMP-003.1
 */

import { describe, expect, it } from "vitest";
import { Artifact } from "../../src/domain/artifact-registry/artifact.js";
import { ArtifactStatus } from "../../src/domain/artifact-registry/artifact-status.js";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import { createContentHash } from "../../src/domain/artifact-registry/value-objects/content-hash.js";

const SAMPLE_ARTIFACT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const SAMPLE_AUTHOR_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const SAMPLE_CONTENT_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

describe("Artifact.draft", () => {
  it("creates artifact with draft status and null publishedAt and archivedAt", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);

    const artifact = Artifact.draft({ id, authorId });

    expect(artifact.id).toBe(id);
    expect(artifact.authorId).toBe(authorId);
    expect(artifact.status).toBe(ArtifactStatus.Draft);
    expect(artifact.publishedAt).toBeNull();
    expect(artifact.archivedAt).toBeNull();
    expect(artifact.contentHash).toBeNull();
    expect(artifact.createdAt).toBeInstanceOf(Date);
  });

  it("creates draft with optional contentHash", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const contentHash = createContentHash(SAMPLE_CONTENT_HASH);

    const artifact = Artifact.draft({ id, authorId, contentHash });

    expect(artifact.contentHash).toBe(contentHash);
    expect(artifact.status).toBe(ArtifactStatus.Draft);
  });

  it("uses provided createdAt when supplied", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const createdAt = new Date("2024-01-15T10:00:00Z");

    const artifact = Artifact.draft({ id, authorId, createdAt });

    expect(artifact.createdAt).toEqual(createdAt);
  });
});
