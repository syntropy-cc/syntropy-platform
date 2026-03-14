/**
 * Hub domain package.
 * Architecture: COMP-019 through COMP-021
 */
export * from "./domain/collaboration/index.js";
export { ContributionIntegrationService, ContributionNotReadyForMergeError, type MergeResult, } from "./application/contribution-integration-service.js";
export type { DipArtifactPublishClient, } from "./infrastructure/dip-contribution-adapter.js";
export { DIPContributionAdapter } from "./infrastructure/dip-contribution-adapter.js";
//# sourceMappingURL=index.d.ts.map