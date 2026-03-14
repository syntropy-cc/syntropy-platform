/**
 * ContractRepository — domain port for governance contract persistence.
 * Architecture: COMP-004.5, smart-contract-engine subdomain (ARCH-002: depend on abstractions)
 */

import type { GovernanceContract } from "../governance-contract.js";

/**
 * Port for persisting and loading GovernanceContract aggregates.
 * Implementations live in the infrastructure layer (e.g. PostgresContractRepository).
 */
export interface ContractRepository {
  save(contract: GovernanceContract): Promise<void>;
  findById(id: string): Promise<GovernanceContract | null>;
  findByInstitution(institutionId: string): Promise<GovernanceContract[]>;
}
