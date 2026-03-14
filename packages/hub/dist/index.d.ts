/**
 * Hub domain package.
 * Architecture: COMP-019 through COMP-021
 */
export * from "./domain/collaboration/index.js";
export { ContributionIntegrationService, ContributionNotReadyForMergeError, type MergeResult, } from "./application/contribution-integration-service.js";
export type { DipArtifactPublishClient, } from "./infrastructure/dip-contribution-adapter.js";
export { DIPContributionAdapter } from "./infrastructure/dip-contribution-adapter.js";
export type { HubCollaborationDbClient } from "./infrastructure/hub-collaboration-db-client.js";
export { PostgresIssueRepository } from "./infrastructure/repositories/postgres-issue-repository.js";
export { PostgresContributionRepository } from "./infrastructure/repositories/postgres-contribution-repository.js";
export { PostgresContributionSandboxRepository } from "./infrastructure/repositories/postgres-contribution-sandbox-repository.js";
//# sourceMappingURL=index.d.ts.map