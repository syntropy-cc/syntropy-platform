/**
 * Semantic search service — embedding-based search via pgvector (COMP-011.4).
 * Embeds query then finds nearest neighbors with <=> operator.
 */

import type { EmbeddingPort } from "../ports/embedding-port.js";
import type { SearchRepository, SearchFilters } from "../ports/search-repository.js";
import type { SearchIndex } from "../search-index.js";

export interface SemanticSearchServiceOptions {
  repository: SearchRepository;
  embeddingPort: EmbeddingPort;
}

/**
 * Service for semantic (vector) search. Embeds the query then runs vector similarity search.
 */
export class SemanticSearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly embeddingPort: EmbeddingPort
  ) {}

  /**
   * Search by semantic similarity. Embeds query then returns nearest neighbors.
   */
  async search(
    query: string,
    options?: { limit?: number; filters?: SearchFilters }
  ): Promise<SearchIndex[]> {
    const trimmed = (query ?? "").trim();
    if (!trimmed) return [];

    const embedding = await this.embeddingPort.embed(trimmed);
    return this.repository.searchByVector(embedding, {
      limit: options?.limit ?? 20,
      filters: options?.filters,
    });
  }
}
