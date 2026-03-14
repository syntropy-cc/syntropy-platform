/**
 * CommunityProposal aggregate (COMP-031.5).
 * Architecture: Governance & Moderation domain, PAT-004.
 */

import {
  ProposalStatus,
  type ProposalStatusValue,
} from "./proposal-status.js";

/** Minimum votes required before a proposal can be accepted. */
export const MIN_VOTES_TO_ACCEPT = 10;

export interface CommunityProposalParams {
  id: string;
  authorId: string;
  title: string;
  description: string;
  proposalType: string;
  status: ProposalStatusValue;
  voteCount: number;
  discussionThreadId?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}

/**
 * CommunityProposal aggregate. Platform-level governance proposal with lifecycle and voting.
 * Immutable; transitions return new instances.
 */
export class CommunityProposal {
  readonly id: string;
  readonly authorId: string;
  readonly title: string;
  readonly description: string;
  readonly proposalType: string;
  readonly status: ProposalStatusValue;
  readonly voteCount: number;
  readonly discussionThreadId: string | undefined;
  readonly createdAt: Date;
  readonly resolvedAt: Date | undefined;

  private constructor(params: CommunityProposalParams) {
    this.id = params.id;
    this.authorId = params.authorId;
    this.title = params.title;
    this.description = params.description;
    this.proposalType = params.proposalType;
    this.status = params.status;
    this.voteCount = params.voteCount;
    this.discussionThreadId = params.discussionThreadId;
    this.createdAt = params.createdAt ?? new Date();
    this.resolvedAt = params.resolvedAt;
  }

  static create(params: {
    id: string;
    authorId: string;
    title: string;
    description: string;
    proposalType: string;
  }): CommunityProposal {
    if (!params.id?.trim()) throw new Error("CommunityProposal.id cannot be empty");
    if (!params.authorId?.trim()) throw new Error("CommunityProposal.authorId cannot be empty");
    if (!params.title?.trim()) throw new Error("CommunityProposal.title cannot be empty");
    if (!params.description?.trim()) throw new Error("CommunityProposal.description cannot be empty");
    if (!params.proposalType?.trim()) throw new Error("CommunityProposal.proposalType cannot be empty");
    return new CommunityProposal({
      ...params,
      status: ProposalStatus.Draft,
      voteCount: 0,
      createdAt: new Date(),
    });
  }

  static fromPersistence(params: CommunityProposalParams): CommunityProposal {
    return new CommunityProposal(params);
  }

  /**
   * Open for discussion; optionally set discussion thread id.
   */
  openDiscussion(discussionThreadId?: string): CommunityProposal {
    if (this.status !== ProposalStatus.Draft) {
      throw new Error(
        `Cannot open discussion: proposal is in status '${this.status}', expected 'draft'`
      );
    }
    return new CommunityProposal({
      ...this,
      status: ProposalStatus.Discussion,
      discussionThreadId: discussionThreadId ?? this.discussionThreadId,
    });
  }

  /**
   * Move to voting phase.
   */
  startVoting(): CommunityProposal {
    if (this.status !== ProposalStatus.Discussion) {
      throw new Error(
        `Cannot start voting: proposal is in status '${this.status}', expected 'discussion'`
      );
    }
    return new CommunityProposal({
      ...this,
      status: ProposalStatus.Voting,
    });
  }

  /**
   * Record a single vote (increment vote count). Does not track who voted; that is persistence concern.
   */
  recordVote(): CommunityProposal {
    if (this.status !== ProposalStatus.Voting) {
      throw new Error(
        `Cannot record vote: proposal is in status '${this.status}', expected 'voting'`
      );
    }
    return new CommunityProposal({
      ...this,
      voteCount: this.voteCount + 1,
    });
  }

  /**
   * Accept the proposal. Allowed only when in voting and threshold (MIN_VOTES_TO_ACCEPT) is met.
   */
  accept(): CommunityProposal {
    if (this.status !== ProposalStatus.Voting) {
      throw new Error(
        `Cannot accept: proposal is in status '${this.status}', expected 'voting'`
      );
    }
    if (this.voteCount < MIN_VOTES_TO_ACCEPT) {
      throw new Error(
        `Cannot accept: vote count ${this.voteCount} is below minimum ${MIN_VOTES_TO_ACCEPT}`
      );
    }
    return new CommunityProposal({
      ...this,
      status: ProposalStatus.Accepted,
      resolvedAt: new Date(),
    });
  }

  /**
   * Reject the proposal. Allowed when in voting or discussion.
   */
  reject(): CommunityProposal {
    if (this.status !== ProposalStatus.Voting && this.status !== ProposalStatus.Discussion) {
      throw new Error(
        `Cannot reject: proposal is in status '${this.status}'`
      );
    }
    return new CommunityProposal({
      ...this,
      status: ProposalStatus.Rejected,
      resolvedAt: new Date(),
    });
  }

  /** True if proposal has been accepted and can be executed. */
  isAccepted(): boolean {
    return this.status === ProposalStatus.Accepted;
  }
}
