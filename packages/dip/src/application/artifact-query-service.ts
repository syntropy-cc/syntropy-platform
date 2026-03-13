/**
 * ArtifactQueryService — application service for querying published artifacts (COMP-003.6).
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { Artifact } from "../domain/artifact-registry/artifact.js";
import type { ArtifactSummary } from "../domain/artifact-registry/queries/artifact-summary.js";
import type {
  ArtifactQueryFilter,
  ArtifactRepository,
} from "../domain/artifact-registry/repositories/artifact-repository.js";

export interface ArtifactQueryPagination {
  cursor?: string;
  limit?: number;
}

export interface FindPublishedResult {
  items: ArtifactSummary[];
  nextCursor?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function artifactToSummary(artifact: Artifact): ArtifactSummary {
  return {
    id: artifact.id,
    authorId: artifact.authorId,
    artifactType: artifact.artifactType,
    tags: artifact.tags,
    publishedAt: artifact.publishedAt ?? artifact.createdAt,
    createdAt: artifact.createdAt,
    contentHash: artifact.contentHash,
    nostrEventId: artifact.nostrEventId,
  };
}

/**
 * Application service for querying published artifacts with filter and cursor-based pagination.
 */
export class ArtifactQueryService {
  constructor(private readonly repository: ArtifactRepository) {}

  /**
   * Returns published artifacts matching the filter, with cursor-based pagination.
   *
   * @param filter - Optional filter by authorId, type, or tag
   * @param pagination - Optional cursor and limit (default 20, max 100)
   * @returns Items and optional nextCursor for the next page
   */
  async findPublished(
    filter?: ArtifactQueryFilter,
    pagination?: ArtifactQueryPagination,
  ): Promise<FindPublishedResult> {
    const limit = Math.min(
      pagination?.limit ?? DEFAULT_LIMIT,
      MAX_LIMIT,
    );
    const result = await this.repository.findPublished({
      filter,
      cursor: pagination?.cursor,
      limit,
    });
    return {
      items: result.items.map(artifactToSummary),
      nextCursor: result.nextCursor,
    };
  }
}
