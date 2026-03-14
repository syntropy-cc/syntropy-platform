/**
 * Achievement entity — unlocked once per type (COMP-010.1).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

export interface Achievement {
  readonly achievementType: string;
  readonly unlockedAt: Date;
}

export function createAchievement(
  achievementType: string,
  unlockedAt: Date = new Date()
): Achievement {
  if (!achievementType?.trim()) {
    throw new Error("achievementType cannot be empty");
  }
  return {
    achievementType: achievementType.trim(),
    unlockedAt: unlockedAt instanceof Date ? unlockedAt : new Date(unlockedAt),
  };
}
