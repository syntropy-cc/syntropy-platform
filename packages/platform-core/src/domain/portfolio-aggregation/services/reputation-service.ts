/**
 * ReputationService — computes ReputationScore from signals (COMP-010.5).
 * Architecture: Platform Core — Portfolio Aggregation.
 *
 * Weighted formula: contributions 40%, review quality 35%, peer feedback 25%.
 * Score clamped to [0, 1]. Time decay applied when lastActivityAt > 180 days.
 */

import { ReputationScore } from "../value-objects.js";
import type { ReputationSignals } from "../reputation-signals.js";
import {
  REPUTATION_WEIGHTS,
  DECAY_AFTER_DAYS,
} from "../reputation-signals.js";

/**
 * Normalizes contribution count to a [0, 1] component (e.g. cap at 100 contributions).
 */
const CONTRIBUTION_CAP = 100;

function contributionComponent(count: number): number {
  if (count <= 0) return 0;
  return Math.min(1, count / CONTRIBUTION_CAP);
}

/**
 * Computes decay factor: 1.0 if within DECAY_AFTER_DAYS, else exponential decay.
 * Using half-life style: after 180 days inactive, factor = 0.5; after 360, 0.25.
 */
function decayFactor(lastActivityAt: Date, now: Date = new Date()): number {
  const elapsedMs = now.getTime() - lastActivityAt.getTime();
  const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);
  if (elapsedDays <= DECAY_AFTER_DAYS) return 1;
  const periods = (elapsedDays - DECAY_AFTER_DAYS) / DECAY_AFTER_DAYS;
  return Math.pow(0.5, periods);
}

/**
 * Calculates ReputationScore from reputation signals.
 * Applies weights, clamps to [0, 1], then applies time decay if lastActivityAt > 180 days.
 *
 * @param signals - Contribution count, review score, peer feedback score, last activity date
 * @param asOfDate - Optional date to use as "now" for decay (for tests); defaults to new Date()
 * @returns ReputationScore in [0, 1]
 */
export function calculate(
  signals: ReputationSignals,
  asOfDate?: Date
): ReputationScore {
  const c = contributionComponent(signals.contributionCount);
  const r = Math.max(0, Math.min(1, signals.reviewScore));
  const p = Math.max(0, Math.min(1, signals.peerFeedbackScore));

  const raw =
    REPUTATION_WEIGHTS.contribution * c +
    REPUTATION_WEIGHTS.review * r +
    REPUTATION_WEIGHTS.peerFeedback * p;

  const now = asOfDate ?? new Date();
  const factor = decayFactor(signals.lastActivityAt, now);
  const value = Math.max(0, Math.min(1, raw * factor));
  return ReputationScore.create(value);
}

/**
 * ReputationService (COMP-010.5). Use calculate() or instance method.
 */
export class ReputationService {
  calculate(signals: ReputationSignals, asOfDate?: Date): ReputationScore {
    return calculate(signals, asOfDate);
  }
}
