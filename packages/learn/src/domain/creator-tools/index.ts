/**
 * Creator Tools domain (COMP-017).
 * Architecture: creator-tools-copilot.md.
 */

export type { ApprovalRecordId } from "@syntropy/types";
export {
  CreatorWorkflow,
  CREATOR_WORKFLOW_PHASES,
  type CreatorWorkflowParams,
  type CreatorWorkflowPhase,
} from "./creator-workflow.js";
export {
  getNextPhase,
  isValidNextPhase,
  isCreatorWorkflowPhase,
} from "./creator-workflow-phase.js";
export type {
  CreatorWorkflowDomainEvent,
  CreatorWorkflowPhaseEntered,
} from "./events.js";
export {
  AIGeneratedDraft,
  type AIGeneratedDraftParams,
} from "./ai-generated-draft.js";
export {
  ApprovalRecord,
  type ApprovalRecordParams,
  type ApprovalDecision,
} from "./approval-record.js";
