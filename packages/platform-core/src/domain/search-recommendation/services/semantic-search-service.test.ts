/**
 * Unit tests for SemanticSearchService (COMP-011.4).
 */

import { describe, it, expect, vi } from "vitest";
import { SemanticSearchService } from "./semantic-search-service.js";
import { SearchIndex } from "../search-index.js";
import type { SearchRepository } from "../ports/search-repository.js";
import type { EmbeddingPort } from "../ports/embedding-port.js";

describe("SemanticSearchService", () => {
  it("search returns empty array when query is empty", async () => {
    const embed = vi.fn();
    const searchByVector = vi.fn();
    const repo = { search: vi.fn(), upsert: vi.fn(), searchByVector, updateEmbedding: vi.fn() } as unknown as SearchRepository;
    const embeddingPort = { embed } as EmbeddingPort;
    const service = new SemanticSearchService(repo, embeddingPort);
    const results = await service.search("  ");
    expect(results).toEqual([]);
    expect(embed).not.toHaveBeenCalled();
    expect(searchByVector).not.toHaveBeenCalled();
  });

  it("search embeds query then calls searchByVector with result", async () => {
    const embedding = [0.1, 0.2, 0.3];
    const embed = vi.fn().mockResolvedValue(embedding);
    const docs = [
      SearchIndex.create({
        indexId: "a:1",
        entityType: "artifact",
        entityId: "1",
        tsvectorContent: "x",
        embedding,
      }),
    ];
    const searchByVector = vi.fn().mockResolvedValue(docs);
    const repo = {
      search: vi.fn(),
      upsert: vi.fn(),
      searchByVector,
      updateEmbedding: vi.fn(),
    } as unknown as SearchRepository;
    const embeddingPort = { embed } as EmbeddingPort;
    const service = new SemanticSearchService(repo, embeddingPort);

    const results = await service.search("machine learning", { limit: 10 });

    expect(embed).toHaveBeenCalledOnce();
    expect(embed).toHaveBeenCalledWith("machine learning");
    expect(searchByVector).toHaveBeenCalledWith(embedding, { limit: 10, filters: undefined });
    expect(results).toEqual(docs);
  });

  it("search passes filters to searchByVector", async () => {
    const embed = vi.fn().mockResolvedValue([0.1]);
    const searchByVector = vi.fn().mockResolvedValue([]);
    const repo = {
      search: vi.fn(),
      upsert: vi.fn(),
      searchByVector,
      updateEmbedding: vi.fn(),
    } as unknown as SearchRepository;
    const service = new SemanticSearchService(repo, { embed } as EmbeddingPort);

    await service.search("query", { limit: 5, filters: { entityType: "track" } });

    expect(searchByVector).toHaveBeenCalledWith(
      [0.1],
      { limit: 5, filters: { entityType: "track" } }
    );
  });
});
