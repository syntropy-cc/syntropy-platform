/**
 * PostgreSQL implementation of HypothesisRecordRepositoryPort (COMP-022.4).
 */

import { createExperimentId } from "@syntropy/types";
import {
  HypothesisRecord,
  createHypothesisId,
  type HypothesisStatus,
} from "../../domain/scientific-context/hypothesis-record.js";
import type { HypothesisRecordRepositoryPort } from "../../domain/scientific-context/ports/hypothesis-record-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.hypothesis_records";

const INSERT = `INSERT INTO ${TABLE} (id, project_id, statement, status, experiment_id, created_by, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
const SELECT_BY_ID = `SELECT id, project_id, statement, status, experiment_id, created_by, created_at, updated_at FROM ${TABLE} WHERE id = $1`;

interface HypothesisRow {
  id: string;
  project_id: string;
  statement: string;
  status: string;
  experiment_id: string | null;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function rowToRecord(row: HypothesisRow): HypothesisRecord {
  return new HypothesisRecord({
    hypothesisId: createHypothesisId(row.id),
    projectId: row.project_id,
    statement: row.statement,
    status: row.status as HypothesisStatus,
    experimentId: row.experiment_id ? createExperimentId(row.experiment_id) : null,
    createdBy: row.created_by,
    createdAt:
      typeof row.created_at === "string" ? new Date(row.created_at) : row.created_at,
    updatedAt:
      typeof row.updated_at === "string" ? new Date(row.updated_at) : row.updated_at,
  });
}

export class PostgresHypothesisRecordRepository
  implements HypothesisRecordRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(record: HypothesisRecord): Promise<void> {
    await this.client.execute(INSERT, [
      record.hypothesisId as string,
      record.projectId,
      record.statement,
      record.status,
      record.experimentId ?? null,
      record.createdBy,
      record.createdAt,
      record.updatedAt,
    ]);
  }

  async findById(
    id: import("../../domain/scientific-context/hypothesis-record.js").HypothesisId
  ): Promise<HypothesisRecord | null> {
    const rows = await this.client.query<HypothesisRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToRecord(rows[0]!);
  }
}
