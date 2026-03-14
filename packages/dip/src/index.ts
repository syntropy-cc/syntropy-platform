/**
 * DIP (Digital Institutions Protocol) package.
 * Architecture: COMP-003 through COMP-008
 */

export {
  Artifact,
  ArtifactStatus,
  createArtifactId,
  createAuthorId,
  createArtifactType,
  createContentHash,
  createNostrEventId,
  isArtifactId,
  isArtifactStatus,
  isArtifactType,
  isAuthorId,
  isContentHash,
  isNostrEventId,
  ArtifactType,
} from "./domain/index.js";
export type {
  ArtifactId,
  AuthorId,
  ArtifactTypeValue,
  ArtifactQueryFilter,
  ArtifactSummary,
  ContentHash,
  FindPublishedOptions,
  FindPublishedResult,
  NostrEventId,
  NostrRelayPort,
  AnchoringPayload,
} from "./domain/index.js";
export {
  ArtifactLifecycleService,
  ArtifactNotFoundError,
  ArtifactQueryService,
  NostrAnchorService,
  AnchoringContentRequiredError,
} from "./application/index.js";
export type {
  ArtifactQueryPagination,
  FindPublishedResult as ArtifactQueryFindPublishedResult,
} from "./application/index.js";
export { NostrRelayAdapter } from "./infrastructure/nostr-relay-adapter.js";
export { PostgresArtifactRepository } from "./infrastructure/repositories/postgres-artifact-repository.js";
export { PostgresContractRepository } from "./infrastructure/repositories/postgres-contract-repository.js";
export { PgArtifactDbClient } from "./infrastructure/pg-artifact-db-client.js";
export { PgContractDbClient } from "./infrastructure/pg-contract-db-client.js";
export type { ArtifactDbClient } from "./infrastructure/artifact-db-client.js";
export type { ContractDbClient } from "./infrastructure/contract-db-client.js";
export { ArtifactEventPublisher } from "./infrastructure/artifact-event-publisher.js";
export type {
  ArtifactRepository,
  ArtifactLifecycleEventPublisher,
} from "./domain/index.js";
export type { ContractRepository } from "@syntropy/dip-contracts";
export { InvalidLifecycleTransitionError } from "./domain/index.js";
