/**
 * Unit tests for Issue aggregate (COMP-019.1).
 */

import { describe, it, expect } from "vitest";
import { Issue } from "../../../src/domain/collaboration/issue.js";
import { IssueStatus } from "../../../src/domain/collaboration/issue-status.js";
import { IssueType } from "../../../src/domain/collaboration/issue-type.js";
import { createIssueId } from "../../../src/domain/collaboration/value-objects/issue-id.js";
import { InvalidIssueTransitionError } from "../../../src/domain/collaboration/errors.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("Issue aggregate", () => {
  describe("open", () => {
    it("creates an issue in open status with required fields", () => {
      const issueId = createIssueId(VALID_UUID);
      const { issue, event } = Issue.open({
        issueId,
        projectId: "proj-1",
        title: "Fix login bug",
        type: IssueType.Bug,
      });

      expect(issue.status).toBe(IssueStatus.Open);
      expect(issue.issueId).toBe(issueId);
      expect(issue.projectId).toBe("proj-1");
      expect(issue.title).toBe("Fix login bug");
      expect(issue.type).toBe(IssueType.Bug);
      expect(issue.assigneeId).toBeNull();
      expect(event.type).toBe("hub.issue.created");
      expect(event.issueId).toBe(VALID_UUID);
      expect(event.status).toBe(IssueStatus.Open);
    });

    it("throws when title is empty", () => {
      const issueId = createIssueId(VALID_UUID);
      expect(() =>
        Issue.open({
          issueId,
          projectId: "p",
          title: "  ",
          type: IssueType.Task,
        })
      ).toThrow("Issue.title cannot be empty");
    });
  });

  describe("assign", () => {
    it("transitions from open to in_progress and sets assignee", () => {
      const issueId = createIssueId(VALID_UUID);
      const { issue } = Issue.open({
        issueId,
        projectId: "p",
        title: "Feature X",
        type: IssueType.Feature,
      });
      const assigned = issue.assign("user-123");

      expect(assigned.status).toBe(IssueStatus.InProgress);
      expect(assigned.assigneeId).toBe("user-123");
      expect(assigned.issueId).toBe(issueId);
    });

    it("throws when assigning from closed", () => {
      const issueId = createIssueId(VALID_UUID);
      const { issue } = Issue.open({
        issueId,
        projectId: "p",
        title: "Done",
        type: IssueType.Chore,
      });
      const closed = issue.close("Done").issue;

      expect(() => closed.assign("user-1")).toThrow(InvalidIssueTransitionError);
      expect(() => closed.assign("user-1")).toThrow(/from "closed" to "in_progress"/);
    });
  });

  describe("close", () => {
    it("transitions to closed and returns issue and event", () => {
      const issueId = createIssueId(VALID_UUID);
      const { issue } = Issue.open({
        issueId,
        projectId: "p",
        title: "Task",
        type: IssueType.Task,
      });
      const { issue: closedIssue, event } = issue.close("Completed");

      expect(closedIssue.status).toBe(IssueStatus.Closed);
      expect(event.type).toBe("hub.issue.closed");
      expect(event.issueId).toBe(VALID_UUID);
      expect(event.resolution).toBe("Completed");
    });

    it("throws when closing an already closed issue", () => {
      const issueId = createIssueId(VALID_UUID);
      const { issue } = Issue.open({
        issueId,
        projectId: "p",
        title: "X",
        type: IssueType.Bug,
      });
      const { issue: closed } = issue.close();

      expect(() => closed.close()).toThrow(InvalidIssueTransitionError);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs issue with given status", () => {
      const issueId = createIssueId(VALID_UUID);
      const issue = Issue.fromPersistence({
        issueId,
        projectId: "p",
        title: "Restored",
        type: IssueType.Feature,
        status: IssueStatus.InReview,
        assigneeId: "user-1",
      });

      expect(issue.status).toBe(IssueStatus.InReview);
      expect(issue.assigneeId).toBe("user-1");
      expect(issue.title).toBe("Restored");
    });
  });
});
