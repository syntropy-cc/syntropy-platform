/**
 * In-memory implementation of ContractTemplateRepositoryPort with pre-defined templates (COMP-020.1).
 * Architecture: Hub Institution Orchestration
 */

import { ContractTemplate, ContractTemplateType } from "../../domain/institution-orchestration/contract-template.js";
import type { ContractTemplateRepositoryPort } from "../../domain/institution-orchestration/ports/contract-template-repository-port.js";

const OPEN_SOURCE_DSL = `
governance {
  chamber "main" { min_members: 1 }
  proposal_threshold: 0.5
}
`;

const RESEARCH_DSL = `
governance {
  chamber "principal_investigators" { min_members: 1 }
  chamber "lab_members" { min_members: 0 }
  proposal_threshold: 0.6
}
`;

const EDUCATIONAL_DSL = `
governance {
  chamber "instructors" { min_members: 1 }
  chamber "students" { min_members: 0 }
  proposal_threshold: 0.5
}
`;

const PREDEFINED_TEMPLATES: ContractTemplate[] = [
  ContractTemplate.create({
    templateId: "template-open-source-v1",
    name: "Open Source Project",
    dsl: OPEN_SOURCE_DSL.trim(),
    type: ContractTemplateType.OpenSourceProject,
  }),
  ContractTemplate.create({
    templateId: "template-research-lab-v1",
    name: "Research Laboratory",
    dsl: RESEARCH_DSL.trim(),
    type: ContractTemplateType.ResearchLaboratory,
  }),
  ContractTemplate.create({
    templateId: "template-educational-v1",
    name: "Educational Institution",
    dsl: EDUCATIONAL_DSL.trim(),
    type: ContractTemplateType.EducationalInstitution,
  }),
];

export class InMemoryContractTemplateRepository
  implements ContractTemplateRepositoryPort
{
  private readonly templates: Map<string, ContractTemplate>;

  constructor(initialTemplates?: ContractTemplate[]) {
    this.templates = new Map();
    const toLoad = initialTemplates ?? PREDEFINED_TEMPLATES;
    for (const t of toLoad) {
      this.templates.set(t.templateId, t);
    }
  }

  async getById(templateId: string): Promise<ContractTemplate | null> {
    return this.templates.get(templateId.trim()) ?? null;
  }

  async list(): Promise<ContractTemplate[]> {
    return [...this.templates.values()];
  }
}
