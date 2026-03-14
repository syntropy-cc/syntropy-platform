/**
 * Port for reading impact-related data (artifact views, portfolio, contributions).
 * Allows ImpactMetricService to stay in application layer (COMP-027.3).
 * Architecture: ARCH-002
 */

/** Snapshot of impact data for a sponsored entity (e.g. by sponsorship). */
export interface ImpactDataSnapshot {
  artifactViews: number;
  portfolioGrowth: number;
  contributionActivity: number;
}

/**
 * Provides raw impact data for a given sponsorship (e.g. by resolving
 * sponsoredId and querying artifact views, portfolio delta, contribution count).
 */
export interface ImpactDataProvider {
  /**
   * Fetches impact data for the given sponsorship id.
   * Returns zeros if sponsorship or related data not found.
   */
  getImpactData(sponsorshipId: string): Promise<ImpactDataSnapshot>;
}
