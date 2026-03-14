/**
 * Search repository port (COMP-011.2, COMP-011.3, COMP-011.4).
 * Architecture: Platform Core — Search & Recommendation, PAT-004.
 */

import type { SearchIndex } from "../search-index.js";

export interface SearchFilters {
  entityType?: string;
}

export interface SearchByVectorOptions {
  limit?: number;
  filters?: SearchFilters;
}

/**
 * Repository for search index: full-text search, vector search, and upsert for indexing.
 */
export interface SearchRepository {
  search(query: string, filters?: SearchFilters): Promise<SearchIndex[]>;
  upsert(index: SearchIndex): Promise<void>;
  /** Semantic search by embedding vector (pgvector <=>). COMP-011.4 */
  searchByVector(
    queryEmbedding: number[],
    options?: SearchByVectorOptions
  ): Promise<SearchIndex[]>;
  /** Update embedding for an existing row (async backfill). COMP-011.4 */
  updateEmbedding(indexId: string, embedding: number[]): Promise<void>;
  /** Get a single index by index_id. COMP-011.6 */
  findById(indexId: string): Promise<SearchIndex | null>;
  /** Delete by composite entity key. COMP-011.6 */
  deleteByEntity(entityType: string, entityId: string): Promise<void>;
}
