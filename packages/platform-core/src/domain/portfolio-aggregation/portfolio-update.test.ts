/**
 * Unit tests for portfolio applyEvent (COMP-010.6).
 */

import { describe, it, expect } from "vitest";
import { Portfolio } from "./portfolio.js";
import { applyEvent } from "./portfolio-update.js";

describe("applyEvent", () => {
  it("adds XP when event has known type", () => {
    const portfolio = Portfolio.empty("user-1");
    const updated = applyEvent(portfolio, {
      type: "learn.fragment.artifact_published",
      payload: {},
    });
    expect(updated.xp).toBe(50);
    expect(updated.userId).toBe("user-1");
  });

  it("unlocks first_fragment achievement when learn.fragment.artifact_published", () => {
    const portfolio = Portfolio.empty("user-1");
    const updated = applyEvent(portfolio, {
      type: "learn.fragment.artifact_published",
      payload: {},
    });
    expect(updated.achievements).toHaveLength(1);
    expect(updated.achievements[0].achievementType).toBe("first_fragment");
  });

  it("adds skills from event payload tags", () => {
    const portfolio = Portfolio.empty("user-1");
    const updated = applyEvent(portfolio, {
      type: "learn.fragment.artifact_published",
      payload: { tags: ["typescript", "react"] },
    });
    expect(updated.skills).toHaveLength(2);
    const names = updated.skills.map((s) => s.skillName).sort();
    expect(names).toEqual(["react", "typescript"]);
  });

  it("does not mutate input portfolio", () => {
    const portfolio = Portfolio.empty("user-1");
    applyEvent(portfolio, {
      type: "learn.fragment.artifact_published",
      payload: {},
    });
    expect(portfolio.xp).toBe(0);
    expect(portfolio.achievements).toHaveLength(0);
  });
});
