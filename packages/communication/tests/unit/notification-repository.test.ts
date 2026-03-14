/**
 * Unit tests for NotificationRepository extensions (COMP-028.6).
 * Tests findByUserId (pagination, ordering) and markAsRead (owner-only, return value).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Notification } from "../../src/domain/notification.js";
import { InMemoryNotificationRepository } from "../../src/infrastructure/repositories/in-memory-notification-repository.js";

describe("InMemoryNotificationRepository (COMP-028.6)", () => {
  let repo: InMemoryNotificationRepository;

  beforeEach(() => {
    repo = new InMemoryNotificationRepository();
  });

  describe("findByUserId", () => {
    it("returns only notifications for the given user", async () => {
      const n1 = new Notification({
        id: "n1",
        userId: "user-a",
        notificationType: "t1",
        sourceEventType: "e1",
        payload: {},
        isRead: false,
        createdAt: new Date(),
      });
      const n2 = new Notification({
        id: "n2",
        userId: "user-b",
        notificationType: "t2",
        sourceEventType: "e2",
        payload: {},
        isRead: false,
        createdAt: new Date(),
      });
      await repo.save(n1);
      await repo.save(n2);

      const forA = await repo.findByUserId("user-a");
      const forB = await repo.findByUserId("user-b");

      expect(forA).toHaveLength(1);
      expect(forA[0].id).toBe("n1");
      expect(forB).toHaveLength(1);
      expect(forB[0].id).toBe("n2");
    });

    it("returns notifications ordered by createdAt descending", async () => {
      const base = new Date("2026-03-14T12:00:00Z");
      await repo.save(
        new Notification({
          id: "old",
          userId: "u1",
          notificationType: "t",
          sourceEventType: "e",
          payload: {},
          isRead: false,
          createdAt: new Date(base.getTime()),
        })
      );
      await repo.save(
        new Notification({
          id: "new",
          userId: "u1",
          notificationType: "t",
          sourceEventType: "e",
          payload: {},
          isRead: false,
          createdAt: new Date(base.getTime() + 1000),
        })
      );

      const items = await repo.findByUserId("u1");
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe("new");
      expect(items[1].id).toBe("old");
    });

    it("respects limit and offset", async () => {
      for (let i = 0; i < 5; i++) {
        await repo.save(
          new Notification({
            id: `n-${i}`,
            userId: "u1",
            notificationType: "t",
            sourceEventType: "e",
            payload: {},
            isRead: false,
            createdAt: new Date(1000 + i),
          })
        );
      }

      const page1 = await repo.findByUserId("u1", { limit: 2, offset: 0 });
      const page2 = await repo.findByUserId("u1", { limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it("with since returns only notifications with createdAt > since (COMP-028.7)", async () => {
      const t0 = new Date("2026-03-14T10:00:00Z");
      const t1 = new Date("2026-03-14T11:00:00Z");
      const t2 = new Date("2026-03-14T12:00:00Z");
      await repo.save(
        new Notification({
          id: "old",
          userId: "u1",
          notificationType: "t",
          sourceEventType: "e",
          payload: {},
          isRead: false,
          createdAt: t0,
        })
      );
      await repo.save(
        new Notification({
          id: "mid",
          userId: "u1",
          notificationType: "t",
          sourceEventType: "e",
          payload: {},
          isRead: false,
          createdAt: t1,
        })
      );
      await repo.save(
        new Notification({
          id: "new",
          userId: "u1",
          notificationType: "t",
          sourceEventType: "e",
          payload: {},
          isRead: false,
          createdAt: t2,
        })
      );

      const since = new Date("2026-03-14T10:30:00Z");
      const items = await repo.findByUserId("u1", { since, limit: 10 });
      expect(items).toHaveLength(2);
      expect(items.map((n) => n.id)).toEqual(["new", "mid"]);
      expect(items[0].createdAt.getTime()).toBeGreaterThan(since.getTime());
      expect(items[1].createdAt.getTime()).toBeGreaterThan(since.getTime());
    });

    it("with since and offset applies offset after filtering", async () => {
      const base = new Date("2026-03-14T12:00:00Z");
      for (let i = 0; i < 4; i++) {
        await repo.save(
          new Notification({
            id: `n-${i}`,
            userId: "u1",
            notificationType: "t",
            sourceEventType: "e",
            payload: {},
            isRead: false,
            createdAt: new Date(base.getTime() + i * 1000),
          })
        );
      }
      const since = new Date(base.getTime() - 1000);
      const page = await repo.findByUserId("u1", { since, limit: 2, offset: 1 });
      expect(page).toHaveLength(2);
      expect(page[0].id).toBe("n-2");
      expect(page[1].id).toBe("n-1");
    });
  });

  describe("markAsRead", () => {
    it("returns true and updates when notification exists and belongs to user", async () => {
      const n = new Notification({
        id: "n1",
        userId: "user-1",
        notificationType: "t",
        sourceEventType: "e",
        payload: {},
        isRead: false,
        createdAt: new Date(),
      });
      await repo.save(n);

      const result = await repo.markAsRead("n1", "user-1");
      expect(result).toBe(true);

      const found = repo.findById("n1");
      expect(found).toBeDefined();
      expect(found!.isRead).toBe(true);
    });

    it("returns false when notification id does not exist", async () => {
      const result = await repo.markAsRead("nonexistent", "user-1");
      expect(result).toBe(false);
    });

    it("returns false when notification belongs to another user", async () => {
      const n = new Notification({
        id: "n1",
        userId: "user-1",
        notificationType: "t",
        sourceEventType: "e",
        payload: {},
        isRead: false,
        createdAt: new Date(),
      });
      await repo.save(n);

      const result = await repo.markAsRead("n1", "other-user");
      expect(result).toBe(false);

      const found = repo.findById("n1");
      expect(found!.isRead).toBe(false);
    });

    it("returns true when notification is already read (idempotent)", async () => {
      const n = new Notification({
        id: "n1",
        userId: "user-1",
        notificationType: "t",
        sourceEventType: "e",
        payload: {},
        isRead: true,
        createdAt: new Date(),
      });
      await repo.save(n);

      const result = await repo.markAsRead("n1", "user-1");
      expect(result).toBe(true);
    });
  });
});
