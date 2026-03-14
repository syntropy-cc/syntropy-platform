/**
 * Ports for approval workflow and persistence (COMP-017.3).
 * Architecture: creator-tools-copilot.md, PAT-004, PAT-005.
 */

import type { CreatorWorkflowId } from "@syntropy/types";

import type { ApprovalRecord } from "../../domain/creator-tools/approval-record.js";
import type { CreatorWorkflow } from "../../domain/creator-tools/creator-workflow.js";

/**
 * Loads a creator workflow by id. Returns null if not found.
 */
export interface CreatorWorkflowLoaderPort {
  findById(workflowId: CreatorWorkflowId): Promise<CreatorWorkflow | null>;
}

/**
 * Persists a creator workflow (e.g. after phase transition).
 */
export interface CreatorWorkflowSavePort {
  save(workflow: CreatorWorkflow): Promise<void>;
}

/**
 * Persists an approval record.
 */
export interface ApprovalRecordRepositoryPort {
  save(record: ApprovalRecord): Promise<void>;
}

/**
 * Checks whether the given user is allowed to approve/reject for the workflow
 * (e.g. workflow creator or user with reviewer permission).
 */
export interface ReviewerApprovalPort {
  canApprove(workflowId: CreatorWorkflowId, reviewerId: string): Promise<boolean>;
}
