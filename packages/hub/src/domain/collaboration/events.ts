/**
 * Hub collaboration domain events (COMP-019).
 * Architecture: Hub Collaboration Layer, collaboration-layer.md
 */

/** Emitted when an Issue is opened. */
export interface HubIssueCreated {
  type: "hub.issue.created";
  issueId: string;
  projectId: string;
  title: string;
  issueType: string;
  status: string;
  occurredAt: Date;
}

/** Emitted when an Issue is closed. */
export interface HubIssueClosed {
  type: "hub.issue.closed";
  issueId: string;
  projectId: string;
  title: string;
  issueType: string;
  status: string;
  resolution?: string;
  occurredAt: Date;
}

/** Emitted when a Contribution is submitted. */
export interface HubContributionSubmitted {
  type: "hub.contribution.submitted";
  contributionId: string;
  projectId: string;
  contributorId: string;
  title: string;
  status: string;
  occurredAt: Date;
}

/** Emitted when a Contribution is integrated (DIP artifact published). */
export interface HubContributionIntegrated {
  type: "hub.contribution.integrated";
  contributionId: string;
  projectId: string;
  contributorId: string;
  dipArtifactId: string;
  closedIssueIds: string[];
  occurredAt: Date;
}

/** Emitted when a ContributionSandbox session starts. */
export interface HubHackinStarted {
  type: "hub.hackin.started";
  sandboxId: string;
  projectId: string;
  title: string;
  status: string;
  occurredAt: Date;
}

/** Emitted when a ContributionSandbox session completes. */
export interface HubHackinCompleted {
  type: "hub.hackin.completed";
  sandboxId: string;
  projectId: string;
  participantContributionIds: string[];
  occurredAt: Date;
}

export type HubCollaborationEvent =
  | HubIssueCreated
  | HubIssueClosed
  | HubContributionSubmitted
  | HubContributionIntegrated
  | HubHackinStarted
  | HubHackinCompleted;
