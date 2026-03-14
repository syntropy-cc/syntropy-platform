/**
 * PostgreSQL implementation of DigitalInstitutionRepositoryPort (COMP-007.6).
 */

import { DigitalInstitution } from "../domain/digital-institution.js";
import type { DigitalInstitutionStatus } from "../domain/digital-institution.js";
import type { DigitalInstitutionRepositoryPort } from "../domain/ports/digital-institution-repository.js";
import type { GovernanceDbClient } from "./governance-db-client.js";

const TABLE = "dip.digital_institutions";
const COLS = "institution_id, name, institution_type, governance_contract_id, status";
const UPSERT_SQL = `
  INSERT INTO ${TABLE} (institution_id, name, institution_type, governance_contract_id, status)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (institution_id) DO UPDATE SET
    name = EXCLUDED.name,
    institution_type = EXCLUDED.institution_type,
    governance_contract_id = EXCLUDED.governance_contract_id,
    status = EXCLUDED.status,
    updated_at = now()
`;
const SELECT_BY_ID = `SELECT ${COLS} FROM ${TABLE} WHERE institution_id = $1`;

const VALID_STATUSES: DigitalInstitutionStatus[] = ["forming", "active", "dissolved"];
function isStatus(s: string): s is DigitalInstitutionStatus {
  return VALID_STATUSES.includes(s as DigitalInstitutionStatus);
}

function rowToInstitution(row: Record<string, unknown>): DigitalInstitution {
  const status = String(row.status);
  if (!isStatus(status)) {
    throw new Error(`Invalid institution status in DB: ${status}`);
  }
  return DigitalInstitution.fromPersistence({
    institutionId: String(row.institution_id),
    name: String(row.name),
    type: String(row.institution_type),
    governanceContract: String(row.governance_contract_id),
    status,
  });
}

export class PostgresDigitalInstitutionRepository implements DigitalInstitutionRepositoryPort {
  constructor(private readonly db: GovernanceDbClient) {}

  async findById(institutionId: string): Promise<DigitalInstitution | null> {
    const rows = await this.db.query<Record<string, unknown>>(SELECT_BY_ID, [institutionId]);
    if (rows.length === 0) return null;
    return rowToInstitution(rows[0]);
  }

  async save(institution: DigitalInstitution): Promise<void> {
    await this.db.execute(UPSERT_SQL, [
      institution.institutionId,
      institution.name,
      institution.type,
      institution.governanceContract,
      institution.status,
    ]);
  }
}
