/**
 * PostgreSQL implementation of TaskRepository (COMP-029.5).
 */

import type { Pool } from "pg";
import { Task } from "../../domain/task.js";
import { isTaskStatus } from "../../domain/task-status.js";
import type { TaskRepository } from "../../domain/ports/task-repository.js";

const TABLE = "planning.tasks";

function rowToTask(row: {
  task_id: string;
  user_id: string;
  title: string;
  status: string;
}): Task {
  if (!isTaskStatus(row.status)) {
    throw new Error(`Invalid task status in DB: ${row.status}`);
  }
  return Task.fromPersistence({
    taskId: row.task_id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
  });
}

export class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly pool: Pool) {}

  async save(task: Task): Promise<void> {
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO ${TABLE} (task_id, user_id, title, status, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (task_id) DO UPDATE SET
         user_id = $2, title = $3, status = $4, updated_at = $5`,
      [task.taskId, task.userId, task.title, task.status, now]
    );
  }

  async findById(taskId: string): Promise<Task | null> {
    const result = await this.pool.query(
      `SELECT task_id, user_id, title, status FROM ${TABLE} WHERE task_id = $1`,
      [taskId]
    );
    if (result.rows.length === 0) return null;
    return rowToTask(result.rows[0] as Parameters<typeof rowToTask>[0]);
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const result = await this.pool.query(
      `SELECT task_id, user_id, title, status FROM ${TABLE} WHERE user_id = $1 ORDER BY task_id`,
      [userId]
    );
    return result.rows.map((row) =>
      rowToTask(row as Parameters<typeof rowToTask>[0])
    );
  }
}
