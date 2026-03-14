/**
 * Unit tests for GovernanceQueryService (COMP-007.8).
 */

import { describe, expect, it } from "vitest";
import { DigitalInstitution } from "../../src/domain/digital-institution.js";
import { Proposal } from "../../src/domain/proposal.js";
import { ProposalStatus } from "../../src/domain/proposal-status.js";
import { GovernanceQueryService } from "../../src/application/governance-query-service.js";

describe("GovernanceQueryService", () => {
  it("getInstitutionSummary returns null when institution not found", async () => {
    const institutionRepo = {
      findById: async () => null,
      save: async () => {},
    };
    const proposalRepo = {
      findById: async () => null,
      findByInstitutionId: async () => [],
      getProposalCountByInstitutionId: async () => 0,
      save: async () => {},
    };
    const voteStore = { getVotes: async () => [], recordVote: async () => {} };
    const service = new GovernanceQueryService(
      institutionRepo as never,
      proposalRepo as never,
      voteStore as never
    );
    const summary = await service.getInstitutionSummary("inst-none");
    expect(summary).toBeNull();
  });

  it("getInstitutionSummary returns summary with proposalCount", async () => {
    const institution = DigitalInstitution.create({
      institutionId: "inst-1",
      name: "Test Org",
      type: "laboratory",
      governanceContract: "c1",
    });
    const institutionRepo = {
      findById: async (id: string) => (id === "inst-1" ? institution : null),
      save: async () => {},
    };
    const proposalRepo = {
      findById: async () => null,
      findByInstitutionId: async () => [],
      getProposalCountByInstitutionId: async (id: string) =>
        id === "inst-1" ? 3 : 0,
      save: async () => {},
    };
    const voteStore = { getVotes: async () => [], recordVote: async () => {} };
    const service = new GovernanceQueryService(
      institutionRepo as never,
      proposalRepo as never,
      voteStore as never
    );
    const summary = await service.getInstitutionSummary("inst-1");
    expect(summary).not.toBeNull();
    expect(summary!.institutionId).toBe("inst-1");
    expect(summary!.name).toBe("Test Org");
    expect(summary!.status).toBe("forming");
    expect(summary!.proposalCount).toBe(3);
  });

  it("getProposalHistory returns paginated items with voteSummary", async () => {
    const proposals = [
      Proposal.fromPersistence({
        proposalId: "p1",
        institutionId: "inst-1",
        type: "amendment",
        status: ProposalStatus.Open,
      }),
      Proposal.fromPersistence({
        proposalId: "p2",
        institutionId: "inst-1",
        type: "budget",
        status: ProposalStatus.Closed,
      }),
    ];
    const proposalRepo = {
      findById: async () => null,
      findByInstitutionId: async (_id: string, opts?: { limit?: number; offset?: number }) => {
        const limit = opts?.limit ?? 20;
        const offset = opts?.offset ?? 0;
        return proposals.slice(offset, offset + limit);
      },
      getProposalCountByInstitutionId: async () => 2,
      save: async () => {},
    };
    const voteStore = {
      getVotes: async (proposalId: string) => {
        if (proposalId === "p1") return [{ actorId: "a1", vote: "for" as const }];
        if (proposalId === "p2")
          return [
            { actorId: "a1", vote: "for" as const },
            { actorId: "a2", vote: "against" as const },
          ];
        return [];
      },
      recordVote: async () => {},
    };
    const institutionRepo = {
      findById: async () => null,
      save: async () => {},
    };
    const service = new GovernanceQueryService(
      institutionRepo as never,
      proposalRepo as never,
      voteStore as never
    );
    const page = await service.getProposalHistory("inst-1", { limit: 10, offset: 0 });
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(2);
    expect(page.limit).toBe(10);
    expect(page.offset).toBe(0);
    expect(page.items[0].proposalId).toBe("p1");
    expect(page.items[0].voteSummary).toEqual({ for: 1, against: 0, abstain: 0, total: 1 });
    expect(page.items[1].proposalId).toBe("p2");
    expect(page.items[1].voteSummary).toEqual({ for: 1, against: 1, abstain: 0, total: 2 });
  });

  it("getProposalHistory respects pagination limit and offset", async () => {
    const proposalRepo = {
      findById: async () => null,
      findByInstitutionId: async (_id: string, opts?: { limit?: number; offset?: number }) => {
        const limit = opts?.limit ?? 20;
        const offset = opts?.offset ?? 0;
        const all = [
          Proposal.fromPersistence({
            proposalId: "p1",
            institutionId: "inst-1",
            type: "t",
            status: ProposalStatus.Open,
          }),
          Proposal.fromPersistence({
            proposalId: "p2",
            institutionId: "inst-1",
            type: "t",
            status: ProposalStatus.Open,
          }),
          Proposal.fromPersistence({
            proposalId: "p3",
            institutionId: "inst-1",
            type: "t",
            status: ProposalStatus.Open,
          }),
        ];
        return all.slice(offset, offset + limit);
      },
      getProposalCountByInstitutionId: async () => 3,
      save: async () => {},
    };
    const voteStore = { getVotes: async () => [], recordVote: async () => {} };
    const institutionRepo = { findById: async () => null, save: async () => {} };
    const service = new GovernanceQueryService(
      institutionRepo as never,
      proposalRepo as never,
      voteStore as never,
      { defaultPageSize: 5, maxPageSize: 50 }
    );
    const page = await service.getProposalHistory("inst-1", { limit: 2, offset: 1 });
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(3);
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(1);
  });
});
