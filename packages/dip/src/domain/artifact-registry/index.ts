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
export type { ArtifactSummary } from "./queries/artifact-summary.js";
export type {
  ArtifactQueryFilter,
  ArtifactRepository,
  FindPublishedOptions,
  FindPublishedResult,
} from "./repositories/artifact-repository.js";
export {
  createArtifactId,
  createAuthorId,
  createArtifactType,
  createContentHash,
  createNostrEventId,
  isArtifactId,
  isArtifactType,
  isAuthorId,
  isContentHash,
  isNostrEventId,
  ArtifactType,
} from "./value-objects/index.js";
export type {
  ArtifactId,
  AuthorId,
  ArtifactTypeKind as ArtifactTypeValue,
  ContentHash,
  NostrEventId,
} from "./value-objects/index.js";
export type { NostrRelayPort, AnchoringPayload } from "./ports/nostr-relay-port.js";
