/**
 * PostgreSQL implementation of creator workflow loader and save (COMP-017.4).
 * Architecture: creator-tools-copilot.md, PAT-004.
 */

import type { CreatorWorkflowId, TrackId } from "@syntropy/types";
import type { Pool } from "pg";

import { CreatorWorkflow } from "../../domain/creator-tools/creator-workflow.js";
import type { CreatorWorkflowPhase } from "../../domain/creator-tools/creator-workflow-phase.js";
import type {
  CreatorWorkflowLoaderPort,
  CreatorWorkflowSavePort,
} from "../../application/ports/approval-ports.js";

interface CreatorWorkflowRow {
  id: string;
  track_id: string;
  creator_id: string;
  current_phase: string;
  phases_completed: string[];
  started_at: Date;
  completed_at: Date | null;
}

function rowToWorkflow(row: CreatorWorkflowRow): CreatorWorkflow {
  const phasesCompleted = (row.phases_completed ?? []) as CreatorWorkflowPhase[];
  return CreatorWorkflow.fromStorage({
    id: row.id as CreatorWorkflowId,
    trackId: row.track_id as TrackId,
    creatorId: row.creator_id,
    currentPhase: row.current_phase as CreatorWorkflowPhase,
    phasesCompleted,
    startedAt: new Date(row.started_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  });
}

export class PostgresCreatorWorkflowRepository
  implements CreatorWorkflowLoaderPort, CreatorWorkflowSavePort
{
  constructor(private readonly pool: Pool) {}

  async findById(workflowId: CreatorWorkflowId): Promise<CreatorWorkflow | null> {
    const result = await this.pool.query<CreatorWorkflowRow>(
      `SELECT id, track_id, creator_id, current_phase, phases_completed,
              started_at, completed_at
       FROM learn.creator_workflows WHERE id = $1`,
      [workflowId]
    );
    if (result.rows.length === 0) return null;
    return rowToWorkflow(result.rows[0]);
  }

  async save(workflow: CreatorWorkflow): Promise<void> {
    const phasesCompleted = JSON.stringify([...workflow.phasesCompleted]);
    await this.pool.query(
      `INSERT INTO learn.creator_workflows (
         id, track_id, creator_id, current_phase, phases_completed,
         started_at, completed_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, now())
       ON CONFLICT (id) DO UPDATE SET
         current_phase = EXCLUDED.current_phase,
         phases_completed = EXCLUDED.phases_completed,
         completed_at = EXCLUDED.completed_at,
         updated_at = now()`,
      [
        workflow.id,
        workflow.trackId,
        workflow.creatorId,
        workflow.currentPhase,
        phasesCompleted,
        workflow.startedAt,
        workflow.completedAt,
      ]
    );
  }
}
