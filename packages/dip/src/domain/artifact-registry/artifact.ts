/**
 * Artifact aggregate — versioned, identity-anchorable creative product.
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { ArtifactId } from "./value-objects/artifact-id.js";
import type { AuthorId } from "./value-objects/author-id.js";
import type { ContentHash } from "./value-objects/content-hash.js";
import { ArtifactStatus } from "./artifact-status.js";

/**
 * Artifact aggregate. Lifecycle: draft → published (optional: archived).
 * Invariants: publishedAt set only when status is published; archivedAt only when archived.
 */
export class Artifact {
  readonly id: ArtifactId;
  readonly authorId: AuthorId;
  readonly contentHash: ContentHash | null;
  readonly status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
  readonly createdAt: Date;
  readonly publishedAt: Date | null;
  readonly archivedAt: Date | null;

  private constructor(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash: ContentHash | null;
    status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
    createdAt: Date;
    publishedAt: Date | null;
    archivedAt: Date | null;
  }) {
    this.id = params.id;
    this.authorId = params.authorId;
    this.contentHash = params.contentHash;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this.publishedAt = params.publishedAt;
    this.archivedAt = params.archivedAt;
  }

  /**
   * Creates a new Artifact in draft state.
   *
   * @param params.id - ArtifactId
   * @param params.authorId - AuthorId
   * @param params.contentHash - Optional; can be null in draft
   * @param params.createdAt - Optional; defaults to new Date()
   */
  static draft(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash?: ContentHash | null;
    createdAt?: Date;
  }): Artifact {
    const createdAt = params.createdAt ?? new Date();
    return new Artifact({
      id: params.id,
      authorId: params.authorId,
      contentHash: params.contentHash ?? null,
      status: ArtifactStatus.Draft,
      createdAt,
      publishedAt: null,
      archivedAt: null,
    });
  }
}
