/**
 * Artifact aggregate — versioned, identity-anchorable creative product.
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { ArtifactId } from "./value-objects/artifact-id.js";
import type { AuthorId } from "./value-objects/author-id.js";
import type { ContentHash } from "./value-objects/content-hash.js";
import type { NostrEventId } from "./value-objects/nostr-event-id.js";
import { ArtifactStatus } from "./artifact-status.js";
import { InvalidLifecycleTransitionError } from "./errors.js";

/**
 * Artifact aggregate. Lifecycle: draft → submitted → published → archived.
 * Invariants: publishedAt set only when status is published; archivedAt only when archived.
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

  private constructor(params: {
    id: ArtifactId;
    authorId: AuthorId;
    contentHash: ContentHash | null;
    nostrEventId: NostrEventId | null;
    status: (typeof ArtifactStatus)[keyof typeof ArtifactStatus];
    createdAt: Date;
    publishedAt: Date | null;
    archivedAt: Date | null;
  }) {
    this.id = params.id;
    this.authorId = params.authorId;
    this.contentHash = params.contentHash;
    this.nostrEventId = params.nostrEventId;
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
      nostrEventId: null,
      status: ArtifactStatus.Draft,
      createdAt,
      publishedAt: null,
      archivedAt: null,
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
    });
  }
}
