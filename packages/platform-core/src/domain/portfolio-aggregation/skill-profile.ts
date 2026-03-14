/**
 * SkillProfile — computed skill view for a user (COMP-010.4).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

import type { SkillRecord } from "./skill-record.js";

export interface SkillProfile {
  readonly userId: string;
  readonly skills: readonly SkillRecord[];
}

/**
 * Creates a SkillProfile from userId and skill records.
 */
export function createSkillProfile(
  userId: string,
  skills: readonly SkillRecord[] = []
): SkillProfile {
  if (!userId?.trim()) {
    throw new Error("userId cannot be empty");
  }
  return {
    userId: userId.trim(),
    skills: [...skills],
  };
}
