/**
 * IDESessionProvisioningService — orchestrates container provision and suspend (COMP-030.6).
 * Architecture: IDE domain, application layer
 */

import { IDESession } from "../domain/ide-session.js";
import { IDESessionStatus } from "../domain/ide-session-status.js";
import { WorkspaceSnapshot } from "../domain/workspace-snapshot.js";
import type { WorkspaceSnapshotFile } from "../domain/workspace-snapshot.js";
import type { ContainerOrchestrator } from "../domain/ports/container-orchestrator.js";
import type { IDESessionRepository } from "../domain/ports/ide-session-repository.js";
import type { WorkspaceSnapshotRepository } from "../domain/ports/workspace-snapshot-repository.js";
import type { IDEEventPublisher } from "../domain/ports/ide-event-publisher.js";

const DEFAULT_IMAGE = "ide-workspace:latest";
const DEFAULT_CPU = 1;
const DEFAULT_MEMORY_MB = 512;

/**
 * Thrown when a session is not found by id.
 */
export class SessionNotFoundError extends Error {
  constructor(public readonly sessionId: string) {
    super(`IDE session not found: ${sessionId}`);
    this.name = "SessionNotFoundError";
    Object.setPrototypeOf(this, SessionNotFoundError.prototype);
  }
}

/**
 * Thrown when suspend is called but session has no container or is not active.
 */
export class SessionNotSuspensibleError extends Error {
  constructor(
    public readonly sessionId: string,
    message: string
  ) {
    super(message);
    this.name = "SessionNotSuspensibleError";
    Object.setPrototypeOf(this, SessionNotSuspensibleError.prototype);
  }
}

/**
 * Service that provisions containers for IDE sessions and handles suspend (snapshot + stop).
 */
export class IDESessionProvisioningService {
  constructor(
    private readonly sessionRepository: IDESessionRepository,
    private readonly snapshotRepository: WorkspaceSnapshotRepository,
    private readonly containerOrchestrator: ContainerOrchestrator,
    private readonly eventPublisher: IDEEventPublisher
  ) {}

  /**
   * Provisions a container for the session, updates session status, and emits ContainerProvisioned.
   *
   * @param sessionId - ID of the session to start
   * @returns The updated session (active with containerId set)
   * @throws SessionNotFoundError if session does not exist
   */
  async start(sessionId: string): Promise<IDESession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    const container = await this.containerOrchestrator.provision({
      image: DEFAULT_IMAGE,
      cpuLimit: DEFAULT_CPU,
      memoryLimit: DEFAULT_MEMORY_MB,
    });

    const updated = session.withContainerStarted(container.containerId);
    await this.sessionRepository.save(updated);

    await this.eventPublisher.publish({
      type: "ide.container.provisioned",
      sessionId,
      containerId: container.containerId,
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Stops the session's container and saves a workspace snapshot.
   *
   * @param sessionId - ID of the session to suspend
   * @param files - Current workspace files to persist in the snapshot
   * @returns The updated session (suspended)
   * @throws SessionNotFoundError if session does not exist
   * @throws SessionNotSuspensibleError if session is not active or has no container
   */
  async suspend(
    sessionId: string,
    files: readonly WorkspaceSnapshotFile[]
  ): Promise<IDESession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }
    if (session.status !== IDESessionStatus.Active) {
      throw new SessionNotSuspensibleError(
        sessionId,
        `Cannot suspend session in status ${session.status}; expected active`
      );
    }
    if (!session.containerId) {
      throw new SessionNotSuspensibleError(
        sessionId,
        "Cannot suspend session without a container"
      );
    }

    await this.containerOrchestrator.stop(session.containerId);

    const snapshot = WorkspaceSnapshot.create(sessionId, files);
    await this.snapshotRepository.save(snapshot);

    const suspended = session.suspend();
    await this.sessionRepository.save(suspended);

    return suspended;
  }
}
