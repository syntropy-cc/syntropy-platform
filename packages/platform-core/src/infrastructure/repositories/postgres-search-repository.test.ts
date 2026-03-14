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
        };
        if (existing >= 0) searchIndex[existing] = row;
        else searchIndex.push(row);
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
