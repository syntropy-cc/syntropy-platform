/**
 * AchievementUnlocked domain event (COMP-010.3).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

export const ACHIEVEMENT_UNLOCKED = "platform_core.achievement.unlocked" as const;

export interface AchievementUnlockedPayload {
  userId: string;
  achievementType: string;
  unlockedAt: string; // ISO date
}

export interface AchievementUnlockedEvent {
  type: typeof ACHIEVEMENT_UNLOCKED;
  payload: AchievementUnlockedPayload;
}

export function createAchievementUnlockedEvent(
  userId: string,
  achievementType: string,
  unlockedAt: Date = new Date()
): AchievementUnlockedEvent {
  return {
    type: ACHIEVEMENT_UNLOCKED,
    payload: {
      userId,
      achievementType,
      unlockedAt: unlockedAt.toISOString(),
    },
  };
}
