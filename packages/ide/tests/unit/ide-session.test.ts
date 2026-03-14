/**
 * Unit tests for IDESession aggregate (COMP-030.1).
 */

import { describe, it, expect } from "vitest";
import { IDESession } from "../../src/domain/ide-session.js";
import { IDESessionStatus } from "../../src/domain/ide-session-status.js";

describe("IDESession (COMP-030.1)", () => {
  describe("create", () => {
    it("creates session in pending status", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      expect(session.status).toBe(IDESessionStatus.Pending);
      expect(session.sessionId).toBe("sess-1");
      expect(session.userId).toBe("user-1");
      expect(session.projectId).toBeNull();
      expect(session.startedAt).toBeNull();
      expect(session.terminatedAt).toBeNull();
    });

    it("creates session with optional projectId", () => {
      const session = IDESession.create({
        sessionId: "sess-2",
        userId: "user-2",
        projectId: "proj-1",
      });
      expect(session.projectId).toBe("proj-1");
    });

    it("throws when sessionId is empty", () => {
      expect(() =>
        IDESession.create({ sessionId: "", userId: "user-1" })
      ).toThrow("sessionId cannot be empty");
    });

    it("throws when userId is empty", () => {
      expect(() =>
        IDESession.create({ sessionId: "sess-1", userId: "" })
      ).toThrow("userId cannot be empty");
    });
  });

  describe("start", () => {
    it("transitions from pending to active and sets startedAt", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      const started = session.start();
      expect(started.status).toBe(IDESessionStatus.Active);
      expect(started.startedAt).toBeInstanceOf(Date);
      expect(started.lastActiveAt).toBeInstanceOf(Date);
    });

    it("throws when not in pending status", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      const started = session.start();
      expect(() => started.start()).toThrow(
        "Cannot start session in status active"
      );
    });
  });

  describe("suspend", () => {
    it("transitions from active to suspended", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      const started = session.start();
      const suspended = started.suspend();
      expect(suspended.status).toBe(IDESessionStatus.Suspended);
    });

    it("throws when not in active status", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      expect(() => session.suspend()).toThrow(
        "Cannot suspend session in status pending"
      );
    });
  });

  describe("terminate", () => {
    it("transitions from active to terminated and sets terminatedAt", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      const started = session.start();
      const terminated = started.terminate();
      expect(terminated.status).toBe(IDESessionStatus.Terminated);
      expect(terminated.terminatedAt).toBeInstanceOf(Date);
    });

    it("transitions from suspended to terminated", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      const started = session.start();
      const suspended = started.suspend();
      const terminated = suspended.terminate();
      expect(terminated.status).toBe(IDESessionStatus.Terminated);
    });

    it("throws when not in active or suspended status", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      expect(() => session.terminate()).toThrow(
        "Cannot terminate session in status pending"
      );
    });
  });

  describe("lifecycle", () => {
    it("full lifecycle: create → start → suspend → terminate", () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      expect(session.status).toBe(IDESessionStatus.Pending);

      const started = session.start();
      expect(started.status).toBe(IDESessionStatus.Active);

      const suspended = started.suspend();
      expect(suspended.status).toBe(IDESessionStatus.Suspended);

      const terminated = suspended.terminate();
      expect(terminated.status).toBe(IDESessionStatus.Terminated);
    });
  });
});
