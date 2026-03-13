/**
 * ArtifactSummary — read model for published artifact list (COMP-003.6).
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { ArtifactId } from "../value-objects/artifact-id.js";
import type { AuthorId } from "../value-objects/author-id.js";

export interface ArtifactSummary {
  id: ArtifactId;
  authorId: AuthorId;
  artifactType: string | null;
  tags: readonly string[];
  publishedAt: Date;
  createdAt: Date;
  contentHash: string | null;
  nostrEventId: string | null;
}
