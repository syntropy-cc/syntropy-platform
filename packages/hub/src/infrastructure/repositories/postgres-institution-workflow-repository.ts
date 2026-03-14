/**
 * PostgreSQL implementation of InstitutionWorkflowRepositoryPort (COMP-020.5).
 */

import {
  InstitutionCreationWorkflow,
  type InstitutionCreationPhaseValue,
} from "../../domain/institution-orchestration/institution-creation-workflow.js";
import type { InstitutionWorkflowRepositoryPort } from "../../domain/institution-orchestration/ports/institution-workflow-repository-port.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.institution_creation_workflows";

const SELECT_BY_ID = `
  SELECT id, template_id, current_phase, configured_parameters, dip_institution_id
  FROM ${TABLE}
  WHERE id = $1
`;

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, template_id, current_phase, configured_parameters, dip_institution_id, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    template_id = EXCLUDED.template_id,
    current_phase = EXCLUDED.current_phase,
    configured_parameters = EXCLUDED.configured_parameters,
    dip_institution_id = EXCLUDED.dip_institution_id,
    updated_at = now()
`;

interface WorkflowRow {
  id: string;
  template_id: string;
  current_phase: string;
  configured_parameters: Record<string, unknown>;
  dip_institution_id: string | null;
}

function rowToWorkflow(row: WorkflowRow): InstitutionCreationWorkflow {
  return InstitutionCreationWorkflow.fromPersistence({
    id: row.id,
    templateId: row.template_id,
    currentPhase: row.current_phase as InstitutionCreationPhaseValue,
    configuredParameters:
      typeof row.configured_parameters === "object" && row.configured_parameters !== null
        ? row.configured_parameters
        : {},
    dipInstitutionId: row.dip_institution_id ?? null,
  });
}

export class PostgresInstitutionWorkflowRepository implements InstitutionWorkflowRepositoryPort {
  constructor(private readonly client: HubCollaborationDbClient) {}

  async findById(workflowId: string): Promise<InstitutionCreationWorkflow | null> {
    const rows = await this.client.query<WorkflowRow>(SELECT_BY_ID, [workflowId]);
    if (rows.length === 0) return null;
    return rowToWorkflow(rows[0]!);
  }

  async save(workflow: InstitutionCreationWorkflow): Promise<void> {
    await this.client.execute(UPSERT_SQL, [
      workflow.id,
      workflow.templateId,
      workflow.currentPhase,
      JSON.stringify(workflow.configuredParameters),
      workflow.dipInstitutionId ?? null,
    ]);
  }
}
