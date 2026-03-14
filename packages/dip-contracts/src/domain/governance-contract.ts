/**
 * GovernanceContract aggregate scaffold.
 * Architecture: COMP-004, smart-contract-engine subdomain
 */

import type { ContractClause } from "./types.js";

/**
 * Aggregate maintaining contract rules and current state for a digital institution.
 * Clauses are immutable value objects: TransparencyClause, ParticipationThreshold,
 * VetoRight, AmendmentProcedure. Evaluation is implemented in COMP-004.3+.
 */
export class GovernanceContract {
  readonly id: string;
  readonly institutionId: string;
  readonly clauses: readonly ContractClause[];

  private constructor(params: {
    id: string;
    institutionId: string;
    clauses: readonly ContractClause[];
  }) {
    this.id = params.id;
    this.institutionId = params.institutionId;
    this.clauses = params.clauses;
  }

  /**
   * Creates a new GovernanceContract (scaffold factory).
   *
   * @param params.id - Contract identifier
   * @param params.institutionId - Owning institution identifier
   * @param params.clauses - Optional list of clauses; defaults to empty
   */
  static create(params: {
    id: string;
    institutionId: string;
    clauses?: readonly ContractClause[];
  }): GovernanceContract {
    const clauses = params.clauses ? [...params.clauses] : [];
    return new GovernanceContract({
      id: params.id,
      institutionId: params.institutionId,
      clauses,
    });
  }
}
