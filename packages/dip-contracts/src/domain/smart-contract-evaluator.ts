/**
 * SmartContractEvaluator — deterministic evaluation of GovernanceContract against context.
 * Architecture: COMP-004.3, smart-contract-engine subdomain (ContractEvaluator).
 */

import type { GovernanceContract } from "./governance-contract.js";
import type {
  AmendmentProcedure,
  ContractClause,
  EvaluationContext,
  EvaluationResult,
  ParticipationThreshold,
  TransparencyClause,
  VetoRight,
} from "./types.js";

/**
 * Domain service that evaluates a GovernanceContract against an EvaluationContext.
 * Returns a single aggregate EvaluationResult: permitted only if all clauses pass.
 * Cross-institution evaluation is not permitted (contract evaluates only for its own institution).
 */
export class SmartContractEvaluator {
  /**
   * Evaluates the contract against the context.
   * Deterministic: same contract + same context → same result (Invariant I5).
   *
   * @param contract - The governance contract to evaluate
   * @param context - Context supplying institutionId and optional data per clause type
   * @returns EvaluationResult; permitted is true only if every clause passes
   */
  evaluate(contract: GovernanceContract, context: EvaluationContext): EvaluationResult {
    if (context.institutionId !== contract.institutionId) {
      return {
        permitted: false,
        details: `Contract belongs to institution ${contract.institutionId}; context institution ${context.institutionId} does not match.`,
      };
    }

    for (const clause of contract.clauses) {
      const failure = this.evaluateClause(clause, context);
      if (failure !== null) {
        return { permitted: false, details: failure };
      }
    }

    return { permitted: true };
  }

  /**
   * Evaluates a single clause. Returns a failure message string or null if the clause passes.
   */
  private evaluateClause(clause: ContractClause, context: EvaluationContext): string | null {
    switch (clause.kind) {
      case "transparency":
        return this.evaluateTransparency(clause, context);
      case "participation_threshold":
        return this.evaluateParticipationThreshold(clause, context);
      case "veto_right":
        return this.evaluateVetoRight(clause, context);
      case "amendment_procedure":
        return this.evaluateAmendmentProcedure(clause, context);
      default: {
        const _exhaustive: never = clause;
        void _exhaustive;
        return null;
      }
    }
  }

  private evaluateTransparency(clause: TransparencyClause, context: EvaluationContext): string | null {
    if (clause.requirePublicRecord && context.hasPublicRecord !== true) {
      return "TransparencyClause: public record is required but not present in context.";
    }
    if (clause.requiredDisclosures && clause.requiredDisclosures.length > 0) {
      const disclosed = new Set(context.disclosedItems ?? []);
      const missing = clause.requiredDisclosures.filter((d) => !disclosed.has(d));
      if (missing.length > 0) {
        return `TransparencyClause: required disclosures missing: ${missing.join(", ")}.`;
      }
    }
    return null;
  }

  private evaluateParticipationThreshold(
    clause: ParticipationThreshold,
    context: EvaluationContext
  ): string | null {
    const percent =
      context.participationPercent ??
      (context.totalEligible != null &&
        context.totalEligible > 0 &&
        context.currentParticipants != null
        ? (context.currentParticipants / context.totalEligible) * 100
        : undefined);

    if (percent === undefined) {
      return "ParticipationThreshold: context must provide participationPercent or (currentParticipants and totalEligible).";
    }
    if (percent < clause.minQuorumPercent) {
      return `ParticipationThreshold: quorum not met (${percent}% < ${clause.minQuorumPercent}% required).`;
    }
    if (clause.minParticipants != null) {
      const participants = context.currentParticipants ?? 0;
      if (participants < clause.minParticipants) {
        return `ParticipationThreshold: minimum participants not met (${participants} < ${clause.minParticipants} required).`;
      }
    }
    return null;
  }

  private evaluateVetoRight(clause: VetoRight, context: EvaluationContext): string | null {
    if (context.vetoHolderHasVetoed === true) {
      return `VetoRight: veto exercised by holder (role ${clause.holderRoleId}).`;
    }
    return null;
  }

  private evaluateAmendmentProcedure(
    clause: AmendmentProcedure,
    context: EvaluationContext
  ): string | null {
    const approval = context.approvalPercent ?? 0;
    if (approval < clause.minApprovalPercent) {
      return `AmendmentProcedure: approval threshold not met (${approval}% < ${clause.minApprovalPercent}% required).`;
    }
    if (clause.requireQuorum && context.quorumReached !== true) {
      return "AmendmentProcedure: quorum is required but not reached.";
    }
    return null;
  }
}
