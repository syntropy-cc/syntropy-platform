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
  createInstitutionId,
  createManifestId,
  createNostrEventId,
  createProjectId,
  CyclicDependencyError,
  DAGService,
  DigitalProject,
  ProjectManifest,
  isArtifactId,
  isArtifactStatus,
  isArtifactType,
  isAuthorId,
  isContentHash,
  isInstitutionId,
  isManifestId,
  isNostrEventId,
  isProjectId,
  ArtifactType,
} from "./domain/index.js";
export type {
  ArtifactId,
  AuthorId,
  ArtifactTypeValue,
  ContentHash,
  CreateProjectManifestSnapshot,
  CreateProjectResult,
  FindPublishedOptions,
  FindPublishedResult,
  InstitutionId,
  ManifestId,
  NostrEventId,
  ProjectId,
  ProjectCreatedEvent,
  ProjectDomainEvent,
  ProjectManifestJSON,
  ProjectManifestUpdatedEvent,
  ArtifactQueryFilter,
  ArtifactSummary,
  NostrRelayPort,
  AnchoringPayload,
  ProjectRepository,
  ProjectEventPublisherPort,
} from "./domain/index.js";
export {
  ArtifactLifecycleService,
  ArtifactNotFoundError,
  ArtifactQueryService,
  CreateProjectUseCase,
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
export { PostgresProjectRepository } from "./infrastructure/repositories/postgres-project-repository.js";
export { PgArtifactDbClient } from "./infrastructure/pg-artifact-db-client.js";
export { PgContractDbClient } from "./infrastructure/pg-contract-db-client.js";
export { PgProjectDbClient } from "./infrastructure/pg-project-db-client.js";
export type { ArtifactDbClient } from "./infrastructure/artifact-db-client.js";
export type { ContractDbClient } from "./infrastructure/contract-db-client.js";
export type { ProjectDbClient } from "./infrastructure/project-db-client.js";
export { ArtifactEventPublisher } from "./infrastructure/artifact-event-publisher.js";
export { ProjectEventPublisher } from "./infrastructure/project-event-publisher.js";
export type {
  ArtifactRepository,
  ArtifactLifecycleEventPublisher,
} from "./domain/index.js";
export type { ContractRepository } from "@syntropy/dip-contracts";
export { InvalidLifecycleTransitionError } from "./domain/index.js";
