/**
 * ContractTemplateRepositoryPort — load and list contract templates (COMP-020.1).
 * Architecture: Hub Institution Orchestration
 */

import type { ContractTemplate } from "../contract-template.js";

export interface ContractTemplateRepositoryPort {
  getById(templateId: string): Promise<ContractTemplate | null>;
  list(): Promise<ContractTemplate[]>;
}
