/**
 * Unit tests for ArtifactLifecycleService.
 * Tests for: COMP-003.2
 */

import { describe, expect, it, vi } from "vitest";
import { Artifact } from "../../src/domain/artifact-registry/artifact.js";
import { ArtifactStatus } from "../../src/domain/artifact-registry/artifact-status.js";
import type { ArtifactLifecycleEvent } from "../../src/domain/artifact-registry/events/artifact-lifecycle-events.js";
import type { ArtifactRepository } from "../../src/domain/artifact-registry/repositories/artifact-repository.js";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import {
  ArtifactLifecycleService,
  ArtifactNotFoundError,
} from "../../src/application/artifact-lifecycle-service.js";

const SAMPLE_ARTIFACT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const SAMPLE_AUTHOR_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

function createMockRepository(initialArtifacts: Map<string, Artifact> = new Map()): ArtifactRepository {
  const store = new Map(initialArtifacts);
  return {
    findById: vi.fn(async (id) => store.get(id) ?? null),
    save: vi.fn(async (artifact) => {
      store.set(artifact.id, artifact);
    }),
  };
}

function createMockEventPublisher(): {
  publisher: { publish: (event: ArtifactLifecycleEvent) => Promise<void> };
  events: ArtifactLifecycleEvent[];
} {
  const events: ArtifactLifecycleEvent[] = [];
  return {
    publisher: {
      publish: vi.fn(async (event: ArtifactLifecycleEvent) => {
        events.push(event);
      }),
    },
    events,
  };
}

describe("ArtifactLifecycleService.draft", () => {
  it("creates artifact in Draft, saves once, and publishes drafted event", async () => {
    const repo = createMockRepository();
    const { publisher, events } = createMockEventPublisher();
    const idGen = vi.fn(() => SAMPLE_ARTIFACT_ID);
    const service = new ArtifactLifecycleService(repo, publisher, idGen);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);

    const artifact = await service.draft(authorId);

    expect(artifact.status).toBe(ArtifactStatus.Draft);
    expect(artifact.authorId).toBe(authorId);
    expect(artifact.id).toBe(createArtifactId(SAMPLE_ARTIFACT_ID));
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("dip.artifact.drafted");
    expect(events[0].artifactId).toBe(artifact.id);
    expect(events[0].authorId).toBe(authorId);
  });

  it("uses content hash when content is provided", async () => {
    const repo = createMockRepository();
    const { publisher } = createMockEventPublisher();
    const idGen = vi.fn(() => SAMPLE_ARTIFACT_ID);
    const service = new ArtifactLifecycleService(repo, publisher, idGen);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const content = "hello";

    const artifact = await service.draft(authorId, content);

    expect(artifact.contentHash).not.toBeNull();
    expect(artifact.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("ArtifactLifecycleService.submit", () => {
  it("loads artifact, transitions to Submitted, saves, and publishes submitted event", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const draftArtifact = Artifact.draft({ id, authorId });
    const repo = createMockRepository(new Map([[id, draftArtifact]]));
    const { publisher, events } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    const artifact = await service.submit(id);

    expect(artifact.status).toBe(ArtifactStatus.Submitted);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("dip.artifact.submitted");
    expect(events[0].artifactId).toBe(id);
  });

  it("throws ArtifactNotFoundError when artifact does not exist", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const repo = createMockRepository();
    const { publisher } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    await expect(service.submit(id)).rejects.toThrow(ArtifactNotFoundError);
    await expect(service.submit(id)).rejects.toThrow(SAMPLE_ARTIFACT_ID);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("throws when artifact is not in Draft", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const submittedArtifact = Artifact.draft({ id, authorId }).submit();
    const repo = createMockRepository(new Map([[id, submittedArtifact]]));
    const { publisher } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    await expect(service.submit(id)).rejects.toThrow("cannot submit");
    await expect(service.submit(id)).rejects.toThrow("submitted");
  });
});

describe("ArtifactLifecycleService.publish", () => {
  it("transitions to Published, sets publishedAt, and publishes event", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const submittedArtifact = Artifact.draft({ id, authorId }).submit();
    const repo = createMockRepository(new Map([[id, submittedArtifact]]));
    const { publisher, events } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    const artifact = await service.publish(id);

    expect(artifact.status).toBe(ArtifactStatus.Published);
    expect(artifact.publishedAt).toBeInstanceOf(Date);
    expect(events[0].type).toBe("dip.artifact.published");
  });

  it("throws when artifact is not in Submitted", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const draftArtifact = Artifact.draft({ id, authorId });
    const repo = createMockRepository(new Map([[id, draftArtifact]]));
    const { publisher } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    await expect(service.publish(id)).rejects.toThrow("cannot publish");
    await expect(service.publish(id)).rejects.toThrow("draft");
  });
});

describe("ArtifactLifecycleService.archive", () => {
  it("transitions to Archived, sets archivedAt, and publishes event", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const publishedArtifact = Artifact.draft({ id, authorId }).submit().publish();
    const repo = createMockRepository(new Map([[id, publishedArtifact]]));
    const { publisher, events } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    const artifact = await service.archive(id);

    expect(artifact.status).toBe(ArtifactStatus.Archived);
    expect(artifact.archivedAt).toBeInstanceOf(Date);
    expect(events[0].type).toBe("dip.artifact.archived");
  });

  it("throws when artifact is not in Published", async () => {
    const id = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const submittedArtifact = Artifact.draft({ id, authorId }).submit();
    const repo = createMockRepository(new Map([[id, submittedArtifact]]));
    const { publisher } = createMockEventPublisher();
    const service = new ArtifactLifecycleService(repo, publisher);

    await expect(service.archive(id)).rejects.toThrow("cannot archive");
    await expect(service.archive(id)).rejects.toThrow("submitted");
  });
});
