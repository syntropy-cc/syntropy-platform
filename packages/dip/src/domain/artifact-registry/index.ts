export { Artifact } from "./artifact.js";
export { ArtifactStatus, isArtifactStatus } from "./artifact-status.js";
export { InvalidLifecycleTransitionError } from "./errors.js";
export type { ArtifactLifecycleEventPublisher } from "./events/artifact-lifecycle-events.js";
export type {
  ArtifactLifecycleEvent,
  ArtifactDraftedEvent,
  ArtifactSubmittedEvent,
  ArtifactPublishedEvent,
  ArtifactArchivedEvent,
} from "./events/artifact-lifecycle-events.js";
export type { ArtifactRepository } from "./repositories/artifact-repository.js";
export {
  createArtifactId,
  createAuthorId,
  createContentHash,
  isArtifactId,
  isAuthorId,
  isContentHash,
  type ArtifactId,
  type AuthorId,
  type ContentHash,
} from "./value-objects/index.js";
