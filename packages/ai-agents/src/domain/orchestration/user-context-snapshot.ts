/**
 * UserContextSnapshot — immutable point-in-time copy of UserContextModel.
 * Architecture: COMP-012, orchestration-context-engine
 */

import type { ActiveGoal, RecentActivityItem, SkillLevel, UserId } from "./types.js";

/**
 * Immutable snapshot of a user's context at a point in time.
 * Used at agent session activation; snapshot does not change for the session lifetime.
 */
export class UserContextSnapshot {
  readonly userId: UserId;
  readonly recentActivity: readonly RecentActivityItem[];
  readonly activeGoals: readonly ActiveGoal[];
  readonly skillLevel: SkillLevel;
  readonly capturedAt: Date;

  constructor(params: {
    userId: UserId;
    recentActivity: readonly RecentActivityItem[];
    activeGoals: readonly ActiveGoal[];
    skillLevel: SkillLevel;
    capturedAt?: Date;
  }) {
    this.userId = params.userId;
    this.recentActivity = [...params.recentActivity];
    this.activeGoals = [...params.activeGoals];
    this.skillLevel = params.skillLevel;
    this.capturedAt = params.capturedAt ?? new Date();
  }
}
