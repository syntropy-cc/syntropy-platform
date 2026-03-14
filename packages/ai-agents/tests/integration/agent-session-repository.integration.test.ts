/**
 * Integration tests for AgentSessionRepository and AgentEventPublisher (COMP-012.7).
 * Uses in-memory mock DB client and mock Kafka producer to verify repository and event behavior.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { AgentSession } from "../../src/domain/orchestration/agent-session.js";
import { PostgresAgentSessionRepository } from "../../src/infrastructure/repositories/postgres-agent-session-repository.js";
import { AgentEventPublisher } from "../../src/infrastructure/agent-event-publisher.js";
import type { AgentSessionDbClient } from "../../src/infrastructure/agent-session-db-client.js";

function createMockDbClient(): AgentSessionDbClient & {
  rows: Map<string, Record<string, unknown>>;
} {
  const rows = new Map<string, Record<string, unknown>>();
  return {
    rows,
    async execute(_sql: string, params: unknown[]): Promise<void> {
      const sessionId = String(params[0]);
      rows.set(sessionId, {
        session_id: params[0],
        user_id: params[1],
        agent_id: params[2],
        status: params[3],
        history: params[4],
        started_at: params[5],
        ended_at: params[6],
      });
    },
    async query<T = Record<string, unknown>>(
      sql: string,
      params: unknown[]
    ): Promise<T[]> {
      const parseRow = (r: Record<string, unknown>) => {
        const out = { ...r };
        if (typeof out.history === "string") {
          try {
            out.history = JSON.parse(out.history as string) as unknown;
          } catch {
            out.history = [];
          }
        }
        return out as T;
      };
      if (sql.includes("WHERE session_id = $1")) {
        const sessionId = params[0] as string;
        const row = rows.get(sessionId);
        return row ? [parseRow(row)] : [];
      }
      if (sql.includes("WHERE user_id = $1") && sql.includes("status = 'active'")) {
        const userId = params[0] as string;
        return [...rows.values()]
          .filter(
            (r) => r.user_id === userId && r.status === "active"
          )
          .sort(
            (a, b) =>
              new Date(b.started_at as string).getTime() -
              new Date(a.started_at as string).getTime()
          )
          .map(parseRow);
      }
      return [];
    },
  };
}

function createMockKafkaProducer(): {
  published: { topic: string; eventType: string; payload: unknown }[];
  publish: (topic: string, envelope: { eventType: string; payload: unknown }) => Promise<void>;
} {
  const published: { topic: string; eventType: string; payload: unknown }[] = [];
  return {
    published,
    async publish(
      topic: string,
      envelope: { eventType: string; payload: unknown }
    ): Promise<void> {
      published.push({
        topic,
        eventType: envelope.eventType,
        payload: envelope.payload,
      });
    },
  };
}

describe("PostgresAgentSessionRepository", () => {
  let client: ReturnType<typeof createMockDbClient>;
  let repo: PostgresAgentSessionRepository;

  beforeEach(() => {
    client = createMockDbClient();
    repo = new PostgresAgentSessionRepository(client);
  });

  it("save persists session and findById returns it", async () => {
    const session = AgentSession.create({
      userId: "user-1",
      agentId: "agent-learn",
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    await repo.save(session);

    const found = await repo.findById(session.sessionId);
    expect(found).not.toBeNull();
    expect(found!.sessionId).toBe(session.sessionId);
    expect(found!.userId).toBe(session.userId);
    expect(found!.agentId).toBe(session.agentId);
    expect(found!.status).toBe("active");
    expect(found!.history).toHaveLength(0);
  });

  it("findById returns null when session does not exist", async () => {
    const found = await repo.findById("nonexistent-session-id");
    expect(found).toBeNull();
  });

  it("findActiveByUser returns only active sessions for user", async () => {
    const s1 = AgentSession.create({
      userId: "user-1",
      agentId: "agent-a",
      sessionId: "session-1",
    });
    const s2 = AgentSession.create({
      userId: "user-1",
      agentId: "agent-b",
      sessionId: "session-2",
    });
    const s3 = AgentSession.create({
      userId: "user-2",
      agentId: "agent-a",
      sessionId: "session-3",
    });
    await repo.save(s1);
    await repo.save(s2);
    await repo.save(s3);

    const active = await repo.findActiveByUser("user-1");
    expect(active).toHaveLength(2);
    expect(active.map((s) => s.sessionId).sort()).toEqual(
      ["session-1", "session-2"].sort()
    );
  });

  it("save updates existing session (addMessage, close)", async () => {
    const session = AgentSession.create({
      userId: "user-1",
      agentId: "agent-a",
      sessionId: "session-update",
    });
    await repo.save(session);

    const withMessage = session.addMessage("user", "Hello");
    await repo.save(withMessage);

    const found = await repo.findById(session.sessionId);
    expect(found!.history).toHaveLength(1);
    expect(found!.history[0].role).toBe("user");
    expect(found!.history[0].content).toBe("Hello");

    const closed = withMessage.close();
    await repo.save(closed);

    const afterClose = await repo.findById(session.sessionId);
    expect(afterClose!.status).toBe("completed");
    expect(afterClose!.endedAt).toBeDefined();
  });

  it("get returns same as findById for AgentSessionStore contract", async () => {
    const session = AgentSession.create({
      userId: "u",
      agentId: "a",
      sessionId: "sid",
    });
    await repo.save(session);
    const viaGet = await repo.get("sid");
    expect(viaGet?.sessionId).toBe("sid");
  });
});

describe("AgentEventPublisher", () => {
  it("publishSessionStarted publishes ai.agent.session_started", async () => {
    const mock = createMockKafkaProducer();
    const publisher = new AgentEventPublisher(
      mock as unknown as import("@syntropy/event-bus").KafkaProducer
    );

    await publisher.publishSessionStarted("sid-1", "user-1", "agent-learn");

    expect(mock.published).toHaveLength(1);
    expect(mock.published[0].topic).toBe("ai.agent.events");
    expect(mock.published[0].eventType).toBe("ai.agent.session_started");
    const payload = mock.published[0].payload as {
      sessionId: string;
      userId: string;
      agentId: string;
      startedAt: string;
    };
    expect(payload.sessionId).toBe("sid-1");
    expect(payload.userId).toBe("user-1");
    expect(payload.agentId).toBe("agent-learn");
    expect(payload.startedAt).toBeDefined();
  });

  it("publishInvoked publishes ai.agent.invoked", async () => {
    const mock = createMockKafkaProducer();
    const publisher = new AgentEventPublisher(
      mock as unknown as import("@syntropy/event-bus").KafkaProducer
    );

    await publisher.publishInvoked("sid-1", "user-1", {
      messageId: "msg-1",
    });

    expect(mock.published).toHaveLength(1);
    expect(mock.published[0].eventType).toBe("ai.agent.invoked");
    const payload = mock.published[0].payload as {
      sessionId: string;
      userId: string;
      messageId?: string;
      invokedAt: string;
    };
    expect(payload.sessionId).toBe("sid-1");
    expect(payload.userId).toBe("user-1");
    expect(payload.messageId).toBe("msg-1");
    expect(payload.invokedAt).toBeDefined();
  });
});
