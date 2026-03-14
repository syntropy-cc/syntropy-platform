/**
 * Unit tests for AIGeneratedDraft value object (COMP-017.2).
 */

import { createCreatorWorkflowId } from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { AIGeneratedDraft } from "../../../src/domain/creator-tools/ai-generated-draft.js";

describe("AIGeneratedDraft", () => {
  it("create builds draft with workflowId phase content agentSessionId and createdAt", () => {
    const workflowId = createCreatorWorkflowId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );
    const createdAt = new Date("2026-01-15T12:00:00Z");

    const draft = AIGeneratedDraft.create({
      workflowId,
      phase: "ideation",
      content: "Draft content here",
      agentSessionId: "session-123",
      createdAt,
    });

    expect(draft.workflowId).toBe(workflowId);
    expect(draft.phase).toBe("ideation");
    expect(draft.content).toBe("Draft content here");
    expect(draft.agentSessionId).toBe("session-123");
    expect(draft.createdAt).toBe(createdAt);
    expect(draft.ai_generated).toBe(true);
  });

  it("ai_generated is always true and cannot be set to false", () => {
    const draft = AIGeneratedDraft.create({
      workflowId: createCreatorWorkflowId(
        "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
      ),
      phase: "drafting",
      content: "Content",
      agentSessionId: "sess-1",
    });

    expect(draft.ai_generated).toBe(true);
    expect((draft as { ai_generated?: boolean }).ai_generated).toBe(true);
  });

  it("create uses current date when createdAt is omitted", () => {
    const before = new Date();
    const draft = AIGeneratedDraft.create({
      workflowId: createCreatorWorkflowId(
        "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
      ),
      phase: "review",
      content: "Text",
      agentSessionId: "sess-2",
    });
    const after = new Date();

    expect(draft.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(draft.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("create throws when content is not a string", () => {
    const workflowId = createCreatorWorkflowId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );

    expect(() =>
      AIGeneratedDraft.create({
        workflowId,
        phase: "ideation",
        content: null as unknown as string,
        agentSessionId: "sess-1",
      })
    ).toThrow("AIGeneratedDraft content must be a string");
  });

  it("create throws when agentSessionId is empty", () => {
    const workflowId = createCreatorWorkflowId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );

    expect(() =>
      AIGeneratedDraft.create({
        workflowId,
        phase: "ideation",
        content: "OK",
        agentSessionId: "",
      })
    ).toThrow("AIGeneratedDraft agentSessionId must be a non-empty string");

    expect(() =>
      AIGeneratedDraft.create({
        workflowId,
        phase: "ideation",
        content: "OK",
        agentSessionId: "   ",
      })
    ).toThrow("AIGeneratedDraft agentSessionId must be a non-empty string");
  });
});
