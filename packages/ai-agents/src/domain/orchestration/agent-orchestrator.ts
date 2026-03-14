/**
 * AgentOrchestrator — builds prompt from context, calls LLM, returns AgentResponse.
 * Architecture: COMP-012.6, orchestration-context-engine
 */

import type { AgentSession } from "./agent-session.js";
import type { AgentResponse } from "./agent-response.js";
import type { LLMAdapter } from "./llm-adapter.js";
import type { ToolRouter } from "./tool-router.js";

/** Session store for loading and persisting AgentSession. */
export interface AgentSessionStore {
  get(sessionId: string): Promise<AgentSession | null>;
  save(session: AgentSession): Promise<void>;
}

/** Provides context string for a user (e.g. from UserContextSnapshot). */
export interface ContextSnapshotProvider {
  getContextForUser(userId: string): Promise<string>;
}

export interface AgentOrchestratorDeps {
  sessionStore: AgentSessionStore;
  contextProvider: ContextSnapshotProvider;
  llm: LLMAdapter;
  toolRouter?: ToolRouter;
}

/**
 * Orchestrates agent invocation: loads session, appends message, builds prompt,
 * calls LLM, persists updated session, returns AgentResponse.
 */
export class AgentOrchestrator {
  constructor(private readonly deps: AgentOrchestratorDeps) {}

  /**
   * Invokes the agent for the given session with a user message.
   *
   * @param sessionId - Active session id
   * @param message - User message content
   * @returns AgentResponse with assistant content (and optional tool results)
   */
  async invoke(sessionId: string, message: string): Promise<AgentResponse> {
    const session = await this.deps.sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.status !== "active") {
      throw new Error(
        `Session ${sessionId} is not active (status: ${session.status})`
      );
    }

    const withUserMessage = session.addMessage("user", message);
    const context = await this.deps.contextProvider.getContextForUser(
      withUserMessage.userId
    );
    const prompt = this.buildPrompt(withUserMessage.history);
    const llmResponse = await this.deps.llm.complete(prompt, context || undefined);

    const withAssistantMessage = withUserMessage.addMessage(
      "assistant",
      llmResponse.content
    );
    await this.deps.sessionStore.save(withAssistantMessage);

    return {
      content: llmResponse.content,
    };
  }

  /**
   * Invokes the agent and streams the assistant response as chunks.
   * Requires LLMAdapter to implement completeStreaming.
   *
   * @param sessionId - Active session id
   * @param message - User message content
   * @returns Async iterable of content chunks (for SSE)
   */
  async *invokeStreaming(
    sessionId: string,
    message: string
  ): AsyncIterable<string> {
    const session = await this.deps.sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.status !== "active") {
      throw new Error(
        `Session ${sessionId} is not active (status: ${session.status})`
      );
    }

    const withUserMessage = session.addMessage("user", message);
    const context = await this.deps.contextProvider.getContextForUser(
      withUserMessage.userId
    );
    const prompt = this.buildPrompt(withUserMessage.history);

    const stream = this.deps.llm.completeStreaming?.(prompt, context || undefined);
    if (!stream) {
      throw new Error("LLM adapter does not support streaming");
    }

    let fullContent = "";
    for await (const chunk of stream) {
      fullContent += chunk;
      yield chunk;
    }

    const withAssistantMessage = withUserMessage.addMessage(
      "assistant",
      fullContent
    );
    await this.deps.sessionStore.save(withAssistantMessage);
  }

  private buildPrompt(history: readonly { role: string; content: string }[]): string {
    return history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");
  }
}
