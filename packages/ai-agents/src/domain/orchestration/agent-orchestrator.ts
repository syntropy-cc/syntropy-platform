/**
 * AgentOrchestrator — builds prompt from context, calls LLM, returns AgentResponse.
 * Architecture: COMP-012.6, orchestration-context-engine, COMP-014.5
 */

import type { AgentSession } from "./agent-session.js";
import type { AgentResponse } from "./agent-response.js";
import type { LLMAdapter } from "./llm-adapter.js";
import type { ToolRouter } from "./tool-router.js";
import type { AgentRegistry } from "../registry/agent-registry.js";
import type { SystemPromptRepository } from "../registry/system-prompt-repository.js";

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
  /** Optional: resolve agent definition for system prompt (COMP-014.5). */
  agentRegistry?: AgentRegistry;
  /** Optional: load system prompt text by prompt ID. */
  systemPromptRepository?: SystemPromptRepository;
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
    const systemPrompt = await this.resolveSystemPrompt(withUserMessage.agentId);
    const prompt = this.buildPrompt(withUserMessage.history, systemPrompt);
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
    const systemPrompt = await this.resolveSystemPrompt(withUserMessage.agentId);
    const prompt = this.buildPrompt(withUserMessage.history, systemPrompt);

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

  private async resolveSystemPrompt(agentId: string): Promise<string | null> {
    if (!this.deps.agentRegistry || !this.deps.systemPromptRepository) {
      return null;
    }
    const def = await this.deps.agentRegistry.findById(agentId);
    if (!def) return null;
    return this.deps.systemPromptRepository.getByPromptId(def.systemPromptId);
  }

  private buildPrompt(
    history: readonly { role: string; content: string }[],
    systemPrompt: string | null = null
  ): string {
    const conversation = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");
    if (systemPrompt) {
      return `system: ${systemPrompt}\n\n${conversation}`;
    }
    return conversation;
  }
}
