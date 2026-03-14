/**
 * Unit tests for ApprovalService (COMP-017.3).
 */

import { createCreatorWorkflowId, createTrackId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { CreatorWorkflow } from "../../../src/domain/creator-tools/creator-workflow.js";
import { ApprovalService } from "../../../src/application/approval-service.js";
import { NotReviewerError } from "../../../src/domain/errors.js";
import type {
  ApprovalRecordRepositoryPort,
  CreatorWorkflowLoaderPort,
  CreatorWorkflowSavePort,
  ReviewerApprovalPort,
} from "../../../src/application/ports/approval-ports.js";

function createWorkflowAtPhase(
  phase: "ideation" | "drafting" | "review" | "refinement"
): CreatorWorkflow {
  const workflow = CreatorWorkflow.create({
    id: createCreatorWorkflowId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    trackId: createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-1",
    startedAt: new Date("2026-01-01T00:00:00Z"),
  });
  if (phase === "drafting") workflow.transition("drafting");
  else if (phase === "review") {
    workflow.transition("drafting");
    workflow.transition("review");
  } else if (phase === "refinement") {
    workflow.transition("drafting");
    workflow.transition("review");
    workflow.transition("refinement");
  }
  return workflow;
}

describe("ApprovalService", () => {
  const workflowId = createCreatorWorkflowId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");

  it("approve transitions workflow to next phase and creates approval record", async () => {
    const workflow = createWorkflowAtPhase("ideation");
    const loader: CreatorWorkflowLoaderPort = {
      findById: vi.fn().mockResolvedValue(workflow),
    };
    const saveWorkflow = vi.fn().mockResolvedValue(undefined);
    const saveRecord = vi.fn().mockResolvedValue(undefined);
    const canApprove = vi.fn().mockResolvedValue(true);

    const service = new ApprovalService({
      workflowLoader: loader,
      workflowSave: { save: saveWorkflow },
      approvalRecordRepository: { save: saveRecord },
      reviewerApproval: { canApprove },
    });

    const result = await service.approve(workflowId, "reviewer-1", "Approved");

    expect(canApprove).toHaveBeenCalledWith(workflowId, "reviewer-1");
    expect(result.record.workflowId).toBe(workflowId);
    expect(result.record.phase).toBe("ideation");
    expect(result.record.reviewerId).toBe("reviewer-1");
    expect(result.record.decision).toBe("approve");
    expect(result.record.notes).toBe("Approved");
    expect(result.event.phase).toBe("drafting");
    expect(workflow.currentPhase).toBe("drafting");
    expect(saveWorkflow).toHaveBeenCalledWith(workflow);
    expect(saveRecord).toHaveBeenCalledWith(result.record);
  });

  it("approve throws NotReviewerError when reviewer port returns false", async () => {
    const workflow = createWorkflowAtPhase("ideation");
    const canApprove = vi.fn().mockResolvedValue(false);
    const service = new ApprovalService({
      workflowLoader: { findById: vi.fn().mockResolvedValue(workflow) },
      workflowSave: { save: vi.fn() },
      approvalRecordRepository: { save: vi.fn() },
      reviewerApproval: { canApprove },
    });

    await expect(service.approve(workflowId, "other-user")).rejects.toThrow(
      NotReviewerError
    );
    await expect(service.approve(workflowId, "other-user")).rejects.toThrow(
      /does not have reviewer role/
    );
    expect(canApprove).toHaveBeenCalledWith(workflowId, "other-user");
  });

  it("approve throws when workflow not found", async () => {
    const loader: CreatorWorkflowLoaderPort = {
      findById: vi.fn().mockResolvedValue(null),
    };
    const service = new ApprovalService({
      workflowLoader: loader,
      workflowSave: { save: vi.fn() },
      approvalRecordRepository: { save: vi.fn() },
      reviewerApproval: { canApprove: vi.fn().mockResolvedValue(true) },
    });

    await expect(service.approve(workflowId, "reviewer-1")).rejects.toThrow(
      /Workflow not found/
    );
  });

  it("approve throws when workflow already at publication phase", async () => {
    const workflow = createWorkflowAtPhase("refinement");
    workflow.transition("publication");
    const service = new ApprovalService({
      workflowLoader: { findById: vi.fn().mockResolvedValue(workflow) },
      workflowSave: { save: vi.fn() },
      approvalRecordRepository: { save: vi.fn() },
      reviewerApproval: { canApprove: vi.fn().mockResolvedValue(true) },
    });

    await expect(service.approve(workflowId, "reviewer-1")).rejects.toThrow(
      /already at final phase/
    );
  });

  it("reject creates approval record and does not transition workflow", async () => {
    const workflow = createWorkflowAtPhase("drafting");
    const saveRecord = vi.fn().mockResolvedValue(undefined);
    const saveWorkflow = vi.fn().mockResolvedValue(undefined);
    const service = new ApprovalService({
      workflowLoader: { findById: vi.fn().mockResolvedValue(workflow) },
      workflowSave: { save: saveWorkflow },
      approvalRecordRepository: { save: saveRecord },
      reviewerApproval: { canApprove: vi.fn().mockResolvedValue(true) },
    });

    const record = await service.reject(workflowId, "reviewer-1", "Needs changes");

    expect(record.decision).toBe("reject");
    expect(record.phase).toBe("drafting");
    expect(record.notes).toBe("Needs changes");
    expect(workflow.currentPhase).toBe("drafting");
    expect(saveRecord).toHaveBeenCalledWith(record);
    expect(saveWorkflow).not.toHaveBeenCalled();
  });

  it("reject throws NotReviewerError when reviewer port returns false", async () => {
    const workflow = createWorkflowAtPhase("ideation");
    const service = new ApprovalService({
      workflowLoader: { findById: vi.fn().mockResolvedValue(workflow) },
      workflowSave: { save: vi.fn() },
      approvalRecordRepository: { save: vi.fn() },
      reviewerApproval: { canApprove: vi.fn().mockResolvedValue(false) },
    });

    await expect(service.reject(workflowId, "other-user")).rejects.toThrow(
      NotReviewerError
    );
  });

  it("reject throws when workflow not found", async () => {
    const service = new ApprovalService({
      workflowLoader: { findById: vi.fn().mockResolvedValue(null) },
      workflowSave: { save: vi.fn() },
      approvalRecordRepository: { save: vi.fn() },
      reviewerApproval: { canApprove: vi.fn().mockResolvedValue(true) },
    });

    await expect(service.reject(workflowId, "reviewer-1")).rejects.toThrow(
      /Workflow not found/
    );
  });
});
