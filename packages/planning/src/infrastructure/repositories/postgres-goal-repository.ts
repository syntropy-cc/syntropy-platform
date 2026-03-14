/**
 * PostgreSQL implementation of GoalRepository (COMP-029.5).
 */

import type { Pool } from "pg";
import { Goal } from "../../domain/goal.js";
import type { GoalRepository } from "../../domain/ports/goal-repository.js";

const TABLE = "planning.goals";

const GOAL_STATUSES = ["active", "achieved", "abandoned"] as const;
function isGoalStatus(s: string): s is (typeof GOAL_STATUSES)[number] {
  return GOAL_STATUSES.includes(s as (typeof GOAL_STATUSES)[number]);
}

function rowToGoal(row: {
  goal_id: string;
  user_id: string;
  description: string;
  due_date: Date | string;
  target_value: string;
  current_value: string;
  status: string;
}): Goal {
  if (!isGoalStatus(row.status)) {
    throw new Error(`Invalid goal status in DB: ${row.status}`);
  }
  return Goal.fromPersistence({
    goalId: row.goal_id,
    userId: row.user_id,
    description: row.description,
    dueDate: new Date(row.due_date),
    targetValue: Number(row.target_value),
    currentValue: Number(row.current_value),
    status: row.status as "active" | "achieved" | "abandoned",
  });
}

export class PostgresGoalRepository implements GoalRepository {
  constructor(private readonly pool: Pool) {}

  async save(goal: Goal): Promise<void> {
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO planning.goals (goal_id, user_id, description, due_date, target_value, current_value, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (goal_id) DO UPDATE SET
         user_id = $2, description = $3, due_date = $4, target_value = $5, current_value = $6, status = $7, updated_at = $8`,
      [
        goal.goalId,
        goal.userId,
        goal.description,
        goal.dueDate.toISOString(),
        goal.targetValue,
        goal.currentValue,
        goal.status,
        now,
      ]
    );
  }

  async findById(goalId: string): Promise<Goal | null> {
    const result = await this.pool.query(
      `SELECT goal_id, user_id, description, due_date, target_value, current_value, status
       FROM ${TABLE} WHERE goal_id = $1`,
      [goalId]
    );
    if (result.rows.length === 0) return null;
    return rowToGoal(result.rows[0] as Parameters<typeof rowToGoal>[0]);
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const result = await this.pool.query(
      `SELECT goal_id, user_id, description, due_date, target_value, current_value, status
       FROM ${TABLE} WHERE user_id = $1 ORDER BY goal_id`,
      [userId]
    );
    return result.rows.map((row) =>
      rowToGoal(row as Parameters<typeof rowToGoal>[0])
    );
  }
}
