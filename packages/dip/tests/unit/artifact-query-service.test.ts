/**
 * Unit tests for ArtifactQueryService (COMP-003.6).
 */

import { describe, expect, it, vi } from "vitest";
import { Artifact } from "../../src/domain/artifact-registry/artifact.js";
import type {
  ArtifactQueryFilter,
  ArtifactRepository,
  FindPublishedResult,
} from "../../src/domain/artifact-registry/repositories/artifact-repository.js";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import { ArtifactQueryService } from "../../src/application/artifact-query-service.js";

function createMockRepository(
  findPublishedResult: FindPublishedResult,
): ArtifactRepository {
  return {
    findById: vi.fn(),
    save: vi.fn(),
    findByAuthor: vi.fn(),
    findPublished: vi.fn(async () => findPublishedResult),
  };
}

describe("ArtifactQueryService", () => {
  it("findPublished with no filter returns repository items as ArtifactSummary", async () => {
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const artifact = Artifact.draft({
      id: createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479"),
      authorId,
    })
      .submit()
      .publish();
    const repo = createMockRepository({ items: [artifact] });
    const service = new ArtifactQueryService(repo);

    const result = await service.findPublished();

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: artifact.id,
      authorId: artifact.authorId,
      publishedAt: artifact.publishedAt,
      createdAt: artifact.createdAt,
    });
    expect(repo.findPublished).toHaveBeenCalledWith({
      filter: undefined,
      cursor: undefined,
      limit: 20,
    });
  });

  it("findPublished with authorId filter passes filter to repository", async () => {
    const repo = createMockRepository({ items: [] });
    const service = new ArtifactQueryService(repo);
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const filter: ArtifactQueryFilter = { authorId };

    await service.findPublished(filter);

    expect(repo.findPublished).toHaveBeenCalledWith({
      filter: { authorId },
      cursor: undefined,
      limit: 20,
    });
  });

  it("findPublished with type and tag filter passes through to repository", async () => {
    const repo = createMockRepository({ items: [] });
    const service = new ArtifactQueryService(repo);
    const filter: ArtifactQueryFilter = {
      type: "scientific-article",
      tag: "ml",
    };

    await service.findPublished(filter);

    expect(repo.findPublished).toHaveBeenCalledWith({
      filter: { type: "scientific-article", tag: "ml" },
      cursor: undefined,
      limit: 20,
    });
  });

  it("findPublished with pagination passes cursor and limit", async () => {
    const repo = createMockRepository({ items: [], nextCursor: "next" });
    const service = new ArtifactQueryService(repo);

    const result = await service.findPublished(undefined, {
      cursor: "cursor-abc",
      limit: 5,
    });

    expect(repo.findPublished).toHaveBeenCalledWith({
      filter: undefined,
      cursor: "cursor-abc",
      limit: 5,
    });
    expect(result.nextCursor).toBe("next");
  });

  it("findPublished caps limit at MAX_LIMIT", async () => {
    const repo = createMockRepository({ items: [] });
    const service = new ArtifactQueryService(repo);

    await service.findPublished(undefined, { limit: 200 });

    expect(repo.findPublished).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });
});
