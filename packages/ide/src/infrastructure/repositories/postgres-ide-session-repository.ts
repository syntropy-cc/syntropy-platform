/**
 * PostgreSQL implementation of IDESessionRepository (COMP-030.7).
 */

import type { Pool } from "pg";
import { IDESession } from "../../domain/ide-session.js";
import { isIDESessionStatus } from "../../domain/ide-session-status.js";
import type { IDESessionParams } from "../../domain/ide-session.js";
import type { IDESessionRepository } from "../../domain/ports/ide-session-repository.js";

const TABLE = "ide.ide_sessions";

type SessionRow = {
  session_id: string;
  user_id: string;
  project_id: string | null;
  status: string;
  container_id: string | null;
  workspace_id: string | null;
  started_at: Date | null;
  last_active_at: Date | null;
  terminated_at: Date | null;
};

function rowToSession(row: SessionRow): IDESession {
  if (!isIDESessionStatus(row.status)) {
    throw new Error(`Invalid session status in DB: ${row.status}`);
  }
  const params: IDESessionParams = {
    sessionId: row.session_id,
    userId: row.user_id,
    projectId: row.project_id,
    status: row.status as IDESessionParams["status"],
    containerId: row.container_id,
    workspaceId: row.workspace_id,
    startedAt: row.started_at,
    lastActiveAt: row.last_active_at,
    terminatedAt: row.terminated_at,
  };
  return IDESession.fromPersistence(params);
}

export class PostgresIDESessionRepository implements IDESessionRepository {
  constructor(private readonly pool: Pool) {}

  async findById(sessionId: string): Promise<IDESession | null> {
    const result = await this.pool.query(
      `SELECT session_id, user_id, project_id, status, container_id, workspace_id,
              started_at, last_active_at, terminated_at
       FROM ${TABLE} WHERE session_id = $1`,
      [sessionId]
    );
    if (result.rows.length === 0) return null;
    return rowToSession(result.rows[0] as SessionRow);
  }

  async save(session: IDESession): Promise<void> {
    await this.pool.query(
      `INSERT INTO ${TABLE} (session_id, user_id, project_id, status, container_id, workspace_id, started_at, last_active_at, terminated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (session_id) DO UPDATE SET
         user_id = $2, project_id = $3, status = $4, container_id = $5, workspace_id = $6,
         started_at = $7, last_active_at = $8, terminated_at = $9`,
      [
        session.sessionId,
        session.userId,
        session.projectId,
        session.status,
        session.containerId,
        session.workspaceId,
        session.startedAt,
        session.lastActiveAt,
        session.terminatedAt,
      ]
    );
  }
}
