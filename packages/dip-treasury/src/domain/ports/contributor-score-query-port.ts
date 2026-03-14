/**
 * Port for querying contributor scores by institution and period (COMP-008.4).
 * Architecture: DIP Value Distribution & Treasury; dependency inversion.
 */

export interface DistributionPeriod {
  start: Date;
  end: Date;
}

export interface ContributorScore {
  contributorId: string;
  score: number;
}

/**
 * Port to read contributor scores for proportional distribution.
 * Implementations may aggregate from usage registry or dependency graph.
 */
export interface ContributorScoreQueryPort {
  getContributorScores(
    institutionId: string,
    period: DistributionPeriod
  ): Promise<ContributorScore[]>;
}
