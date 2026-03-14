/**
 * IDESession aggregate — lifecycle and transitions (COMP-030.1).
 * Architecture: IDE domain, PAT-004
 */

import {
  IDESessionStatus,
  type IDESessionStatusValue,
} from "./ide-session-status.js";

export interface IDESessionParams {
  sessionId: string;
  userId: string;
  projectId: string | null;
  status: IDESessionStatusValue;
  containerId: string | null;
  workspaceId: string | null;
  startedAt: Date | null;
  lastActiveAt: Date | null;
  terminatedAt: Date | null;
}

/**
 * IDESession aggregate. Lifecycle: pending → provisioning → active;
 * active → suspended; active | suspended → terminated.
 */
export class IDESession {
  readonly sessionId: string;
  readonly userId: string;
  readonly projectId: string | null;
  readonly status: IDESessionStatusValue;
  readonly containerId: string | null;
  readonly workspaceId: string | null;
  readonly startedAt: Date | null;
  readonly lastActiveAt: Date | null;
  readonly terminatedAt: Date | null;

  private constructor(params: IDESessionParams) {
    this.sessionId = params.sessionId;
    this.userId = params.userId;
    this.projectId = params.projectId;
    this.status = params.status;
    this.containerId = params.containerId;
    this.workspaceId = params.workspaceId;
    this.startedAt = params.startedAt;
    this.lastActiveAt = params.lastActiveAt;
    this.terminatedAt = params.terminatedAt;
  }

  /**
   * Creates a new IDESession in pending status.
   */
  static create(params: {
    sessionId: string;
    userId: string;
    projectId?: string | null;
  }): IDESession {
    if (!params.sessionId?.trim()) {
      throw new Error("IDESession.sessionId cannot be empty");
    }
    if (!params.userId?.trim()) {
      throw new Error("IDESession.userId cannot be empty");
    }
    return new IDESession({
      sessionId: params.sessionId.trim(),
      userId: params.userId.trim(),
      projectId: params.projectId?.trim() ?? null,
      status: IDESessionStatus.Pending,
      containerId: null,
      workspaceId: null,
      startedAt: null,
      lastActiveAt: null,
      terminatedAt: null,
    });
  }

  /**
   * Reconstructs from persistence.
   */
  static fromPersistence(params: IDESessionParams): IDESession {
    return new IDESession(params);
  }

  /**
   * Transitions from pending to provisioning (or active if no container step).
   */
  start(): IDESession {
    if (this.status === IDESessionStatus.Pending) {
      const now = new Date();
      return new IDESession({
        ...this.toParams(),
        status: IDESessionStatus.Active,
        startedAt: now,
        lastActiveAt: now,
      });
    }
    if (this.status === IDESessionStatus.Provisioning) {
      const now = new Date();
      return new IDESession({
        ...this.toParams(),
        status: IDESessionStatus.Active,
        startedAt: this.startedAt ?? now,
        lastActiveAt: now,
      });
    }
    throw new Error(
      `Cannot start session in status ${this.status}; expected pending or provisioning`
    );
  }

  /**
   * Transitions from active to suspended.
   */
  suspend(): IDESession {
    if (this.status !== IDESessionStatus.Active) {
      throw new Error(
        `Cannot suspend session in status ${this.status}; expected active`
      );
    }
    const now = new Date();
    return new IDESession({
      ...this.toParams(),
      status: IDESessionStatus.Suspended,
      lastActiveAt: now,
    });
  }

  /**
   * Transitions from active or suspended to terminated.
   */
  terminate(_reason?: string): IDESession {
    if (
      this.status !== IDESessionStatus.Active &&
      this.status !== IDESessionStatus.Suspended
    ) {
      throw new Error(
        `Cannot terminate session in status ${this.status}; expected active or suspended`
      );
    }
    const now = new Date();
    return new IDESession({
      ...this.toParams(),
      status: IDESessionStatus.Terminated,
      terminatedAt: now,
    });
  }

  private toParams(): IDESessionParams {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      projectId: this.projectId,
      status: this.status,
      containerId: this.containerId,
      workspaceId: this.workspaceId,
      startedAt: this.startedAt,
      lastActiveAt: this.lastActiveAt,
      terminatedAt: this.terminatedAt,
    };
  }
}
