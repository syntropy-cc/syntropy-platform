/**
 * Unit tests for ContributionIntegrationService (COMP-019.5).
 */

import { describe, it, expect, vi } from "vitest";
import { ContributionIntegrationService } from "../../../src/application/contribution-integration-service.js";
import { Contribution } from "../../../src/domain/collaboration/contribution.js";
import { ContributionStatus } from "../../../src/domain/collaboration/contribution-status.js";
import { Issue } from "../../../src/domain/collaboration/issue.js";
import { IssueStatus } from "../../../src/domain/collaboration/issue-status.js";
import { IssueType } from "../../../src/domain/collaboration/issue-type.js";
import { createContributionId } from "../../../src/domain/collaboration/value-objects/contribution-id.js";
import { createIssueId } from "../../../src/domain/collaboration/value-objects/issue-id.js";
import { ContributionNotReadyForMergeError } from "../../../src/application/contribution-integration-service.js";

const CONTRIB_ID = "550e8400-e29b-41d4-a716-446655440001";
const ISSUE_ID_1 = "550e8400-e29b-41d4-a716-446655440002";
const ISSUE_ID_2 = "550e8400-e29b-41d4-a716-446655440003";

describe("ContributionIntegrationService", () => {
  it("merge: publishes artifact, merges contribution, closes linked issues and returns events", async () => {
    const accepted = Contribution.fromPersistence({
      id: createContributionId(CONTRIB_ID),
      projectId: "proj-1",
      contributorId: "user-1",
      title: "Feature X",
      description: "Desc",
      content: {},
      status: ContributionStatus.Accepted,
      linkedIssueIds: [ISSUE_ID_1, ISSUE_ID_2],
      dipArtifactId: null,
      reviewerIds: ["r1"],
    });

    const issue1 = Issue.fromPersistence({
      issueId: createIssueId(ISSUE_ID_1),
      projectId: "proj-1",
      title: "Issue 1",
      type: IssueType.Feature,
      status: IssueStatus.Open,
    });
    const issue2 = Issue.fromPersistence({
      issueId: createIssueId(ISSUE_ID_2),
      projectId: "proj-1",
      title: "Issue 2",
      type: IssueType.Bug,
      status: IssueStatus.InProgress,
    });

    const mockPublish = vi.fn().mockResolvedValue("dip-artifact-123");
    const mockContributionSave = vi.fn().mockResolvedValue(undefined);
    const mockIssueSave = vi.fn().mockResolvedValue(undefined);

    const service = new ContributionIntegrationService(
      { publishContribution: mockPublish },
      {
        getById: vi.fn().mockResolvedValue(accepted),
        save: mockContributionSave,
      },
      {
        getById: vi.fn(),
        getByIds: vi.fn().mockResolvedValue([issue1, issue2]),
        save: mockIssueSave,
      }
    );

    const result = await service.merge(CONTRIB_ID);

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(accepted);
    expect(mockContributionSave).toHaveBeenCalledTimes(1);
    const savedContribution = mockContributionSave.mock.calls[0][0] as Contribution;
    expect(savedContribution.status).toBe(ContributionStatus.Integrated);
    expect(savedContribution.dipArtifactId).toBe("dip-artifact-123");

    expect(mockIssueSave).toHaveBeenCalledTimes(2);

    expect(result.integratedEvent.type).toBe("hub.contribution.integrated");
    expect(result.integratedEvent.contributionId).toBe(CONTRIB_ID);
    expect(result.integratedEvent.dipArtifactId).toBe("dip-artifact-123");
    expect(result.integratedEvent.closedIssueIds).toEqual([
      ISSUE_ID_1,
      ISSUE_ID_2,
    ]);
    expect(result.closedIssueEvents).toHaveLength(2);
    expect(result.closedIssueEvents[0].type).toBe("hub.issue.closed");
    expect(result.closedIssueEvents[1].type).toBe("hub.issue.closed");
  });

  it("merge: throws when contribution not found", async () => {
    const service = new ContributionIntegrationService(
      { publishContribution: vi.fn() },
      { getById: vi.fn().mockResolvedValue(null), save: vi.fn() },
      { getById: vi.fn(), getByIds: vi.fn(), save: vi.fn() }
    );

    await expect(service.merge(CONTRIB_ID)).rejects.toThrow(
      ContributionNotReadyForMergeError
    );
    await expect(service.merge(CONTRIB_ID)).rejects.toThrow("not found");
  });

  it("merge: throws when contribution not accepted", async () => {
    const inReview = Contribution.fromPersistence({
      id: createContributionId(CONTRIB_ID),
      projectId: "p",
      contributorId: "u",
      title: "T",
      description: "D",
      content: {},
      status: ContributionStatus.InReview,
      linkedIssueIds: [],
      dipArtifactId: null,
      reviewerIds: [],
    });

    const service = new ContributionIntegrationService(
      { publishContribution: vi.fn() },
      { getById: vi.fn().mockResolvedValue(inReview), save: vi.fn() },
      { getById: vi.fn(), getByIds: vi.fn(), save: vi.fn() }
    );

    await expect(service.merge(CONTRIB_ID)).rejects.toThrow(
      ContributionNotReadyForMergeError
    );
    await expect(service.merge(CONTRIB_ID)).rejects.toThrow("expected status accepted");
  });

  it("merge: does not load or close issues when linkedIssueIds is empty", async () => {
    const accepted = Contribution.fromPersistence({
      id: createContributionId(CONTRIB_ID),
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

    const getByIds = vi.fn();
    const issueSave = vi.fn();

    const service = new ContributionIntegrationService(
      { publishContribution: vi.fn().mockResolvedValue("art-1") },
      { getById: vi.fn().mockResolvedValue(accepted), save: vi.fn() },
      { getById: vi.fn(), getByIds, save: issueSave }
    );

    const result = await service.merge(CONTRIB_ID);

    expect(getByIds).not.toHaveBeenCalled();
    expect(issueSave).not.toHaveBeenCalled();
    expect(result.closedIssueEvents).toEqual([]);
    expect(result.integratedEvent.closedIssueIds).toEqual([]);
  });
});
