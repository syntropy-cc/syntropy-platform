/**
 * API tests for Agent Registry routes (COMP-013.4).
 * Verifies POST (admin only), GET list, GET by id, GET tools; 403 for non-admin.
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
  InMemoryAgentRegistry,
  AgentSession,
  AgentOrchestrator,
  type AgentSessionStore,
  type AgentEventPublisher,
  type ContextSnapshotProvider,
  type LLMAdapter,
  type ToolDefinition,
} from "@syntropy/ai-agents";
import type { ToolDefinitionStore } from "../types/ai-agents-context.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-jwt";
const ADMIN_JWT = "admin-jwt";

function createMockAuth(validJwt: string, roles: string[]): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: TEST_ACTOR_ID,
    roles,
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

function createMockOrchestrator(store: AgentSessionStore): AgentOrchestrator {
  const contextProvider: ContextSnapshotProvider = {
    async getContextForUser() {
      return "";
    },
  };
  const llm: LLMAdapter = {
    async complete() {
      return { content: "Mock" };
    },
    completeStreaming() {
      return (async function* () {
        yield "Mock";
      })();
    },
  };
  return new AgentOrchestrator({
    sessionStore: store,
    contextProvider,
    llm,
  });
}

function createToolStore(): ToolDefinitionStore {
  const byId = new Map<string, ToolDefinition>();
  return {
    get(toolId: string) {
      return byId.get(toolId);
    },
    register(tool: ToolDefinition) {
      byId.set(tool.toolId, tool);
    },
  };
}

describe("agents routes", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  let sessionStore: AgentSessionStore;
  let agentRegistry: InMemoryAgentRegistry;
  let toolStore: ToolDefinitionStore;

  beforeEach(async () => {
    sessionStore = createMockSessionStore();
    agentRegistry = new InMemoryAgentRegistry();
    toolStore = createToolStore();
    app = await createApp({
      auth: createMockAuth(VALID_JWT, ["learner"]),
      aiAgents: {
        sessionStore,
        eventPublisher: { async publishSessionStarted() {}, async publishInvoked() {} },
        orchestrator: createMockOrchestrator(sessionStore),
        agentRegistry,
        toolStore,
      },
    });
  });

  it("POST /api/v1/agents without auth returns 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/agents",
      payload: {
        agentId: "agent-1",
        name: "Test Agent",
        pillar: "learn",
        toolIds: [],
        systemPromptId: "p1",
      },
    });
    expect(response.statusCode).toBe(401);
  });

  it("POST /api/v1/agents with non-admin role returns 403", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/agents",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        agentId: "agent-1",
        name: "Test Agent",
        pillar: "learn",
        toolIds: [],
        systemPromptId: "p1",
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it("POST /api/v1/agents with admin creates agent and GET list returns it", async () => {
    const adminApp = await createApp({
      auth: createMockAuth(ADMIN_JWT, ["admin"]),
      aiAgents: {
        sessionStore,
        eventPublisher: { async publishSessionStarted() {}, async publishInvoked() {} },
        orchestrator: createMockOrchestrator(sessionStore),
        agentRegistry,
        toolStore,
      },
    });
    const postRes = await adminApp.inject({
      method: "POST",
      url: "/api/v1/agents",
      headers: { authorization: `Bearer ${ADMIN_JWT}` },
      payload: {
        agentId: "agent-1",
        name: "Test Agent",
        pillar: "learn",
        toolIds: ["tool-1"],
        systemPromptId: "p1",
        tools: [
          {
            toolId: "tool-1",
            name: "tool1",
            description: "A tool",
            requiredRole: "creator",
          },
        ],
      },
    });
    expect(postRes.statusCode).toBe(201);
    const postBody = postRes.json() as { data?: { agentId?: string }; meta?: unknown };
    expect(postBody.data?.agentId).toBe("agent-1");

    const listRes = await adminApp.inject({
      method: "GET",
      url: "/api/v1/agents",
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = listRes.json() as { data?: Array<{ agentId: string; name: string }> };
    expect(listBody.data).toHaveLength(1);
    expect(listBody.data![0].agentId).toBe("agent-1");
    expect(listBody.data![0].name).toBe("Test Agent");
    await adminApp.close();
  });

  it("GET /api/v1/agents/:id returns agent when found", async () => {
    const adminApp = await createApp({
      auth: createMockAuth(ADMIN_JWT, ["admin"]),
      aiAgents: {
        sessionStore,
        eventPublisher: { async publishSessionStarted() {}, async publishInvoked() {} },
        orchestrator: createMockOrchestrator(sessionStore),
        agentRegistry,
        toolStore,
      },
    });
    await adminApp.inject({
      method: "POST",
      url: "/api/v1/agents",
      headers: { authorization: `Bearer ${ADMIN_JWT}` },
      payload: {
        agentId: "agent-2",
        name: "Second Agent",
        pillar: "hub",
        toolIds: ["t1"],
        systemPromptId: "p2",
      },
    });
    const res = await adminApp.inject({
      method: "GET",
      url: "/api/v1/agents/agent-2",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data?: { agentId: string; name: string } };
    expect(body.data?.agentId).toBe("agent-2");
    expect(body.data?.name).toBe("Second Agent");
    await adminApp.close();
  });

  it("GET /api/v1/agents/:id returns 404 when not found", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/agents/nonexistent",
    });
    expect(res.statusCode).toBe(404);
  });

  it("GET /api/v1/agents/:id/tools returns tools for agent", async () => {
    const adminApp = await createApp({
      auth: createMockAuth(ADMIN_JWT, ["admin"]),
      aiAgents: {
        sessionStore,
        eventPublisher: { async publishSessionStarted() {}, async publishInvoked() {} },
        orchestrator: createMockOrchestrator(sessionStore),
        agentRegistry,
        toolStore,
      },
    });
    await adminApp.inject({
      method: "POST",
      url: "/api/v1/agents",
      headers: { authorization: `Bearer ${ADMIN_JWT}` },
      payload: {
        agentId: "agent-3",
        name: "Agent With Tools",
        pillar: "learn",
        toolIds: ["tool-a"],
        systemPromptId: "p3",
        tools: [
          { toolId: "tool-a", name: "toolA", requiredRole: "creator" },
        ],
      },
    });
    const res = await adminApp.inject({
      method: "GET",
      url: "/api/v1/agents/agent-3/tools",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data?: Array<{ toolId: string; name: string; requiredRole: string }> };
    expect(body.data).toHaveLength(1);
    expect(body.data![0].toolId).toBe("tool-a");
    expect(body.data![0].name).toBe("toolA");
    expect(body.data![0].requiredRole).toBe("creator");
    await adminApp.close();
  });
});
