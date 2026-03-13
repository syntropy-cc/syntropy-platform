/**
 * Artifact lifecycle domain events and publisher interface.
 * Architecture: COMP-003, DIP Artifact Registry
 */

import type { ArtifactId } from "../value-objects/artifact-id.js";
import type { AuthorId } from "../value-objects/author-id.js";

/** Base shape for artifact lifecycle events (drafted, submitted, published, archived). */
export interface ArtifactLifecycleEventPayload {
  artifactId: ArtifactId;
  authorId: AuthorId;
  timestamp: Date;
}

export interface ArtifactDraftedEvent extends ArtifactLifecycleEventPayload {
  type: "dip.artifact.drafted";
}

export interface ArtifactSubmittedEvent extends ArtifactLifecycleEventPayload {
  type: "dip.artifact.submitted";
}

export interface ArtifactPublishedEvent extends ArtifactLifecycleEventPayload {
  type: "dip.artifact.published";
}

export interface ArtifactArchivedEvent extends ArtifactLifecycleEventPayload {
  type: "dip.artifact.archived";
}

export type ArtifactLifecycleEvent =
  | ArtifactDraftedEvent
  | ArtifactSubmittedEvent
  | ArtifactPublishedEvent
  | ArtifactArchivedEvent;

/**
 * Port for publishing artifact lifecycle domain events.
 * Implementations (e.g. Kafka) live in infrastructure (COMP-003.5).
 */
export interface ArtifactLifecycleEventPublisher {
  publish(event: ArtifactLifecycleEvent): Promise<void>;
}
