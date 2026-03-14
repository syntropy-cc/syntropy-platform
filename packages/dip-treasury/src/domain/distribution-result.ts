/**
 * Result of a value distribution run (COMP-008.4).
 * Architecture: DIP Value Distribution & Treasury; ADR-009.
 */

export interface DistributionAllocation {
  contributorId: string;
  amount: number;
}

/**
 * Result of ValueDistributionService.compute().
 * All amounts are integer AVU; sum of allocations may be less than balance due to floor rounding.
 */
export interface DistributionResult {
  allocations: DistributionAllocation[];
  totalDistributed: number;
}
