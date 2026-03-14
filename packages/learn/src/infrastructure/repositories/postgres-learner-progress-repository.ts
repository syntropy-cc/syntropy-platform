/**
 * PostgreSQL implementation of LearnerProgressRepositoryPort (COMP-016.5).
 * Architecture: fragment-artifact-engine.md, PAT-004.
 */

import type { Pool } from "pg";
import { LearnerProgressRecord } from "../../domain/fragment-artifact/learner-progress-record.js";
import type { LearnerProgressRepositoryPort } from "../../domain/fragment-artifact/ports/learner-progress-repository-port.js";
import type { ProgressEntityType } from "../../domain/fragment-artifact/learner-progress-record.js";

interface ProgressRow {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
  score: string | null;
}

function rowToRecord(row: ProgressRow): LearnerProgressRecord {
  return LearnerProgressRecord.create({
    userId: row.user_id,
    entityId: row.entity_id,
    entityType: row.entity_type as ProgressEntityType,
    status:
      row.status === "completed"
        ? "completed"
        : row.status === "in_progress"
          ? "in_progress"
          : "not_started",
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? null,
    score: row.score != null ? Number(row.score) : null,
  });
}

export class PostgresLearnerProgressRepository implements LearnerProgressRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async findByUserAndEntity(
    userId: string,
    entityId: string,
    entityType: ProgressEntityType
  ): Promise<LearnerProgressRecord | null> {
    const result = await this.pool.query<ProgressRow>(
      `SELECT id, user_id, entity_id, entity_type, status,
              started_at, completed_at, score
       FROM learn.learner_progress_records
       WHERE user_id = $1 AND entity_id = $2 AND entity_type = $3`,
      [userId, entityId, entityType]
    );
    if (result.rows.length === 0) return null;
    return rowToRecord(result.rows[0]);
  }

  async save(record: LearnerProgressRecord): Promise<void> {
    const startedAt = record.startedAt.getTime() > 0 ? record.startedAt : null;
    await this.pool.query(
      `INSERT INTO learn.learner_progress_records (
         user_id, entity_id, entity_type, status,
         started_at, completed_at, score, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (user_id, entity_id, entity_type) DO UPDATE SET
         status = EXCLUDED.status,
         started_at = COALESCE(learn.learner_progress_records.started_at, EXCLUDED.started_at),
         completed_at = COALESCE(EXCLUDED.completed_at, learn.learner_progress_records.completed_at),
         score = EXCLUDED.score,
         updated_at = now()`,
      [
        record.userId,
        record.entityId,
        record.entityType,
        record.status,
        startedAt,
        record.completedAt,
        record.score,
      ]
    );
  }
}
