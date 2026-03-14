/**
 * Unit tests for Goal entity (COMP-029.2).
 */

import { describe, it, expect } from "vitest";
import { Goal, GoalStatus } from "../../src/domain/goal.js";

describe("Goal entity (COMP-029.2)", () => {
  it("create builds goal in active status with zero current value", () => {
    const due = new Date("2025-12-31");
    const goal = Goal.create({
      goalId: "g1",
      userId: "u1",
      description: "Complete track",
      dueDate: due,
      targetValue: 100,
    });
    expect(goal.goalId).toBe("g1");
    expect(goal.userId).toBe("u1");
    expect(goal.description).toBe("Complete track");
    expect(goal.dueDate).toBe(due);
    expect(goal.targetValue).toBe(100);
    expect(goal.currentValue).toBe(0);
    expect(goal.status).toBe(GoalStatus.Active);
    expect(goal.progress).toBe(0);
  });

  it("create throws when goalId or userId is empty", () => {
    const due = new Date();
    expect(() =>
      Goal.create({
        goalId: "",
        userId: "u1",
        description: "D",
        dueDate: due,
        targetValue: 10,
      })
    ).toThrow("Goal.goalId cannot be empty");
    expect(() =>
      Goal.create({
        goalId: "g1",
        userId: "  ",
        description: "D",
        dueDate: due,
        targetValue: 10,
      })
    ).toThrow("Goal.userId cannot be empty");
  });

  it("create throws when targetValue is negative", () => {
    expect(() =>
      Goal.create({
        goalId: "g1",
        userId: "u1",
        description: "D",
        dueDate: new Date(),
        targetValue: -1,
      })
    ).toThrow("Goal.targetValue must be a non-negative number");
  });

  it("progress returns currentValue / targetValue capped at 1", () => {
    const goal = Goal.fromPersistence({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 100,
      currentValue: 50,
      status: GoalStatus.Active,
    });
    expect(goal.progress).toBe(0.5);
    const over = Goal.fromPersistence({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 100,
      currentValue: 150,
      status: GoalStatus.Active,
    });
    expect(over.progress).toBe(1);
  });

  it("progress returns 0 when targetValue is 0", () => {
    const goal = Goal.fromPersistence({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 0,
      currentValue: 0,
      status: GoalStatus.Active,
    });
    expect(goal.progress).toBe(0);
  });

  it("checkAchievement updates currentValue and transitions to achieved when target met", () => {
    const goal = Goal.create({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 100,
    });
    const updated = goal.checkAchievement(100);
    expect(updated.currentValue).toBe(100);
    expect(updated.status).toBe(GoalStatus.Achieved);
    expect(updated.progress).toBe(1);
  });

  it("checkAchievement keeps active when currentValue below target", () => {
    const goal = Goal.create({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 100,
    });
    const updated = goal.checkAchievement(50);
    expect(updated.currentValue).toBe(50);
    expect(updated.status).toBe(GoalStatus.Active);
  });

  it("checkAchievement is no-op when already achieved", () => {
    const goal = Goal.fromPersistence({
      goalId: "g1",
      userId: "u1",
      description: "D",
      dueDate: new Date(),
      targetValue: 100,
      currentValue: 100,
      status: GoalStatus.Achieved,
    });
    const same = goal.checkAchievement(200);
    expect(same.status).toBe(GoalStatus.Achieved);
    expect(same.currentValue).toBe(100);
  });
});
