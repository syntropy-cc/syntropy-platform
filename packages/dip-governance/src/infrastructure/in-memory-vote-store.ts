/**
 * In-memory implementation of VoteStorePort (COMP-007.3).
 * For testing and development.
 */

import type { VoteStorePort, VoteRecord, VoteValue } from "../domain/ports/vote-store.js";

export class InMemoryVoteStore implements VoteStorePort {
  private readonly votesByProposal = new Map<string, VoteRecord[]>();

  async getVotes(proposalId: string): Promise<VoteRecord[]> {
    return [...(this.votesByProposal.get(proposalId) ?? [])];
  }

  async recordVote(
    proposalId: string,
    actorId: string,
    vote: VoteValue
  ): Promise<void> {
    const list = this.votesByProposal.get(proposalId) ?? [];
    list.push({ actorId, vote });
    this.votesByProposal.set(proposalId, list);
  }
}
