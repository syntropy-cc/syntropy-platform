/**
 * Port for storing and retrieving votes (COMP-007.3).
 * Architecture: DIP Institutional Governance
 */

export type VoteValue = "for" | "against" | "abstain";

export interface VoteRecord {
  actorId: string;
  vote: VoteValue;
}

/**
 * Store for proposal votes. Used by VotingService to persist votes and
 * prevent double-voting (one vote per actor per proposal).
 */
export interface VoteStorePort {
  getVotes(proposalId: string): Promise<VoteRecord[]>;
  recordVote(proposalId: string, actorId: string, vote: VoteValue): Promise<void>;
}
