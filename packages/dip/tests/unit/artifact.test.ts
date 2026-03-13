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

describe("Artifact.submit", () => {
  it("transitions from Draft to Submitted and returns new Artifact", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const artifact = Artifact.draft({ id, authorId });

    const submitted = artifact.submit();

    expect(submitted.id).toBe(id);
    expect(submitted.status).toBe(ArtifactStatus.Submitted);
    expect(submitted.publishedAt).toBeNull();
    expect(submitted.archivedAt).toBeNull();
    expect(artifact.status).toBe(ArtifactStatus.Draft);
  });

  it("throws when status is not Draft", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const artifact = Artifact.draft({ id, authorId }).submit();

    expect(() => artifact.submit()).toThrow("cannot submit");
    expect(() => artifact.submit()).toThrow("submitted");
  });
});

describe("Artifact.publish", () => {
  it("transitions from Submitted to Published and sets publishedAt", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const artifact = Artifact.draft({ id, authorId }).submit();

    const published = artifact.publish();

    expect(published.id).toBe(id);
    expect(published.status).toBe(ArtifactStatus.Published);
    expect(published.publishedAt).toBeInstanceOf(Date);
    expect(published.archivedAt).toBeNull();
  });

  it("uses provided publishedAt when supplied", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const at = new Date("2024-06-01T12:00:00Z");
    const artifact = Artifact.draft({ id, authorId }).submit();

    const published = artifact.publish(at);

    expect(published.publishedAt).toEqual(at);
  });

  it("throws when status is not Submitted", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const draftArtifact = Artifact.draft({ id, authorId });

    expect(() => draftArtifact.publish()).toThrow("cannot publish");
    expect(() => draftArtifact.publish()).toThrow("draft");
  });
});

describe("Artifact.archive", () => {
  it("transitions from Published to Archived and sets archivedAt", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const artifact = Artifact.draft({ id, authorId }).submit().publish();

    const archived = artifact.archive();

    expect(archived.id).toBe(id);
    expect(archived.status).toBe(ArtifactStatus.Archived);
    expect(archived.publishedAt).toBeInstanceOf(Date);
    expect(archived.archivedAt).toBeInstanceOf(Date);
  });

  it("throws when status is not Published", () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const draftArtifact = Artifact.draft({ id, authorId });

    expect(() => draftArtifact.archive()).toThrow("cannot archive");
    expect(() => draftArtifact.archive()).toThrow("draft");
  });
});
