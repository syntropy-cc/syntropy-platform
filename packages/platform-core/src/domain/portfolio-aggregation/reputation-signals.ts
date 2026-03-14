/**
 * ReputationSignals — input for ReputationService (COMP-010.5).
 * Architecture: Platform Core — Portfolio Aggregation.
 *
 * Weighted components: contributions (40%), review quality (35%), peer feedback (25%).
 * lastActivityAt is used for time decay when older than 180 days.
 */

export interface ReputationSignals {
  /** Number of contributions (e.g. merged PRs, published artifacts). */
  readonly contributionCount: number;
  /** Normalized review quality score in [0, 1] (e.g. acceptance rate, rating). */
  readonly reviewScore: number;
  /** Normalized peer feedback score in [0, 1]. */
  readonly peerFeedbackScore: number;
  /** Last activity timestamp for decay; if older than 180 days, score is decayed. */
  readonly lastActivityAt: Date;
}

export const REPUTATION_WEIGHTS = {
  contribution: 0.4,
  review: 0.35,
  peerFeedback: 0.25,
} as const;

/** Days of inactivity after which exponential decay applies. */
export const DECAY_AFTER_DAYS = 180;
