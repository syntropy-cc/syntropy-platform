/**
 * Unit tests for Thread aggregate (COMP-028.1).
 */

import { describe, it, expect } from "vitest";
import { Thread } from "../../src/domain/thread.js";

describe("Thread (COMP-028.1)", () => {
  it("creates with valid threadId, participants, and type", () => {
    const thread = new Thread({
      threadId: "thread-1",
      participants: ["user-a", "user-b"],
      type: "direct",
    });
    expect(thread.threadId).toBe("thread-1");
    expect(thread.participants).toEqual(["user-a", "user-b"]);
    expect(thread.type).toBe("direct");
  });

  it("addParticipant adds new participant", () => {
    const thread = new Thread({
      threadId: "t1",
      participants: ["user-a"],
      type: "group",
    });
    const updated = thread.addParticipant("user-b");
    expect(updated.participants).toEqual(["user-a", "user-b"]);
    expect(updated.threadId).toBe("t1");
    expect(thread.participants).toEqual(["user-a"]);
  });

  it("addParticipant is idempotent when participant already present", () => {
    const thread = new Thread({
      threadId: "t1",
      participants: ["user-a"],
      type: "direct",
    });
    const updated = thread.addParticipant("user-a");
    expect(updated).toBe(thread);
    expect(updated.participants).toEqual(["user-a"]);
  });

  it("throws when threadId is empty", () => {
    expect(
      () =>
        new Thread({
          threadId: "",
          participants: [],
          type: "notification",
        })
    ).toThrow("threadId cannot be empty");
  });

  it("throws when type is invalid", () => {
    expect(
      () =>
        new Thread({
          threadId: "t1",
          participants: [],
          type: "invalid" as "direct",
        })
    ).toThrow("Invalid thread type");
  });

  it("throws when addParticipant receives empty id", () => {
    const thread = new Thread({
      threadId: "t1",
      participants: [],
      type: "direct",
    });
    expect(() => thread.addParticipant("")).toThrow("Participant id cannot be empty");
  });
});
