/**
 * DIP (Digital Institutions Protocol) package.
 * Architecture: COMP-003 through COMP-008
 */

export {
  Artifact,
  ArtifactStatus,
  createArtifactId,
  createAuthorId,
  createContentHash,
  createNostrEventId,
  isArtifactId,
  isArtifactStatus,
  isAuthorId,
  isContentHash,
  isNostrEventId,
} from "./domain/index.js";
export type {
  ArtifactId,
  AuthorId,
  ContentHash,
  NostrEventId,
  NostrRelayPort,
  AnchoringPayload,
} from "./domain/index.js";
export {
  ArtifactLifecycleService,
  ArtifactNotFoundError,
  NostrAnchorService,
  AnchoringContentRequiredError,
} from "./application/index.js";
export { NostrRelayAdapter } from "./infrastructure/nostr-relay-adapter.js";
export { PostgresArtifactRepository } from "./infrastructure/repositories/postgres-artifact-repository.js";
export { PgArtifactDbClient } from "./infrastructure/pg-artifact-db-client.js";
export type { ArtifactDbClient } from "./infrastructure/artifact-db-client.js";
export { ArtifactEventPublisher } from "./infrastructure/artifact-event-publisher.js";
export type {
  ArtifactRepository,
  ArtifactLifecycleEventPublisher,
} from "./domain/index.js";
export { InvalidLifecycleTransitionError } from "./domain/index.js";
