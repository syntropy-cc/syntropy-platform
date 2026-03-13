/**
 * ArtifactLifecycleService — application service for artifact lifecycle operations.
 * Architecture: COMP-003.2, DIP Artifact Registry
 */

import { createHash } from "node:crypto";
import { Artifact } from "../domain/artifact-registry/artifact.js";
import type { ArtifactLifecycleEventPublisher } from "../domain/artifact-registry/events/artifact-lifecycle-events.js";
import type { ArtifactRepository } from "../domain/artifact-registry/repositories/artifact-repository.js";
import { createArtifactId } from "../domain/artifact-registry/value-objects/artifact-id.js";
import { createContentHash } from "../domain/artifact-registry/value-objects/content-hash.js";
import type { ArtifactId } from "../domain/artifact-registry/value-objects/artifact-id.js";
import type { AuthorId } from "../domain/artifact-registry/value-objects/author-id.js";

/**
 * Thrown when an artifact is not found by id.
 */
export class ArtifactNotFoundError extends Error {
  constructor(public readonly artifactId: string) {
    super(`Artifact not found: ${artifactId}`);
    this.name = "ArtifactNotFoundError";
    Object.setPrototypeOf(this, ArtifactNotFoundError.prototype);
  }
}

/**
 * Application service for artifact lifecycle: draft, submit, publish, archive.
 * Each transition persists the artifact and publishes a domain event.
 */
export class ArtifactLifecycleService {
  constructor(
    private readonly repository: ArtifactRepository,
    private readonly eventPublisher: ArtifactLifecycleEventPublisher,
    private readonly idGenerator: () => string = () => crypto.randomUUID(),
  ) {}

  /**
   * Creates a new artifact in draft state, saves it, and publishes a drafted event.
   *
   * @param authorId - Author of the artifact
   * @param content - Optional content; if provided, SHA-256 hash is computed and stored
   * @returns The created artifact in Draft status
   */
  async draft(
    authorId: AuthorId,
    content?: string,
  ): Promise<Artifact> {
    const id = createArtifactId(this.idGenerator());
    const contentHash =
      content !== undefined && content !== ""
        ? createContentHash(this.sha256Hex(content))
        : null;
    const artifact = Artifact.draft({ id, authorId, contentHash });
    await this.repository.save(artifact);
    await this.eventPublisher.publish({
      type: "dip.artifact.drafted",
      artifactId: id,
      authorId,
      timestamp: new Date(),
    });
    return artifact;
  }

  /**
   * Transitions an artifact from Draft to Submitted, saves, and publishes event.
   *
   * @param artifactId - Id of the artifact to submit
   * @returns The artifact in Submitted status
   * @throws ArtifactNotFoundError if the artifact does not exist
   * @throws InvalidLifecycleTransitionError if the artifact is not in Draft
   */
  async submit(artifactId: ArtifactId): Promise<Artifact> {
    const artifact = await this.repository.findById(artifactId);
    if (!artifact) {
      throw new ArtifactNotFoundError(artifactId);
    }
    const updated = artifact.submit();
    await this.repository.save(updated);
    await this.eventPublisher.publish({
      type: "dip.artifact.submitted",
      artifactId: updated.id,
      authorId: updated.authorId,
      timestamp: new Date(),
    });
    return updated;
  }

  /**
   * Transitions an artifact from Submitted to Published, saves, and publishes event.
   *
   * @param artifactId - Id of the artifact to publish
   * @returns The artifact in Published status
   * @throws ArtifactNotFoundError if the artifact does not exist
   * @throws InvalidLifecycleTransitionError if the artifact is not in Submitted
   */
  async publish(artifactId: ArtifactId): Promise<Artifact> {
    const artifact = await this.repository.findById(artifactId);
    if (!artifact) {
      throw new ArtifactNotFoundError(artifactId);
    }
    const updated = artifact.publish();
    await this.repository.save(updated);
    await this.eventPublisher.publish({
      type: "dip.artifact.published",
      artifactId: updated.id,
      authorId: updated.authorId,
      timestamp: new Date(),
    });
    return updated;
  }

  /**
   * Transitions an artifact from Published to Archived, saves, and publishes event.
   *
   * @param artifactId - Id of the artifact to archive
   * @returns The artifact in Archived status
   * @throws ArtifactNotFoundError if the artifact does not exist
   * @throws InvalidLifecycleTransitionError if the artifact is not in Published
   */
  async archive(artifactId: ArtifactId): Promise<Artifact> {
    const artifact = await this.repository.findById(artifactId);
    if (!artifact) {
      throw new ArtifactNotFoundError(artifactId);
    }
    const updated = artifact.archive();
    await this.repository.save(updated);
    await this.eventPublisher.publish({
      type: "dip.artifact.archived",
      artifactId: updated.id,
      authorId: updated.authorId,
      timestamp: new Date(),
    });
    return updated;
  }

  private sha256Hex(input: string): string {
    return createHash("sha256").update(input, "utf8").digest("hex");
  }
}
