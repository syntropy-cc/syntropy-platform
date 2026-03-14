/**
 * Unit tests for ProminenceScorer (COMP-021.2).
 */

import { describe, it, expect } from "vitest";
import {
  computeProminenceScore,
  timeDecayFactor,
  PROMINENCE_WEIGHTS,
  ProminenceScorer,
  type ProminenceSignals,
} from "../../../src/domain/public-square/services/prominence-scorer.js";

const emptySignals: ProminenceSignals = {
  artifactCount: 0,
  contributorCount: 0,
  governanceActivity: 0,
  recentContributionsCount: 0,
  crossLinksCount: 0,
};

describe("ProminenceScorer", () => {
  describe("computeProminenceScore", () => {
    it("returns 0 when all signals are zero", () => {
      const score = computeProminenceScore(emptySignals);
      expect(score).toBe(0);
    });

    it("applies artifact weight 30% when only artifact count is non-zero", () => {
      // At cap (100), artifact contributes 0.3 * 1 = 0.3 -> 30
      const score = computeProminenceScore({
        ...emptySignals,
        artifactCount: 100,
      });
      expect(score).toBe(30);
    });

    it("applies contributor weight 25% when only contributor count is non-zero", () => {
      const score = computeProminenceScore({
        ...emptySignals,
        contributorCount: 50,
      });
      expect(score).toBe(25);
    });

    it("applies governance weight 20% when only governance activity is non-zero", () => {
      const score = computeProminenceScore({
        ...emptySignals,
        governanceActivity: 20,
      });
      expect(score).toBe(20);
    });

    it("applies recent contributions weight 15% when only recent contributions non-zero", () => {
      const score = computeProminenceScore({
        ...emptySignals,
        recentContributionsCount: 30,
      });
      expect(score).toBe(15);
    });

    it("applies cross-links weight 10% when only cross-links non-zero", () => {
      const score = computeProminenceScore({
        ...emptySignals,
        crossLinksCount: 25,
      });
      expect(score).toBe(10);
    });

    it("normalizes each component by cap and sums weighted score", () => {
      const score = computeProminenceScore({
        artifactCount: 50, // 50/100 = 0.5 -> 0.15
        contributorCount: 25, // 25/50 = 0.5 -> 0.125
        governanceActivity: 10, // 10/20 = 0.5 -> 0.1
        recentContributionsCount: 15, // 15/30 = 0.5 -> 0.075
        crossLinksCount: 12, // 12/25 = 0.48 -> 0.048
      });
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeCloseTo(
        (0.3 * 0.5 + 0.25 * 0.5 + 0.2 * 0.5 + 0.15 * 0.5 + 0.1 * (12 / 25)) * 100,
        1
      );
    });

    it("caps total score at 100 when all components at max", () => {
      const score = computeProminenceScore({
        artifactCount: 200,
        contributorCount: 100,
        governanceActivity: 50,
        recentContributionsCount: 60,
        crossLinksCount: 50,
      });
      expect(score).toBe(100);
    });

    it("ignores negative values by treating as zero", () => {
      const score = computeProminenceScore({
        ...emptySignals,
        artifactCount: -10,
        contributorCount: 5,
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(25);
    });
  });

  describe("time decay", () => {
    it("reduces score when lastActivityAt is in the past", () => {
      const ref = new Date("2024-06-01T12:00:00Z");
      const noDecay = computeProminenceScore(
        { ...emptySignals, artifactCount: 100 },
        ref
      );
      const withDecay = computeProminenceScore(
        {
          ...emptySignals,
          artifactCount: 100,
          lastActivityAt: "2024-01-01T00:00:00Z", // ~5 months before ref
        },
        ref
      );
      expect(noDecay).toBe(30);
      expect(withDecay).toBeLessThan(noDecay);
      expect(withDecay).toBeGreaterThan(0);
    });

    it("applies no decay when lastActivityAt is absent", () => {
      const withTimestamp = computeProminenceScore({
        ...emptySignals,
        artifactCount: 100,
        lastActivityAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const withoutTimestamp = computeProminenceScore({
        ...emptySignals,
        artifactCount: 100,
      });
      expect(withoutTimestamp).toBe(30);
      expect(withTimestamp).toBeLessThanOrEqual(30);
    });

    it("timeDecayFactor returns 1 when lastActivityAt equals reference", () => {
      const ref = new Date("2024-06-01T12:00:00Z");
      const factor = timeDecayFactor("2024-06-01T12:00:00Z", ref);
      expect(factor).toBe(1);
    });

    it("timeDecayFactor decreases as days since activity increase", () => {
      const ref = new Date("2024-06-01T12:00:00Z");
      const sameDay = timeDecayFactor("2024-06-01T00:00:00Z", ref);
      const thirtyDays = timeDecayFactor("2024-05-02T12:00:00Z", ref);
      const sixtyDays = timeDecayFactor("2024-04-02T12:00:00Z", ref);
      expect(sameDay).toBeGreaterThan(thirtyDays);
      expect(thirtyDays).toBeGreaterThan(sixtyDays);
      expect(thirtyDays).toBeCloseTo(0.5, 1);
    });
  });

  describe("ProminenceScorer class", () => {
    it("score() returns same result as computeProminenceScore with default clock", () => {
      const scorer = new ProminenceScorer();
      const signals: ProminenceSignals = {
        artifactCount: 10,
        contributorCount: 5,
        governanceActivity: 2,
        recentContributionsCount: 3,
        crossLinksCount: 1,
      };
      expect(scorer.score(signals)).toBe(computeProminenceScore(signals));
    });

    it("score() uses injected clock for time decay", () => {
      const ref = new Date("2024-06-01T12:00:00Z");
      const scorer = new ProminenceScorer(() => ref);
      const score = scorer.score({
        ...emptySignals,
        artifactCount: 100,
        lastActivityAt: "2024-05-01T12:00:00Z",
      });
      expect(score).toBe(computeProminenceScore(
        {
          ...emptySignals,
          artifactCount: 100,
          lastActivityAt: "2024-05-01T12:00:00Z",
        },
        ref
      ));
    });
  });

  describe("weights sum to 1", () => {
    it("PROMINENCE_WEIGHTS sum to 1", () => {
      const sum =
        PROMINENCE_WEIGHTS.artifact +
        PROMINENCE_WEIGHTS.contributor +
        PROMINENCE_WEIGHTS.governance +
        PROMINENCE_WEIGHTS.recentContributions +
        PROMINENCE_WEIGHTS.crossLinks;
      expect(sum).toBe(1);
    });
  });
});
