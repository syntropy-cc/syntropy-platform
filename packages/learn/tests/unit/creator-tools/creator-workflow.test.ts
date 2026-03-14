/**
 * Unit tests for CreatorWorkflow aggregate (COMP-017.1).
 */

import {
  createCreatorWorkflowId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { CreatorWorkflow } from "../../../src/domain/creator-tools/creator-workflow.js";
import { InvalidPhaseTransitionError } from "../../../src/domain/errors.js";

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

describe("CreatorWorkflow", () => {
  it("create builds workflow with id trackId creatorId and initial phase ideation", () => {
    const id = createCreatorWorkflowId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const startedAt = new Date("2026-01-01T00:00:00Z");

    const workflow = CreatorWorkflow.create({
      id,
      trackId,
      creatorId: "creator-1",
      startedAt,
    });

    expect(workflow.id).toBe(id);
    expect(workflow.trackId).toBe(trackId);
    expect(workflow.creatorId).toBe("creator-1");
    expect(workflow.currentPhase).toBe("ideation");
    expect(workflow.phasesCompleted).toEqual([]);
    expect(workflow.startedAt).toBe(startedAt);
    expect(workflow.completedAt).toBeNull();
    expect(workflow.isComplete).toBe(false);
  });

  it("transition moves to next phase and appends previous phase to phasesCompleted", () => {
    const workflow = createWorkflowAtPhase("ideation");

    const event = workflow.transition("drafting");

    expect(workflow.currentPhase).toBe("drafting");
    expect(workflow.phasesCompleted).toEqual(["ideation"]);
    expect(event.type).toBe("CreatorWorkflowPhaseEntered");
    expect(event.workflowId).toBe(workflow.id);
    expect(event.phase).toBe("drafting");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("transition through all phases in order succeeds", () => {
    const workflow = createWorkflowAtPhase("ideation");

    workflow.transition("drafting");
    expect(workflow.currentPhase).toBe("drafting");

    workflow.transition("review");
    expect(workflow.currentPhase).toBe("review");
    expect(workflow.phasesCompleted).toEqual(["ideation", "drafting"]);

    workflow.transition("refinement");
    expect(workflow.currentPhase).toBe("refinement");

    const event = workflow.transition("publication");
    expect(workflow.currentPhase).toBe("publication");
    expect(workflow.phasesCompleted).toEqual(["ideation", "drafting", "review", "refinement"]);
    expect(workflow.isComplete).toBe(true);
    expect(workflow.completedAt).not.toBeNull();
    expect(event.phase).toBe("publication");
  });

  it("transition to same phase throws InvalidPhaseTransitionError", () => {
    const workflow = createWorkflowAtPhase("ideation");

    expect(() => workflow.transition("ideation")).toThrow(InvalidPhaseTransitionError);
    expect(() => workflow.transition("ideation")).toThrow(/Invalid phase transition/);
    expect(() => workflow.transition("ideation")).toThrow(/from "ideation" to "ideation"/);
  });

  it("transition skipping a phase throws InvalidPhaseTransitionError", () => {
    const workflow = createWorkflowAtPhase("ideation");

    expect(() => workflow.transition("review")).toThrow(InvalidPhaseTransitionError);
    expect(() => workflow.transition("review")).toThrow(/from "ideation" to "review"/);
  });

  it("transition backwards throws InvalidPhaseTransitionError", () => {
    const workflow = createWorkflowAtPhase("drafting");

    expect(() => workflow.transition("ideation")).toThrow(InvalidPhaseTransitionError);
    expect(() => workflow.transition("ideation")).toThrow(/from "drafting" to "ideation"/);
  });

  it("transition to non-immediate phase from refinement throws", () => {
    const workflow = createWorkflowAtPhase("refinement");

    expect(() => workflow.transition("drafting")).toThrow(InvalidPhaseTransitionError);
    expect(() => workflow.transition("review")).toThrow(InvalidPhaseTransitionError);
  });

  it("transition from refinement to publication succeeds and sets completedAt", () => {
    const workflow = createWorkflowAtPhase("refinement");

    const event = workflow.transition("publication");

    expect(workflow.currentPhase).toBe("publication");
    expect(workflow.isComplete).toBe(true);
    expect(workflow.completedAt).toBeInstanceOf(Date);
    expect(event.phase).toBe("publication");
  });
});
