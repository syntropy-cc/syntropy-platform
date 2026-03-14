/**
 * PostgreSQL implementation of AgentSessionRepository (COMP-012.7).
 */

import { AgentSession } from "../../domain/orchestration/agent-session.js";
import type { AgentSessionStore } from "../../domain/orchestration/agent-orchestrator.js";
import type { AgentSessionRepository } from "../../domain/orchestration/repositories/agent-session-repository.js";
import type { AgentSessionDbClient } from "../agent-session-db-client.js";

const SCHEMA_TABLE = "ai_agents.agent_sessions";
const COLS =
  "session_id, user_id, agent_id, status, history, started_at, ended_at";

const UPSERT_SQL = `
  INSERT INTO ${SCHEMA_TABLE} (session_id, user_id, agent_id, status, history, started_at, ended_at)
  VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
  ON CONFLICT (session_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    agent_id = EXCLUDED.agent_id,
    status = EXCLUDED.status,
    history = EXCLUDED.history,
    started_at = EXCLUDED.started_at,
    ended_at = EXCLUDED.ended_at
`;

const SELECT_BY_ID = `SELECT ${COLS} FROM ${SCHEMA_TABLE} WHERE session_id = $1`;
const SELECT_ACTIVE_BY_USER = `SELECT ${COLS} FROM ${SCHEMA_TABLE} WHERE user_id = $1 AND status = 'active' ORDER BY started_at DESC`;

function rowToSession(row: Record<string, unknown>): AgentSession {
  const sessionId = String(row.session_id);
  const userId = String(row.user_id);
  const agentId = String(row.agent_id);
  const status = String(row.status) as AgentSession["status"];
  const history = parseHistory(row.history);
  const startedAt =
    row.started_at instanceof Date
      ? row.started_at
      : new Date(String(row.started_at));
  const endedAt =
    row.ended_at != null
      ? row.ended_at instanceof Date
        ? row.ended_at
        : new Date(String(row.ended_at))
      : undefined;

  return AgentSession.fromPersistence({
    sessionId,
    userId,
    agentId,
    status,
    history,
    startedAt,
    endedAt,
  });
}

function parseHistory(value: unknown): readonly { role: string; content: string }[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object" && "role" in item && "content" in item) {
      return {
        role: String((item as { role: unknown }).role),
        content: String((item as { content: unknown }).content),
      };
    }
    return { role: "", content: String(item) };
  });
}

export class PostgresAgentSessionRepository
  implements AgentSessionRepository, AgentSessionStore
{
  constructor(private readonly client: AgentSessionDbClient) {}

  async get(sessionId: string): Promise<AgentSession | null> {
    return this.findById(sessionId);
  }

  async findById(sessionId: string): Promise<AgentSession | null> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_ID,
      [sessionId]
    );
    if (rows.length === 0) return null;
    return rowToSession(rows[0]);
  }

  async findActiveByUser(userId: string): Promise<AgentSession[]> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_ACTIVE_BY_USER,
      [userId]
    );
    return rows.map(rowToSession);
  }

  async save(session: AgentSession): Promise<void> {
    const historyJson = JSON.stringify(
      session.history.map((m) => ({ role: m.role, content: m.content }))
    );
    await this.client.execute(UPSERT_SQL, [
      session.sessionId,
      session.userId,
      session.agentId,
      session.status,
      historyJson,
      session.startedAt,
      session.endedAt ?? null,
    ]);
  }
}
