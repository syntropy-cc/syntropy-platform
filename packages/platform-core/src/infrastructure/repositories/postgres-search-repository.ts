/**
 * PostgreSQL implementation of SearchRepository (COMP-011.2, COMP-011.3, COMP-011.4).
 * Full-text search via tsvector; vector search via pgvector; upsert for EventIndexingConsumer.
 */

import type { EventLogClient } from "../../event-log/EventLogClient.js";
import type {
  SearchRepository,
  SearchFilters,
  SearchByVectorOptions,
} from "../../domain/search-recommendation/ports/search-repository.js";
import { SearchIndex } from "../../domain/search-recommendation/search-index.js";

/** Format embedding array for pgvector: '[a,b,c,...]' */
function embeddingToVectorLiteral(embedding: number[]): string {
  return "[" + embedding.join(",") + "]";
}

interface SearchRow {
  index_id: string;
  entity_type: string;
  entity_id: string;
  tsvector_content: string;
  embedding?: number[] | null;
}

function rowToSearchIndex(row: SearchRow): SearchIndex {
  return SearchIndex.create({
    indexId: row.index_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    tsvectorContent: typeof row.tsvector_content === "string" ? row.tsvector_content : String(row.tsvector_content),
    embedding: Array.isArray(row.embedding) ? row.embedding : null,
  });
}

/**
 * Full-text search: uses plainto_tsquery for safe query parsing; ranked by ts_rank.
 * Supports optional entityType filter.
 */
const SEARCH_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content, embedding
  FROM platform_core.search_index
  WHERE tsvector_content @@ plainto_tsquery('english', $1)
  ORDER BY ts_rank(tsvector_content, plainto_tsquery('english', $1)) DESC
`;

const SEARCH_WITH_TYPE_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content, embedding
  FROM platform_core.search_index
  WHERE tsvector_content @@ plainto_tsquery('english', $1)
    AND entity_type = $2
  ORDER BY ts_rank(tsvector_content, plainto_tsquery('english', $1)) DESC
`;

const UPSERT_SQL = `
  INSERT INTO platform_core.search_index (index_id, entity_type, entity_id, tsvector_content, embedding, updated_at)
  VALUES ($1, $2, $3, to_tsvector('english', $4), $5::vector, now())
  ON CONFLICT (entity_type, entity_id)
  DO UPDATE SET
    index_id = EXCLUDED.index_id,
    tsvector_content = to_tsvector('english', $4),
    embedding = COALESCE(EXCLUDED.embedding, platform_core.search_index.embedding),
    updated_at = now()
`;

const UPSERT_WITHOUT_EMBEDDING_SQL = `
  INSERT INTO platform_core.search_index (index_id, entity_type, entity_id, tsvector_content, updated_at)
  VALUES ($1, $2, $3, to_tsvector('english', $4), now())
  ON CONFLICT (entity_type, entity_id)
  DO UPDATE SET
    index_id = EXCLUDED.index_id,
    tsvector_content = to_tsvector('english', $4),
    updated_at = now()
`;

const SEARCH_BY_VECTOR_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content, embedding
  FROM platform_core.search_index
  WHERE embedding IS NOT NULL
    AND ($2::text IS NULL OR entity_type = $2)
  ORDER BY embedding <=> $1::vector
  LIMIT $3
`;

const UPDATE_EMBEDDING_SQL = `
  UPDATE platform_core.search_index
  SET embedding = $2::vector, updated_at = now()
  WHERE index_id = $1
`;

const FIND_BY_ID_SQL = `
  SELECT index_id, entity_type, entity_id, tsvector_content, embedding
  FROM platform_core.search_index
  WHERE index_id = $1
`;

const DELETE_BY_ENTITY_SQL = `
  DELETE FROM platform_core.search_index
  WHERE entity_type = $1 AND entity_id = $2
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
    if (index.embedding != null && index.embedding.length > 0) {
      const vec = embeddingToVectorLiteral(index.embedding);
      await this.client.execute(UPSERT_SQL.trim(), [
        index.indexId,
        index.entityType,
        index.entityId,
        index.tsvectorContent,
        vec,
      ]);
    } else {
      await this.client.execute(UPSERT_WITHOUT_EMBEDDING_SQL.trim(), [
        index.indexId,
        index.entityType,
        index.entityId,
        index.tsvectorContent,
      ]);
    }
  }

  async searchByVector(
    queryEmbedding: number[],
    options?: SearchByVectorOptions
  ): Promise<SearchIndex[]> {
    const limit = Math.min(options?.limit ?? 20, 100);
    const entityType = options?.filters?.entityType ?? null;
    const vec = embeddingToVectorLiteral(queryEmbedding);
    const rows = await this.client.query<SearchRow>(SEARCH_BY_VECTOR_SQL.trim(), [
      vec,
      entityType,
      limit,
    ]);
    return rows.map(rowToSearchIndex);
  }

  async updateEmbedding(indexId: string, embedding: number[]): Promise<void> {
    const vec = embeddingToVectorLiteral(embedding);
    await this.client.execute(UPDATE_EMBEDDING_SQL.trim(), [indexId, vec]);
  }

  async findById(indexId: string): Promise<SearchIndex | null> {
    const rows = await this.client.query<SearchRow>(FIND_BY_ID_SQL.trim(), [indexId]);
    if (rows.length === 0) return null;
    return rowToSearchIndex(rows[0]!);
  }

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    await this.client.execute(DELETE_BY_ENTITY_SQL.trim(), [entityType, entityId]);
  }
}
