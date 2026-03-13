export {
  Artifact,
  ArtifactStatus,
  createArtifactId,
  createAuthorId,
  createContentHash,
  InvalidLifecycleTransitionError,
  isArtifactId,
  isArtifactStatus,
  isAuthorId,
  isContentHash,
} from "./artifact-registry/index.js";
export type {
  ArtifactId,
  AuthorId,
  ContentHash,
  ArtifactRepository,
  ArtifactLifecycleEventPublisher,
  ArtifactLifecycleEvent,
  ArtifactDraftedEvent,
  ArtifactSubmittedEvent,
  ArtifactPublishedEvent,
  ArtifactArchivedEvent,
} from "./artifact-registry/index.js";
