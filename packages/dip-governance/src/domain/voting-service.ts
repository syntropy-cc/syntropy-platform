/**
 * VotingService — cast votes and get tally (COMP-007.3).
 * Architecture: DIP Institutional Governance subdomain
 */

import { ProposalStatus } from "./proposal-status.js";
import type { ProposalRepositoryPort } from "./ports/proposal-repository.js";
import type { VoteStorePort, VoteValue } from "./ports/vote-store.js";

/**
 * Thrown when an actor has already voted on a proposal.
 */
export class DuplicateVoteError extends Error {
  constructor(
    public readonly proposalId: string,
    public readonly actorId: string
  ) {
    super(
      `Duplicate vote: actor ${actorId} has already voted on proposal ${proposalId}`
    );
    this.name = "DuplicateVoteError";
    Object.setPrototypeOf(this, DuplicateVoteError.prototype);
  }
}

/**
 * Thrown when an actor is not eligible to vote on a proposal.
 */
export class NotEligibleToVoteError extends Error {
  constructor(
    public readonly proposalId: string,
    public readonly actorId: string
  ) {
    super(`Actor ${actorId} is not eligible to vote on proposal ${proposalId}`);
    this.name = "NotEligibleToVoteError";
    Object.setPrototypeOf(this, NotEligibleToVoteError.prototype);
  }
}

export interface VoteSummary {
  for: number;
  against: number;
  abstain: number;
  total: number;
}

/**
 * Eligibility check: (actorId, proposalId) => true if allowed to vote.
 * COMP-037.1 RBAC can be wired here; for unit tests use a stub.
 */
export type EligibilityChecker = (
  proposalId: string,
  actorId: string
) => Promise<boolean>;

/**
 * VotingService: cast votes (with eligibility and double-vote checks) and get tally.
 */
export class VotingService {
  constructor(
    private readonly proposalRepository: ProposalRepositoryPort,
    private readonly voteStore: VoteStorePort,
    private readonly eligibilityChecker: EligibilityChecker
  ) {}

  /**
   * Records a vote for an actor. Validates proposal is open, actor is eligible,
   * and actor has not already voted.
   */
  async castVote(
    proposalId: string,
    actorId: string,
    vote: VoteValue
  ): Promise<void> {
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    if (proposal.status !== ProposalStatus.Open) {
      throw new Error(
        `Proposal ${proposalId} is not open for voting (status: ${proposal.status})`
      );
    }
    const eligible = await this.eligibilityChecker(proposalId, actorId);
    if (!eligible) {
      throw new NotEligibleToVoteError(proposalId, actorId);
    }
    const existing = await this.voteStore.getVotes(proposalId);
    if (existing.some((v) => v.actorId === actorId)) {
      throw new DuplicateVoteError(proposalId, actorId);
    }
    await this.voteStore.recordVote(proposalId, actorId, vote);
  }

  /**
   * Returns the vote tally for a proposal.
   */
  async getVoteSummary(proposalId: string): Promise<VoteSummary> {
    const votes = await this.voteStore.getVotes(proposalId);
    let forCount = 0;
    let againstCount = 0;
    let abstainCount = 0;
    for (const v of votes) {
      switch (v.vote) {
        case "for":
          forCount++;
          break;
        case "against":
          againstCount++;
          break;
        case "abstain":
          abstainCount++;
          break;
      }
    }
    return {
      for: forCount,
      against: againstCount,
      abstain: abstainCount,
      total: votes.length,
    };
  }
}
