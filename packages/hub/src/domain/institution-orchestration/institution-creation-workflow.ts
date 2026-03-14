/**
 * InstitutionCreationWorkflow aggregate — guides institution setup through phases (COMP-020.2).
 * Architecture: Hub Institution Orchestration, institution-orchestration.md
 */

export const InstitutionCreationPhase = {
  TemplateSelected: "template_selected",
  FoundersConfirmed: "founders_confirmed",
  ContractDeployed: "contract_deployed",
  InstitutionCreated: "institution_created",
} as const;

export type InstitutionCreationPhaseValue =
  (typeof InstitutionCreationPhase)[keyof typeof InstitutionCreationPhase];

const PHASE_ORDER: InstitutionCreationPhaseValue[] = [
  InstitutionCreationPhase.TemplateSelected,
  InstitutionCreationPhase.FoundersConfirmed,
  InstitutionCreationPhase.ContractDeployed,
  InstitutionCreationPhase.InstitutionCreated,
];

export interface InstitutionCreationWorkflowParams {
  id: string;
  templateId: string;
  currentPhase: InstitutionCreationPhaseValue;
  configuredParameters?: Record<string, unknown>;
  dipInstitutionId?: string | null;
}

export class InvalidWorkflowTransitionError extends Error {
  constructor(
    public readonly workflowId: string,
    from: string,
    to: string,
    reason: string
  ) {
    super(
      `InstitutionCreationWorkflow ${workflowId}: cannot transition from ${from} to ${to}: ${reason}`
    );
    this.name = "InvalidWorkflowTransitionError";
    Object.setPrototypeOf(this, InvalidWorkflowTransitionError.prototype);
  }
}

/**
 * Aggregate that guides the multi-step institution creation process.
 * proceed() advances through phases with validation.
 */
export class InstitutionCreationWorkflow {
  readonly id: string;
  readonly templateId: string;
  readonly currentPhase: InstitutionCreationPhaseValue;
  readonly configuredParameters: Record<string, unknown>;
  readonly dipInstitutionId: string | null;

  private constructor(params: InstitutionCreationWorkflowParams) {
    this.id = params.id;
    this.templateId = params.templateId;
    this.currentPhase = params.currentPhase;
    this.configuredParameters = { ...(params.configuredParameters ?? {}) };
    this.dipInstitutionId = params.dipInstitutionId ?? null;
  }

  /**
   * Creates a new workflow in template_selected phase.
   */
  static start(params: { id: string; templateId: string }): InstitutionCreationWorkflow {
    if (!params.id?.trim()) {
      throw new Error("InstitutionCreationWorkflow.id cannot be empty");
    }
    if (!params.templateId?.trim()) {
      throw new Error("InstitutionCreationWorkflow.templateId cannot be empty");
    }
    return new InstitutionCreationWorkflow({
      id: params.id.trim(),
      templateId: params.templateId.trim(),
      currentPhase: InstitutionCreationPhase.TemplateSelected,
    });
  }

  static fromPersistence(params: InstitutionCreationWorkflowParams): InstitutionCreationWorkflow {
    return new InstitutionCreationWorkflow(params);
  }

  /**
   * Advances to the next phase. Returns the updated workflow.
   * template_selected -> founders_confirmed -> contract_deployed -> institution_created.
   * Optional context can carry phase-specific data (e.g. founderIds for founders_confirmed).
   */
  proceed(context?: {
    founderIds?: string[];
    contractDeployed?: boolean;
    dipInstitutionId?: string;
  }): InstitutionCreationWorkflow {
    const currentIndex = PHASE_ORDER.indexOf(this.currentPhase);
    if (currentIndex < 0) {
      throw new InvalidWorkflowTransitionError(
        this.id,
        this.currentPhase,
        "?",
        "unknown phase"
      );
    }
    if (currentIndex >= PHASE_ORDER.length - 1) {
      throw new InvalidWorkflowTransitionError(
        this.id,
        this.currentPhase,
        "next",
        "already in final phase"
      );
    }

    const nextPhase = PHASE_ORDER[currentIndex + 1]!;

    if (nextPhase === InstitutionCreationPhase.FoundersConfirmed) {
      if (context?.founderIds != null && context.founderIds.length === 0) {
        throw new InvalidWorkflowTransitionError(
          this.id,
          this.currentPhase,
          nextPhase,
          "at least one founder required"
        );
      }
    }

    if (nextPhase === InstitutionCreationPhase.ContractDeployed) {
      if (context?.contractDeployed !== true) {
        throw new InvalidWorkflowTransitionError(
          this.id,
          this.currentPhase,
          nextPhase,
          "contract must be deployed"
        );
      }
    }

    if (nextPhase === InstitutionCreationPhase.InstitutionCreated) {
      if (!context?.dipInstitutionId?.trim()) {
        throw new InvalidWorkflowTransitionError(
          this.id,
          this.currentPhase,
          nextPhase,
          "dipInstitutionId is required"
        );
      }
      return new InstitutionCreationWorkflow({
        id: this.id,
        templateId: this.templateId,
        currentPhase: nextPhase,
        configuredParameters: this.configuredParameters,
        dipInstitutionId: context.dipInstitutionId.trim(),
      });
    }

    return new InstitutionCreationWorkflow({
      id: this.id,
      templateId: this.templateId,
      currentPhase: nextPhase,
      configuredParameters: this.configuredParameters,
      dipInstitutionId: this.dipInstitutionId,
    });
  }

  isComplete(): boolean {
    return this.currentPhase === InstitutionCreationPhase.InstitutionCreated;
  }
}
