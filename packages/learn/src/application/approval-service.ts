/**
 * ApprovalService — approve/reject workflow phase with role check (COMP-017.3).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 */

import { createApprovalRecordId, type CreatorWorkflowId } from "@syntropy/types";

import { NotReviewerError } from "../domain/errors.js";
import { ApprovalRecord } from "../domain/creator-tools/approval-record.js";
import { getNextPhase } from "../domain/creator-tools/creator-workflow-phase.js";
import type { CreatorWorkflowPhaseEntered } from "../domain/creator-tools/events.js";
import type {
  ApprovalRecordRepositoryPort,
  CreatorWorkflowLoaderPort,
  CreatorWorkflowSavePort,
  ReviewerApprovalPort,
} from "./ports/approval-ports.js";

export interface ApprovalServiceDeps {
  readonly workflowLoader: CreatorWorkflowLoaderPort;
  readonly workflowSave: CreatorWorkflowSavePort;
  readonly approvalRecordRepository: ApprovalRecordRepositoryPort;
  readonly reviewerApproval: ReviewerApprovalPort;
}

export interface ApproveResult {
  readonly record: ApprovalRecord;
  readonly event: CreatorWorkflowPhaseEntered;
}

/**
 * Application service for recording approvals/rejections and advancing workflow phase.
 * Enforces reviewer role via port; approve transitions to next phase, reject records only.
 */
export class ApprovalService {
  constructor(private readonly deps: ApprovalServiceDeps) {}

  /**
   * Approves the current phase and transitions the workflow to the next phase.
   * Persists the approval record and updated workflow. Throws if workflow not found or not reviewer.
   */
  async approve(
    workflowId: CreatorWorkflowId,
    reviewerId: string,
    comments?: string
  ): Promise<ApproveResult> {
    const workflow = await this.deps.workflowLoader.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const allowed = await this.deps.reviewerApproval.canApprove(
      workflow.id,
      reviewerId
    );
    if (!allowed) {
      throw new NotReviewerError(reviewerId);
    }

    const nextPhase = getNextPhase(workflow.currentPhase);
    if (!nextPhase) {
      throw new Error(
        `Workflow already at final phase (${workflow.currentPhase}), cannot approve`
      );
    }

    const record = ApprovalRecord.create({
      id: createApprovalRecordId(crypto.randomUUID()),
      workflowId: workflow.id,
      phase: workflow.currentPhase,
      reviewerId,
      decision: "approve",
      notes: comments ?? "",
      decidedAt: new Date(),
    });

    const event = workflow.transition(nextPhase);
    await this.deps.workflowSave.save(workflow);
    await this.deps.approvalRecordRepository.save(record);

    return { record, event };
  }

  /**
   * Records a rejection for the current phase. Does not advance the workflow.
   * Throws if workflow not found or not reviewer.
   */
  async reject(
    workflowId: CreatorWorkflowId,
    reviewerId: string,
    comments?: string
  ): Promise<ApprovalRecord> {
    const workflow = await this.deps.workflowLoader.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const allowed = await this.deps.reviewerApproval.canApprove(
      workflow.id,
      reviewerId
    );
    if (!allowed) {
      throw new NotReviewerError(reviewerId);
    }

    const record = ApprovalRecord.create({
      id: createApprovalRecordId(crypto.randomUUID()),
      workflowId: workflow.id,
      phase: workflow.currentPhase,
      reviewerId,
      decision: "reject",
      notes: comments ?? "",
      decidedAt: new Date(),
    });

    await this.deps.approvalRecordRepository.save(record);
    return record;
  }
}
