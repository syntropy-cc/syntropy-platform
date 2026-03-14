/**
 * API tests for AI agents routes (COMP-012.8).
 * Uses mocked session store and event publisher; verifies auth required and response shape.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  AgentSession,
  AgentOrchestrator,
  type AgentSessionStore,
  type AgentEventPublisher,
  type ContextSnapshotProvider,
  type LLMAdapter,
} from "@syntropy/ai-agents";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-ai-agent-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: TEST_ACTOR_ID,
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt) throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createMockSessionStore(): AgentSessionStore {
  const sessions = new Map<string, AgentSession>();
  return {
    async get(sessionId: string) {
      return sessions.get(sessionId) ?? null;
    },
    async save(session: AgentSession) {
      sessions.set(session.sessionId, session);
    },
  };
}

function createMockEventPublisher(): AgentEventPublisher {
  return {
    async publishSessionStarted() {},
    async publishInvoked() {},
  };
}

function createMockOrchestrator(store: AgentSessionStore): AgentOrchestrator {
  const contextProvider: ContextSnapshotProvider = {
    async getContextForUser() {
      return "";
    },
  };
  const llm: LLMAdapter = {
    async complete() {
      return { content: "Mock response" };
    },
    completeStreaming() {
      return (async function* () {
        yield "Mock ";
        yield "streamed ";
        yield "response";
      })();
    },
  };
  return new AgentOrchestrator({
    sessionStore: store,
    contextProvider,
    llm,
  });
}

describe("ai-agents routes", () => {
  describe("when aiAgents is not configured", () => {
    it("POST /api/v1/ai-agents/sessions returns 404", async () => {
      const app = await createApp({
        auth: createMockAuth(VALID_JWT),
        aiAgents: null,
      });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/ai-agents/sessions",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { agentId: "default" },
        });
        expect(response.statusCode).toBe(404);
      } finally {
        await app.close();
      }
    });
  });

  describe("when aiAgents is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;
    let sessionStore: AgentSessionStore;

    beforeEach(async () => {
      sessionStore = createMockSessionStore();
      const orchestrator = createMockOrchestrator(sessionStore);
      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        aiAgents: {
          sessionStore,
          eventPublisher: createMockEventPublisher(),
          orchestrator,
        },
      });
    });

    it("POST /api/v1/ai-agents/sessions without auth returns 401", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/ai-agents/sessions",
        payload: { agentId: "default" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("POST /api/v1/ai-agents/sessions with auth creates session and returns 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/ai-agents/sessions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { agentId: "learn-agent" },
      });
      expect(response.statusCode).toBe(201);
      const body = response.json() as { data?: { sessionId?: string }; meta?: unknown };
      expect(body.data).toBeDefined();
      expect(body.data!.sessionId).toBeDefined();
      expect(typeof body.data!.sessionId).toBe("string");
      expect(body.meta).toBeDefined();
    });

    it("GET /api/v1/ai-agents/sessions/:id without auth returns 401", async () => {
      const session = AgentSession.create({
        userId: TEST_USER_ID,
        agentId: "default",
      });
      await sessionStore.save(session);
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/ai-agents/sessions/${session.sessionId}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("GET /api/v1/ai-agents/sessions/:id with auth returns session", async () => {
      const session = AgentSession.create({
        userId: TEST_USER_ID,
        agentId: "default",
      });
      await sessionStore.save(session);
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/ai-agents/sessions/${session.sessionId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json() as { data?: { sessionId?: string; userId?: string; status?: string }; meta?: unknown };
      expect(body.data!.sessionId).toBe(session.sessionId);
      expect(body.data!.userId).toBe(TEST_USER_ID);
      expect(body.data!.status).toBe("active");
    });

    it("GET /api/v1/ai-agents/sessions/:id for nonexistent returns 404", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ai-agents/sessions/00000000-0000-0000-0000-000000000000",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
