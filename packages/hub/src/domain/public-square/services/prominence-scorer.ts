/**
 * ProminenceScorer — computes weighted prominence score for discovery ranking (COMP-021.2).
 *
 * Weights: artifact count 30%, contributor count 25%, governance activity 20%,
 * recent contributions 15%, cross-links 10%. Time-decayed so older activity weighs less.
 * Score normalized to [0, 100].
 */

/** Input signals used to compute prominence. All counts are non-negative. */
export interface ProminenceSignals {
  artifactCount: number;
  contributorCount: number;
  governanceActivity: number;
  recentContributionsCount: number;
  crossLinksCount: number;
  /** Optional: last activity timestamp for time decay. If absent, no decay applied. */
  lastActivityAt?: string; // ISO timestamp
}

/** Weights per Implementation Plan Section 7 (sum = 1). */
export const PROMINENCE_WEIGHTS = {
  artifact: 0.3,
  contributor: 0.25,
  governance: 0.2,
  recentContributions: 0.15,
  crossLinks: 0.1,
} as const;

/** Cap each component at this value for normalization (prevents one signal from dominating). */
const NORMALIZATION_CAPS = {
  artifact: 100,
  contributor: 50,
  governance: 20,
  recentContributions: 30,
  crossLinks: 25,
} as const;

/** Decay half-life in days: after this many days, weight is halved. */
const DECAY_HALF_LIFE_DAYS = 30;

const MAX_SCORE = 100;

/**
 * Normalizes a raw count to [0, 1] using cap (min(count/cap, 1)).
 */
function normalizeComponent(value: number, cap: number): number {
  if (cap <= 0) return 0;
  const v = Math.max(0, value);
  return Math.min(v / cap, 1);
}

/**
 * Time decay factor in [0, 1]. Older lastActivityAt yields lower factor.
 * Uses exponential decay: factor = 0.5^(daysSinceActivity / DECAY_HALF_LIFE_DAYS).
 *
 * @param lastActivityAt - ISO timestamp of last activity
 * @param referenceDate - Reference "now" for tests
 */
export function timeDecayFactor(
  lastActivityAt: string,
  referenceDate: Date = new Date()
): number {
  const last = new Date(lastActivityAt).getTime();
  const ref = referenceDate.getTime();
  const daysSince = Math.max(0, (ref - last) / (24 * 60 * 60 * 1000));
  return Math.pow(0.5, daysSince / DECAY_HALF_LIFE_DAYS);
}

/**
 * Computes prominence score from signals.
 * Weights: artifact 30%, contributor 25%, governance 20%, recent contributions 15%, cross-links 10%.
 * Each component is normalized by a cap, then time decay is applied when lastActivityAt is set.
 *
 * @param signals - Raw counts and optional lastActivityAt
 * @param referenceDate - Optional "now" for time decay (tests)
 * @returns Score in [0, MAX_SCORE]
 */
export function computeProminenceScore(
  signals: ProminenceSignals,
  referenceDate: Date = new Date()
): number {
  const w = PROMINENCE_WEIGHTS;
  const caps = NORMALIZATION_CAPS;

  const artifactNorm = normalizeComponent(signals.artifactCount, caps.artifact);
  const contributorNorm = normalizeComponent(signals.contributorCount, caps.contributor);
  const governanceNorm = normalizeComponent(signals.governanceActivity, caps.governance);
  const recentNorm = normalizeComponent(signals.recentContributionsCount, caps.recentContributions);
  const crossLinksNorm = normalizeComponent(signals.crossLinksCount, caps.crossLinks);

  let rawScore =
    w.artifact * artifactNorm +
    w.contributor * contributorNorm +
    w.governance * governanceNorm +
    w.recentContributions * recentNorm +
    w.crossLinks * crossLinksNorm;

  if (signals.lastActivityAt) {
    const decay = timeDecayFactor(signals.lastActivityAt, referenceDate);
    rawScore *= decay;
  }

  return Math.round(Math.min(rawScore * MAX_SCORE, MAX_SCORE) * 100) / 100;
}

/**
 * Domain service that computes prominence score for an institution.
 * Delegates to computeProminenceScore; allows dependency injection of clock for tests.
 */
export class ProminenceScorer {
  constructor(private readonly now: () => Date = () => new Date()) {}

  /**
   * Returns prominence score in [0, 100] for the given signals.
   */
  score(signals: ProminenceSignals): number {
    return computeProminenceScore(signals, this.now());
  }
}
