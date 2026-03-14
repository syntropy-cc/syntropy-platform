/**
 * Skill taxonomy and level thresholds (COMP-010.4).
 * Architecture: Platform Core — Portfolio Aggregation.
 *
 * Maps signal counts to SkillLevel. Event payloads may use tags/skills
 * that are normalized to skill names (lowercase, trimmed).
 */

import type { SkillLevel } from "./value-objects.js";

/** Default known skill areas (optional allowlist; event-driven tags are also allowed). */
export const KNOWN_SKILL_AREAS: readonly string[] = [
  "typescript",
  "javascript",
  "research",
  "collaboration",
  "writing",
  "review",
  "mentorship",
];

/**
 * Minimum signal count to reach each level.
 * beginner: 1+, intermediate: 3+, advanced: 7+, expert: 15+
 */
export const SIGNAL_COUNT_TO_LEVEL: ReadonlyArray<{ minSignals: number; level: SkillLevel }> = [
  { minSignals: 0, level: "beginner" },
  { minSignals: 3, level: "intermediate" },
  { minSignals: 7, level: "advanced" },
  { minSignals: 15, level: "expert" },
];

/**
 * Returns SkillLevel for a given signal count using default thresholds.
 */
export function levelFromSignalCount(signalCount: number): SkillLevel {
  if (signalCount < 0) return "beginner";
  let result: SkillLevel = "beginner";
  for (const { minSignals, level } of SIGNAL_COUNT_TO_LEVEL) {
    if (signalCount >= minSignals) result = level;
  }
  return result;
}

/**
 * Normalizes a raw tag/skill string for use as skill name (lowercase, trimmed).
 */
export function normalizeSkillName(raw: string): string {
  return raw.trim().toLowerCase();
}
