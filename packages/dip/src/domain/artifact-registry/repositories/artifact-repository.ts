/**
 * ArtifactRepository — domain interface for artifact persistence.
 * Architecture: COMP-003, DIP Artifact Registry (ARCH-002: depend on abstractions)
 */

import type { Artifact } from "../artifact.js";
import type { ArtifactId } from "../value-objects/artifact-id.js";

/**
 * Port for persisting and loading Artifact aggregates.
 * Implementations live in the infrastructure layer (e.g. PostgresArtifactRepository).
 */
export interface ArtifactRepository {
  findById(id: ArtifactId): Promise<Artifact | null>;
  save(artifact: Artifact): Promise<void>;
}
