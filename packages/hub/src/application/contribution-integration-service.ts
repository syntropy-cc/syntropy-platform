/**
 * ContributionIntegrationService — orchestrates merge: publish DIP artifact, update contribution, close issues (COMP-019.5).
 * Architecture: Hub Collaboration Layer
 */

import type { ContributionId } from "../domain/collaboration/value-objects/contribution-id.js";
import { ContributionStatus } from "../domain/collaboration/contribution-status.js";
import type { HubContributionIntegrated, HubIssueClosed } from "../domain/collaboration/events.js";
import type { ArtifactPublisherPort } from "../domain/collaboration/ports/artifact-publisher-port.js";
import type { ContributionRepositoryPort } from "../domain/collaboration/ports/contribution-repository-port.js";
import type { IssueRepositoryPort } from "../domain/collaboration/ports/issue-repository-port.js";
import { createContributionId } from "../domain/collaboration/value-objects/contribution-id.js";

/**
 * Result of a successful merge. Caller is responsible for publishing events.
 */
export interface MergeResult {
  integratedEvent: HubContributionIntegrated;
  closedIssueEvents: HubIssueClosed[];
}

/**
 * Thrown when contribution is not found or not in Accepted status.
 */
export class ContributionNotReadyForMergeError extends Error {
  constructor(
    public readonly contributionId: string,
    reason: string
  ) {
    super(`Contribution ${contributionId} cannot be merged: ${reason}`);
    this.name = "ContributionNotReadyForMergeError";
    Object.setPrototypeOf(this, ContributionNotReadyForMergeError.prototype);
  }
}

/**
 * Orchestrates contribution integration: publish artifact, merge contribution, close linked issues.
 * Transaction boundary is the caller's responsibility (COMP-019.7 adds persistence).
 */
export class ContributionIntegrationService {
  constructor(
    private readonly artifactPublisher: ArtifactPublisherPort,
    private readonly contributionRepo: ContributionRepositoryPort,
    private readonly issueRepo: IssueRepositoryPort
  ) {}

  /**
   * Merges an accepted contribution: publishes to DIP, updates contribution to integrated, closes linked issues.
   * @param contributionId - Id of the contribution to merge
   * @returns Events to publish (integrated + issue closed)
   */
  async merge(
    contributionId: ContributionId | string
  ): Promise<MergeResult> {
    const id =
      typeof contributionId === "string"
        ? createContributionId(contributionId)
        : contributionId;

    const contribution = await this.contributionRepo.getById(id);
    if (!contribution) {
      throw new ContributionNotReadyForMergeError(
        id as string,
        "contribution not found"
      );
    }
    if (contribution.status !== ContributionStatus.Accepted) {
      throw new ContributionNotReadyForMergeError(
        id as string,
        `expected status accepted, got ${contribution.status}`
      );
    }

    const artifactId = await this.artifactPublisher.publishContribution(
      contribution
    );
    const { contribution: merged, event: integratedEvent } =
      contribution.merge(artifactId);

    await this.contributionRepo.save(merged);

    const closedIssueEvents: HubIssueClosed[] = [];
    if (contribution.linkedIssueIds.length > 0) {
      const issues = await this.issueRepo.getByIds(contribution.linkedIssueIds);
      const resolution = `Integrated as artifact ${artifactId}`;
      for (const issue of issues) {
        const { issue: closedIssue, event: closedEvent } =
          issue.close(resolution);
        await this.issueRepo.save(closedIssue);
        closedIssueEvents.push(closedEvent);
      }
    }

    return { integratedEvent, closedIssueEvents };
  }
}
