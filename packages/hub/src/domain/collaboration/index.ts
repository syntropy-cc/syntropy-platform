/**
 * Hub collaboration domain — Issue, Contribution, ContributionSandbox (COMP-019).
 * Architecture: Hub Collaboration Layer
 */

export { Issue } from "./issue.js";
export { Contribution } from "./contribution.js";
export { ContributionSandbox, type SandboxConfig } from "./contribution-sandbox.js";
export { IssueStatus, isIssueStatus, type IssueStatusValue } from "./issue-status.js";
export {
  ContributionSandboxStatus,
  isContributionSandboxStatus,
  type ContributionSandboxStatusValue,
} from "./contribution-sandbox-status.js";
export { IssueType, isIssueType, type IssueTypeValue } from "./issue-type.js";
export {
  ContributionStatus,
  isContributionStatus,
  type ContributionStatusValue,
} from "./contribution-status.js";
export { createIssueId, isIssueId, type IssueId } from "./value-objects/issue-id.js";
export {
  createContributionId,
  isContributionId,
  type ContributionId,
} from "./value-objects/contribution-id.js";
export {
  InvalidIssueTransitionError,
  InvalidContributionTransitionError,
} from "./errors.js";
export type {
  HubIssueCreated,
  HubIssueClosed,
  HubContributionSubmitted,
  HubContributionIntegrated,
  HubHackinStarted,
  HubHackinCompleted,
  HubCollaborationEvent,
} from "./events.js";
export type {
  ContainerOrchestratorPort,
  ProvisionResult,
} from "./ports/container-orchestrator-port.js";
export { StubContainerOrchestrator } from "./ports/container-orchestrator-port.js";
export type { ArtifactPublisherPort } from "./ports/artifact-publisher-port.js";
export type { ContributionRepositoryPort } from "./ports/contribution-repository-port.js";
export type { IssueRepositoryPort } from "./ports/issue-repository-port.js";
