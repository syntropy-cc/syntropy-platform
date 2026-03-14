/**
 * PostgreSQL implementation of VoteStorePort (COMP-007.6).
 */

import type { VoteStorePort, VoteRecord, VoteValue } from "../domain/ports/vote-store.js";
import type { GovernanceDbClient } from "./governance-db-client.js";

const TABLE = "dip.votes";
const INSERT_SQL = `
  INSERT INTO ${TABLE} (proposal_id, actor_id, vote)
  VALUES ($1, $2, $3)
  ON CONFLICT (proposal_id, actor_id) DO UPDATE SET vote = EXCLUDED.vote
`;
const SELECT_BY_PROPOSAL = `SELECT actor_id, vote FROM ${TABLE} WHERE proposal_id = $1`;

function rowToRecord(row: Record<string, unknown>): VoteRecord {
  return {
    actorId: String(row.actor_id),
    vote: String(row.vote) as VoteValue,
  };
}

export class PostgresVoteStore implements VoteStorePort {
  constructor(private readonly db: GovernanceDbClient) {}

  async getVotes(proposalId: string): Promise<VoteRecord[]> {
    const rows = await this.db.query<Record<string, unknown>>(SELECT_BY_PROPOSAL, [
      proposalId,
    ]);
    return rows.map(rowToRecord);
  }

  async recordVote(proposalId: string, actorId: string, vote: VoteValue): Promise<void> {
    await this.db.execute(INSERT_SQL, [proposalId, actorId, vote]);
  }
}
