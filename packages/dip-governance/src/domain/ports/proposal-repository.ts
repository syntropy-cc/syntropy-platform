/**
 * Port for loading and saving proposals (COMP-007.3).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { Proposal } from "../proposal.js";

/**
 * Minimal repository for Proposal aggregate. Used by VotingService to load
 * and persist proposals with vote tally.
 */
export interface ProposalRepositoryPort {
  findById(proposalId: string): Promise<Proposal | null>;
  save(proposal: Proposal): Promise<void>;
}
