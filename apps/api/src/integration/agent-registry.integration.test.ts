/**
 * Integration tests for Agent Registry (COMP-013.5).
 *
 * Uses Testcontainers Postgres for session store; InMemoryAgentRegistry and toolStore.
 * Verifies: register agent + list agents, session persisted in real DB, tool permission 403,
 * tool schema validation rejects invalid params.
 *
 * Requires Docker for Testcontainers.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import type { AgentEventPublisher, LLMAdapter } from "@syntropy/ai-agents";
import {
  InMemoryAgentRegistry,
  AgentOrchestrator,
  PostgresAgentSessionRepository,
  PgAgentSessionDbClient,
  createToolDefinition,
  type AgentSessionStore,
  type ContextSnapshotProvider,
  type ToolDefinition,
} from "@syntropy/ai-agents";
import { z } from "zod";
import type { ToolDefinitionStore } from "../types/ai-agents-context.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
const ADMIN_JWT = "admin-test-jwt";
const LEARNER_JWT = "learner-test-jwt";

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
      if (jwt !== validJwt)
        throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
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

function createMockEventPublisher(): AgentEventPublisher {
  return {
    publishSessionStarted: async () => {},
    publishInvoked: async () => {},
  } as unknown as AgentEventPublisher;
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

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const files = ["20260313250000_ai_agents_sessions.sql"];
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

describe("agent registry integration (COMP-013.5)", () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let app: Awaited<ReturnType<typeof createApp>>;
    let agentRegistry: InMemoryAgentRegistry;
    let toolStore: ToolDefinitionStore;

    beforeAll(async () => {
      container = await new PostgreSqlContainer().start();
      const connectionUri = container.getConnectionUri();
      pool = new Pool({ connectionString: connectionUri });

      const migrationsDir = getMigrationsDir();
      await runMigrations(pool, migrationsDir);

      const sessionDbClient = new PgAgentSessionDbClient(pool);
      const sessionStore = new PostgresAgentSessionRepository(sessionDbClient);
      agentRegistry = new InMemoryAgentRegistry();
      toolStore = createToolStore();

      app = await createApp({
        auth: createMockAuth(VALID_JWT, ["learner"]),
        supabaseClient: null,
        aiAgents: {
          sessionStore,
          eventPublisher: createMockEventPublisher(),
          orchestrator: createMockOrchestrator(sessionStore),
          agentRegistry,
          toolStore,
        },
      });
    });

    afterAll(async () => {
      if (app) await app.close();
      if (pool) await pool.end();
      if (container) await container.stop();
    });

    it("register agent as admin and list agents returns registered agent", async () => {
      const adminApp = await createApp({
        auth: createMockAuth(ADMIN_JWT, ["admin"]),
        supabaseClient: null,
        aiAgents: {
          sessionStore: new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool)),
          eventPublisher: createMockEventPublisher(),
          orchestrator: createMockOrchestrator(
            new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool))
          ),
          agentRegistry,
          toolStore,
        },
      });
      const postRes = await adminApp.inject({
        method: "POST",
        url: "/api/v1/agents",
        headers: { authorization: `Bearer ${ADMIN_JWT}` },
        payload: {
          agentId: "int-agent-1",
          name: "Integration Agent",
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
      const postBody = postRes.json() as { data?: { agentId?: string } };
      expect(postBody.data?.agentId).toBe("int-agent-1");

      const listRes = await adminApp.inject({
        method: "GET",
        url: "/api/v1/agents",
      });
      expect(listRes.statusCode).toBe(200);
      const listBody = listRes.json() as { data?: Array<{ agentId: string; name: string }> };
      expect(listBody.data).toBeDefined();
      expect(listBody.data!.length).toBeGreaterThanOrEqual(1);
      expect(listBody.data!.some((a) => a.agentId === "int-agent-1" && a.name === "Integration Agent")).toBe(true);
      await adminApp.close();
    });

    it("session created via API is persisted in real DB", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/ai-agents/sessions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { agentId: "default" },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data?: { sessionId?: string } };
      const sessionId = createBody.data?.sessionId;
      expect(sessionId).toBeDefined();

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/ai-agents/sessions/${sessionId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json() as { data?: { sessionId: string; status: string } };
      expect(getBody.data?.sessionId).toBe(sessionId);
      expect(getBody.data?.status).toBe("active");
    });

    it("invoke tool with insufficient role returns 403", async () => {
      const adminApp = await createApp({
        auth: createMockAuth(ADMIN_JWT, ["admin"]),
        supabaseClient: null,
        aiAgents: {
          sessionStore: new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool)),
          eventPublisher: createMockEventPublisher(),
          orchestrator: createMockOrchestrator(
            new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool))
          ),
          agentRegistry,
          toolStore,
        },
      });
      await adminApp.inject({
        method: "POST",
        url: "/api/v1/agents",
        headers: { authorization: `Bearer ${ADMIN_JWT}` },
        payload: {
          agentId: "agent-403",
          name: "Agent With Creator Tool",
          pillar: "learn",
          toolIds: ["tool-creator-only"],
          systemPromptId: "p1",
          tools: [
            {
              toolId: "tool-creator-only",
              name: "CreatorOnly",
              requiredRole: "creator",
            },
          ],
        },
      });
      await adminApp.close();

      const learnerApp = await createApp({
        auth: createMockAuth(LEARNER_JWT, ["learner"]),
        supabaseClient: null,
        aiAgents: {
          sessionStore: new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool)),
          eventPublisher: createMockEventPublisher(),
          orchestrator: createMockOrchestrator(
            new PostgresAgentSessionRepository(new PgAgentSessionDbClient(pool))
          ),
          agentRegistry,
          toolStore,
        },
      });
      const canInvokeRes = await learnerApp.inject({
        method: "GET",
        url: "/api/v1/agents/tools/tool-creator-only/can-invoke",
        headers: { authorization: `Bearer ${LEARNER_JWT}` },
      });
      expect(canInvokeRes.statusCode).toBe(403);
      const errBody = canInvokeRes.json() as { error?: { code: string } };
      expect(errBody.error?.code).toBe("FORBIDDEN");
      await learnerApp.close();
    });

    it("tool schema validation rejects invalid params with 400", async () => {
      const strictTool = createToolDefinition({
        toolId: "strict-schema-tool",
        name: "StrictSchema",
        inputSchema: z.object({ query: z.string() }),
        requiredRole: "learner",
      });
      toolStore.register(strictTool);

      const validateRes = await app.inject({
        method: "POST",
        url: "/api/v1/agents/tools/validate",
        payload: {
          toolId: "strict-schema-tool",
          params: { query: 123 },
        },
      });
      expect(validateRes.statusCode).toBe(400);
      const errBody = validateRes.json() as {
        error?: { code: string; message: string; details?: unknown };
      };
      expect(errBody.error?.code).toBe("VALIDATION_ERROR");
      expect(errBody.error?.message).toContain("schema validation");
      expect(errBody.error?.details).toBeDefined();
    });
  }
);
