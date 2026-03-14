/**
 * PostgreSQL implementation of WorkspaceSnapshotRepository (COMP-030.7).
 */

import type { Pool } from "pg";
import { WorkspaceSnapshot } from "../../domain/workspace-snapshot.js";
import type { WorkspaceSnapshotRepository } from "../../domain/ports/workspace-snapshot-repository.js";

const TABLE = "ide.workspace_snapshots";

type SnapshotRow = {
  id: string;
  snapshot_id: string;
  session_id: string;
  version: number;
  files: unknown;
  created_at: Date;
};

function rowToSnapshot(row: SnapshotRow): WorkspaceSnapshot {
  const files = Array.isArray(row.files)
    ? (row.files as { path: string; content: string }[])
    : [];
  return WorkspaceSnapshot.fromPersistence({
    snapshotId: row.snapshot_id,
    sessionId: row.session_id,
    version: Number(row.version),
    files,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  });
}

export class PostgresWorkspaceSnapshotRepository
  implements WorkspaceSnapshotRepository
{
  constructor(private readonly pool: Pool) {}

  async save(snapshot: WorkspaceSnapshot): Promise<void> {
    const filesJson = JSON.stringify(snapshot.getFiles());
    await this.pool.query(
      `INSERT INTO ${TABLE} (snapshot_id, session_id, version, files)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (snapshot_id) DO UPDATE SET session_id = $2, version = $3, files = $4::jsonb, created_at = now()`,
      [
        snapshot.snapshotId,
        snapshot.sessionId,
        snapshot.version,
        filesJson,
      ]
    );
  }

  async getLatestBySessionId(sessionId: string): Promise<WorkspaceSnapshot | null> {
    const result = await this.pool.query(
      `SELECT id, snapshot_id, session_id, version, files, created_at
       FROM ${TABLE} WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );
    if (result.rows.length === 0) return null;
    return rowToSnapshot(result.rows[0] as SnapshotRow);
  }
}
