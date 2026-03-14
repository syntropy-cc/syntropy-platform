/**
 * PostgreSQL implementation of StudyPlanRepository (COMP-029.5).
 */

import type { Pool } from "pg";
import type { SuggestedStep } from "../../domain/ports/learner-progress-port.js";
import { StudyPlan } from "../../domain/study-plan.js";
import type { StudyPlanRepository } from "../../domain/ports/study-plan-repository.js";

const TABLE = "planning.study_plans";

function parseSuggestedPath(raw: unknown): SuggestedStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const step =
      item && typeof item === "object" && "stepId" in item
        ? (item as { stepId: string; label?: string; order?: number })
        : { stepId: String(item), order: index };
    return {
      stepId: String(step.stepId),
      label: step.label,
      order: typeof step.order === "number" ? step.order : index,
    };
  });
}

function rowToStudyPlan(row: {
  id: string;
  user_id: string;
  career_id: string;
  suggested_path: unknown;
}): StudyPlan {
  return StudyPlan.fromPersistence({
    id: row.id,
    userId: row.user_id,
    careerId: row.career_id,
    suggestedPath: parseSuggestedPath(row.suggested_path),
  });
}

export class PostgresStudyPlanRepository implements StudyPlanRepository {
  constructor(private readonly pool: Pool) {}

  async save(plan: StudyPlan): Promise<void> {
    const now = new Date().toISOString();
    const suggestedPath = JSON.stringify(
      plan.suggestedPath.map((s) => ({ stepId: s.stepId, label: s.label, order: s.order }))
    );
    await this.pool.query(
      `INSERT INTO ${TABLE} (id, user_id, career_id, suggested_path, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       ON CONFLICT (id) DO UPDATE SET
         user_id = $2, career_id = $3, suggested_path = $4::jsonb, updated_at = $5`,
      [plan.id, plan.userId, plan.careerId, suggestedPath, now]
    );
  }

  async findById(id: string): Promise<StudyPlan | null> {
    const result = await this.pool.query(
      `SELECT id, user_id, career_id, suggested_path FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToStudyPlan(result.rows[0] as Parameters<typeof rowToStudyPlan>[0]);
  }

  async findByUserId(userId: string): Promise<StudyPlan[]> {
    const result = await this.pool.query(
      `SELECT id, user_id, career_id, suggested_path FROM ${TABLE} WHERE user_id = $1 ORDER BY id`,
      [userId]
    );
    return result.rows.map((row) =>
      rowToStudyPlan(row as Parameters<typeof rowToStudyPlan>[0])
    );
  }
}
