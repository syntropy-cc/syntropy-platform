/**
 * Governance context passed into the API for institution and proposal routes (COMP-007.9).
 */

import type { DigitalInstitutionRepositoryPort } from "@syntropy/dip-governance";
import type { ProposalRepositoryPort } from "@syntropy/dip-governance";
import type { VoteStorePort } from "@syntropy/dip-governance";
import type { VotingService } from "@syntropy/dip-governance";
import type { GovernanceQueryService } from "@syntropy/dip-governance";

export interface GovernanceContext {
  institutionRepo: DigitalInstitutionRepositoryPort;
  proposalRepo: ProposalRepositoryPort;
  voteStore: VoteStorePort;
  votingService: VotingService;
  governanceQueryService: GovernanceQueryService;
}
