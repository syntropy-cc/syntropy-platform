/**
 * Unit tests for Contribution aggregate (COMP-019.2).
 */

import { describe, it, expect } from "vitest";
import { Contribution } from "../../../src/domain/collaboration/contribution.js";
import { ContributionStatus } from "../../../src/domain/collaboration/contribution-status.js";
import { createContributionId } from "../../../src/domain/collaboration/value-objects/contribution-id.js";
import { InvalidContributionTransitionError } from "../../../src/domain/collaboration/errors.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440001";

describe("Contribution aggregate", () => {
  describe("submit", () => {
    it("creates a contribution in submitted status", () => {
      const id = createContributionId(VALID_UUID);
      const { contribution, event } = Contribution.submit({
        id,
        projectId: "proj-1",
        contributorId: "user-1",
        title: "Add feature X",
        description: "Description",
        content: { type: "patch", diff: "" },
        linkedIssueIds: ["issue-1"],
      });

      expect(contribution.status).toBe(ContributionStatus.Submitted);
      expect(contribution.id).toBe(id);
      expect(contribution.linkedIssueIds).toEqual(["issue-1"]);
      expect(contribution.dipArtifactId).toBeNull();
      expect(event.type).toBe("hub.contribution.submitted");
      expect(event.contributionId).toBe(VALID_UUID);
    });

    it("throws when title is empty", () => {
      const id = createContributionId(VALID_UUID);
      expect(() =>
        Contribution.submit({
          id,
          projectId: "p",
          contributorId: "u",
          title: "  ",
          description: "",
          content: {},
        })
      ).toThrow("Contribution.title cannot be empty");
    });
  });

  describe("assignReviewer", () => {
    it("transitions from submitted to in_review", () => {
      const id = createContributionId(VALID_UUID);
      const { contribution } = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      });
      const inReview = contribution.assignReviewer("reviewer-1");

      expect(inReview.status).toBe(ContributionStatus.InReview);
      expect(inReview.reviewerIds).toContain("reviewer-1");
    });

    it("throws when not submitted", () => {
      const id = createContributionId(VALID_UUID);
      const { contribution } = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      });
      const inReview = contribution.assignReviewer("r").accept("r");

      expect(() => inReview.assignReviewer("r2")).toThrow(
        InvalidContributionTransitionError
      );
    });
  });

  describe("requestRevision", () => {
    it("transitions from in_review back to submitted", () => {
      const id = createContributionId(VALID_UUID);
      let c = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      }).contribution;
      c = c.assignReviewer("r").requestRevision("r");

      expect(c.status).toBe(ContributionStatus.Submitted);
    });
  });

  describe("accept", () => {
    it("transitions from in_review to accepted", () => {
      const id = createContributionId(VALID_UUID);
      let c = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      }).contribution;
      c = c.assignReviewer("r").accept("r");

      expect(c.status).toBe(ContributionStatus.Accepted);
    });

    it("throws when not in_review", () => {
      const id = createContributionId(VALID_UUID);
      const { contribution } = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      });

      expect(() => contribution.accept("r")).toThrow(
        InvalidContributionTransitionError
      );
    });
  });

  describe("reject", () => {
    it("transitions from in_review to rejected", () => {
      const id = createContributionId(VALID_UUID);
      let c = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      }).contribution;
      c = c.assignReviewer("r").reject("r", "Needs work");

      expect(c.status).toBe(ContributionStatus.Rejected);
    });
  });

  describe("merge", () => {
    it("transitions from accepted to integrated and sets dip_artifact_id", () => {
      const id = createContributionId(VALID_UUID);
      let c = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
        linkedIssueIds: ["issue-a", "issue-b"],
      }).contribution;
      c = c.assignReviewer("r").accept("r");
      const { contribution: merged, event } = c.merge("dip-artifact-123");

      expect(merged.status).toBe(ContributionStatus.Integrated);
      expect(merged.dipArtifactId).toBe("dip-artifact-123");
      expect(event.type).toBe("hub.contribution.integrated");
      expect(event.dipArtifactId).toBe("dip-artifact-123");
      expect(event.closedIssueIds).toEqual(["issue-a", "issue-b"]);
    });

    it("throws when not accepted", () => {
      const id = createContributionId(VALID_UUID);
      const { contribution } = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      });

      expect(() => contribution.merge("art-1")).toThrow(
        InvalidContributionTransitionError
      );
    });

    it("throws when dipArtifactId is empty", () => {
      const id = createContributionId(VALID_UUID);
      let c = Contribution.submit({
        id,
        projectId: "p",
        contributorId: "u",
        title: "X",
        description: "",
        content: {},
      }).contribution;
      c = c.assignReviewer("r").accept("r");

      expect(() => c.merge("  ")).toThrow("non-empty dipArtifactId");
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs contribution with given status", () => {
      const id = createContributionId(VALID_UUID);
      const c = Contribution.fromPersistence({
        id,
        projectId: "p",
        contributorId: "u",
        title: "T",
        description: "D",
        content: {},
        status: ContributionStatus.Integrated,
        linkedIssueIds: [],
        dipArtifactId: "art-1",
        reviewerIds: ["r1"],
      });

      expect(c.status).toBe(ContributionStatus.Integrated);
      expect(c.dipArtifactId).toBe("art-1");
      expect(c.reviewerIds).toEqual(["r1"]);
    });
  });
});
