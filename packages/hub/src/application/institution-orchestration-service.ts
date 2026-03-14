/**
 * InstitutionOrchestrationService — completes workflow: template → governance contract → DIP institution (COMP-020.4).
 * Architecture: Hub Institution Orchestration, saga pattern on failure.
 */

import { InstitutionCreationPhase } from "../domain/institution-orchestration/institution-creation-workflow.js";
import type { InstitutionCreationWorkflow } from "../domain/institution-orchestration/institution-creation-workflow.js";
import type { ContractTemplateRepositoryPort } from "../domain/institution-orchestration/ports/contract-template-repository-port.js";
import type { DIPInstitutionAdapterPort } from "../domain/institution-orchestration/ports/dip-institution-adapter-port.js";
import type { InstitutionEventPublisherPort } from "../domain/institution-orchestration/ports/institution-event-publisher-port.js";
import type { InstitutionWorkflowRepositoryPort } from "../domain/institution-orchestration/ports/institution-workflow-repository-port.js";

/**
 * Thrown when the workflow is not in a phase that allows completing institution creation.
 */
export class InstitutionOrchestrationInvalidPhaseError extends Error {
  constructor(
    public readonly workflowId: string,
    public readonly currentPhase: string,
    reason: string
  ) {
    super(
      `InstitutionOrchestrationService: workflow ${workflowId} in phase ${currentPhase} cannot complete: ${reason}`
    );
    this.name = "InstitutionOrchestrationInvalidPhaseError";
    Object.setPrototypeOf(this, InstitutionOrchestrationInvalidPhaseError.prototype);
  }
}

/**
 * Thrown when the template for the workflow is not found.
 */
export class InstitutionOrchestrationTemplateNotFoundError extends Error {
  constructor(
    public readonly workflowId: string,
    public readonly templateId: string
  ) {
    super(
      `InstitutionOrchestrationService: template ${templateId} not found for workflow ${workflowId}`
    );
    this.name = "InstitutionOrchestrationTemplateNotFoundError";
    Object.setPrototypeOf(this, InstitutionOrchestrationTemplateNotFoundError.prototype);
  }
}

export interface CreateInstitutionResult {
  workflow: InstitutionCreationWorkflow;
  institutionId: string;
}

/**
 * Orchestrates the steps to create a DIP institution from a Hub workflow.
 * Loads template, calls DIP adapter, advances workflow to institution_created, persists, and optionally publishes event.
 * Saga: no workflow update is persisted until DIP succeeds; on DIP failure the workflow is not modified.
 */
export class InstitutionOrchestrationService {
  constructor(
    private readonly templateRepo: ContractTemplateRepositoryPort,
    private readonly workflowRepo: InstitutionWorkflowRepositoryPort,
    private readonly dipAdapter: DIPInstitutionAdapterPort,
    private readonly eventPublisher?: InstitutionEventPublisherPort
  ) {}

  /**
   * Completes the institution creation: deplies governance contract via DIP and marks workflow complete.
   * Workflow must be in founders_confirmed phase. On success, workflow is advanced to institution_created and saved.
   *
   * @param workflow - The workflow in founders_confirmed phase
   * @returns The completed workflow and the DIP institution id
   */
  async createInstitution(workflow: InstitutionCreationWorkflow): Promise<CreateInstitutionResult> {
    if (workflow.currentPhase !== InstitutionCreationPhase.FoundersConfirmed) {
      throw new InstitutionOrchestrationInvalidPhaseError(
        workflow.id,
        workflow.currentPhase,
        "expected founders_confirmed"
      );
    }

    const template = await this.templateRepo.getById(workflow.templateId);
    if (!template) {
      throw new InstitutionOrchestrationTemplateNotFoundError(workflow.id, workflow.templateId);
    }

    const { institutionId } = await this.dipAdapter.createInstitution({
      name: template.name,
      type: template.type,
      governanceContract: template.dsl,
    });

    const afterContractDeployed = workflow.proceed({ contractDeployed: true });
    const completed = afterContractDeployed.proceed({ dipInstitutionId: institutionId });

    await this.workflowRepo.save(completed);

    if (this.eventPublisher) {
      await this.eventPublisher.publishInstitutionCreated({
        institutionId,
        workflowId: workflow.id,
        name: template.name,
        type: template.type,
      });
    }

    return { workflow: completed, institutionId };
  }
}
