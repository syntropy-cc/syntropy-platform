/**
 * Unit tests for ReputationService (COMP-010.5).
 */

import { describe, it, expect } from "vitest";
import { calculate } from "./services/reputation-service.js";

function signals(overrides: Partial<{
  contributionCount: number;
  reviewScore: number;
  peerFeedbackScore: number;
  lastActivityAt: Date;
}> = {}): { contributionCount: number; reviewScore: number; peerFeedbackScore: number; lastActivityAt: Date } {
  const now = new Date();
  return {
    contributionCount: 0,
    reviewScore: 0,
    peerFeedbackScore: 0,
    lastActivityAt: now,
    ...overrides,
  };
}

describe("ReputationService", () => {
  it("returns zero when all signals are zero", () => {
    const score = calculate(signals());
    expect(score.value).toBe(0);
  });

  it("applies contribution weight and caps at 1", () => {
    const score = calculate(
      signals({ contributionCount: 100, reviewScore: 0, peerFeedbackScore: 0 })
    );
    expect(score.value).toBeGreaterThan(0);
    expect(score.value).toBeLessThanOrEqual(1);
    expect(score.value).toBeCloseTo(0.4, 5);
  });

  it("applies review and peer feedback weights", () => {
    const score = calculate(
      signals({
        contributionCount: 0,
        reviewScore: 1,
        peerFeedbackScore: 1,
      })
    );
    expect(score.value).toBeCloseTo(0.35 + 0.25, 5);
  });

  it("clamps total to 1.0", () => {
    const score = calculate(
      signals({
        contributionCount: 200,
        reviewScore: 1,
        peerFeedbackScore: 1,
      })
    );
    expect(score.value).toBe(1);
  });

  it("applies time decay when lastActivityAt is older than 180 days", () => {
    const now = new Date("2025-01-01T12:00:00Z");
    const lastActivity = new Date("2024-01-01T12:00:00Z");
    const activeSignals = signals({
      contributionCount: 50,
      reviewScore: 1,
      peerFeedbackScore: 1,
      lastActivityAt: lastActivity,
    });
    const scoreWithDecay = calculate(activeSignals, now);
    const scoreNoDecay = calculate(
      signals({
        ...activeSignals,
        lastActivityAt: now,
      }),
      now
    );
    expect(scoreWithDecay.value).toBeLessThan(scoreNoDecay.value);
    expect(scoreWithDecay.value).toBeGreaterThan(0);
  });

  it("returns same score when lastActivityAt is within 180 days", () => {
    const now = new Date("2025-01-01T12:00:00Z");
    const lastActivity = new Date("2024-12-01T12:00:00Z");
    const s = signals({
      contributionCount: 10,
      reviewScore: 0.5,
      peerFeedbackScore: 0.5,
      lastActivityAt: lastActivity,
    });
    const score = calculate(s, now);
    expect(score.value).toBeGreaterThan(0);
    expect(score.value).toBeLessThanOrEqual(1);
  });
});
