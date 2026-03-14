/**
 * Unit tests for DIPContributionAdapter (COMP-019.4). ACL translation; mock DIP service.
 */

import { describe, it, expect, vi } from "vitest";
import { DIPContributionAdapter } from "../../../src/infrastructure/dip-contribution-adapter.js";
import { Contribution } from "../../../src/domain/collaboration/contribution.js";
import { ContributionStatus } from "../../../src/domain/collaboration/contribution-status.js";
import { createContributionId } from "../../../src/domain/collaboration/value-objects/contribution-id.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440001";

describe("DIPContributionAdapter", () => {
  it("translates contribution to single publish call and returns artifact id", async () => {
    const contribution = Contribution.fromPersistence({
      id: createContributionId(VALID_UUID),
      projectId: "proj-1",
      contributorId: "user-1",
      title: "Add feature X",
      description: "Description text",
      content: { type: "patch", diff: "..." },
      status: ContributionStatus.Accepted,
      linkedIssueIds: [],
      dipArtifactId: null,
      reviewerIds: ["r1"],
    });

    const mockPublish = vi.fn().mockResolvedValue("dip-artifact-123");
    const dipClient = { publish: mockPublish };
    const adapter = new DIPContributionAdapter(dipClient);

    const artifactId = await adapter.publishContribution(contribution);

    expect(artifactId).toBe("dip-artifact-123");
    expect(mockPublish).toHaveBeenCalledTimes(1);
    const call = mockPublish.mock.calls[0][0];
    expect(call.authorId).toBe("user-1");
    expect(call.title).toBe("Add feature X");
    expect(call.description).toBe("Description text");
    expect(call.projectId).toBe("proj-1");
    expect(call.content).toBe(JSON.stringify({ type: "patch", diff: "..." }));
  });

  it("uses description as content when content object is empty", async () => {
    const contribution = Contribution.fromPersistence({
      id: createContributionId(VALID_UUID),
      projectId: "p",
      contributorId: "u",
      title: "T",
      description: "Fallback body",
      content: {},
      status: ContributionStatus.Accepted,
      linkedIssueIds: [],
      dipArtifactId: null,
      reviewerIds: [],
    });

    const mockPublish = vi.fn().mockResolvedValue("art-1");
    const adapter = new DIPContributionAdapter({ publish: mockPublish });

    await adapter.publishContribution(contribution);

    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: "u",
        content: "Fallback body",
        title: "T",
        description: "Fallback body",
      })
    );
  });

  it("propagates errors from DIP client", async () => {
    const contribution = Contribution.fromPersistence({
      id: createContributionId(VALID_UUID),
      projectId: "p",
      contributorId: "u",
      title: "T",
      description: "D",
      content: {},
      status: ContributionStatus.Accepted,
      linkedIssueIds: [],
      dipArtifactId: null,
      reviewerIds: [],
    });

    const adapter = new DIPContributionAdapter({
      publish: vi.fn().mockRejectedValue(new Error("DIP unavailable")),
    });

    await expect(adapter.publishContribution(contribution)).rejects.toThrow(
      "DIP unavailable"
    );
  });
});
