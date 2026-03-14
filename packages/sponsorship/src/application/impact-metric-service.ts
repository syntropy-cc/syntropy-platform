/**
 * ImpactMetricService — computes ImpactMetric from impact data (COMP-027.3).
 * Application layer; depends on ImpactDataProvider port.
 * Architecture: ARCH-001, ARCH-002
 */

import { ImpactMetric } from "../domain/impact-metric.js";
import type { ImpactDataProvider } from "../domain/ports/impact-data-provider.js";

/**
 * Computes aggregated impact metric for a sponsorship.
 * Refreshed on portfolio.updated (caller responsibility; this method is stateless).
 */
export class ImpactMetricService {
  constructor(private readonly impactDataProvider: ImpactDataProvider) {}

  /**
   * Aggregates artifact views, portfolio growth, and contribution activity
   * for the given sponsorship and returns an ImpactMetric.
   */
  async compute(sponsorshipId: string): Promise<ImpactMetric> {
    const snapshot = await this.impactDataProvider.getImpactData(sponsorshipId);
    return new ImpactMetric({
      sponsorshipId,
      artifactViews: snapshot.artifactViews,
      portfolioGrowth: snapshot.portfolioGrowth,
      contributionActivity: snapshot.contributionActivity,
    });
  }
}
