/**
 * Unit tests for CommunityProposal aggregate and CommunityProposalService (COMP-031.5).
 */

import { describe, it, expect } from "vitest";
import { CommunityProposal, MIN_VOTES_TO_ACCEPT } from "../../src/domain/community-proposal.js";
import { ProposalStatus } from "../../src/domain/proposal-status.js";
import { CommunityProposalService } from "../../src/application/community-proposal-service.js";

describe("CommunityProposal", () => {
  describe("create", () => {
    it("creates a proposal in Draft status with zero votes", () => {
      const p = CommunityProposal.create({
        id: "prop-1",
        authorId: "user-1",
        title: "Add feature X",
        description: "We should add feature X.",
        proposalType: "feature_request",
      });
      expect(p.id).toBe("prop-1");
      expect(p.authorId).toBe("user-1");
      expect(p.title).toBe("Add feature X");
      expect(p.status).toBe(ProposalStatus.Draft);
      expect(p.voteCount).toBe(0);
      expect(p.createdAt).toBeInstanceOf(Date);
    });

    it("throws when required fields are empty", () => {
      expect(() =>
        CommunityProposal.create({
          id: "",
          authorId: "u1",
          title: "T",
          description: "D",
          proposalType: "feature",
        })
      ).toThrow(/id cannot be empty/);
    });
  });

  describe("lifecycle transitions", () => {
    it("openDiscussion transitions Draft to Discussion", () => {
      const p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      });
      const updated = p.openDiscussion("thread-123");
      expect(updated.status).toBe(ProposalStatus.Discussion);
      expect(updated.discussionThreadId).toBe("thread-123");
    });

    it("startVoting transitions Discussion to Voting", () => {
      const p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      })
        .openDiscussion()
        .startVoting();
      expect(p.status).toBe(ProposalStatus.Voting);
    });

    it("recordVote increments voteCount", () => {
      const p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      })
        .openDiscussion()
        .startVoting()
        .recordVote()
        .recordVote();
      expect(p.voteCount).toBe(2);
    });

    it("accept succeeds when voteCount >= MIN_VOTES_TO_ACCEPT", () => {
      let p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      })
        .openDiscussion()
        .startVoting();
      for (let i = 0; i < MIN_VOTES_TO_ACCEPT; i++) {
        p = p.recordVote();
      }
      const accepted = p.accept();
      expect(accepted.status).toBe(ProposalStatus.Accepted);
      expect(accepted.resolvedAt).toBeInstanceOf(Date);
      expect(accepted.isAccepted()).toBe(true);
    });

    it("accept throws when voteCount below threshold", () => {
      const p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      })
        .openDiscussion()
        .startVoting()
        .recordVote()
        .recordVote();
      expect(() => p.accept()).toThrow(/below minimum/);
    });

    it("reject transitions Voting to Rejected", () => {
      const p = CommunityProposal.create({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "feature",
      })
        .openDiscussion()
        .startVoting()
        .reject();
      expect(p.status).toBe(ProposalStatus.Rejected);
      expect(p.resolvedAt).toBeInstanceOf(Date);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs proposal with all fields", () => {
      const created = new Date("2026-01-01T00:00:00Z");
      const p = CommunityProposal.fromPersistence({
        id: "p1",
        authorId: "u1",
        title: "T",
        description: "D",
        proposalType: "policy_change",
        status: ProposalStatus.Voting,
        voteCount: 5,
        discussionThreadId: "thread-1",
        createdAt: created,
      });
      expect(p.status).toBe(ProposalStatus.Voting);
      expect(p.voteCount).toBe(5);
      expect(p.discussionThreadId).toBe("thread-1");
      expect(p.createdAt).toEqual(created);
    });
  });
});

describe("CommunityProposalService", () => {
  it("execute returns success when proposal is accepted", () => {
    const service = new CommunityProposalService();
    let p = CommunityProposal.create({
      id: "p1",
      authorId: "u1",
      title: "T",
      description: "D",
      proposalType: "feature",
    })
      .openDiscussion()
      .startVoting();
    for (let i = 0; i < MIN_VOTES_TO_ACCEPT; i++) {
      p = p.recordVote();
    }
    p = p.accept();
    const result = service.execute(p);
    expect(result.success).toBe(true);
    expect(result.proposalId).toBe("p1");
  });

  it("execute returns failure when proposal is not accepted", () => {
    const service = new CommunityProposalService();
    const p = CommunityProposal.create({
      id: "p1",
      authorId: "u1",
      title: "T",
      description: "D",
      proposalType: "feature",
    });
    const result = service.execute(p);
    expect(result.success).toBe(false);
    expect(result.message).toContain("not accepted");
  });
});
