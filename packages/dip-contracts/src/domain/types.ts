/**
 * Base types for DIP Smart Contract Engine.
 * Architecture: COMP-004, smart-contract-engine subdomain
 */

/**
 * Base shape for a contract clause. Specific clause types (TransparencyClause,
 * ParticipationThreshold, VetoRight, AmendmentProcedure) are added in COMP-004.2.
 */
export interface ContractClause {
  readonly kind: string;
}

/**
 * Result of evaluating a governance contract against a request.
 * Evaluation is deterministic: same request + same state → same result.
 */
export interface EvaluationResult {
  readonly permitted: boolean;
  readonly newState?: Record<string, unknown>;
  readonly details?: string;
}
