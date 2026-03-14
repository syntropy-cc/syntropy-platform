/**
 * Search repository port (COMP-011.2, COMP-011.3).
 * Architecture: Platform Core — Search & Recommendation, PAT-004.
 */

import type { SearchIndex } from "../search-index.js";

export interface SearchFilters {
  entityType?: string;
}

/**
 * Repository for search index: full-text search and upsert for indexing.
 */
export interface SearchRepository {
  search(query: string, filters?: SearchFilters): Promise<SearchIndex[]>;
  upsert(index: SearchIndex): Promise<void>;
}
