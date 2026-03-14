/**
 * Unit tests for ContextModelUpdater.
 * Architecture: COMP-012.5
 */

import { describe, it, expect } from "vitest";
import { UserContextModel } from "../../../src/domain/orchestration/user-context-model.js";
import { ContextModelUpdater } from "../../../src/domain/orchestration/context-model-updater.js";
import type { UserContextModelRepository } from "../../../src/domain/orchestration/context-model-updater.js";
import type {
  ActiveGoal,
  RecentActivityItem,
  UserContextUpdateEvent,
  UserId,
} from "../../../src/domain/orchestration/types.js";

function createInMemoryRepository(): UserContextModelRepository & {
  store: Map<UserId, UserContextModel>;
} {
  const store = new Map<UserId, UserContextModel>();
  return {
    store,
    async findByUser(userId: UserId) {
      return store.get(userId) ?? null;
    },
    async save(model: UserContextModel) {
      store.set(model.userId, model);
    },
  };
}

describe("ContextModelUpdater", () => {
  describe("update", () => {
    it("creates new model and applies activity_added when user has no model", async () => {
      const repo = createInMemoryRepository();
      const updater = new ContextModelUpdater(repo);
      const activity: RecentActivityItem = {
        id: "a1",
        type: "fragment_completed",
        at: new Date("2026-01-01T12:00:00Z"),
      };
      const event: UserContextUpdateEvent = {
        kind: "activity_added",
        payload: activity,
      };

      await updater.update("user-1", event);

      const model = await repo.findByUser("user-1");
      expect(model).not.toBeNull();
      expect(model!.userId).toBe("user-1");
      expect(model!.recentActivity).toHaveLength(1);
      expect(model!.recentActivity[0]).toEqual(activity);
    });

    it("applies goals_updated to existing model", async () => {
      const repo = createInMemoryRepository();
      const existing = UserContextModel.create({ userId: "user-2" });
      repo.store.set("user-2", existing);
      const updater = new ContextModelUpdater(repo);
      const goals: ActiveGoal[] = [
        { id: "g1", title: "Complete track", pillar: "learn" },
      ];
      const event: UserContextUpdateEvent = {
        kind: "goals_updated",
        payload: goals,
      };

      await updater.update("user-2", event);

      const model = await repo.findByUser("user-2");
      expect(model!.activeGoals).toHaveLength(1);
      expect(model!.activeGoals[0]).toEqual(goals[0]);
    });

    it("applies skill_level_updated to existing model", async () => {
      const repo = createInMemoryRepository();
      const existing = UserContextModel.create({
        userId: "user-3",
        skillLevel: "beginner",
      });
      repo.store.set("user-3", existing);
      const updater = new ContextModelUpdater(repo);
      const event: UserContextUpdateEvent = {
        kind: "skill_level_updated",
        payload: "advanced",
      };

      await updater.update("user-3", event);

      const model = await repo.findByUser("user-3");
      expect(model!.skillLevel).toBe("advanced");
    });
  });

  describe("updateBatch", () => {
    it("applies multiple events in order and persists once", async () => {
      const repo = createInMemoryRepository();
      const updater = new ContextModelUpdater(repo);
      const activity1: RecentActivityItem = {
        id: "a1",
        type: "fragment_completed",
        at: new Date("2026-01-01T10:00:00Z"),
      };
      const activity2: RecentActivityItem = {
        id: "a2",
        type: "contribution_integrated",
        at: new Date("2026-01-01T11:00:00Z"),
      };
      const events: UserContextUpdateEvent[] = [
        { kind: "activity_added", payload: activity1 },
        { kind: "activity_added", payload: activity2 },
        { kind: "skill_level_updated", payload: "intermediate" },
      ];

      await updater.updateBatch("user-batch", events);

      const model = await repo.findByUser("user-batch");
      expect(model!.recentActivity).toHaveLength(2);
      expect(model!.recentActivity[0]).toEqual(activity1);
      expect(model!.recentActivity[1]).toEqual(activity2);
      expect(model!.skillLevel).toBe("intermediate");
    });
  });
});
