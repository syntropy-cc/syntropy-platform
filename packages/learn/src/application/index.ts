/**
 * Learn application layer (COMP-017).
 * Architecture: creator-tools-copilot.md.
 */

export { ApprovalService, type ApprovalServiceDeps, type ApproveResult } from "./approval-service.js";
export { CreatorCopilotService, type CreatorCopilotServiceDeps } from "./creator-copilot-service.js";
export type {
  ApprovalRecordRepositoryPort,
  CreatorWorkflowLoaderPort,
  CreatorWorkflowSavePort,
  ReviewerApprovalPort,
} from "./ports/approval-ports.js";
export type {
  LearnCopilotAgentPort,
  GenerateContentParams,
  GenerateContentResult,
} from "./ports/learn-copilot-agent-port.js";
