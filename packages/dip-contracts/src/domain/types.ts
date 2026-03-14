/**
 * Base types for DIP Smart Contract Engine.
 * Architecture: COMP-004, smart-contract-engine subdomain
 */

/**
 * Transparency clause: requires public record and optional disclosure list.
 * Immutable value object.
 */
export interface TransparencyClause {
  readonly kind: "transparency";
  readonly requirePublicRecord: boolean;
  readonly requiredDisclosures?: readonly string[];
}

/**
 * Participation threshold clause: minimum quorum for decisions.
 * Immutable value object.
 */
export interface ParticipationThreshold {
  readonly kind: "participation_threshold";
  readonly minQuorumPercent: number;
  readonly minParticipants?: number;
}

/**
 * Veto right clause: designates which role can veto.
 * Immutable value object.
 */
export interface VetoRight {
  readonly kind: "veto_right";
  readonly holderRoleId: string;
}

/**
 * Amendment procedure clause: how contract amendments are approved.
 * Immutable value object.
 */
export interface AmendmentProcedure {
  readonly kind: "amendment_procedure";
  readonly minApprovalPercent: number;
  readonly requireQuorum: boolean;
}

/**
 * Union of all contract clause types. Used by GovernanceContract.clauses.
 */
export type ContractClause =
  | TransparencyClause
  | ParticipationThreshold
  | VetoRight
  | AmendmentProcedure;

/**
 * Result of evaluating a governance contract against a request.
 * Evaluation is deterministic: same request + same state → same result.
 */
export interface EvaluationResult {
  readonly permitted: boolean;
  readonly newState?: Record<string, unknown>;
  readonly details?: string;
}
