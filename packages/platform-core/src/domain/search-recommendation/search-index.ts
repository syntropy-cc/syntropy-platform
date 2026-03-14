/**
 * SearchIndex entity — indexed searchable representation of a published entity (COMP-011.1).
 * Architecture: Platform Core — Search & Recommendation.
 * Read model: eventual consistency; tsvector for FTS; optional embedding for semantic search (COMP-011.4).
 */

export interface SearchIndexParams {
  indexId: string;
  entityType: string;
  entityId: string;
  tsvectorContent: string;
  embedding?: number[] | null;
}

export class SearchIndex {
  readonly indexId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly tsvectorContent: string;
  readonly embedding: number[] | null;

  private constructor(params: SearchIndexParams) {
    this.indexId = params.indexId;
    this.entityType = params.entityType;
    this.entityId = params.entityId;
    this.tsvectorContent = params.tsvectorContent;
    this.embedding = params.embedding ?? null;
  }

  /**
   * Create a SearchIndex from known state (e.g. loaded from persistence or built from event).
   */
  static create(params: SearchIndexParams): SearchIndex {
    return new SearchIndex(params);
  }

  /**
   * Create a copy with updated embedding (for async embedding backfill in COMP-011.4).
   */
  withEmbedding(embedding: number[] | null): SearchIndex {
    return new SearchIndex({
      indexId: this.indexId,
      entityType: this.entityType,
      entityId: this.entityId,
      tsvectorContent: this.tsvectorContent,
      embedding,
    });
  }
}
