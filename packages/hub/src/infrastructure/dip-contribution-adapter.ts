/**
 * DIPContributionAdapter — ACL that translates Hub Contribution to DIP Artifact on merge (COMP-019.4).
 * Architecture: Hub Collaboration Layer; DIP concepts do not leak into Hub domain.
 */

import type { Contribution } from "../domain/collaboration/contribution.js";
import type { ArtifactPublisherPort } from "../domain/collaboration/ports/artifact-publisher-port.js";

/**
 * Minimal interface for the external artifact system (DIP). Implemented by app wiring with @syntropy/dip.
 * Keeps Hub package free of DIP dependency; adapter translates Hub contribution to this call.
 */
export interface DipArtifactPublishClient {
  /**
   * Creates and publishes an artifact in the external system.
   * @returns The published artifact id
   */
  publish(params: {
    authorId: string;
    content: string;
    title?: string;
    description?: string;
    projectId?: string;
  }): Promise<string>;
}

/**
 * ACL adapter: translates Hub Contribution to external artifact publish call.
 * Maps contribution fields to artifact params; returns artifact id as string.
 */
export class DIPContributionAdapter implements ArtifactPublisherPort {
  constructor(private readonly dipClient: DipArtifactPublishClient) {}

  async publishContribution(contribution: Contribution): Promise<string> {
    const content =
      typeof contribution.content === "object" && contribution.content !== null
        ? JSON.stringify(contribution.content)
        : String(contribution.content ?? "");
    const body =
      content && content !== "{}" ? content : contribution.description;
    return this.dipClient.publish({
      authorId: contribution.contributorId,
      content: body,
      title: contribution.title,
      description: contribution.description,
      projectId: contribution.projectId,
    });
  }
}
