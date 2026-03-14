/**
 * Unit tests for Portfolio aggregate (COMP-010.1).
 */

import { describe, it, expect } from "vitest";
import { Portfolio } from "./portfolio.js";

describe("Portfolio", () => {
  it("fromEvents builds portfolio with summed XP from event types", () => {
    const events = [
      { type: "artifact_published" },
      { type: "artifact_published" },
      { type: "contribution_merged" },
    ];
    const weights: Record<string, number> = {
      artifact_published: 50,
      contribution_merged: 30,
    };
    const portfolio = Portfolio.fromEvents("user-1", events, weights);
    expect(portfolio.userId).toBe("user-1");
    expect(portfolio.xp).toBe(50 + 50 + 30);
    expect(portfolio.achievements.length).toBe(0);
    expect(portfolio.skills.length).toBe(0);
  });

  it("fromEvents with no weights yields zero XP", () => {
    const portfolio = Portfolio.fromEvents("user-2", [
      { type: "artifact_published" },
    ]);
    expect(portfolio.xp).toBe(0);
  });

  it("empty creates portfolio with zero XP and no achievements", () => {
    const portfolio = Portfolio.empty("user-3");
    expect(portfolio.userId).toBe("user-3");
    expect(portfolio.xp).toBe(0);
    expect(portfolio.achievements.length).toBe(0);
  });

  it("unlockAchievement adds achievement and hasAchievement returns true", () => {
    const portfolio = Portfolio.empty("user-4");
    portfolio.unlockAchievement("first_fragment");
    expect(portfolio.hasAchievement("first_fragment")).toBe(true);
    expect(portfolio.achievements.length).toBe(1);
    expect(portfolio.achievements[0].achievementType).toBe("first_fragment");
  });

  it("unlockAchievement throws when achievement already unlocked", () => {
    const portfolio = Portfolio.empty("user-5");
    portfolio.unlockAchievement("first_contribution");
    expect(() => portfolio.unlockAchievement("first_contribution")).toThrow(
      /Achievement already unlocked/
    );
    expect(portfolio.achievements.length).toBe(1);
  });

  it("addXp increases xp by delta", () => {
    const portfolio = Portfolio.empty("user-6");
    expect(portfolio.xp).toBe(0);
    portfolio.addXp(50);
    expect(portfolio.xp).toBe(50);
    portfolio.addXp(30);
    expect(portfolio.xp).toBe(80);
  });

  it("addXp throws when delta is not positive integer", () => {
    const portfolio = Portfolio.empty("user-7");
    expect(() => portfolio.addXp(0)).toThrow(/positive integer/);
    expect(() => portfolio.addXp(-1)).toThrow(/positive integer/);
  });
});
