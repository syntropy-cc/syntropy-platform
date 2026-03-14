/**
 * Port for loading and saving proposals (COMP-007.3).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { Proposal } from "../proposal.js";

/**
 * Pagination options for listing proposals.
 */
export interface ProposalListOptions {
  limit?: number;
  offset?: number;
}

/**
 * Minimal repository for Proposal aggregate. Used by VotingService to load
 * and persist proposals with vote tally; used by query service for listing.
 */
export interface ProposalRepositoryPort {
  findById(proposalId: string): Promise<Proposal | null>;
  findByInstitutionId(
    institutionId: string,
    options?: ProposalListOptions
  ): Promise<Proposal[]>;
  getProposalCountByInstitutionId(institutionId: string): Promise<number>;
  save(proposal: Proposal): Promise<void>;
}
