/**
 * IDEArtifactBridge — publishes IDE output as DIP artifact (COMP-030.5).
 * Architecture: IDE domain, PAT-005, ACL to DIP
 */

import type { IDESession } from "../domain/ide-session.js";
import { IDESessionStatus } from "../domain/ide-session-status.js";
import type { WorkspaceSnapshotFile } from "../domain/workspace-snapshot.js";
import type { DIPArtifactPort } from "../domain/ports/dip-artifact-port.js";

/**
 * Thrown when publish is attempted for a session that is not active.
 */
export class SessionNotActiveError extends Error {
  constructor(
    public readonly sessionId: string,
    public readonly status: string
  ) {
    super(
      `Cannot publish artifact: session ${sessionId} is not active (status: ${status})`
    );
    this.name = "SessionNotActiveError";
    Object.setPrototypeOf(this, SessionNotActiveError.prototype);
  }
}

/**
 * Bridge that publishes IDE workspace files as a DIP artifact.
 * Validates session is active, then delegates to DIP via ACL port.
 */
export class IDEArtifactBridge {
  constructor(private readonly dipPort: DIPArtifactPort) {}

  /**
   * Publishes the given files as a DIP artifact for the session.
   * Session must be active.
   *
   * @param session - Current IDE session (must be active)
   * @param files - Files to publish (path + content)
   * @returns The created DIP artifact ID
   * @throws SessionNotActiveError if session is not active
   */
  async publish(
    session: IDESession,
    files: readonly WorkspaceSnapshotFile[]
  ): Promise<string> {
    if (session.status !== IDESessionStatus.Active) {
      throw new SessionNotActiveError(session.sessionId, session.status);
    }

    const result = await this.dipPort.publish({
      sessionId: session.sessionId,
      userId: session.userId,
      files,
      metadata: {
        projectId: session.projectId,
      },
    });

    return result.artifactId;
  }
}
