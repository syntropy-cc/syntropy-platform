/**
 * ImpactMetric value type — aggregated impact for a sponsorship (COMP-027.3).
 * Architecture: sponsorship domain
 */

export interface ImpactMetricParams {
  sponsorshipId: string;
  artifactViews: number;
  portfolioGrowth: number;
  contributionActivity: number;
}

/**
 * Immutable value type aggregating impact data for a sponsorship.
 * Used for sponsor-facing reporting and refresh on portfolio.updated.
 */
export class ImpactMetric {
  readonly sponsorshipId: string;
  readonly artifactViews: number;
  readonly portfolioGrowth: number;
  readonly contributionActivity: number;

  constructor(params: ImpactMetricParams) {
    if (!params.sponsorshipId?.trim()) {
      throw new Error("ImpactMetric sponsorshipId cannot be empty");
    }
    if (typeof params.artifactViews !== "number" || params.artifactViews < 0) {
      throw new Error("ImpactMetric artifactViews must be a non-negative number");
    }
    if (typeof params.portfolioGrowth !== "number" || params.portfolioGrowth < 0) {
      throw new Error("ImpactMetric portfolioGrowth must be a non-negative number");
    }
    if (
      typeof params.contributionActivity !== "number" ||
      params.contributionActivity < 0
    ) {
      throw new Error(
        "ImpactMetric contributionActivity must be a non-negative number"
      );
    }

    this.sponsorshipId = params.sponsorshipId.trim();
    this.artifactViews = params.artifactViews;
    this.portfolioGrowth = params.portfolioGrowth;
    this.contributionActivity = params.contributionActivity;
  }
}
