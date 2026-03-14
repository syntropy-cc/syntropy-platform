/**
 * Unit tests for CreatorCopilotService (COMP-017.2).
 */

import { createCreatorWorkflowId, createTrackId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { CreatorWorkflow } from "../../../src/domain/creator-tools/creator-workflow.js";
import { CreatorCopilotService } from "../../../src/application/creator-copilot-service.js";
import type { LearnCopilotAgentPort } from "../../../src/application/ports/learn-copilot-agent-port.js";

function createWorkflow(phase: "ideation" | "drafting" = "ideation"): CreatorWorkflow {
  const workflow = CreatorWorkflow.create({
    id: createCreatorWorkflowId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    trackId: createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-1",
    startedAt: new Date("2026-01-01T00:00:00Z"),
  });
  if (phase === "drafting") {
    workflow.transition("drafting");
  }
  return workflow;
}

describe("CreatorCopilotService", () => {
  it("generateDraft calls port with workflowId phase prompt userId and returns AIGeneratedDraft", async () => {
    const workflow = createWorkflow("ideation");
    const generateContent = vi.fn().mockResolvedValue({
      content: "AI-generated draft text",
      sessionId: "agent-session-456",
    });
    const mockPort: LearnCopilotAgentPort = { generateContent };
    const service = new CreatorCopilotService({
      learnCopilotAgent: mockPort,
    });

    const draft = await service.generateDraft(workflow, "Write an intro");

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(generateContent).toHaveBeenCalledWith({
      workflowId: workflow.id,
      phase: "ideation",
      prompt: "Write an intro",
      userId: "creator-1",
    });
    expect(draft.workflowId).toBe(workflow.id);
    expect(draft.phase).toBe("ideation");
    expect(draft.content).toBe("AI-generated draft text");
    expect(draft.agentSessionId).toBe("agent-session-456");
    expect(draft.ai_generated).toBe(true);
    expect(draft.createdAt).toBeInstanceOf(Date);
  });

  it("generateDraft links draft to workflow when workflow is in drafting phase", async () => {
    const workflow = createWorkflow("drafting");
    const generateContent = vi.fn().mockResolvedValue({
      content: "Draft for phase drafting",
      sessionId: "sess-drafting",
    });
    const service = new CreatorCopilotService({
      learnCopilotAgent: { generateContent },
    });

    const draft = await service.generateDraft(workflow, "Outline the curriculum");

    expect(draft.workflowId).toBe(workflow.id);
    expect(draft.phase).toBe("drafting");
    expect(draft.content).toBe("Draft for phase drafting");
    expect(draft.agentSessionId).toBe("sess-drafting");
  });
});
