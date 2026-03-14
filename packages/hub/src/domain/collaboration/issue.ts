/**
 * Issue aggregate — discrete unit of work with open/assign/close lifecycle (COMP-019.1).
 * Architecture: Hub Collaboration Layer, collaboration-layer.md
 */

import type { IssueId } from "./value-objects/issue-id.js";
import { InvalidIssueTransitionError } from "./errors.js";
import type { HubIssueClosed, HubIssueCreated } from "./events.js";
import { IssueStatus, type IssueStatusValue } from "./issue-status.js";
import type { IssueTypeValue } from "./issue-type.js";

export interface IssueParams {
  issueId: IssueId;
  projectId: string;
  title: string;
  type: IssueTypeValue;
  status: IssueStatusValue;
  assigneeId?: string | null;
}

/**
 * Issue aggregate. Lifecycle: open → (assign → in_progress) → close → closed.
 */
export class Issue {
  readonly issueId: IssueId;
  readonly projectId: string;
  readonly title: string;
  readonly type: IssueTypeValue;
  readonly status: IssueStatusValue;
  readonly assigneeId: string | null;

  private constructor(params: IssueParams) {
    this.issueId = params.issueId;
    this.projectId = params.projectId;
    this.title = params.title;
    this.type = params.type;
    this.status = params.status;
    this.assigneeId = params.assigneeId ?? null;
  }

  /**
   * Creates a new Issue in open status. Returns the aggregate and the event to publish.
   */
  static open(params: {
    issueId: IssueId;
    projectId: string;
    title: string;
    type: IssueTypeValue;
  }): { issue: Issue; event: HubIssueCreated } {
    if (!params.title?.trim()) {
      throw new Error("Issue.title cannot be empty");
    }
    const issue = new Issue({
      ...params,
      projectId: params.projectId.trim(),
      title: params.title.trim(),
      status: IssueStatus.Open,
    });
    const event: HubIssueCreated = {
      type: "hub.issue.created",
      issueId: params.issueId as string,
      projectId: params.projectId,
      title: issue.title,
      issueType: issue.type,
      status: issue.status,
      occurredAt: new Date(),
    };
    return { issue, event };
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: IssueParams): Issue {
    return new Issue(params);
  }

  /**
   * Transitions from open (or in_review) to in_progress. Optionally assigns a user.
   */
  assign(userId: string): Issue {
    if (this.status !== IssueStatus.Open && this.status !== IssueStatus.InReview) {
      throw new InvalidIssueTransitionError(
        this.status,
        IssueStatus.InProgress,
        this.issueId as string
      );
    }
    return new Issue({
      issueId: this.issueId,
      projectId: this.projectId,
      title: this.title,
      type: this.type,
      status: IssueStatus.InProgress,
      assigneeId: userId.trim() || null,
    });
  }

  /**
   * Transitions to closed. Only open or in_progress or in_review issues can be closed.
   * Returns the updated aggregate and the event to publish.
   */
  close(resolution?: string): { issue: Issue; event: HubIssueClosed } {
    if (this.status === IssueStatus.Closed) {
      throw new InvalidIssueTransitionError(
        this.status,
        IssueStatus.Closed,
        this.issueId as string
      );
    }
    const issue = new Issue({
      issueId: this.issueId,
      projectId: this.projectId,
      title: this.title,
      type: this.type,
      status: IssueStatus.Closed,
      assigneeId: this.assigneeId,
    });
    const event: HubIssueClosed = {
      type: "hub.issue.closed",
      issueId: this.issueId as string,
      projectId: this.projectId,
      title: this.title,
      issueType: this.type,
      status: IssueStatus.Closed,
      resolution: resolution?.trim(),
      occurredAt: new Date(),
    };
    return { issue, event };
  }
}
