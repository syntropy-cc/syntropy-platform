/**
 * Unit tests for ApprovalRecord entity (COMP-017.3).
 */

import {
  createApprovalRecordId,
  createCreatorWorkflowId,
} from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { ApprovalRecord } from "../../../src/domain/creator-tools/approval-record.js";

describe("ApprovalRecord", () => {
  it("create builds record with id workflowId phase reviewerId decision notes decidedAt", () => {
    const id = createApprovalRecordId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const workflowId = createCreatorWorkflowId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const decidedAt = new Date("2026-01-15T12:00:00Z");

    const record = ApprovalRecord.create({
      id,
      workflowId,
      phase: "review",
      reviewerId: "reviewer-1",
      decision: "approve",
      notes: "Looks good",
      decidedAt,
    });

    expect(record.id).toBe(id);
    expect(record.workflowId).toBe(workflowId);
    expect(record.phase).toBe("review");
    expect(record.reviewerId).toBe("reviewer-1");
    expect(record.decision).toBe("approve");
    expect(record.notes).toBe("Looks good");
    expect(record.decidedAt).toBe(decidedAt);
  });

  it("create accepts reject decision", () => {
    const record = ApprovalRecord.create({
      id: createApprovalRecordId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f"),
      workflowId: createCreatorWorkflowId("d4e5f6a7-b8c9-4d0e-8f2a-3b4c5d6e7f8a"),
      phase: "drafting",
      reviewerId: "creator-1",
      decision: "reject",
      notes: "Needs more detail",
      decidedAt: new Date(),
    });

    expect(record.decision).toBe("reject");
    expect(record.notes).toBe("Needs more detail");
  });

  it("create defaults notes to empty string when omitted", () => {
    const record = ApprovalRecord.create({
      id: createApprovalRecordId("e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8a9b"),
      workflowId: createCreatorWorkflowId("f6a7b8c9-d0e1-4f2a-8b4c-5d6e7f8a9b0c"),
      phase: "ideation",
      reviewerId: "r1",
      decision: "approve",
      notes: "",
      decidedAt: new Date(),
    });

    expect(record.notes).toBe("");
  });

  it("create throws when decision is invalid", () => {
    expect(() =>
      ApprovalRecord.create({
        id: createApprovalRecordId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
        workflowId: createCreatorWorkflowId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
        phase: "review",
        reviewerId: "r1",
        decision: "pending" as "approve",
        notes: "",
        decidedAt: new Date(),
      })
    ).toThrow(/decision must be 'approve' or 'reject'/);
  });

  it("create throws when required fields are missing", () => {
    expect(() =>
      ApprovalRecord.create({
        id: "" as import("@syntropy/types").ApprovalRecordId,
        workflowId: createCreatorWorkflowId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
        phase: "review",
        reviewerId: "r1",
        decision: "approve",
        notes: "",
        decidedAt: new Date(),
      })
    ).toThrow(/ApprovalRecord requires/);
  });
});
