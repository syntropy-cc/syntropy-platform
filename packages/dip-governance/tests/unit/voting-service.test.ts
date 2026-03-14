/**
 * Unit tests for VotingService (COMP-007.3).
 */

import { describe, it, expect } from "vitest";
import { Proposal, ProposalStatus } from "../../src/domain/proposal.js";
import { VotingService, DuplicateVoteError, NotEligibleToVoteError } from "../../src/domain/voting-service.js";
import type { ProposalRepositoryPort } from "../../src/domain/ports/proposal-repository.js";
import { InMemoryVoteStore } from "../../src/infrastructure/in-memory-vote-store.js";

function createInMemoryProposalRepo(initial: Map<string, Proposal>): ProposalRepositoryPort {
  const store = new Map(initial);
  return {
    async findById(proposalId: string) {
      return store.get(proposalId) ?? null;
    },
    async findByInstitutionId(institutionId: string, options?: { limit?: number; offset?: number }) {
      const list = [...store.values()].filter((p) => p.institutionId === institutionId);
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 50;
      return list.slice(offset, offset + limit);
    },
    async getProposalCountByInstitutionId(institutionId: string) {
      return [...store.values()].filter((p) => p.institutionId === institutionId).length;
    },
    async save(proposal: Proposal) {
      store.set(proposal.proposalId, proposal);
    },
  };
}

describe("VotingService.castVote", () => {
  it("records vote when proposal is open and actor is eligible", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", proposal]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await service.castVote("p1", "actor-1", "for");
    const summary = await service.getVoteSummary("p1");
    expect(summary.for).toBe(1);
    expect(summary.against).toBe(0);
    expect(summary.abstain).toBe(0);
    expect(summary.total).toBe(1);
  });

  it("throws NotEligibleToVoteError when eligibility checker returns false", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", proposal]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async (pid: string, actorId: string) => actorId !== "actor-2";
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await service.castVote("p1", "actor-1", "for");
    await expect(service.castVote("p1", "actor-2", "for")).rejects.toThrow(
      NotEligibleToVoteError
    );
    const summary = await service.getVoteSummary("p1");
    expect(summary.total).toBe(1);
  });

  it("throws DuplicateVoteError when same actor votes twice", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", proposal]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await service.castVote("p1", "actor-1", "for");
    await expect(service.castVote("p1", "actor-1", "against")).rejects.toThrow(
      DuplicateVoteError
    );
    const summary = await service.getVoteSummary("p1");
    expect(summary.for).toBe(1);
    expect(summary.against).toBe(0);
  });

  it("throws when proposal is not open for voting", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const closed = proposal.close();
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", closed]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await expect(service.castVote("p1", "actor-1", "for")).rejects.toThrow(
      /not open for voting/
    );
  });

  it("throws when proposal not found", async () => {
    const proposalRepo = createInMemoryProposalRepo(new Map());
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await expect(service.castVote("nonexistent", "actor-1", "for")).rejects.toThrow(
      /Proposal not found/
    );
  });
});

describe("VotingService.getVoteSummary", () => {
  it("returns tally for for, against, and abstain", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", proposal]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    await service.castVote("p1", "a1", "for");
    await service.castVote("p1", "a2", "for");
    await service.castVote("p1", "a3", "against");
    await service.castVote("p1", "a4", "abstain");

    const summary = await service.getVoteSummary("p1");
    expect(summary.for).toBe(2);
    expect(summary.against).toBe(1);
    expect(summary.abstain).toBe(1);
    expect(summary.total).toBe(4);
  });

  it("returns zeros for proposal with no votes", async () => {
    const proposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", proposal]]));
    const voteStore = new InMemoryVoteStore();
    const eligibility = async () => true;
    const service = new VotingService(proposalRepo, voteStore, eligibility);

    const summary = await service.getVoteSummary("p1");
    expect(summary.for).toBe(0);
    expect(summary.against).toBe(0);
    expect(summary.abstain).toBe(0);
    expect(summary.total).toBe(0);
  });
});
