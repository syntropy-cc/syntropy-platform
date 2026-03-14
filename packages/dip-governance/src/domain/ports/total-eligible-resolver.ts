/**
 * Port for resolving total eligible voters for an institution (COMP-007.4).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

/**
 * Resolves the total number of eligible voters for an institution (e.g. from chambers).
 * Used by GovernanceService to build EvaluationContext for quorum checks.
 */
export interface TotalEligibleResolverPort {
  getTotalEligible(institutionId: string): Promise<number>;
}
