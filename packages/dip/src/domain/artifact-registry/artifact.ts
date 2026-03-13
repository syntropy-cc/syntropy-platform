/**
 * Artifact aggregate — versioned, identity-anchorable creative product.
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { ArtifactId } from "./value-objects/artifact-id.js";
import type { ArtifactType } from "./value-objects/artifact-type.js";
import type { AuthorId } from "./value-objects/author-id.js";
import type { ContentHash } from "./value-objects/content-hash.js";
import type { NostrEventId } from "./value-objects/nostr-event-id.js";
import { ArtifactStatus } from "./artifact-status.js";
import { InvalidLifecycleTransitionError } from "./errors.js";

/**
 * Artifact aggregate. Lifecycle: draft → submitted → published → archived.
 * Invariants: publishedAt set only when status is published; archivedAt only when archived.
 * artifactType and tags are optional (nullable in DB for backfill).
 */
export class Artifact {
  readonly id: ArtifactId;
  readonly authorId: AuthorId;
  readonly contentHash: ContentHash | null;
  readonly nostrEventId: NostrEventId | null;
  readonly status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
  readonly createdAt: Date;
  readonly publishedAt: Date | null;
  readonly archivedAt: Date | null;
  readonly artifactType: ArtifactType | null;
  readonly tags: readonly string[];

  private constructor(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash: ContentHash | null;
    nostrEventId: NostrEventId | null;
    status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
    createdAt: Date;
    publishedAt: Date | null;
    archivedAt: Date | null;
    artifactType?: ArtifactType | null;
    tags?: readonly string[];
  }) {
    this.id = params.id;
    this.authorId = params.authorId;
    this.contentHash = params.contentHash;
    this.nostrEventId = params.nostrEventId;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this.publishedAt = params.publishedAt;
    this.archivedAt = params.archivedAt;
    this.artifactType = params.artifactType ?? null;
    this.tags = params.tags ?? [];
  }

  /**
   * Creates a new Artifact in draft state.
   *
   * @param params.id - ArtifactId
   * @param params.authorId - AuthorId
   * @param params.contentHash - Optional; can be null in draft
   * @param params.artifactType - Optional artifact type
   * @param params.tags - Optional tags
   * @param params.createdAt - Optional; defaults to new Date()
   */
  static draft(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash?: ContentHash | null;
    artifactType?: ArtifactType | null;
    tags?: readonly string[];
    createdAt?: Date;
  }): Artifact {
    const createdAt = params.createdAt ?? new Date();
    return new Artifact({
      id: params.id,
      authorId: params.authorId,
      contentHash: params.contentHash ?? null,
      nostrEventId: null,
      status: ArtifactStatus.Draft,
      createdAt,
      publishedAt: null,
      archivedAt: null,
      artifactType: params.artifactType ?? null,
      tags: params.tags ?? [],
    });
  }

  /**
   * Reconstructs an Artifact from persistence (e.g. repository).
   * All fields must be provided; used by infrastructure layer.
   */
  static fromPersistence(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash: ContentHash | null;
    nostrEventId: NostrEventId | null;
    status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
    createdAt: Date;
    publishedAt: Date | null;
    archivedAt: Date | null;
    artifactType?: ArtifactType | null;
    tags?: readonly string[];
  }): Artifact {
    return new Artifact(params);
  }

  /**
   * Returns a new Artifact with the given Nostr event id (anchoring reference) set.
   */
  withNostrEventId(id: NostrEventId): Artifact {
    return new Artifact({
      id: this.id,
      authorId: this.authorId,
      contentHash: this.contentHash,
      nostrEventId: id,
      status: this.status,
      createdAt: this.createdAt,
      publishedAt: this.publishedAt,
      archivedAt: this.archivedAt,
      artifactType: this.artifactType,
      tags: this.tags,
    });
  }

  /**
   * Transitions from Draft to Submitted. Returns a new Artifact.
   *
   * @throws InvalidLifecycleTransitionError if status is not Draft
   */
  submit(): Artifact {
    if (this.status !== ArtifactStatus.Draft) {
      throw new InvalidLifecycleTransitionError(
        this.status,
        "submit",
        this.id,
      );
    }
    return new Artifact({
      id: this.id,
      authorId: this.authorId,
      contentHash: this.contentHash,
      nostrEventId: this.nostrEventId,
      status: ArtifactStatus.Submitted,
      createdAt: this.createdAt,
      publishedAt: this.publishedAt,
      archivedAt: this.archivedAt,
      artifactType: this.artifactType,
      tags: this.tags,
    });
  }

  /**
   * Transitions from Submitted to Published. Sets publishedAt. Returns a new Artifact.
   *
   * @param publishedAt - Optional; defaults to new Date()
   * @throws InvalidLifecycleTransitionError if status is not Submitted
   */
  publish(publishedAt?: Date): Artifact {
    if (this.status !== ArtifactStatus.Submitted) {
      throw new InvalidLifecycleTransitionError(
        this.status,
        "publish",
        this.id,
      );
    }
    const at = publishedAt ?? new Date();
    return new Artifact({
      id: this.id,
      authorId: this.authorId,
      contentHash: this.contentHash,
      nostrEventId: this.nostrEventId,
      status: ArtifactStatus.Published,
      createdAt: this.createdAt,
      publishedAt: at,
      archivedAt: this.archivedAt,
      artifactType: this.artifactType,
      tags: this.tags,
    });
  }

  /**
   * Transitions from Published to Archived. Sets archivedAt. Returns a new Artifact.
   *
   * @param archivedAt - Optional; defaults to new Date()
   * @throws InvalidLifecycleTransitionError if status is not Published
   */
  archive(archivedAt?: Date): Artifact {
    if (this.status !== ArtifactStatus.Published) {
      throw new InvalidLifecycleTransitionError(
        this.status,
        "archive",
        this.id,
      );
    }
    const at = archivedAt ?? new Date();
    return new Artifact({
      id: this.id,
      authorId: this.authorId,
      contentHash: this.contentHash,
      nostrEventId: this.nostrEventId,
      status: ArtifactStatus.Archived,
      createdAt: this.createdAt,
      publishedAt: this.publishedAt,
      archivedAt: at,
      artifactType: this.artifactType,
      tags: this.tags,
    });
  }
}
