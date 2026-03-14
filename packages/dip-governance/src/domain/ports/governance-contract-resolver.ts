/**
 * Port for resolving GovernanceContract by institution (COMP-007.4).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { GovernanceContract } from "@syntropy/dip-contracts";

/**
 * Resolves the governance contract for a digital institution.
 * Used by GovernanceService to evaluate proposal execution against contract clauses.
 */
export interface GovernanceContractResolverPort {
  getContractByInstitutionId(institutionId: string): Promise<GovernanceContract | null>;
}
