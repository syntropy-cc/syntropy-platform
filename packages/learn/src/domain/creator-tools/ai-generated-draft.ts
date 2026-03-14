/**
 * AIGeneratedDraft value object — draft content + AI invocation metadata (COMP-017.2).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 *
 * All instances are AI-generated; ai_generated is implicitly true and cannot be set to false.
 */

import type { CreatorWorkflowId } from "@syntropy/types";

import type { CreatorWorkflowPhase } from "./creator-workflow-phase.js";

export interface AIGeneratedDraftParams {
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly content: string;
  readonly agentSessionId: string;
  readonly createdAt?: Date;
}

/**
 * Immutable value object for content produced by an AI agent during the creator workflow.
 * Always tagged as AI-generated; creator may edit freely before approval.
 */
export class AIGeneratedDraft {
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly content: string;
  readonly agentSessionId: string;
  readonly createdAt: Date;

  /** All AIGeneratedDraft instances are AI-generated; no way to set to false. */
  readonly ai_generated = true as const;

  private constructor(params: AIGeneratedDraftParams) {
    this.workflowId = params.workflowId;
    this.phase = params.phase;
    this.content = params.content;
    this.agentSessionId = params.agentSessionId;
    this.createdAt = params.createdAt ?? new Date();
  }

  static create(params: AIGeneratedDraftParams): AIGeneratedDraft {
    if (typeof params.content !== "string") {
      throw new Error("AIGeneratedDraft content must be a string");
    }
    if (typeof params.agentSessionId !== "string" || !params.agentSessionId.trim()) {
      throw new Error("AIGeneratedDraft agentSessionId must be a non-empty string");
    }
    return new AIGeneratedDraft(params);
  }
}
