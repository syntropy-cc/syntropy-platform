/**
 * PostgreSQL implementation of SearchRepository (COMP-011.2, COMP-011.3).
 * Full-text search via tsvector; upsert for EventIndexingConsumer.
 */

import type { EventLogClient } from "../../event-log/EventLogClient.js";
import type { SearchRepository, SearchFilters } from "../../domain/search-recommendation/ports/search-repository.js";
import { SearchIndex } from "../../domain/search-recommendation/search-index.js";

interface SearchRow {
  index_id: string;
  entity_type: string;
  entity_id: string;
  tsvector_content: string;
}

function rowToSearchIndex(row: SearchRow): SearchIndex {
  return SearchIndex.create({
    indexId: row.index_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    tsvectorContent: typeof row.tsvector_content === "string" ? row.tsvector_content : String(row.tsvector_content),
  });
}

/**
 * Full-text search: uses plainto_tsquery for safe query parsing; ranked by ts_rank.
 * Supports optional entityType filter.
 */
const SEARCH_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content
  FROM platform_core.search_index
  WHERE tsvector_content @@ plainto_tsquery('english', $1)
  ORDER BY ts_rank(tsvector_content, plainto_tsquery('english', $1)) DESC
`;

const SEARCH_WITH_TYPE_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content
  FROM platform_core.search_index
  WHERE tsvector_content @@ plainto_tsquery('english', $1)
    AND entity_type = $2
  ORDER BY ts_rank(tsvector_content, plainto_tsquery('english', $1)) DESC
`;

const UPSERT_SQL = `
  INSERT INTO platform_core.search_index (index_id, entity_type, entity_id, tsvector_content, updated_at)
  VALUES ($1, $2, $3, to_tsvector('english', $4), now())
  ON CONFLICT (entity_type, entity_id)
  DO UPDATE SET
    index_id = EXCLUDED.index_id,
    tsvector_content = to_tsvector('english', $4),
    updated_at = now()
`;

export class PostgresSearchRepository implements SearchRepository {
  constructor(private readonly client: EventLogClient) {}

  async search(query: string, filters?: SearchFilters): Promise<SearchIndex[]> {
    const trimmed = (query ?? "").trim();
    if (!trimmed) return [];

    if (filters?.entityType) {
      const rows = await this.client.query<SearchRow>(SEARCH_WITH_TYPE_SQL.trim(), [trimmed, filters.entityType]);
      return rows.map(rowToSearchIndex);
    }
    const rows = await this.client.query<SearchRow>(SEARCH_SQL.trim(), [trimmed]);
    return rows.map(rowToSearchIndex);
  }

  async upsert(index: SearchIndex): Promise<void> {
    await this.client.execute(UPSERT_SQL.trim(), [
      index.indexId,
      index.entityType,
      index.entityId,
      index.tsvectorContent,
    ]);
  }
}
