/**
 * Unit tests for workspace sync (COMP-035.6).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  startAutoSave,
  saveSnapshot,
  restoreSnapshot,
} from "./workspace-sync.js";
import { WorkspaceSnapshot } from "@syntropy/ide";
import type { WorkspaceSnapshotRepository } from "@syntropy/ide";

function createMockSnapshotRepo(): WorkspaceSnapshotRepository {
  const sessions = new Map<string, WorkspaceSnapshot>();
  return {
    async save(snapshot: WorkspaceSnapshot) {
      sessions.set(snapshot.sessionId, snapshot);
    },
    async getLatestBySessionId(sessionId: string) {
      return sessions.get(sessionId) ?? null;
    },
  };
}

describe("workspace-sync (COMP-035.6)", () => {
  describe("startAutoSave", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("calls getCurrentFiles and saves snapshot at 2min interval", async () => {
      const repo = createMockSnapshotRepo();
      const getCurrentFiles = vi.fn().mockResolvedValue([
        { path: "a.ts", content: "x" },
      ]);
      const stop = startAutoSave("sess-1", repo, getCurrentFiles);

      expect(getCurrentFiles).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
      expect(getCurrentFiles).toHaveBeenCalledTimes(1);
      const snap = await repo.getLatestBySessionId("sess-1");
      expect(snap).not.toBeNull();
      expect(snap!.getFiles()).toHaveLength(1);
      expect(snap!.getFiles()[0]).toEqual({ path: "a.ts", content: "x" });

      await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
      expect(getCurrentFiles).toHaveBeenCalledTimes(2);

      stop();
      await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
      expect(getCurrentFiles).toHaveBeenCalledTimes(2);
    });
  });

  describe("saveSnapshot", () => {
    it("creates and persists snapshot for session", async () => {
      const repo = createMockSnapshotRepo();
      const files = [{ path: "b.ts", content: "y" }];
      await saveSnapshot("sess-2", files, repo);
      const snap = await repo.getLatestBySessionId("sess-2");
      expect(snap).not.toBeNull();
      expect(snap!.sessionId).toBe("sess-2");
      expect(snap!.getFiles()).toHaveLength(1);
    });
  });

  describe("restoreSnapshot", () => {
    it("returns null when no snapshot exists for session", async () => {
      const repo = createMockSnapshotRepo();
      const result = await restoreSnapshot("sess-none", repo);
      expect(result).toBeNull();
    });

    it("returns latest snapshot when one exists", async () => {
      const repo = createMockSnapshotRepo();
      const snapshot = WorkspaceSnapshot.create("sess-3", [
        { path: "c.ts", content: "z" },
      ]);
      await repo.save(snapshot);
      const result = await restoreSnapshot("sess-3", repo);
      expect(result).not.toBeNull();
      expect(result!.sessionId).toBe("sess-3");
      expect(result!.getFiles()).toHaveLength(1);
      expect(result!.getFiles()[0].path).toBe("c.ts");
    });
  });
});
