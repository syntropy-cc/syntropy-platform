/**
 * GovernanceService — execute proposals with contract evaluation and quorum (COMP-007.4).
 * Architecture: DIP Institutional Governance subdomain
 */

import type { EvaluationContext, EvaluationResult, GovernanceContract } from "@syntropy/dip-contracts";
import { ProposalStatus } from "../proposal-status.js";
import type { Proposal } from "../proposal.js";
import type { ProposalExecutedEvent } from "../events.js";
import type { ProposalRepositoryPort } from "../ports/proposal-repository.js";
import type { GovernanceContractResolverPort } from "../ports/governance-contract-resolver.js";
import type { ProposalExecutedPublisherPort } from "../ports/proposal-executed-publisher.js";
import type { TotalEligibleResolverPort } from "../ports/total-eligible-resolver.js";
import type { VoteSummary } from "../voting-service.js";

/** Evaluator interface to keep boundary clear; satisfied by SmartContractEvaluator. */
export interface ContractEvaluatorPort {
  evaluate(contract: GovernanceContract, context: EvaluationContext): EvaluationResult;
}

/**
 * Thrown when proposal execution is rejected (e.g. quorum not met).
 */
export class ProposalExecutionRejectedError extends Error {
  constructor(
    public readonly proposalId: string,
    public readonly details: string
  ) {
    super(`Proposal ${proposalId} execution rejected: ${details}`);
    this.name = "ProposalExecutionRejectedError";
    Object.setPrototypeOf(this, ProposalExecutionRejectedError.prototype);
  }
}

/**
 * GovernanceService: evaluates governance contract, enforces quorum, applies proposal
 * effects, and publishes governance.proposal_executed.
 */
export class GovernanceService {
  constructor(
    private readonly proposalRepository: ProposalRepositoryPort,
    private readonly votingService: { getVoteSummary(proposalId: string): Promise<VoteSummary> },
    private readonly contractResolver: GovernanceContractResolverPort,
    private readonly evaluator: ContractEvaluatorPort,
    private readonly executedPublisher: ProposalExecutedPublisherPort,
    private readonly totalEligibleResolver: TotalEligibleResolverPort
  ) {}

  /**
   * Executes a proposal: evaluates contract (quorum etc.), rejects if not permitted,
   * transitions proposal to executed, persists, and publishes proposal_executed.
   */
  async executeProposal(proposalId: string): Promise<Proposal> {
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    if (proposal.status !== ProposalStatus.Closed) {
      throw new Error(
        `Proposal ${proposalId} is not closed (status: ${proposal.status}); only closed proposals can be executed.`
      );
    }

    const voteSummary = await this.votingService.getVoteSummary(proposalId);
    const totalEligible = await this.totalEligibleResolver.getTotalEligible(proposal.institutionId);
    const contract = await this.contractResolver.getContractByInstitutionId(proposal.institutionId);
    if (!contract) {
      throw new Error(
        `Governance contract not found for institution: ${proposal.institutionId}`
      );
    }

    const context = this.buildEvaluationContext(
      proposal,
      voteSummary,
      totalEligible,
      contract
    );
    const result = this.evaluator.evaluate(contract, context);
    if (!result.permitted) {
      throw new ProposalExecutionRejectedError(
        proposalId,
        result.details ?? "Contract evaluation failed"
      );
    }

    const executedProposal = proposal.execute();
    await this.proposalRepository.save(executedProposal);

    const event: ProposalExecutedEvent = {
      eventType: "dip.governance.proposal_executed",
      institutionId: proposal.institutionId,
      proposalId,
      proposalType: proposal.type,
      timestamp: new Date().toISOString(),
    };
    await this.executedPublisher.publish(event);

    return executedProposal;
  }

  private buildEvaluationContext(
    proposal: Proposal,
    voteSummary: VoteSummary,
    totalEligible: number,
    contract: GovernanceContract
  ): EvaluationContext {
    const currentParticipants = voteSummary.total;
    const participationPercent =
      totalEligible > 0 ? (currentParticipants / totalEligible) * 100 : 0;
    const voted = voteSummary.for + voteSummary.against;
    const approvalPercent =
      voted > 0 ? (voteSummary.for / voted) * 100 : 0;

    let quorumReached: boolean | undefined;
    const participationClause = contract.clauses.find(
      (c): c is { kind: "participation_threshold"; minQuorumPercent: number } =>
        c.kind === "participation_threshold"
    );
    if (participationClause) {
      quorumReached = participationPercent >= participationClause.minQuorumPercent;
    }

    return {
      institutionId: proposal.institutionId,
      currentParticipants,
      totalEligible,
      participationPercent,
      approvalPercent,
      quorumReached,
    };
  }
}
