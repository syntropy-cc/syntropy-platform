/**
 * PostgreSQL implementation of SprintRepository (COMP-029.5).
 */

import type { Pool } from "pg";
import { Sprint } from "../../domain/sprint.js";
import type { SprintRepository } from "../../domain/ports/sprint-repository.js";

const TABLE = "planning.sprints";

function rowToSprint(row: {
  id: string;
  start_date: Date | string;
  end_date: Date | string;
  task_ids: unknown;
}): Sprint {
  const taskIds = Array.isArray(row.task_ids) ? row.task_ids : [];
  return Sprint.fromPersistence({
    id: row.id,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    taskIds,
  });
}

export class PostgresSprintRepository implements SprintRepository {
  constructor(private readonly pool: Pool) {}

  async save(sprint: Sprint): Promise<void> {
    const now = new Date().toISOString();
    const taskIds = JSON.stringify([...sprint.taskIds]);
    await this.pool.query(
      `INSERT INTO ${TABLE} (id, start_date, end_date, task_ids, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       ON CONFLICT (id) DO UPDATE SET
         start_date = $2, end_date = $3, task_ids = $4::jsonb, updated_at = $5`,
      [
        sprint.id,
        sprint.startDate.toISOString(),
        sprint.endDate.toISOString(),
        taskIds,
        now,
      ]
    );
  }

  async findById(id: string): Promise<Sprint | null> {
    const result = await this.pool.query(
      `SELECT id, start_date, end_date, task_ids FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToSprint(
      result.rows[0] as Parameters<typeof rowToSprint>[0]
    );
  }
}
