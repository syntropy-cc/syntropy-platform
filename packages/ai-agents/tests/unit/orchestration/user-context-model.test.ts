/**
 * Unit tests for UserContextModel aggregate.
 * Architecture: COMP-012.1
 */

import { describe, it, expect } from "vitest";
import {
  UserContextModel,
  UserContextSnapshot,
  DEFAULT_SKILL_LEVEL,
  type ActiveGoal,
  type RecentActivityItem,
} from "../../../src/domain/orchestration/index.js";

describe("UserContextModel", () => {
  describe("create", () => {
    it("initializes with defaults when only userId is provided", () => {
      const model = UserContextModel.create({ userId: "user-1" });

      expect(model.userId).toBe("user-1");
      expect(model.recentActivity).toEqual([]);
      expect(model.activeGoals).toEqual([]);
      expect(model.skillLevel).toBe(DEFAULT_SKILL_LEVEL);
    });

    it("initializes with provided activity, goals, and skill level", () => {
      const activity: RecentActivityItem = {
        id: "a1",
        type: "fragment_completed",
        at: new Date("2026-01-01T12:00:00Z"),
      };
      const goals: ActiveGoal[] = [
        { id: "g1", title: "Complete track", pillar: "learn" },
      ];
      const model = UserContextModel.create({
        userId: "user-2",
        recentActivity: [activity],
        activeGoals: goals,
        skillLevel: "advanced",
      });

      expect(model.userId).toBe("user-2");
      expect(model.recentActivity).toHaveLength(1);
      expect(model.recentActivity[0]).toEqual(activity);
      expect(model.activeGoals).toHaveLength(1);
      expect(model.activeGoals[0]).toEqual(goals[0]);
      expect(model.skillLevel).toBe("advanced");
    });
  });

  describe("update", () => {
    it("activity_added event appends to recentActivity", () => {
      const model = UserContextModel.create({ userId: "user-1" });
      const activity: RecentActivityItem = {
        id: "a1",
        type: "contribution_integrated",
        at: new Date("2026-01-02T10:00:00Z"),
      };

      const updated = model.update({ kind: "activity_added", payload: activity });

      expect(updated.recentActivity).toHaveLength(1);
      expect(updated.recentActivity[0]).toEqual(activity);
      expect(updated.userId).toBe(model.userId);
      expect(updated.activeGoals).toEqual(model.activeGoals);
      expect(updated.skillLevel).toBe(model.skillLevel);
    });

    it("goals_updated event replaces activeGoals", () => {
      const model = UserContextModel.create({
        userId: "user-1",
        activeGoals: [{ id: "old", title: "Old goal" }],
      });
      const newGoals: ActiveGoal[] = [
        { id: "g1", title: "New goal 1", pillar: "learn" },
        { id: "g2", title: "New goal 2", pillar: "hub" },
      ];

      const updated = model.update({ kind: "goals_updated", payload: newGoals });

      expect(updated.activeGoals).toHaveLength(2);
      expect(updated.activeGoals[0].title).toBe("New goal 1");
      expect(updated.activeGoals[1].title).toBe("New goal 2");
      expect(updated.recentActivity).toEqual(model.recentActivity);
      expect(updated.skillLevel).toBe(model.skillLevel);
    });

    it("skill_level_updated event changes skillLevel", () => {
      const model = UserContextModel.create({
        userId: "user-1",
        skillLevel: "beginner",
      });

      const updated = model.update({
        kind: "skill_level_updated",
        payload: "intermediate",
      });

      expect(updated.skillLevel).toBe("intermediate");
      expect(updated.recentActivity).toEqual(model.recentActivity);
      expect(updated.activeGoals).toEqual(model.activeGoals);
    });

    it("returns new instance and leaves original unchanged", () => {
      const model = UserContextModel.create({
        userId: "user-1",
        recentActivity: [{ id: "a1", type: "t", at: new Date() }],
      });

      const updated = model.update({
        kind: "activity_added",
        payload: { id: "a2", type: "t2", at: new Date() },
      });

      expect(updated).not.toBe(model);
      expect(model.recentActivity).toHaveLength(1);
      expect(updated.recentActivity).toHaveLength(2);
    });
  });

  describe("createSnapshot", () => {
    it("returns snapshot with same userId, activity, goals, and skillLevel", () => {
      const activity: RecentActivityItem = {
        id: "a1",
        type: "fragment_completed",
        at: new Date("2026-01-01T12:00:00Z"),
      };
      const goals: ActiveGoal[] = [{ id: "g1", title: "Goal", pillar: "learn" }];
      const model = UserContextModel.create({
        userId: "user-1",
        recentActivity: [activity],
        activeGoals: goals,
        skillLevel: "advanced",
      });

      const snapshot = model.createSnapshot();

      expect(snapshot).toBeInstanceOf(UserContextSnapshot);
      expect(snapshot.userId).toBe(model.userId);
      expect(snapshot.recentActivity).toHaveLength(1);
      expect(snapshot.recentActivity[0]).toEqual(activity);
      expect(snapshot.activeGoals).toHaveLength(1);
      expect(snapshot.activeGoals[0]).toEqual(goals[0]);
      expect(snapshot.skillLevel).toBe(model.skillLevel);
      expect(snapshot.capturedAt).toBeInstanceOf(Date);
    });

    it("snapshot reflects state at creation time and is independent of later model updates", () => {
      const model = UserContextModel.create({
        userId: "user-1",
        recentActivity: [{ id: "a1", type: "t", at: new Date() }],
        skillLevel: "beginner",
      });
      const snapshot = model.createSnapshot();

      const afterActivity = model.update({
        kind: "activity_added",
        payload: { id: "a2", type: "t2", at: new Date() },
      });
      const afterSkill = afterActivity.update({
        kind: "skill_level_updated",
        payload: "advanced",
      });

      expect(snapshot.recentActivity).toHaveLength(1);
      expect(snapshot.skillLevel).toBe("beginner");
      expect(afterActivity.recentActivity).toHaveLength(2);
      expect(afterSkill.skillLevel).toBe("advanced");
    });

    it("accepts optional capturedAt for deterministic tests", () => {
      const model = UserContextModel.create({ userId: "user-1" });
      const fixed = new Date("2026-03-13T00:00:00Z");

      const snapshot = model.createSnapshot(fixed);

      expect(snapshot.capturedAt).toBe(fixed);
    });
  });
});
