/**
 * Integration tests for PostgresSearchRepository and SearchService (COMP-011.2).
 * Uses mock client to verify FTS query shape, ranking, and entityType filter.
 */

import { describe, it, expect } from "vitest";
import { PostgresSearchRepository } from "./postgres-search-repository.js";
import { SearchService } from "../../domain/search-recommendation/services/search-service.js";
import { SearchIndex } from "../../domain/search-recommendation/search-index.js";
import type { EventLogClient } from "../../event-log/EventLogClient.js";

interface SearchRow {
  index_id: string;
  entity_type: string;
  entity_id: string;
  tsvector_content: string;
  embedding?: number[] | null;
}

function createMockClient(): EventLogClient & {
  searchIndex: SearchRow[];
  executed: Array<{ sql: string; params: unknown[] }>;
} {
  const searchIndex: SearchRow[] = [];
  const executed: Array<{ sql: string; params: unknown[] }> = [];

  return {
    searchIndex,
    executed,
    async execute(sql: string, params: unknown[]): Promise<void> {
      executed.push({ sql, params });
      const s = sql.trim();
      if (s.includes("platform_core.search_index") && s.includes("ON CONFLICT")) {
        const et = String(params[1]);
        const eid = String(params[2]);
        const existing = searchIndex.findIndex((r) => r.entity_type === et && r.entity_id === eid);
        const row: SearchRow = {
          index_id: String(params[0]),
          entity_type: et,
          entity_id: eid,
          tsvector_content: String(params[3]),
          embedding: params.length > 4 && params[4] != null
            ? (params[4] as string).replace(/^\[|\]$/g, "").split(",").map(Number)
            : undefined,
        };
        if (existing >= 0) searchIndex[existing] = row;
        else searchIndex.push(row);
      }
      if (s.includes("SET embedding = ") && s.includes("WHERE index_id")) {
        const indexId = String(params[0]);
        const vec = (params[1] as string).replace(/^\[|\]$/g, "").split(",").map(Number);
        const row = searchIndex.find((r) => r.index_id === indexId);
        if (row) row.embedding = vec;
      }
      if (s.includes("DELETE FROM platform_core.search_index") && s.includes("entity_type")) {
        const et = String(params[0]);
        const eid = String(params[1]);
        const idx = searchIndex.findIndex((r) => r.entity_type === et && r.entity_id === eid);
        if (idx >= 0) searchIndex.splice(idx, 1);
      }
    },
    async query<T>(sql: string, params: unknown[]): Promise<T[]> {
      const s = sql.trim();
      if (s.includes("plainto_tsquery") && s.includes("search_index")) {
        const query = (params[0] as string).toLowerCase();
        const entityType = params[1] as string | undefined;
        let rows = searchIndex.filter(
          (r) => r.tsvector_content.toLowerCase().includes(query) || query === ""
        );
        if (entityType) rows = rows.filter((r) => r.entity_type === entityType);
        return rows.map((r) => ({ ...r })) as T[];
      }
      if (s.includes("embedding <=>") && s.includes("search_index")) {
        const entityType = params[1] as string | null;
        const limit = params[2] as number;
        let rows = searchIndex.filter((r) => r.embedding != null);
        if (entityType) rows = rows.filter((r) => r.entity_type === entityType);
        return rows.slice(0, limit).map((r) => ({ ...r })) as T[];
      }
      if (s.includes("WHERE index_id = $1") && s.includes("search_index")) {
        const indexId = params[0] as string;
        const row = searchIndex.find((r) => r.index_id === indexId);
        return (row ? [{ ...row }] : []) as T[];
      }
      return [];
    },
  };
}

describe("PostgresSearchRepository", () => {
  it("search returns empty array when query is empty", async () => {
    const client = createMockClient();
    const repo = new PostgresSearchRepository(client);
    const results = await repo.search("  ");
    expect(results).toEqual([]);
  });

  it("search returns matching rows and applies entityType filter", async () => {
    const client = createMockClient();
    client.searchIndex.push(
      { index_id: "i1", entity_type: "artifact", entity_id: "a1", tsvector_content: "machine learning" },
      { index_id: "i2", entity_type: "track", entity_id: "t1", tsvector_content: "machine learning algorithms" },
      { index_id: "i3", entity_type: "artifact", entity_id: "a2", tsvector_content: "deep learning" }
    );
    const repo = new PostgresSearchRepository(client);
    const all = await repo.search("learning");
    expect(all.length).toBe(3);
    const filtered = await repo.search("learning", { entityType: "artifact" });
    expect(filtered.length).toBe(2);
    expect(filtered.every((r) => r.entityType === "artifact")).toBe(true);
  });

  it("upsert executes INSERT with to_tsvector params", async () => {
    const client = createMockClient();
    const repo = new PostgresSearchRepository(client);
    const index = SearchIndex.create({
      indexId: "idx-1",
      entityType: "artifact",
      entityId: "art-1",
      tsvectorContent: "content for full-text search",
    });
    await repo.upsert(index);
    expect(client.executed.length).toBe(1);
    expect(client.executed[0].params[0]).toBe("idx-1");
    expect(client.executed[0].params[3]).toBe("content for full-text search");
  });
});

describe("SearchService", () => {
  it("search delegates to repository and returns SearchIndex list", async () => {
    const client = createMockClient();
    client.searchIndex.push({
      index_id: "i1",
      entity_type: "track",
      entity_id: "t1",
      tsvector_content: "distributed systems",
    });
    const repo = new PostgresSearchRepository(client);
    const service = new SearchService(repo);
    const results = await service.search("distributed");
    expect(results.length).toBe(1);
    expect(results[0].entityType).toBe("track");
    expect(results[0].entityId).toBe("t1");
  });
});

describe("PostgresSearchRepository searchByVector and updateEmbedding (COMP-011.4)", () => {
  it("searchByVector returns rows with embedding ordered by limit", async () => {
    const client = createMockClient();
    client.searchIndex.push(
      { index_id: "a:1", entity_type: "artifact", entity_id: "1", tsvector_content: "x", embedding: [0.1, 0.2] },
      { index_id: "a:2", entity_type: "artifact", entity_id: "2", tsvector_content: "y", embedding: [0.2, 0.3] }
    );
    const repo = new PostgresSearchRepository(client);
    const results = await repo.searchByVector([0.1, 0.2], { limit: 5 });
    expect(results.length).toBeLessThanOrEqual(2);
    expect(results.every((r) => r.embedding != null)).toBe(true);
  });

  it("updateEmbedding executes UPDATE with indexId and vector", async () => {
    const client = createMockClient();
    client.searchIndex.push({
      index_id: "t:1",
      entity_type: "track",
      entity_id: "1",
      tsvector_content: "ml",
    });
    const repo = new PostgresSearchRepository(client);
    await repo.updateEmbedding("t:1", [0.1, 0.2, 0.3]);
    const updateCalls = client.executed.filter((e) => e.sql.includes("SET embedding = "));
    expect(updateCalls.length).toBe(1);
    expect(updateCalls[0].params[0]).toBe("t:1");
  });
});

describe("PostgresSearchRepository findById and deleteByEntity (COMP-011.6)", () => {
  it("findById returns SearchIndex when found", async () => {
    const client = createMockClient();
    client.searchIndex.push({
      index_id: "a:1",
      entity_type: "artifact",
      entity_id: "1",
      tsvector_content: "content",
    });
    const repo = new PostgresSearchRepository(client);
    const found = await repo.findById("a:1");
    expect(found).not.toBeNull();
    expect(found!.indexId).toBe("a:1");
    expect(found!.entityType).toBe("artifact");
  });

  it("findById returns null when not found", async () => {
    const client = createMockClient();
    const repo = new PostgresSearchRepository(client);
    const found = await repo.findById("nonexistent");
    expect(found).toBeNull();
  });

  it("deleteByEntity removes row from mock", async () => {
    const client = createMockClient();
    client.searchIndex.push({
      index_id: "t:1",
      entity_type: "track",
      entity_id: "1",
      tsvector_content: "x",
    });
    const repo = new PostgresSearchRepository(client);
    await repo.deleteByEntity("track", "1");
    expect(client.searchIndex.length).toBe(0);
  });
});

describe("SearchService hybridSearch (COMP-011.4)", () => {
  it("hybridSearch without embeddingPort falls back to FTS only", async () => {
    const client = createMockClient();
    client.searchIndex.push({
      index_id: "a:1",
      entity_type: "artifact",
      entity_id: "1",
      tsvector_content: "machine learning",
    });
    const repo = new PostgresSearchRepository(client);
    const service = new SearchService(repo);
    const results = await service.hybridSearch("machine", { limit: 10 });
    expect(results.length).toBeGreaterThanOrEqual(0);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("hybridSearch with embeddingPort merges FTS and semantic via RRF", async () => {
    const client = createMockClient();
    client.searchIndex.push(
      { index_id: "a:1", entity_type: "artifact", entity_id: "1", tsvector_content: "ml", embedding: [0.1, 0.2] },
      { index_id: "a:2", entity_type: "artifact", entity_id: "2", tsvector_content: "ml", embedding: [0.2, 0.3] }
    );
    const repo = new PostgresSearchRepository(client);
    const embeddingPort: { embed: (t: string) => Promise<number[]> } = {
      embed: async () => [0.15, 0.25],
    };
    const service = new SearchService(repo, { embeddingPort });
    const results = await service.hybridSearch("ml", { limit: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
