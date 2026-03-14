/**
 * ModerationAction entity (COMP-031.2).
 * Architecture: Governance & Moderation domain, PAT-004.
 */

import { ActionType, type ActionTypeValue } from "./action-type.js";

export interface ModerationActionParams {
  id: string;
  flagId: string;
  moderatorId: string;
  actionType: ActionTypeValue;
  reason: string;
  createdAt: Date;
}

/**
 * ModerationAction entity. Records a moderator's decision on a ModerationFlag.
 * Immutable; provides audit trail via createdAt and reason.
 */
export class ModerationAction {
  readonly id: string;
  readonly flagId: string;
  readonly moderatorId: string;
  readonly actionType: ActionTypeValue;
  readonly reason: string;
  readonly createdAt: Date;

  private constructor(params: ModerationActionParams) {
    this.id = params.id;
    this.flagId = params.flagId;
    this.moderatorId = params.moderatorId;
    this.actionType = params.actionType;
    this.reason = params.reason;
    this.createdAt = params.createdAt;
  }

  /**
   * Create a new ModerationAction. Caller must ensure moderator role.
   */
  static create(params: {
    id: string;
    flagId: string;
    moderatorId: string;
    actionType: ActionTypeValue;
    reason: string;
    createdAt?: Date;
  }): ModerationAction {
    if (!params.id?.trim()) {
      throw new Error("ModerationAction.id cannot be empty");
    }
    if (!params.flagId?.trim()) {
      throw new Error("ModerationAction.flagId cannot be empty");
    }
    if (!params.moderatorId?.trim()) {
      throw new Error("ModerationAction.moderatorId cannot be empty");
    }
    if (!params.reason?.trim()) {
      throw new Error("ModerationAction.reason cannot be empty");
    }
    if (!Object.values(ActionType).includes(params.actionType)) {
      throw new Error(
        `ModerationAction.actionType must be one of: ${Object.values(ActionType).join(", ")}`
      );
    }
    return new ModerationAction({
      id: params.id,
      flagId: params.flagId,
      moderatorId: params.moderatorId,
      actionType: params.actionType,
      reason: params.reason.trim(),
      createdAt: params.createdAt ?? new Date(),
    });
  }

  /**
   * Reconstruct from persistence.
   */
  static fromPersistence(params: ModerationActionParams): ModerationAction {
    return new ModerationAction(params);
  }
}
