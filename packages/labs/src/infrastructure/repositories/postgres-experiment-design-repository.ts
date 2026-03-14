/**
 * PostgreSQL implementation of ExperimentDesignRepositoryPort (COMP-024.4).
 */

import type { ExperimentId } from "@syntropy/types";
import { createArticleId, createExperimentId } from "@syntropy/types";
import { createHypothesisId } from "../../domain/scientific-context/hypothesis-record.js";
import { ExperimentDesign } from "../../domain/experiment-design/experiment-design.js";
import type { ExperimentDesignRepositoryPort } from "../../domain/experiment-design/ports/experiment-design-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.experiment_designs";
const INSERT =
  `INSERT INTO ${TABLE} (id, article_id, researcher_id, title, methodology_id, hypothesis_record_id, protocol, variables, ethical_approval_status, status, pre_registered_at, created_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ` +
  `ON CONFLICT (id) DO UPDATE SET article_id = $2, researcher_id = $3, title = $4, methodology_id = $5, hypothesis_record_id = $6, protocol = $7, variables = $8, ethical_approval_status = $9, status = $10, pre_registered_at = $11, updated_at = $13`;
const SELECT_BY_ID = `SELECT id, article_id, researcher_id, title, methodology_id, hypothesis_record_id, protocol, variables, ethical_approval_status, status, pre_registered_at FROM ${TABLE} WHERE id = $1`;

interface ExperimentDesignRow {
  id: string;
  article_id: string;
  researcher_id: string;
  title: string;
  methodology_id: string;
  hypothesis_record_id: string | null;
  protocol: unknown;
  variables: unknown;
  ethical_approval_status: string;
  status: string;
  pre_registered_at: string | null;
}

function parseJson(value: unknown): Record<string, unknown> {
  if (value == null) return {};
  if (typeof value === "object" && !Array.isArray(value))
    return value as Record<string, unknown>;
  if (typeof value === "string") return JSON.parse(value) as Record<string, unknown>;
  return {};
}

function rowToDesign(row: ExperimentDesignRow): ExperimentDesign {
  return new ExperimentDesign({
    experimentId: createExperimentId(row.id),
    articleId: createArticleId(row.article_id),
    researcherId: row.researcher_id,
    title: row.title,
    methodologyId: row.methodology_id,
    hypothesisRecordId: row.hypothesis_record_id
      ? createHypothesisId(row.hypothesis_record_id)
      : null,
    protocol: parseJson(row.protocol),
    variables: parseJson(row.variables),
    ethicalApprovalStatus: row.ethical_approval_status ?? "",
    status: row.status as "designing" | "registered" | "running" | "completed",
    preRegisteredAt: row.pre_registered_at
      ? new Date(row.pre_registered_at)
      : null,
  });
}

export class PostgresExperimentDesignRepository
  implements ExperimentDesignRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(design: ExperimentDesign): Promise<void> {
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      design.experimentId as string,
      design.articleId as string,
      design.researcherId,
      design.title,
      design.methodologyId,
      design.hypothesisRecordId ? (design.hypothesisRecordId as string) : null,
      JSON.stringify(design.protocol),
      JSON.stringify(design.variables),
      design.ethicalApprovalStatus,
      design.status,
      design.preRegisteredAt?.toISOString() ?? null,
      now,
      now,
    ]);
  }

  async findById(id: ExperimentId): Promise<ExperimentDesign | null> {
    const rows = await this.client.query<ExperimentDesignRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToDesign(rows[0]!);
  }
}
