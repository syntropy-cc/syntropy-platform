/**
 * ContractTemplate entity — pre-audited governance blueprint for institution creation (COMP-020.1).
 * Architecture: Hub Institution Orchestration, institution-orchestration.md
 */

export const ContractTemplateType = {
  OpenSourceProject: "open_source_project",
  ResearchLaboratory: "research_laboratory",
  EducationalInstitution: "educational_institution",
} as const;

export type ContractTemplateTypeValue =
  (typeof ContractTemplateType)[keyof typeof ContractTemplateType];

export interface ContractTemplateParams {
  templateId: string;
  name: string;
  dsl: string;
  type: ContractTemplateTypeValue;
}

/**
 * Pre-audited governance configuration shortcut. Only audited templates
 * may be used for production institution creation (COMP-020.1).
 */
export class ContractTemplate {
  readonly templateId: string;
  readonly name: string;
  readonly dsl: string;
  readonly type: ContractTemplateTypeValue;

  private constructor(params: ContractTemplateParams) {
    this.templateId = params.templateId;
    this.name = params.name;
    this.dsl = params.dsl;
    this.type = params.type;
  }

  static create(params: ContractTemplateParams): ContractTemplate {
    if (!params.templateId?.trim()) {
      throw new Error("ContractTemplate.templateId cannot be empty");
    }
    if (!params.name?.trim()) {
      throw new Error("ContractTemplate.name cannot be empty");
    }
    if (!params.dsl?.trim()) {
      throw new Error("ContractTemplate.dsl cannot be empty");
    }
    const validTypes = Object.values(ContractTemplateType);
    if (!validTypes.includes(params.type as ContractTemplateTypeValue)) {
      throw new Error(
        `ContractTemplate.type must be one of ${validTypes.join(", ")}, got "${params.type}"`
      );
    }
    return new ContractTemplate({
      templateId: params.templateId.trim(),
      name: params.name.trim(),
      dsl: params.dsl.trim(),
      type: params.type as ContractTemplateTypeValue,
    });
  }

  static fromPersistence(params: ContractTemplateParams): ContractTemplate {
    return new ContractTemplate(params);
  }
}
