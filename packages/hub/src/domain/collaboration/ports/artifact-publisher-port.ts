/**
 * ArtifactPublisherPort — publish Hub Contribution as external artifact (COMP-019.4).
 * Architecture: Hub Collaboration Layer, ACL; implementation translates to DIP artifact.
 */

import type { Contribution } from "../contribution.js";

/**
 * Hub-facing port for publishing a contribution as an artifact.
 * Returns the published artifact id (opaque string; no DIP types in domain).
 */
export interface ArtifactPublisherPort {
  /**
   * Publishes the contribution as an artifact in the external system (DIP).
   * @param contribution - Accepted contribution to publish
   * @returns The published artifact id
   */
  publishContribution(contribution: Contribution): Promise<string>;
}
