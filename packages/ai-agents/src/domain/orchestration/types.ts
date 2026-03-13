/**
 * Domain value types for UserContextModel and context update events.
 * Architecture: COMP-012, orchestration-context-engine
 */

/** User identifier. */
export type UserId = string;

/** Single recent activity entry (e.g. fragment completed, contribution submitted). */
export interface RecentActivityItem {
  readonly id: string;
  readonly type: string;
  readonly at: Date;
  readonly payload?: unknown;
}

/** Active goal for the user (e.g. complete track, submit article). */
export interface ActiveGoal {
  readonly id: string;
  readonly title: string;
  readonly pillar?: string;
}

/** Skill level for personalization and recommendations. */
export type SkillLevel = "beginner" | "intermediate" | "advanced";

/** Default skill level when not set. */
export const DEFAULT_SKILL_LEVEL: SkillLevel = "beginner";

/** Discriminated union of events that update UserContextModel. */
export type UserContextUpdateEvent =
  | { kind: "activity_added"; payload: RecentActivityItem }
  | { kind: "goals_updated"; payload: readonly ActiveGoal[] }
  | { kind: "skill_level_updated"; payload: SkillLevel };
