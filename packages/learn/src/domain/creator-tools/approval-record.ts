/**
 * ApprovalRecord entity — stores reviewer decision for a workflow phase (COMP-017.3).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 */

import type { ApprovalRecordId, CreatorWorkflowId } from "@syntropy/types";

import type { CreatorWorkflowPhase } from "./creator-workflow-phase.js";

export type ApprovalDecision = "approve" | "reject";

export interface ApprovalRecordParams {
  readonly id: ApprovalRecordId;
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly reviewerId: string;
  readonly decision: ApprovalDecision;
  readonly notes: string;
  readonly decidedAt: Date;
}

/**
 * Immutable entity recording a creator/reviewer's approval or rejection
 * of content at a specific workflow phase. Used for audit and to gate phase transitions.
 */
export class ApprovalRecord {
  readonly id: ApprovalRecordId;
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly reviewerId: string;
  readonly decision: ApprovalDecision;
  readonly notes: string;
  readonly decidedAt: Date;

  private constructor(params: ApprovalRecordParams) {
    this.id = params.id;
    this.workflowId = params.workflowId;
    this.phase = params.phase;
    this.reviewerId = params.reviewerId;
    this.decision = params.decision;
    this.notes = params.notes;
    this.decidedAt = params.decidedAt;
  }

  static create(params: ApprovalRecordParams): ApprovalRecord {
    if (!params.id || !params.workflowId || !params.phase || !params.reviewerId) {
      throw new Error("ApprovalRecord requires id, workflowId, phase, and reviewerId");
    }
    if (params.decision !== "approve" && params.decision !== "reject") {
      throw new Error("ApprovalRecord decision must be 'approve' or 'reject'");
    }
    const notes = typeof params.notes === "string" ? params.notes : "";
    const decidedAt = params.decidedAt instanceof Date ? params.decidedAt : new Date(params.decidedAt);
    return new ApprovalRecord({
      ...params,
      notes,
      decidedAt,
    });
  }
}
