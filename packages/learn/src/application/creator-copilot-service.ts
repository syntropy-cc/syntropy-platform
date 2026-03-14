/**
 * CreatorCopilotService — generates drafts via AI agent (COMP-017.2).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 */

import type { CreatorWorkflow } from "../domain/creator-tools/creator-workflow.js";
import { AIGeneratedDraft } from "../domain/creator-tools/ai-generated-draft.js";
import type { LearnCopilotAgentPort } from "./ports/learn-copilot-agent-port.js";

export interface CreatorCopilotServiceDeps {
  readonly learnCopilotAgent: LearnCopilotAgentPort;
}

/**
 * Application service that generates AI drafts for a creator workflow.
 * Calls the AI agent via the port and returns an AIGeneratedDraft linked to the workflow.
 */
export class CreatorCopilotService {
  constructor(private readonly deps: CreatorCopilotServiceDeps) {}

  /**
   * Generates a draft for the current workflow phase using the AI agent.
   * Returns an AIGeneratedDraft linked to the workflow (same workflowId and phase).
   */
  async generateDraft(
    workflow: CreatorWorkflow,
    prompt: string
  ): Promise<AIGeneratedDraft> {
    const result = await this.deps.learnCopilotAgent.generateContent({
      workflowId: workflow.id,
      phase: workflow.currentPhase,
      prompt,
      userId: workflow.creatorId,
    });

    return AIGeneratedDraft.create({
      workflowId: workflow.id,
      phase: workflow.currentPhase,
      content: result.content,
      agentSessionId: result.sessionId,
      createdAt: new Date(),
    });
  }
}
