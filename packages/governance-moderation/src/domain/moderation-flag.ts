/**
 * ModerationFlag aggregate (COMP-031.1).
 * Architecture: Governance & Moderation domain, PAT-004.
 */

import {
  FlagStatus,
  type FlagStatusValue,
} from "./flag-status.js";

export interface ModerationFlagParams {
  flagId: string;
  entityType: string;
  entityId: string;
  reason: string;
  status: FlagStatusValue;
  createdAt?: Date;
}

/**
 * ModerationFlag aggregate. Represents a single content moderation flag.
 * Immutable; state transitions return new instances.
 */
export class ModerationFlag {
  readonly flagId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly reason: string;
  readonly status: FlagStatusValue;
  readonly createdAt: Date;

  private constructor(params: ModerationFlagParams) {
    this.flagId = params.flagId;
    this.entityType = params.entityType;
    this.entityId = params.entityId;
    this.reason = params.reason;
    this.status = params.status;
    this.createdAt = params.createdAt ?? new Date();
  }

  /**
   * Create a new ModerationFlag in Pending status.
   */
  static create(params: {
    flagId: string;
    entityType: string;
    entityId: string;
    reason: string;
  }): ModerationFlag {
    const trimmed = params.reason?.trim() ?? "";
    if (!trimmed) {
      throw new Error("ModerationFlag.reason cannot be empty");
    }
    if (!params.entityType?.trim()) {
      throw new Error("ModerationFlag.entityType cannot be empty");
    }
    if (!params.entityId?.trim()) {
      throw new Error("ModerationFlag.entityId cannot be empty");
    }
    if (!params.flagId?.trim()) {
      throw new Error("ModerationFlag.flagId cannot be empty");
    }
    return new ModerationFlag({
      flagId: params.flagId,
      entityType: params.entityType,
      entityId: params.entityId,
      reason: trimmed,
      status: FlagStatus.Pending,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstruct from persistence.
   */
  static fromPersistence(params: ModerationFlagParams): ModerationFlag {
    return new ModerationFlag(params);
  }

  /**
   * Transition to under_review (e.g. when a moderator starts reviewing).
   */
  startReview(): ModerationFlag {
    if (this.status !== FlagStatus.Pending) {
      throw new Error(
        `Cannot start review: flag is in status '${this.status}', expected 'pending'`
      );
    }
    return new ModerationFlag({
      ...this,
      status: FlagStatus.UnderReview,
    });
  }

  /**
   * Transition to resolved.
   */
  resolve(): ModerationFlag {
    if (this.status !== FlagStatus.Pending && this.status !== FlagStatus.UnderReview) {
      throw new Error(
        `Cannot resolve: flag is in status '${this.status}'`
      );
    }
    return new ModerationFlag({
      ...this,
      status: FlagStatus.Resolved,
    });
  }

  /**
   * Transition to dismissed.
   */
  dismiss(): ModerationFlag {
    if (this.status !== FlagStatus.Pending && this.status !== FlagStatus.UnderReview) {
      throw new Error(
        `Cannot dismiss: flag is in status '${this.status}'`
      );
    }
    return new ModerationFlag({
      ...this,
      status: FlagStatus.Dismissed,
    });
  }
}
