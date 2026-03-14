/**
 * Unit tests for GovernanceService.executeProposal (COMP-007.4).
 */

import { describe, it, expect } from "vitest";
import { Proposal } from "../../src/domain/proposal.js";
import { ProposalStatus } from "../../src/domain/proposal-status.js";
import {
  GovernanceService,
  ProposalExecutionRejectedError,
} from "../../src/domain/services/governance-service.js";
import type { ProposalRepositoryPort } from "../../src/domain/ports/proposal-repository.js";
import type { GovernanceContractResolverPort } from "../../src/domain/ports/governance-contract-resolver.js";
import type { ProposalExecutedPublisherPort } from "../../src/domain/ports/proposal-executed-publisher.js";
import type { TotalEligibleResolverPort } from "../../src/domain/ports/total-eligible-resolver.js";
import type { ProposalExecutedEvent } from "../../src/domain/events.js";
import {
  GovernanceContract,
  SmartContractEvaluator,
} from "@syntropy/dip-contracts";
import { VotingService } from "../../src/domain/voting-service.js";
import { InMemoryVoteStore } from "../../src/infrastructure/in-memory-vote-store.js";

function createInMemoryProposalRepo(
  initial: Map<string, Proposal>
): ProposalRepositoryPort {
  const store = new Map(initial);
  return {
    async findById(proposalId: string) {
      return store.get(proposalId) ?? null;
    },
    async save(proposal: Proposal) {
      store.set(proposal.proposalId, proposal);
    },
  };
}

function createContractResolver(
  map: Map<string, GovernanceContract>
): GovernanceContractResolverPort {
  return {
    async getContractByInstitutionId(institutionId: string) {
      return map.get(institutionId) ?? null;
    },
  };
}

function createTotalEligibleResolver(
  map: Map<string, number>
): TotalEligibleResolverPort {
  return {
    async getTotalEligible(institutionId: string) {
      return map.get(institutionId) ?? 0;
    },
  };
}

function createCapturingPublisher(): {
  publisher: ProposalExecutedPublisherPort;
  captured: ProposalExecutedEvent[];
} {
  const captured: ProposalExecutedEvent[] = [];
  const publisher: ProposalExecutedPublisherPort = {
    async publish(event: ProposalExecutedEvent) {
      captured.push(event);
    },
  };
  return { publisher, captured };
}

describe("GovernanceService.executeProposal", () => {
  it("succeeds when contract permits and proposal is closed", async () => {
    const closed = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    }).close();
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", closed]]));
    const voteStore = new InMemoryVoteStore();
    const votingService = new VotingService(
      proposalRepo,
      voteStore,
      async () => true
    );
    await voteStore.recordVote("p1", "a1", "for");
    await voteStore.recordVote("p1", "a2", "for");
    await voteStore.recordVote("p1", "a3", "for");
    await voteStore.recordVote("p1", "a4", "for");
    await voteStore.recordVote("p1", "a5", "for");
    await voteStore.recordVote("p1", "a6", "against");
    const contract = GovernanceContract.create({
      id: "c1",
      institutionId: "i1",
      clauses: [{ kind: "participation_threshold", minQuorumPercent: 50 }],
    });
    const contractResolver = createContractResolver(new Map([["i1", contract]]));
    const evaluator = new SmartContractEvaluator();
    const { publisher, captured } = createCapturingPublisher();
    const totalEligibleResolver = createTotalEligibleResolver(
      new Map([["i1", 10]])
    );

    const service = new GovernanceService(
      proposalRepo,
      votingService,
      contractResolver,
      evaluator,
      publisher,
      totalEligibleResolver
    );

    const result = await service.executeProposal("p1");

    expect(result.status).toBe(ProposalStatus.Executed);
    expect(result.proposalId).toBe("p1");
    expect(captured).toHaveLength(1);
    expect(captured[0].eventType).toBe("dip.governance.proposal_executed");
    expect(captured[0].proposalId).toBe("p1");
    expect(captured[0].institutionId).toBe("i1");
    expect(captured[0].proposalType).toBe("amendment");
    const saved = await proposalRepo.findById("p1");
    expect(saved?.status).toBe(ProposalStatus.Executed);
  });

  it("throws ProposalExecutionRejectedError when quorum not met", async () => {
    const closed = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    }).close();
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", closed]]));
    const voteStore = new InMemoryVoteStore();
    await voteStore.recordVote("p1", "a1", "for");
    await voteStore.recordVote("p1", "a2", "against");
    await voteStore.recordVote("p1", "a3", "for");
    const votingService = new VotingService(
      proposalRepo,
      voteStore,
      async () => true
    );
    const contract = GovernanceContract.create({
      id: "c1",
      institutionId: "i1",
      clauses: [{ kind: "participation_threshold", minQuorumPercent: 50 }],
    });
    const contractResolver = createContractResolver(new Map([["i1", contract]]));
    const evaluator = new SmartContractEvaluator();
    const { publisher, captured } = createCapturingPublisher();
    const totalEligibleResolver = createTotalEligibleResolver(
      new Map([["i1", 10]])
    );

    const service = new GovernanceService(
      proposalRepo,
      votingService,
      contractResolver,
      evaluator,
      publisher,
      totalEligibleResolver
    );

    await expect(service.executeProposal("p1")).rejects.toThrow(
      ProposalExecutionRejectedError
    );
    await expect(service.executeProposal("p1")).rejects.toThrow(/quorum not met/i);
    expect(captured).toHaveLength(0);
    const stillClosed = await proposalRepo.findById("p1");
    expect(stillClosed?.status).toBe(ProposalStatus.Closed);
  });

  it("throws when proposal is not closed", async () => {
    const openProposal = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    });
    const proposalRepo = createInMemoryProposalRepo(
      new Map([["p1", openProposal]])
    );
    const voteStore = new InMemoryVoteStore();
    const votingService = new VotingService(
      proposalRepo,
      voteStore,
      async () => true
    );
    const contract = GovernanceContract.create({
      id: "c1",
      institutionId: "i1",
      clauses: [],
    });
    const contractResolver = createContractResolver(new Map([["i1", contract]]));
    const evaluator = new SmartContractEvaluator();
    const { publisher, captured } = createCapturingPublisher();
    const totalEligibleResolver = createTotalEligibleResolver(
      new Map([["i1", 10]])
    );

    const service = new GovernanceService(
      proposalRepo,
      votingService,
      contractResolver,
      evaluator,
      publisher,
      totalEligibleResolver
    );

    await expect(service.executeProposal("p1")).rejects.toThrow(
      /not closed.*only closed proposals can be executed/i
    );
    expect(captured).toHaveLength(0);
  });

  it("throws when proposal not found", async () => {
    const proposalRepo = createInMemoryProposalRepo(new Map());
    const voteStore = new InMemoryVoteStore();
    const votingService = new VotingService(
      proposalRepo,
      voteStore,
      async () => true
    );
    const contractResolver = createContractResolver(new Map());
    const evaluator = new SmartContractEvaluator();
    const { publisher, captured } = createCapturingPublisher();
    const totalEligibleResolver = createTotalEligibleResolver(new Map());

    const service = new GovernanceService(
      proposalRepo,
      votingService,
      contractResolver,
      evaluator,
      publisher,
      totalEligibleResolver
    );

    await expect(service.executeProposal("nonexistent")).rejects.toThrow(
      /Proposal not found/
    );
    expect(captured).toHaveLength(0);
  });

  it("throws when governance contract not found for institution", async () => {
    const closed = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "amendment",
    }).close();
    const proposalRepo = createInMemoryProposalRepo(new Map([["p1", closed]]));
    const voteStore = new InMemoryVoteStore();
    const votingService = new VotingService(
      proposalRepo,
      voteStore,
      async () => true
    );
    const contractResolver = createContractResolver(new Map());
    const evaluator = new SmartContractEvaluator();
    const { publisher, captured } = createCapturingPublisher();
    const totalEligibleResolver = createTotalEligibleResolver(
      new Map([["i1", 10]])
    );

    const service = new GovernanceService(
      proposalRepo,
      votingService,
      contractResolver,
      evaluator,
      publisher,
      totalEligibleResolver
    );

    await expect(service.executeProposal("p1")).rejects.toThrow(
      /Governance contract not found for institution/
    );
    expect(captured).toHaveLength(0);
  });
});
