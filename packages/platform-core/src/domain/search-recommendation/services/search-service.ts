/**
 * Search service — full-text and hybrid search over SearchIndex (COMP-011.2, COMP-011.4).
 * Delegates to SearchRepository; hybrid combines FTS + semantic with combined score.
 */

import type { EmbeddingPort } from "../ports/embedding-port.js";
import type { SearchRepository, SearchFilters } from "../ports/search-repository.js";
import type { SearchIndex } from "../search-index.js";

export interface SearchServiceOptions {
  repository: SearchRepository;
  embeddingPort?: EmbeddingPort;
}

const DEFAULT_HYBRID_LIMIT = 20;
const MAX_HYBRID_LIMIT = 100;

/**
 * Key for deduplication: entity_type + entity_id.
 */
function docKey(doc: SearchIndex): string {
  return `${doc.entityType}:${doc.entityId}`;
}

/**
 * Reciprocal Rank Fusion: score = sum(1 / (k + rank)), k=60 typical.
 * Merges FTS and semantic rankings into a single ordered list.
 */
function reciprocalRankFusion(
  ftsList: SearchIndex[],
  semanticList: SearchIndex[],
  k: number = 60
): SearchIndex[] {
  const scores = new Map<string, { doc: SearchIndex; score: number }>();
  [ftsList, semanticList].forEach((list) => {
    list.forEach((doc, rank) => {
      const key = docKey(doc);
      const rrf = 1 / (k + rank + 1);
      const existing = scores.get(key);
      if (existing) {
        existing.score += rrf;
      } else {
        scores.set(key, { doc, score: rrf });
      }
    });
  });
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map((x) => x.doc);
}

/**
 * Service for full-text and hybrid search. Results ranked by ts_rank (FTS) or RRF (hybrid).
 */
export class SearchService {
  private readonly embeddingPort: EmbeddingPort | null;

  constructor(
    private readonly repository: SearchRepository,
    options?: SearchServiceOptions
  ) {
    this.embeddingPort = options?.embeddingPort ?? null;
  }

  /**
   * Full-text search. Uses FTS (plainto_tsquery) and ranks by ts_rank.
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchIndex[]> {
    return this.repository.search(query, filters);
  }

  /**
   * Hybrid search: combines FTS and semantic results with Reciprocal Rank Fusion.
   * Requires embeddingPort to be set. Falls back to FTS-only if no embeddingPort.
   */
  async hybridSearch(
    query: string,
    options?: { limit?: number; filters?: SearchFilters }
  ): Promise<SearchIndex[]> {
    const limit = Math.min(options?.limit ?? DEFAULT_HYBRID_LIMIT, MAX_HYBRID_LIMIT);
    const filters = options?.filters;

    const [ftsResults, semanticResults] = await Promise.all([
      this.repository.search(query, filters),
      this.embeddingPort
        ? (async () => {
            const embedding = await this.embeddingPort!.embed(query.trim() || " ");
            return this.repository.searchByVector(embedding, { limit, filters });
          })()
        : Promise.resolve([]),
    ]);

    if (semanticResults.length === 0) return ftsResults.slice(0, limit);
    return reciprocalRankFusion(ftsResults, semanticResults).slice(0, limit);
  }
}
