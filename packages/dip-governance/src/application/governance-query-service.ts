/**
 * Governance query service — read models for institution summary and proposal history (COMP-007.8).
 */

import type { InstitutionSummary } from "../domain/read-models/institution-summary.js";
import type {
  ProposalHistoryItem,
  ProposalHistoryPage,
} from "../domain/read-models/proposal-history.js";
import type { DigitalInstitutionRepositoryPort } from "../domain/ports/digital-institution-repository.js";
import type {
  ProposalRepositoryPort,
  ProposalListOptions,
} from "../domain/ports/proposal-repository.js";
import type { VoteStorePort } from "../domain/ports/vote-store.js";
import type { VoteSummary } from "../domain/voting-service.js";

export interface GovernanceQueryServiceOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
}

/**
 * Query service for governance read models. Uses repository ports to build
 * InstitutionSummary and paginated ProposalHistory.
 */
export class GovernanceQueryService {
  private readonly defaultPageSize: number;
  private readonly maxPageSize: number;

  constructor(
    private readonly institutionRepo: DigitalInstitutionRepositoryPort,
    private readonly proposalRepo: ProposalRepositoryPort,
    private readonly voteStore: VoteStorePort,
    options: GovernanceQueryServiceOptions = {}
  ) {
    this.defaultPageSize = options.defaultPageSize ?? 20;
    this.maxPageSize = options.maxPageSize ?? 100;
  }

  /**
   * Returns a summary of an institution including governance stats.
   */
  async getInstitutionSummary(institutionId: string): Promise<InstitutionSummary | null> {
    const institution = await this.institutionRepo.findById(institutionId);
    if (!institution) return null;
    const proposalCount = await this.proposalRepo.getProposalCountByInstitutionId(
      institutionId
    );
    return {
      institutionId: institution.institutionId,
      name: institution.name,
      status: institution.status,
      proposalCount,
    };
  }

  /**
   * Returns a paginated list of proposals for an institution, with optional vote summary per proposal.
   */
  async getProposalHistory(
    institutionId: string,
    pagination?: { limit?: number; offset?: number }
  ): Promise<ProposalHistoryPage> {
    const limit = Math.min(
      pagination?.limit ?? this.defaultPageSize,
      this.maxPageSize
    );
    const offset = pagination?.offset ?? 0;
    const options: ProposalListOptions = { limit, offset };
    const [proposals, total] = await Promise.all([
      this.proposalRepo.findByInstitutionId(institutionId, options),
      this.proposalRepo.getProposalCountByInstitutionId(institutionId),
    ]);
    const items: ProposalHistoryItem[] = await Promise.all(
      proposals.map(async (p) => {
        const votes = await this.voteStore.getVotes(p.proposalId);
        const voteSummary: VoteSummary = {
          for: votes.filter((v) => v.vote === "for").length,
          against: votes.filter((v) => v.vote === "against").length,
          abstain: votes.filter((v) => v.vote === "abstain").length,
          total: votes.length,
        };
        return {
          proposalId: p.proposalId,
          institutionId: p.institutionId,
          type: p.type,
          status: p.status,
          voteSummary,
        };
      })
    );
    return { items, total, limit, offset };
  }
}
