/**
 * Stub adapter for Learn copilot AI agent (COMP-017.2).
 * Architecture: creator-tools-copilot.md, PAT-005.
 *
 * Implements LearnCopilotAgentPort for testing and placeholder integration.
 * Replace with HTTP client to POST /api/v1/ai-agents/sessions and invoke for production.
 */

import type { LearnCopilotAgentPort } from "../application/ports/learn-copilot-agent-port.js";
import type { GenerateContentParams, GenerateContentResult } from "../application/ports/learn-copilot-agent-port.js";

export interface StubLearnCopilotAdapterOptions {
  /** Fixed content returned by generateContent (default: stub message). */
  readonly content?: string;
  /** Fixed session id returned (default: stub-session-id). */
  readonly sessionId?: string;
}

/**
 * Stub implementation of LearnCopilotAgentPort.
 * Returns configurable content and sessionId without calling an external AI service.
 */
export class StubLearnCopilotAdapter implements LearnCopilotAgentPort {
  private readonly content: string;
  private readonly sessionId: string;

  constructor(options: StubLearnCopilotAdapterOptions = {}) {
    this.content = options.content ?? "[Stub AI draft content]";
    this.sessionId = options.sessionId ?? "stub-session-id";
  }

  async generateContent(_params: GenerateContentParams): Promise<GenerateContentResult> {
    return {
      content: this.content,
      sessionId: this.sessionId,
    };
  }
}
