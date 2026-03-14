/**
 * Port for invoking AI agent to generate draft content (COMP-017.2).
 * Architecture: creator-tools-copilot.md, PAT-005 (adapter at boundary).
 */

import type { CreatorWorkflowId } from "@syntropy/types";

import type { CreatorWorkflowPhase } from "../../domain/creator-tools/creator-workflow-phase.js";

export interface GenerateContentParams {
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly prompt: string;
  readonly userId: string;
}

export interface GenerateContentResult {
  readonly content: string;
  readonly sessionId: string;
}

/**
 * Port for the Learn creator copilot: invokes the AI agent and returns
 * generated content plus session id for audit/metadata.
 */
export interface LearnCopilotAgentPort {
  generateContent(params: GenerateContentParams): Promise<GenerateContentResult>;
}
