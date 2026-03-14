/**
 * Goal entity — outcome-focused objective with progress and achievement (COMP-029.2).
 * Architecture: Planning domain
 */

export const GoalStatus = {
  Active: "active",
  Achieved: "achieved",
  Abandoned: "abandoned",
} as const;

export type GoalStatusValue =
  (typeof GoalStatus)[keyof typeof GoalStatus];

export interface GoalParams {
  goalId: string;
  userId: string;
  description: string;
  dueDate: Date;
  targetValue: number;
  currentValue: number;
  status: GoalStatusValue;
}

/**
 * Goal entity. Tracks progress toward a target; checkAchievement updates currentValue and status.
 */
export class Goal {
  readonly goalId: string;
  readonly userId: string;
  readonly description: string;
  readonly dueDate: Date;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly status: GoalStatusValue;

  private constructor(params: GoalParams) {
    this.goalId = params.goalId;
    this.userId = params.userId;
    this.description = params.description;
    this.dueDate = params.dueDate;
    this.targetValue = params.targetValue;
    this.currentValue = params.currentValue;
    this.status = params.status;
  }

  /**
   * Progress as ratio of currentValue to targetValue (0–1), or 0 if target is 0.
   */
  get progress(): number {
    if (this.targetValue <= 0) return 0;
    return Math.min(1, this.currentValue / this.targetValue);
  }

  static create(params: {
    goalId: string;
    userId: string;
    description: string;
    dueDate: Date;
    targetValue: number;
  }): Goal {
    if (!params.goalId?.trim()) {
      throw new Error("Goal.goalId cannot be empty");
    }
    if (!params.userId?.trim()) {
      throw new Error("Goal.userId cannot be empty");
    }
    if (typeof params.targetValue !== "number" || params.targetValue < 0) {
      throw new Error("Goal.targetValue must be a non-negative number");
    }
    return new Goal({
      goalId: params.goalId.trim(),
      userId: params.userId.trim(),
      description: params.description?.trim() ?? "",
      dueDate: params.dueDate,
      targetValue: params.targetValue,
      currentValue: 0,
      status: GoalStatus.Active,
    });
  }

  static fromPersistence(params: GoalParams): Goal {
    return new Goal(params);
  }

  /**
   * Updates current value and, if currentValue >= targetValue, transitions to achieved.
   * No-op if already achieved or abandoned.
   */
  checkAchievement(currentValue: number): Goal {
    if (this.status !== GoalStatus.Active) {
      return this;
    }
    const value = typeof currentValue === "number" ? currentValue : 0;
    const achieved =
      this.targetValue > 0 && value >= this.targetValue;
    return new Goal({
      goalId: this.goalId,
      userId: this.userId,
      description: this.description,
      dueDate: this.dueDate,
      targetValue: this.targetValue,
      currentValue: value,
      status: achieved ? GoalStatus.Achieved : GoalStatus.Active,
    });
  }
}
