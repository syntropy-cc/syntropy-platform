/**
 * XP weights by event type and level thresholds (COMP-010.2).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

/** Default XP awarded per event type. */
export const DEFAULT_XP_WEIGHTS: Record<string, number> = {
  artifact_published: 50,
  contribution_merged: 30,
  "learn.fragment.artifact_published": 50,
  "hub.contribution.integrated": 75,
  "labs.review.submitted": 30,
  "learn.track.completed": 200,
  "labs.article.published": 150,
};

/** Level thresholds: level N is reached at this total XP. */
export const LEVEL_THRESHOLDS: number[] = [
  0,    // level 1
  100,  // level 2
  250,  // level 3
  500,  // level 4
  1000, // level 5
  2500, // level 6
  5000, // level 7
  10000, // level 8
];

/**
 * Returns level (1-based) for a given total XP.
 */
export function levelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}
