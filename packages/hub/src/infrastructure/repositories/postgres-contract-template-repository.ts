/**
 * PostgreSQL implementation of ContractTemplateRepositoryPort (COMP-020.5).
 */

import {
  ContractTemplate,
  type ContractTemplateTypeValue,
} from "../../domain/institution-orchestration/contract-template.js";
import type { ContractTemplateRepositoryPort } from "../../domain/institution-orchestration/ports/contract-template-repository-port.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.contract_templates";

const SELECT_BY_ID = `
  SELECT id, name, dsl, type FROM ${TABLE} WHERE id = $1
`;

const SELECT_ALL = `
  SELECT id, name, dsl, type FROM ${TABLE} ORDER BY id
`;

interface TemplateRow {
  id: string;
  name: string;
  dsl: string;
  type: string;
}

function rowToTemplate(row: TemplateRow): ContractTemplate {
  return ContractTemplate.fromPersistence({
    templateId: row.id,
    name: row.name,
    dsl: row.dsl,
    type: row.type as ContractTemplateTypeValue,
  });
}

export class PostgresContractTemplateRepository implements ContractTemplateRepositoryPort {
  constructor(private readonly client: HubCollaborationDbClient) {}

  async getById(templateId: string): Promise<ContractTemplate | null> {
    const rows = await this.client.query<TemplateRow>(SELECT_BY_ID, [templateId.trim()]);
    if (rows.length === 0) return null;
    return rowToTemplate(rows[0]!);
  }

  async list(): Promise<ContractTemplate[]> {
    const rows = await this.client.query<TemplateRow>(SELECT_ALL, []);
    return rows.map(rowToTemplate);
  }
}
