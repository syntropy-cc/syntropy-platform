/**
 * PostgreSQL implementation of ResearchMethodologyRepositoryPort (COMP-022.4).
 */

import {
  ResearchMethodology,
  createResearchMethodologyId,
  type MethodologyType,
} from "../../domain/scientific-context/research-methodology.js";
import type { ResearchMethodologyRepositoryPort } from "../../domain/scientific-context/ports/research-methodology-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.research_methodologies";

const SELECT_ALL = `SELECT id, name, type, description FROM ${TABLE} ORDER BY name`;
const SELECT_BY_ID = `SELECT id, name, type, description FROM ${TABLE} WHERE id = $1`;
const INSERT = `INSERT INTO ${TABLE} (id, name, type, description) VALUES ($1, $2, $3, $4)`;

interface MethodologyRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

function rowToMethodology(row: MethodologyRow): ResearchMethodology {
  return new ResearchMethodology({
    id: createResearchMethodologyId(row.id),
    name: row.name,
    type: row.type as MethodologyType,
    description: row.description ?? undefined,
  });
}

export class PostgresResearchMethodologyRepository
  implements ResearchMethodologyRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async listAll(): Promise<ResearchMethodology[]> {
    const rows = await this.client.query<MethodologyRow>(SELECT_ALL, []);
    return rows.map(rowToMethodology);
  }

  async findById(
    id: import("../../domain/scientific-context/research-methodology.js").ResearchMethodologyId
  ): Promise<ResearchMethodology | null> {
    const rows = await this.client.query<MethodologyRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToMethodology(rows[0]!);
  }

  async save(methodology: ResearchMethodology): Promise<void> {
    await this.client.execute(INSERT, [
      methodology.id as string,
      methodology.name,
      methodology.type,
      methodology.description ?? null,
    ]);
  }
}
