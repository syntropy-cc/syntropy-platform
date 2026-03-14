/**
 * Unit tests for XPCalculator (COMP-010.2).
 */

import { describe, it, expect } from "vitest";
import { calculate } from "./xp-calculator.js";

describe("XPCalculator.calculate", () => {
  it("returns total XP and level from events using default weights", () => {
    const events = [
      { type: "learn.fragment.artifact_published" },
      { type: "learn.fragment.artifact_published" },
      { type: "hub.contribution.integrated" },
    ];
    const result = calculate(events);
    expect(result.totalXp).toBe(50 + 50 + 75);
    expect(result.level).toBeGreaterThanOrEqual(1);
  });

  it("artifact_published weight is 50", () => {
    const result = calculate([{ type: "artifact_published" }]);
    expect(result.totalXp).toBe(50);
  });

  it("contribution_merged weight is 30", () => {
    const result = calculate([{ type: "contribution_merged" }]);
    expect(result.totalXp).toBe(30);
  });

  it("learn.track.completed weight is 200", () => {
    const result = calculate([{ type: "learn.track.completed" }]);
    expect(result.totalXp).toBe(200);
  });

  it("level 1 at 0 XP", () => {
    const result = calculate([]);
    expect(result.totalXp).toBe(0);
    expect(result.level).toBe(1);
  });

  it("level 2 at 100 XP", () => {
    const result = calculate(
      [{ type: "artifact_published" }, { type: "artifact_published" }],
      { artifact_published: 50 }
    );
    expect(result.totalXp).toBe(100);
    expect(result.level).toBe(2);
  });

  it("level 3 at 250 XP", () => {
    const result = calculate(
      Array(5).fill({ type: "x" }),
      { x: 50 }
    );
    expect(result.totalXp).toBe(250);
    expect(result.level).toBe(3);
  });

  it("unknown event type contributes 0 XP", () => {
    const result = calculate([{ type: "unknown.event" }]);
    expect(result.totalXp).toBe(0);
  });

  it("custom weights override defaults", () => {
    const result = calculate(
      [{ type: "custom" }],
      { custom: 100 }
    );
    expect(result.totalXp).toBe(100);
  });
});
