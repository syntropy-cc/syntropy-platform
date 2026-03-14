/**
 * Unit tests for AchievementService (COMP-010.3).
 */

import { describe, it, expect } from "vitest";
import { Portfolio } from "./portfolio.js";
import { evaluate, AchievementService } from "./achievement-service.js";

describe("AchievementService.evaluate", () => {
  it("unlocks first_fragment when learn.fragment.artifact_published and not yet unlocked", () => {
    const portfolio = Portfolio.empty("user-1");
    const result = evaluate(portfolio, {
      type: "learn.fragment.artifact_published",
    });
    expect(result.unlocked).toContain("first_fragment");
    expect(result.events.length).toBe(1);
    expect(portfolio.hasAchievement("first_fragment")).toBe(true);
  });

  it("does not unlock first_fragment twice on second event", () => {
    const portfolio = Portfolio.empty("user-2");
    evaluate(portfolio, { type: "learn.fragment.artifact_published" });
    const result2 = evaluate(portfolio, { type: "learn.fragment.artifact_published" });
    expect(result2.unlocked.length).toBe(0);
    expect(result2.events.length).toBe(0);
  });

  it("unlocks first_contribution when hub.contribution.integrated", () => {
    const portfolio = Portfolio.empty("user-3");
    const result = evaluate(portfolio, {
      type: "hub.contribution.integrated",
    });
    expect(result.unlocked).toContain("first_contribution");
    expect(portfolio.hasAchievement("first_contribution")).toBe(true);
  });

  it("unlocks first_article when labs.article.published", () => {
    const portfolio = Portfolio.empty("user-4");
    const result = evaluate(portfolio, {
      type: "labs.article.published",
    });
    expect(result.unlocked).toContain("first_article");
  });

  it("returns empty when event type does not match any condition", () => {
    const portfolio = Portfolio.empty("user-5");
    const result = evaluate(portfolio, { type: "unknown.event.type" });
    expect(result.unlocked.length).toBe(0);
    expect(result.events.length).toBe(0);
  });

  it("unlocks ten_contributions when contributionCount >= 10 in payload", () => {
    const portfolio = Portfolio.empty("user-6");
    const result = evaluate(portfolio, {
      type: "hub.contribution.integrated",
      payload: { contributionCount: 10 },
    });
    expect(result.unlocked).toContain("first_contribution");
    expect(result.unlocked).toContain("ten_contributions");
  });
});

describe("AchievementService class", () => {
  it("evaluate method unlocks achievement", () => {
    const service = new AchievementService();
    const portfolio = Portfolio.empty("user-7");
    const result = service.evaluate(portfolio, {
      type: "learn.fragment.artifact_published",
    });
    expect(result.unlocked).toContain("first_fragment");
  });
});
