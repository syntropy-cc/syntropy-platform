/**
 * Unit tests for WorkspaceSnapshot entity (COMP-030.4).
 */

import { describe, it, expect } from "vitest";
import {
  WorkspaceSnapshot,
  type WorkspaceSnapshotFile,
  type WorkspaceSnapshotData,
} from "../../src/domain/workspace-snapshot.js";

describe("WorkspaceSnapshot (COMP-030.4)", () => {
  const sampleFiles: WorkspaceSnapshotFile[] = [
    { path: "src/index.ts", content: "export {};" },
    { path: "README.md", content: "# Hello" },
  ];

  describe("create", () => {
    it("creates snapshot with sessionId and files and default version 1", () => {
      const snapshot = WorkspaceSnapshot.create("sess-1", sampleFiles);

      expect(snapshot.sessionId).toBe("sess-1");
      expect(snapshot.version).toBe(1);
      expect(snapshot.files).toHaveLength(2);
      expect(snapshot.files[0]).toEqual({ path: "src/index.ts", content: "export {};" });
      expect(snapshot.files[1]).toEqual({ path: "README.md", content: "# Hello" });
      expect(snapshot.snapshotId).toBeDefined();
      expect(snapshot.snapshotId).toContain("sess-1");
      expect(snapshot.createdAt).toBeInstanceOf(Date);
    });

    it("creates snapshot with explicit version", () => {
      const snapshot = WorkspaceSnapshot.create("sess-2", sampleFiles, {
        version: 3,
      });

      expect(snapshot.version).toBe(3);
      expect(snapshot.snapshotId).toContain("v3");
    });

    it("creates snapshot with explicit snapshotId", () => {
      const snapshot = WorkspaceSnapshot.create("sess-3", sampleFiles, {
        snapshotId: "custom-ws-id",
      });

      expect(snapshot.snapshotId).toBe("custom-ws-id");
      expect(snapshot.version).toBe(1);
    });

    it("trims sessionId", () => {
      const snapshot = WorkspaceSnapshot.create("  sess-4  ", sampleFiles);
      expect(snapshot.sessionId).toBe("sess-4");
    });

    it("accepts empty files array", () => {
      const snapshot = WorkspaceSnapshot.create("sess-5", []);
      expect(snapshot.files).toHaveLength(0);
    });

    it("throws when sessionId is empty", () => {
      expect(() => WorkspaceSnapshot.create("", sampleFiles)).toThrow(
        "sessionId cannot be empty"
      );
      expect(() => WorkspaceSnapshot.create("   ", sampleFiles)).toThrow(
        "sessionId cannot be empty"
      );
    });

    it("throws when version is not a positive integer", () => {
      expect(() =>
        WorkspaceSnapshot.create("sess-1", sampleFiles, { version: 0 })
      ).toThrow("version must be a positive integer");
      expect(() =>
        WorkspaceSnapshot.create("sess-1", sampleFiles, { version: -1 })
      ).toThrow("version must be a positive integer");
      expect(() =>
        WorkspaceSnapshot.create("sess-1", sampleFiles, { version: 1.5 })
      ).toThrow("version must be a positive integer");
    });
  });

  describe("fromPersistence", () => {
    it("reconstitutes snapshot from persistence data", () => {
      const data: WorkspaceSnapshotData = {
        snapshotId: "ws-1",
        sessionId: "sess-1",
        version: 2,
        files: sampleFiles,
        createdAt: new Date("2024-01-15T10:00:00Z"),
      };

      const snapshot = WorkspaceSnapshot.fromPersistence(data);

      expect(snapshot.snapshotId).toBe("ws-1");
      expect(snapshot.sessionId).toBe("sess-1");
      expect(snapshot.version).toBe(2);
      expect(snapshot.files).toHaveLength(2);
      expect(snapshot.files[0]).toEqual(sampleFiles[0]);
      expect(snapshot.createdAt).toEqual(new Date("2024-01-15T10:00:00Z"));
    });

    it("round-trips create then fromPersistence", () => {
      const created = WorkspaceSnapshot.create("sess-1", sampleFiles, {
        snapshotId: "ws-round",
        version: 1,
      });

      const data: WorkspaceSnapshotData = {
        snapshotId: created.snapshotId,
        sessionId: created.sessionId,
        version: created.version,
        files: created.getFiles(),
        createdAt: created.createdAt,
      };

      const restored = WorkspaceSnapshot.fromPersistence(data);

      expect(restored.snapshotId).toBe(created.snapshotId);
      expect(restored.sessionId).toBe(created.sessionId);
      expect(restored.version).toBe(created.version);
      expect(restored.files).toEqual(created.files);
      expect(restored.createdAt.getTime()).toBe(created.createdAt.getTime());
    });

    it("accepts date-like createdAt", () => {
      const data: WorkspaceSnapshotData = {
        snapshotId: "ws-2",
        sessionId: "sess-2",
        version: 1,
        files: [],
        createdAt: new Date("2024-06-01T12:00:00Z"),
      };
      const snapshot = WorkspaceSnapshot.fromPersistence(data);
      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.createdAt.toISOString()).toBe("2024-06-01T12:00:00.000Z");
    });

    it("throws when snapshotId is empty", () => {
      expect(() =>
        WorkspaceSnapshot.fromPersistence({
          snapshotId: "",
          sessionId: "sess-1",
          version: 1,
          files: [],
          createdAt: new Date(),
        })
      ).toThrow("snapshotId cannot be empty");
    });

    it("throws when sessionId is empty", () => {
      expect(() =>
        WorkspaceSnapshot.fromPersistence({
          snapshotId: "ws-1",
          sessionId: "",
          version: 1,
          files: [],
          createdAt: new Date(),
        })
      ).toThrow("sessionId cannot be empty");
    });

    it("throws when version is invalid", () => {
      expect(() =>
        WorkspaceSnapshot.fromPersistence({
          snapshotId: "ws-1",
          sessionId: "sess-1",
          version: 0,
          files: [],
          createdAt: new Date(),
        })
      ).toThrow("version must be a positive integer");
    });
  });

  describe("getFiles", () => {
    it("returns a copy of files so snapshot remains immutable", () => {
      const snapshot = WorkspaceSnapshot.create("sess-1", sampleFiles);
      const files = snapshot.getFiles();
      expect(files).toEqual(snapshot.files);
      expect(files).not.toBe(snapshot.files);
      (files as WorkspaceSnapshotFile[]).push({
        path: "extra",
        content: "x",
      });
      expect(snapshot.files).toHaveLength(2);
    });
  });
});
