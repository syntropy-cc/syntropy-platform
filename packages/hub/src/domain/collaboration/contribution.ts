/**
 * Contribution aggregate — submitted work with review and merge lifecycle (COMP-019.2).
 * Architecture: Hub Collaboration Layer, collaboration-layer.md
 */

import type { ContributionId } from "./value-objects/contribution-id.js";
import { InvalidContributionTransitionError } from "./errors.js";
import type {
  HubContributionIntegrated,
  HubContributionSubmitted,
} from "./events.js";
import {
  ContributionStatus,
  type ContributionStatusValue,
} from "./contribution-status.js";

export interface ContributionParams {
  id: ContributionId;
  projectId: string;
  contributorId: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  status: ContributionStatusValue;
  linkedIssueIds: string[];
  dipArtifactId: string | null;
  reviewerIds: string[];
}

/**
 * Contribution aggregate. Lifecycle: submitted → in_review → accepted | rejected;
 * accepted → integrated (merge with DIP artifact id).
 */
export class Contribution {
  readonly id: ContributionId;
  readonly projectId: string;
  readonly contributorId: string;
  readonly title: string;
  readonly description: string;
  readonly content: Record<string, unknown>;
  readonly status: ContributionStatusValue;
  readonly linkedIssueIds: string[];
  readonly dipArtifactId: string | null;
  readonly reviewerIds: string[];

  private constructor(params: ContributionParams) {
    this.id = params.id;
    this.projectId = params.projectId;
    this.contributorId = params.contributorId;
    this.title = params.title;
    this.description = params.description;
    this.content = params.content;
    this.status = params.status;
    this.linkedIssueIds = [...params.linkedIssueIds];
    this.dipArtifactId = params.dipArtifactId;
    this.reviewerIds = [...params.reviewerIds];
  }

  /**
   * Creates a new Contribution in submitted status. Returns the aggregate and the event to publish.
   */
  static submit(params: {
    id: ContributionId;
    projectId: string;
    contributorId: string;
    title: string;
    description: string;
    content: Record<string, unknown>;
    linkedIssueIds?: string[];
  }): { contribution: Contribution; event: HubContributionSubmitted } {
    if (!params.title?.trim()) {
      throw new Error("Contribution.title cannot be empty");
    }
    const contribution = new Contribution({
      ...params,
      title: params.title.trim(),
      description: params.description?.trim() ?? "",
      content: params.content ?? {},
      status: ContributionStatus.Submitted,
      linkedIssueIds: params.linkedIssueIds ?? [],
      dipArtifactId: null,
      reviewerIds: [],
    });
    const event: HubContributionSubmitted = {
      type: "hub.contribution.submitted",
      contributionId: params.id as string,
      projectId: params.projectId,
      contributorId: params.contributorId,
      title: contribution.title,
      status: contribution.status,
      occurredAt: new Date(),
    };
    return { contribution, event };
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: ContributionParams): Contribution {
    return new Contribution(params);
  }

  /**
   * Assigns a reviewer: transitions from submitted to in_review.
   */
  assignReviewer(reviewerId: string): Contribution {
    if (this.status !== ContributionStatus.Submitted) {
      throw new InvalidContributionTransitionError(
        this.status,
        ContributionStatus.InReview,
        this.id as string
      );
    }
    const reviewerIds = [...this.reviewerIds, reviewerId.trim()].filter(Boolean);
    return new Contribution({
      ...this._params(),
      status: ContributionStatus.InReview,
      reviewerIds,
    });
  }

  /**
   * Reviewer requests revision: transitions from in_review back to submitted.
   */
  requestRevision(_reviewerId: string): Contribution {
    if (this.status !== ContributionStatus.InReview) {
      throw new InvalidContributionTransitionError(
        this.status,
        ContributionStatus.Submitted,
        this.id as string
      );
    }
    return new Contribution({
      ...this._params(),
      status: ContributionStatus.Submitted,
    });
  }

  /**
   * Reviewer accepts: transitions from in_review to accepted.
   */
  accept(reviewerId: string): Contribution {
    if (this.status !== ContributionStatus.InReview) {
      throw new InvalidContributionTransitionError(
        this.status,
        ContributionStatus.Accepted,
        this.id as string
      );
    }
    const reviewerIds = this.reviewerIds.includes(reviewerId.trim())
      ? this.reviewerIds
      : [...this.reviewerIds, reviewerId.trim()];
    return new Contribution({
      ...this._params(),
      status: ContributionStatus.Accepted,
      reviewerIds,
    });
  }

  /**
   * Reviewer rejects: transitions from in_review to rejected.
   */
  reject(reviewerId: string, _reason: string): Contribution {
    if (this.status !== ContributionStatus.InReview) {
      throw new InvalidContributionTransitionError(
        this.status,
        ContributionStatus.Rejected,
        this.id as string
      );
    }
    const reviewerIds = this.reviewerIds.includes(reviewerId.trim())
      ? this.reviewerIds
      : [...this.reviewerIds, reviewerId.trim()];
    return new Contribution({
      ...this._params(),
      status: ContributionStatus.Rejected,
      reviewerIds,
    });
  }

  /**
   * Integrates the contribution after DIP artifact publication. Transitions from accepted to integrated.
   * Returns the updated aggregate and the event to publish.
   */
  merge(dipArtifactId: string): {
    contribution: Contribution;
    event: HubContributionIntegrated;
  } {
    if (this.status !== ContributionStatus.Accepted) {
      throw new InvalidContributionTransitionError(
        this.status,
        ContributionStatus.Integrated,
        this.id as string
      );
    }
    const artifactId = dipArtifactId.trim();
    if (!artifactId) {
      throw new Error("Contribution.merge requires a non-empty dipArtifactId");
    }
    const contribution = new Contribution({
      ...this._params(),
      status: ContributionStatus.Integrated,
      dipArtifactId: artifactId,
    });
    const event: HubContributionIntegrated = {
      type: "hub.contribution.integrated",
      contributionId: this.id as string,
      projectId: this.projectId,
      contributorId: this.contributorId,
      dipArtifactId: artifactId,
      closedIssueIds: [...this.linkedIssueIds],
      occurredAt: new Date(),
    };
    return { contribution, event };
  }

  private _params(): ContributionParams {
    return {
      id: this.id,
      projectId: this.projectId,
      contributorId: this.contributorId,
      title: this.title,
      description: this.description,
      content: this.content,
      status: this.status,
      linkedIssueIds: this.linkedIssueIds,
      dipArtifactId: this.dipArtifactId,
      reviewerIds: this.reviewerIds,
    };
  }
}
