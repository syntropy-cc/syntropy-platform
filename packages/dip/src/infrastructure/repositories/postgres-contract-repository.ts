/**
 * PostgreSQL implementation of ContractRepository (COMP-004.5).
 */

import {
  GovernanceContract,
  type ContractClause,
} from "@syntropy/dip-contracts";
import type { ContractRepository as IContractRepository } from "@syntropy/dip-contracts";
import type { ContractDbClient } from "../contract-db-client.js";

const TABLE = "dip.governance_contracts";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, institution_id, dsl, created_at, updated_at)
  VALUES ($1, $2, $3::jsonb, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    institution_id = EXCLUDED.institution_id,
    dsl = EXCLUDED.dsl,
    updated_at = now()
`;

const SELECT_BY_ID = `SELECT id, institution_id, dsl FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_INSTITUTION = `SELECT id, institution_id, dsl FROM ${TABLE} WHERE institution_id = $1 ORDER BY created_at ASC`;

interface ContractRow {
  id: string;
  institution_id: string;
  dsl: { id: string; institutionId: string; clauses: ContractClause[] };
}

function rowToContract(row: ContractRow): GovernanceContract {
  const dsl = row.dsl;
  const clauses = Array.isArray(dsl?.clauses) ? dsl.clauses : [];
  return GovernanceContract.create({
    id: String(row.id),
    institutionId: row.institution_id,
    clauses: clauses as ContractClause[],
  });
}

export class PostgresContractRepository implements IContractRepository {
  constructor(private readonly client: ContractDbClient) {}

  async findById(id: string): Promise<GovernanceContract | null> {
    const rows = await this.client.query<ContractRow>(SELECT_BY_ID, [id]);
    if (rows.length === 0) return null;
    return rowToContract(rows[0]);
  }

  async save(contract: GovernanceContract): Promise<void> {
    const dsl = {
      id: contract.id,
      institutionId: contract.institutionId,
      clauses: [...contract.clauses],
    };
    await this.client.execute(UPSERT_SQL, [
      contract.id,
      contract.institutionId,
      JSON.stringify(dsl),
    ]);
  }

  async findByInstitution(
    institutionId: string,
  ): Promise<GovernanceContract[]> {
    const rows = await this.client.query<ContractRow>(
      SELECT_BY_INSTITUTION,
      [institutionId],
    );
    return rows.map(rowToContract);
  }
}
