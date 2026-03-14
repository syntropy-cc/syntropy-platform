/**
 * PostgreSQL implementation of ProposalRepositoryPort (COMP-007.6).
 */

import { Proposal } from "../domain/proposal.js";
import { ProposalStatus } from "../domain/proposal-status.js";
import type { ProposalStatusValue } from "../domain/proposal-status.js";
import type {
  ProposalRepositoryPort,
  ProposalListOptions,
} from "../domain/ports/proposal-repository.js";
import type { GovernanceDbClient } from "./governance-db-client.js";

const TABLE = "dip.proposals";
const COLS = "proposal_id, institution_id, type, status";
const UPSERT_SQL = `
  INSERT INTO ${TABLE} (proposal_id, institution_id, type, status)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (proposal_id) DO UPDATE SET
    institution_id = EXCLUDED.institution_id,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    updated_at = now()
`;
const SELECT_BY_ID = `SELECT ${COLS} FROM ${TABLE} WHERE proposal_id = $1`;
const SELECT_BY_INSTITUTION = `SELECT ${COLS} FROM ${TABLE} WHERE institution_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`;
const COUNT_BY_INSTITUTION = `SELECT COUNT(*)::int AS count FROM ${TABLE} WHERE institution_id = $1`;

const VALID_STATUSES: ProposalStatusValue[] = ["open", "closed", "executed"];
function isStatus(s: string): s is ProposalStatusValue {
  return VALID_STATUSES.includes(s as ProposalStatusValue);
}

function rowToProposal(row: Record<string, unknown>): Proposal {
  const status = String(row.status);
  if (!isStatus(status)) {
    throw new Error(`Invalid proposal status in DB: ${status}`);
  }
  return Proposal.fromPersistence({
    proposalId: String(row.proposal_id),
    institutionId: String(row.institution_id),
    type: String(row.type),
    status,
  });
}

export class PostgresProposalRepository implements ProposalRepositoryPort {
  constructor(private readonly db: GovernanceDbClient) {}

  async findById(proposalId: string): Promise<Proposal | null> {
    const rows = await this.db.query<Record<string, unknown>>(SELECT_BY_ID, [proposalId]);
    if (rows.length === 0) return null;
    return rowToProposal(rows[0]);
  }

  async findByInstitutionId(
    institutionId: string,
    options?: ProposalListOptions
  ): Promise<Proposal[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const rows = await this.db.query<Record<string, unknown>>(
      SELECT_BY_INSTITUTION,
      [institutionId, limit, offset]
    );
    return rows.map(rowToProposal);
  }

  async getProposalCountByInstitutionId(institutionId: string): Promise<number> {
    const rows = await this.db.query<{ count: number }>(COUNT_BY_INSTITUTION, [
      institutionId,
    ]);
    return rows[0]?.count ?? 0;
  }

  async save(proposal: Proposal): Promise<void> {
    await this.db.execute(UPSERT_SQL, [
      proposal.proposalId,
      proposal.institutionId,
      proposal.type,
      proposal.status,
    ]);
  }
}
