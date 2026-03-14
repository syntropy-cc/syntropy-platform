/**
 * Port for publishing a Fragment as a DIP artifact (COMP-016.4).
 * Architecture: fragment-artifact-engine.md, ACL to DIP.
 */

import type { Fragment } from "../fragment.js";

/**
 * Implemented by LearnArtifactBridge. Publishes fragment content to DIP
 * and returns the published artifact id. No DIP types in signature.
 */
export interface ArtifactPublisherPort {
  publish(fragment: Fragment): Promise<string>;
}
