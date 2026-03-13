/**
 * UserContextModel aggregate — unified cross-pillar user context.
 * Architecture: COMP-012, orchestration-context-engine
 */

import {
  DEFAULT_SKILL_LEVEL,
  type ActiveGoal,
  type RecentActivityItem,
  type SkillLevel,
  type UserContextUpdateEvent,
  type UserId,
} from "./types.js";
import { UserContextSnapshot } from "./user-context-snapshot.js";

/**
 * Aggregate maintaining a user's cross-pillar context: recent activity, active goals, skill level.
 * Updated via events; produces immutable snapshots for agent session activation.
 */
export class UserContextModel {
  readonly userId: UserId;
  readonly recentActivity: readonly RecentActivityItem[];
  readonly activeGoals: readonly ActiveGoal[];
  readonly skillLevel: SkillLevel;

  private constructor(params: {
    userId: UserId;
    recentActivity: readonly RecentActivityItem[];
    activeGoals: readonly ActiveGoal[];
    skillLevel: SkillLevel;
  }) {
    this.userId = params.userId;
    this.recentActivity = params.recentActivity;
    this.activeGoals = params.activeGoals;
    this.skillLevel = params.skillLevel;
  }

  /**
   * Creates a new UserContextModel.
   *
   * @param params.userId - User identifier
   * @param params.recentActivity - Optional; defaults to empty array
   * @param params.activeGoals - Optional; defaults to empty array
   * @param params.skillLevel - Optional; defaults to DEFAULT_SKILL_LEVEL
   */
  static create(params: {
    userId: UserId;
    recentActivity?: readonly RecentActivityItem[];
    activeGoals?: readonly ActiveGoal[];
    skillLevel?: SkillLevel;
  }): UserContextModel {
    return new UserContextModel({
      userId: params.userId,
      recentActivity: params.recentActivity ?? [],
      activeGoals: params.activeGoals ?? [],
      skillLevel: params.skillLevel ?? DEFAULT_SKILL_LEVEL,
    });
  }

  /**
   * Applies an update event and returns a new UserContextModel (immutable).
   */
  update(event: UserContextUpdateEvent): UserContextModel {
    switch (event.kind) {
      case "activity_added": {
        const next = [...this.recentActivity, event.payload];
        return new UserContextModel({
          userId: this.userId,
          recentActivity: next,
          activeGoals: this.activeGoals,
          skillLevel: this.skillLevel,
        });
      }
      case "goals_updated":
        return new UserContextModel({
          userId: this.userId,
          recentActivity: this.recentActivity,
          activeGoals: [...event.payload],
          skillLevel: this.skillLevel,
        });
      case "skill_level_updated":
        return new UserContextModel({
          userId: this.userId,
          recentActivity: this.recentActivity,
          activeGoals: this.activeGoals,
          skillLevel: event.payload,
        });
    }
  }

  /**
   * Creates an immutable snapshot of this model at the current point in time.
   */
  createSnapshot(capturedAt?: Date): UserContextSnapshot {
    return new UserContextSnapshot({
      userId: this.userId,
      recentActivity: this.recentActivity,
      activeGoals: this.activeGoals,
      skillLevel: this.skillLevel,
      capturedAt,
    });
  }
}
