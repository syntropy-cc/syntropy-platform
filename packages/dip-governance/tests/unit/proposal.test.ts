/**
 * Unit tests for Proposal aggregate (COMP-007.2).
 */

import { describe, it, expect } from "vitest";
import {
  Proposal,
  InvalidProposalTransitionError,
} from "../../src/domain/proposal.js";
import { ProposalStatus } from "../../src/domain/proposal-status.js";

describe("Proposal.open", () => {
  it("creates proposal in open status", () => {
    const p = Proposal.open({
      proposalId: "prop-001",
      institutionId: "inst-001",
      type: "amendment",
    });
    expect(p.proposalId).toBe("prop-001");
    expect(p.institutionId).toBe("inst-001");
    expect(p.type).toBe("amendment");
    expect(p.status).toBe(ProposalStatus.Open);
  });

  it("throws when proposalId is empty", () => {
    expect(() =>
      Proposal.open({
        proposalId: "",
        institutionId: "i1",
        type: "t1",
      })
    ).toThrow(/proposalId cannot be empty/);
  });

  it("throws when institutionId is empty", () => {
    expect(() =>
      Proposal.open({
        proposalId: "p1",
        institutionId: "",
        type: "t1",
      })
    ).toThrow(/institutionId cannot be empty/);
  });

  it("throws when type is empty", () => {
    expect(() =>
      Proposal.open({
        proposalId: "p1",
        institutionId: "i1",
        type: "",
      })
    ).toThrow(/type cannot be empty/);
  });
});

describe("Proposal.close", () => {
  it("transitions from open to closed", () => {
    const p = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "t1",
    });
    const closed = p.close();
    expect(closed.status).toBe(ProposalStatus.Closed);
    expect(closed.proposalId).toBe(p.proposalId);
    expect(p.status).toBe(ProposalStatus.Open);
  });

  it("throws when not in open status", () => {
    const p = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "t1",
    });
    const closed = p.close();
    expect(() => closed.close()).toThrow(InvalidProposalTransitionError);
    expect(() => closed.close()).toThrow(/from "closed" to "closed"/);
  });
});

describe("Proposal.execute", () => {
  it("transitions from closed to executed", () => {
    const p = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "t1",
    });
    const closed = p.close();
    const executed = closed.execute();
    expect(executed.status).toBe(ProposalStatus.Executed);
    expect(executed.proposalId).toBe(p.proposalId);
    expect(closed.status).toBe(ProposalStatus.Closed);
  });

  it("throws when not in closed status", () => {
    const p = Proposal.open({
      proposalId: "p1",
      institutionId: "i1",
      type: "t1",
    });
    expect(() => p.execute()).toThrow(InvalidProposalTransitionError);
    expect(() => p.execute()).toThrow(/from "open" to "executed"/);

    const closed = p.close();
    const executed = closed.execute();
    expect(() => executed.execute()).toThrow(InvalidProposalTransitionError);
    expect(() => executed.execute()).toThrow(/from "executed"/);
  });
});

describe("Proposal.fromPersistence", () => {
  it("reconstructs with any valid status", () => {
    const open = Proposal.fromPersistence({
      proposalId: "p1",
      institutionId: "i1",
      type: "t1",
      status: ProposalStatus.Open,
    });
    expect(open.status).toBe(ProposalStatus.Open);

    const closed = Proposal.fromPersistence({
      proposalId: "p2",
      institutionId: "i2",
      type: "t2",
      status: ProposalStatus.Closed,
    });
    expect(closed.status).toBe(ProposalStatus.Closed);

    const executed = Proposal.fromPersistence({
      proposalId: "p3",
      institutionId: "i3",
      type: "t3",
      status: ProposalStatus.Executed,
    });
    expect(executed.status).toBe(ProposalStatus.Executed);
  });
});
