/**
 * Unit tests for AgentOrchestrator.
 * Architecture: COMP-012.6
 */

import { describe, it, expect } from "vitest";
import { AgentSession } from "../../../src/domain/orchestration/agent-session.js";
import { AgentOrchestrator } from "../../../src/domain/orchestration/agent-orchestrator.js";
import type { AgentSessionStore, ContextSnapshotProvider } from "../../../src/domain/orchestration/agent-orchestrator.js";
import type { LLMAdapter, LLMResponse } from "../../../src/domain/orchestration/llm-adapter.js";

function createMockSessionStore(
  initial?: AgentSession
): AgentSessionStore & { lastSaved: AgentSession | null } {
  let session = initial ?? null;
  const state: { lastSaved: AgentSession | null } = { lastSaved: null };
  return {
    get lastSaved() {
      return state.lastSaved;
    },
    async get(sessionId: string) {
      if (session?.sessionId === sessionId) return session;
      return null;
    },
    async save(s: AgentSession) {
      session = s;
      state.lastSaved = s;
    },
  };
}

function createMockContextProvider(contextByUser: Record<string, string>): ContextSnapshotProvider {
  return {
    async getContextForUser(userId: string) {
      return contextByUser[userId] ?? "";
    },
  };
}

function createMockLLM(response: LLMResponse): LLMAdapter {
  return {
    async complete() {
      return response;
    },
  };
}

describe("AgentOrchestrator", () => {
  describe("invoke", () => {
    it("loads session, appends user message, calls LLM, saves session with assistant reply", async () => {
      const session = AgentSession.create({
        userId: "user-1",
        agentId: "agent-1",
        sessionId: "sess-1",
      });
      const sessionStore = createMockSessionStore(session);
      const contextProvider = createMockContextProvider({
        "user-1": "User is a developer.",
      });
      const llm = createMockLLM({ content: "Hello! How can I help?" });
      const orchestrator = new AgentOrchestrator({
        sessionStore,
        contextProvider,
        llm,
      });

      const response = await orchestrator.invoke("sess-1", "Hi there");

      expect(response.content).toBe("Hello! How can I help?");
      expect(sessionStore.lastSaved).not.toBeNull();
      expect(sessionStore.lastSaved!.history).toHaveLength(2);
      expect(sessionStore.lastSaved!.history[0]).toEqual({
        role: "user",
        content: "Hi there",
      });
      expect(sessionStore.lastSaved!.history[1]).toEqual({
        role: "assistant",
        content: "Hello! How can I help?",
      });
    });

    it("builds prompt from session history", async () => {
      let capturedPrompt = "";
      let capturedContext: string | undefined;
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      })
        .addMessage("user", "First message")
        .addMessage("assistant", "First reply");
      const sessionStore = createMockSessionStore(session);
      const llm: LLMAdapter = {
        async complete(prompt, context) {
          capturedPrompt = prompt;
          capturedContext = context;
          return { content: "Reply" };
        },
      };
      const orchestrator = new AgentOrchestrator({
        sessionStore,
        contextProvider: createMockContextProvider({ u: "Context" }),
        llm,
      });

      await orchestrator.invoke("s1", "Second message");

      expect(capturedContext).toBe("Context");
      expect(capturedPrompt).toContain("user: First message");
      expect(capturedPrompt).toContain("assistant: First reply");
      expect(capturedPrompt).toContain("user: Second message");
    });

    it("throws when session not found", async () => {
      const sessionStore = createMockSessionStore();
      const orchestrator = new AgentOrchestrator({
        sessionStore,
        contextProvider: createMockContextProvider({}),
        llm: createMockLLM({ content: "x" }),
      });

      await expect(orchestrator.invoke("nonexistent", "Hi")).rejects.toThrow(
        /Session not found: nonexistent/
      );
    });

    it("throws when session is not active", async () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      }).close();
      const sessionStore = createMockSessionStore(session);
      const orchestrator = new AgentOrchestrator({
        sessionStore,
        contextProvider: createMockContextProvider({}),
        llm: createMockLLM({ content: "x" }),
      });

      await expect(orchestrator.invoke("s1", "Hi")).rejects.toThrow(
        /Session .* is not active/
      );
    });

    it("prepends system prompt when agentRegistry and systemPromptRepository are provided", async () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "my-agent",
        sessionId: "s1",
      });
      const sessionStore = createMockSessionStore(session);
      const { InMemoryAgentRegistry } = await import(
        "../../../src/domain/registry/in-memory-agent-registry.js"
      );
      const { createAIAgentDefinition } = await import(
        "../../../src/domain/registry/ai-agent-definition.js"
      );
      const { createSystemPromptRepositoryFromMap } = await import(
        "../../../src/infrastructure/repositories/in-memory-system-prompt-repository.js"
      );
      const agentRegistry = new InMemoryAgentRegistry();
      await agentRegistry.register(
        createAIAgentDefinition({
          agentId: "my-agent",
          name: "Test Agent",
          pillar: "learn",
          toolIds: [],
          systemPromptId: "learn-project-scoping",
        })
      );
      const systemPromptRepository = createSystemPromptRepositoryFromMap({
        "learn-project-scoping": "You are the Project Scoping Agent. Always be concise.",
      });
      let capturedPrompt = "";
      const llm: LLMAdapter = {
        async complete(prompt) {
          capturedPrompt = prompt;
          return { content: "OK" };
        },
      };
      const orchestrator = new AgentOrchestrator({
        sessionStore,
        contextProvider: createMockContextProvider({}),
        llm,
        agentRegistry,
        systemPromptRepository,
      });

      await orchestrator.invoke("s1", "Hi");

      expect(capturedPrompt).toContain("system: You are the Project Scoping Agent. Always be concise.");
      expect(capturedPrompt).toContain("user: Hi");
    });
  });
});
