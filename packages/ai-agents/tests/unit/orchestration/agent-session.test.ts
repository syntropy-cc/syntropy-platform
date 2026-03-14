/**
 * Unit tests for AgentSession aggregate.
 * Architecture: COMP-012.2
 */

import { describe, it, expect } from "vitest";
import { AgentSession } from "../../../src/domain/orchestration/agent-session.js";

describe("AgentSession", () => {
  describe("create", () => {
    it("initializes with active status and empty history when userId and agentId provided", () => {
      const session = AgentSession.create({
        userId: "user-1",
        agentId: "agent-learn",
      });

      expect(session.userId).toBe("user-1");
      expect(session.agentId).toBe("agent-learn");
      expect(session.status).toBe("active");
      expect(session.history).toEqual([]);
      expect(session.startedAt).toBeInstanceOf(Date);
      expect(session.endedAt).toBeUndefined();
      expect(session.sessionId).toBeDefined();
      expect(typeof session.sessionId).toBe("string");
    });

    it("uses provided sessionId when supplied", () => {
      const session = AgentSession.create({
        userId: "user-2",
        agentId: "agent-hub",
        sessionId: "custom-session-id",
      });

      expect(session.sessionId).toBe("custom-session-id");
    });
  });

  describe("addMessage", () => {
    it("appends user and assistant messages to history", () => {
      const session = AgentSession.create({
        userId: "user-1",
        agentId: "agent-1",
        sessionId: "s1",
      });
      const withUser = session.addMessage("user", "Hello");
      const withBoth = withUser.addMessage("assistant", "Hi there!");

      expect(withUser.history).toHaveLength(1);
      expect(withUser.history[0]).toEqual({ role: "user", content: "Hello" });
      expect(withBoth.history).toHaveLength(2);
      expect(withBoth.history[1]).toEqual({
        role: "assistant",
        content: "Hi there!",
      });
    });

    it("returns new session instance and does not mutate original", () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      });
      const updated = session.addMessage("user", "Hi");

      expect(session.history).toHaveLength(0);
      expect(updated.history).toHaveLength(1);
      expect(updated.sessionId).toBe(session.sessionId);
    });

    it("throws when adding message to completed session", () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      });
      const closed = session.close();

      expect(() => closed.addMessage("user", "Hi")).toThrow(
        /Cannot add message to session in status 'completed'/
      );
    });

  });


  describe("close", () => {
    it("sets status to completed and sets endedAt", () => {
      const session = AgentSession.create({
        userId: "user-1",
        agentId: "agent-1",
        sessionId: "s1",
      });
      const closed = session.close();

      expect(closed.status).toBe("completed");
      expect(closed.endedAt).toBeInstanceOf(Date);
      expect(closed.history).toEqual(session.history);
      expect(session.status).toBe("active");
      expect(session.endedAt).toBeUndefined();
    });

    it("returns new session instance and does not mutate original", () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      });
      const closed = session.close();

      expect(session.status).toBe("active");
      expect(closed.status).toBe("completed");
    });

    it("throws when closing already completed session", () => {
      const session = AgentSession.create({
        userId: "u",
        agentId: "a",
        sessionId: "s1",
      });
      const closed = session.close();

      expect(() => closed.close()).toThrow(
        /Cannot close session in status 'completed'/
      );
    });
  });
});
