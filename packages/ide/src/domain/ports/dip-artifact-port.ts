/**
 * DIP Artifact Port — ACL boundary for publishing IDE output as DIP artifact (COMP-030.5).
 * Architecture: IDE domain, PAT-005, ARCH-002
 */

import type { WorkspaceSnapshotFile } from "../workspace-snapshot.js";

/** Input for publishing IDE files as a DIP artifact. */
export interface PublishArtifactParams {
  readonly sessionId: string;
  readonly userId: string;
  readonly files: readonly WorkspaceSnapshotFile[];
  readonly metadata?: {
    readonly projectId?: string | null;
    readonly title?: string;
  };
}

/** Result of a successful publish. */
export interface PublishArtifactResult {
  readonly artifactId: string;
}

/**
 * Port for publishing IDE workspace output to the DIP Artifact Registry.
 * Implemented by an ACL adapter that translates IDE concepts to DIP protocol.
 */
export interface DIPArtifactPort {
  /**
   * Publishes the given files as a DIP artifact. Returns the new artifact ID.
   *
   * @param params - Session, user, files, and optional metadata
   * @returns The created artifact ID
   */
  publish(params: PublishArtifactParams): Promise<PublishArtifactResult>;
}
