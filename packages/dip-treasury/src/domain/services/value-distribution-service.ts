/**
 * ValueDistributionService — computes proportional distribution of treasury balance (COMP-008.4).
 * Architecture: DIP Value Distribution & Treasury; ADR-009.
 * Distributes AVU to contributors proportionally to their scores; amounts are integer (floor rounding).
 */

import type { TreasuryAccountRepositoryPort } from "../ports/treasury-account-repository-port.js";
import type {
  ContributorScoreQueryPort,
  DistributionPeriod,
} from "../ports/contributor-score-query-port.js";
import type { DistributionResult } from "../distribution-result.js";

export class ValueDistributionService {
  constructor(
    private readonly accountRepository: TreasuryAccountRepositoryPort,
    private readonly contributorScores: ContributorScoreQueryPort
  ) {}

  /**
   * Computes how much AVU to distribute to each contributor for the given institution and period.
   * Uses proportional split by contributor score; amounts are floored to integer AVU.
   * Total distributed may be less than balance due to rounding.
   */
  async compute(
    institutionId: string,
    period: DistributionPeriod
  ): Promise<DistributionResult> {
    const account = await this.accountRepository.findByInstitutionId(institutionId);
    if (account == null) {
      return { allocations: [], totalDistributed: 0 };
    }

    const balance = account.avuBalance;
    if (balance <= 0) {
      return { allocations: [], totalDistributed: 0 };
    }

    const scores = await this.contributorScores.getContributorScores(
      institutionId,
      period
    );
    if (scores.length === 0) {
      return { allocations: [], totalDistributed: 0 };
    }

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    if (totalScore <= 0) {
      return { allocations: [], totalDistributed: 0 };
    }

    const allocations: { contributorId: string; amount: number }[] = [];
    let distributed = 0;

    for (const { contributorId, score } of scores) {
      const amount = Math.floor((balance * score) / totalScore);
      if (amount > 0) {
        allocations.push({ contributorId, amount });
        distributed += amount;
      }
    }

    return {
      allocations,
      totalDistributed: distributed,
    };
  }
}
