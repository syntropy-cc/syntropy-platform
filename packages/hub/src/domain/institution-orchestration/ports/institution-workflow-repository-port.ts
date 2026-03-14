/**
 * InstitutionWorkflowRepositoryPort — persist InstitutionCreationWorkflow (COMP-020.4).
 * Architecture: Hub Institution Orchestration, PAT-004
 */

import type { InstitutionCreationWorkflow } from "../institution-creation-workflow.js";

export interface InstitutionWorkflowRepositoryPort {
  save(workflow: InstitutionCreationWorkflow): Promise<void>;
  findById(workflowId: string): Promise<InstitutionCreationWorkflow | null>;
}
