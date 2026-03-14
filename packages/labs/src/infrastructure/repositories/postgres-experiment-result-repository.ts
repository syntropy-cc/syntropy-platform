/**
 * PostgreSQL implementation of ExperimentResultRepositoryPort (COMP-024.4).
 */

import type { ExperimentId, ExperimentResultId } from "@syntropy/types";
import {
  createExperimentId,
  createExperimentResultId,
} from "@syntropy/types";
import { ExperimentResult } from "../../domain/experiment-design/experiment-result.js";
import type { ExperimentResultRepositoryPort } from "../../domain/experiment-design/ports/experiment-result-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.experiment_results";
const INSERT =
  `INSERT INTO ${TABLE} (id, experiment_id, raw_data_location, statistical_summary, p_value, collected_at, created_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ` +
  `ON CONFLICT (id) DO UPDATE SET experiment_id = $2, raw_data_location = $3, statistical_summary = $4, p_value = $5, collected_at = $6, updated_at = $8`;
const SELECT_BY_ID = `SELECT id, experiment_id, raw_data_location, statistical_summary, p_value, collected_at FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_EXPERIMENT_ID = `SELECT id, experiment_id, raw_data_location, statistical_summary, p_value, collected_at FROM ${TABLE} WHERE experiment_id = $1 ORDER BY collected_at ASC`;

interface ExperimentResultRow {
  id: string;
  experiment_id: string;
  raw_data_location: string;
  statistical_summary: unknown;
  p_value: number | null;
  collected_at: string;
}

function parseSummary(value: unknown): Record<string, unknown> {
  if (value == null) return {};
  if (typeof value === "object" && !Array.isArray(value))
    return value as Record<string, unknown>;
  if (typeof value === "string")
    return JSON.parse(value) as Record<string, unknown>;
  return {};
}

function rowToResult(row: ExperimentResultRow): ExperimentResult {
  return new ExperimentResult({
    id: createExperimentResultId(row.id),
    experimentId: createExperimentId(row.experiment_id),
    rawDataLocation: row.raw_data_location,
    statisticalSummary: parseSummary(row.statistical_summary),
    pValue: row.p_value,
    collectedAt: new Date(row.collected_at),
  });
}

export class PostgresExperimentResultRepository
  implements ExperimentResultRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(result: ExperimentResult): Promise<void> {
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      result.id as string,
      result.experimentId as string,
      result.rawDataLocation,
      JSON.stringify(result.statisticalSummary),
      result.pValue,
      result.collectedAt.toISOString(),
      now,
      now,
    ]);
  }

  async findById(id: ExperimentResultId): Promise<ExperimentResult | null> {
    const rows = await this.client.query<ExperimentResultRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToResult(rows[0]!);
  }

  async findByExperimentId(
    experimentId: ExperimentId
  ): Promise<ExperimentResult[]> {
    const rows = await this.client.query<ExperimentResultRow>(
      SELECT_BY_EXPERIMENT_ID,
      [experimentId as string]
    );
    return rows.map(rowToResult);
  }
}
