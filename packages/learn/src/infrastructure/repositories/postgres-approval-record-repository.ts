/**
 * PostgreSQL implementation of ApprovalRecordRepositoryPort (COMP-017.4).
 * Architecture: creator-tools-copilot.md, PAT-004.
 */

import type { Pool } from "pg";

import { ApprovalRecord } from "../../domain/creator-tools/approval-record.js";
import type { ApprovalRecordRepositoryPort } from "../../application/ports/approval-ports.js";

export class PostgresApprovalRecordRepository implements ApprovalRecordRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async save(record: ApprovalRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO learn.approval_records (
         id, workflow_id, phase, reviewer_id, decision, notes, decided_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         notes = EXCLUDED.notes`,
      [
        record.id,
        record.workflowId,
        record.phase,
        record.reviewerId,
        record.decision,
        record.notes,
        record.decidedAt,
      ]
    );
  }
}
