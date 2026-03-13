/**
 * ArtifactRepository — domain interface for artifact persistence.
 * Architecture: COMP-003, DIP Artifact Registry (ARCH-002: depend on abstractions)
 */

import type { Artifact } from "../artifact.js";
import type { ArtifactId } from "../value-objects/artifact-id.js";
import type { AuthorId } from "../value-objects/author-id.js";

/** Options for findPublished pagination. */
export interface FindPublishedOptions {
  limit?: number;
  offset?: number;
}

/**
 * Port for persisting and loading Artifact aggregates.
 * Implementations live in the infrastructure layer (e.g. PostgresArtifactRepository).
 */
export interface ArtifactRepository {
  findById(id: ArtifactId): Promise<Artifact | null>;
  save(artifact: Artifact): Promise<void>;
  findByAuthor(authorId: AuthorId): Promise<Artifact[]>;
  findPublished(options?: FindPublishedOptions): Promise<Artifact[]>;
}
