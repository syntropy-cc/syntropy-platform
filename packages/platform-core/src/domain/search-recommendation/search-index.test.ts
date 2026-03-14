/**
 * Unit tests for SearchIndex entity (COMP-011.1).
 */

import { describe, it, expect } from "vitest";
import { SearchIndex } from "./search-index.js";

describe("SearchIndex", () => {
  it("create builds entity with required fields", () => {
    const index = SearchIndex.create({
      indexId: "idx-1",
      entityType: "artifact",
      entityId: "art-123",
      tsvectorContent: "machine learning algorithm",
    });
    expect(index.indexId).toBe("idx-1");
    expect(index.entityType).toBe("artifact");
    expect(index.entityId).toBe("art-123");
    expect(index.tsvectorContent).toBe("machine learning algorithm");
    expect(index.embedding).toBeNull();
  });

  it("create with embedding stores optional embedding", () => {
    const embedding = [0.1, -0.2, 0.3];
    const index = SearchIndex.create({
      indexId: "idx-2",
      entityType: "track",
      entityId: "trk-456",
      tsvectorContent: "distributed systems",
      embedding,
    });
    expect(index.embedding).toEqual(embedding);
  });

  it("create with null embedding sets embedding to null", () => {
    const index = SearchIndex.create({
      indexId: "idx-3",
      entityType: "article",
      entityId: "art-789",
      tsvectorContent: "peer review",
      embedding: null,
    });
    expect(index.embedding).toBeNull();
  });

  it("withEmbedding returns new SearchIndex with updated embedding", () => {
    const index = SearchIndex.create({
      indexId: "idx-4",
      entityType: "fragment",
      entityId: "frag-abc",
      tsvectorContent: "content",
    });
    const newEmbedding = [0.5, 0.5];
    const updated = index.withEmbedding(newEmbedding);
    expect(updated.embedding).toEqual(newEmbedding);
    expect(updated.indexId).toBe(index.indexId);
    expect(index.embedding).toBeNull();
  });

  it("withEmbedding null clears embedding", () => {
    const index = SearchIndex.create({
      indexId: "idx-5",
      entityType: "artifact",
      entityId: "art-x",
      tsvectorContent: "text",
      embedding: [0.1, 0.2],
    });
    const updated = index.withEmbedding(null);
    expect(updated.embedding).toBeNull();
    expect(index.embedding).toEqual([0.1, 0.2]);
  });
});
