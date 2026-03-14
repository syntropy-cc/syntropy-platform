/**
 * Search service — full-text search over SearchIndex (COMP-011.2).
 * Delegates to SearchRepository; uses to_tsquery with plainto_tsquery fallback at repository level.
 */

import type { SearchRepository, SearchFilters } from "../ports/search-repository.js";
import type { SearchIndex } from "../search-index.js";

export interface SearchServiceOptions {
  repository: SearchRepository;
}

/**
 * Service for full-text search. Results are ranked by ts_rank; filters by entityType supported.
 */
export class SearchService {
  constructor(private readonly repository: SearchRepository) {}

  /**
   * Search the index by query. Uses FTS (plainto_tsquery) and ranks by ts_rank.
   * Optionally filter by entityType.
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchIndex[]> {
    return this.repository.search(query, filters);
  }
}
