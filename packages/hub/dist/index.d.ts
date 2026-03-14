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
export { InstitutionOrchestrationService, InstitutionOrchestrationInvalidPhaseError, InstitutionOrchestrationTemplateNotFoundError, type CreateInstitutionResult, } from "./application/institution-orchestration-service.js";
export { InstitutionProfileProjector } from "./application/institution-profile-projector.js";
export type { DIPInstitutionAdapterPort, CreateInstitutionParams, CreateInstitutionResult as DIPCreateInstitutionResult } from "./domain/institution-orchestration/ports/dip-institution-adapter-port.js";
export type { InstitutionWorkflowRepositoryPort } from "./domain/institution-orchestration/ports/institution-workflow-repository-port.js";
export type { InstitutionEventPublisherPort, InstitutionCreatedEvent } from "./domain/institution-orchestration/ports/institution-event-publisher-port.js";
export type { ContractTemplateRepositoryPort } from "./domain/institution-orchestration/ports/contract-template-repository-port.js";
export type { InstitutionProfileReaderPort } from "./domain/institution-orchestration/ports/institution-profile-reader-port.js";
export { InstitutionCreationWorkflow, InstitutionCreationPhase, InvalidWorkflowTransitionError, } from "./domain/institution-orchestration/institution-creation-workflow.js";
export type { InstitutionCreationWorkflowParams } from "./domain/institution-orchestration/institution-creation-workflow.js";
export { ContractTemplate, ContractTemplateType, } from "./domain/institution-orchestration/contract-template.js";
export type { ContractTemplateParams } from "./domain/institution-orchestration/contract-template.js";
export type { InstitutionProfile } from "./domain/institution-orchestration/institution-profile.js";
export { PostgresInstitutionWorkflowRepository } from "./infrastructure/repositories/postgres-institution-workflow-repository.js";
export { PostgresContractTemplateRepository } from "./infrastructure/repositories/postgres-contract-template-repository.js";
export { InMemoryContractTemplateRepository } from "./infrastructure/institution-orchestration/contract-template-repository-in-memory.js";
//# sourceMappingURL=index.d.ts.map