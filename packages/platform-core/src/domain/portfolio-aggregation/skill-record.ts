/**
 * SkillRecord entity — skill name, level, evidence (COMP-010.1).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

import type { SkillLevel } from "./value-objects.js";

export interface SkillRecord {
  readonly skillName: string;
  readonly level: SkillLevel;
  readonly evidenceEventIds: string[];
}

export function createSkillRecord(
  skillName: string,
  level: SkillLevel,
  evidenceEventIds: string[] = []
): SkillRecord {
  if (!skillName?.trim()) {
    throw new Error("skillName cannot be empty");
  }
  return {
    skillName: skillName.trim(),
    level,
    evidenceEventIds: [...evidenceEventIds],
  };
}
