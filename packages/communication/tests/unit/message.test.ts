/**
 * Unit tests for Message entity (COMP-028.2).
 */

import { describe, it, expect } from "vitest";
import { Message } from "../../src/domain/message.js";

describe("Message (COMP-028.2)", () => {
  it("creates with valid params", () => {
    const sentAt = new Date("2026-03-14T12:00:00Z");
    const message = new Message({
      messageId: "msg-1",
      threadId: "thread-1",
      authorId: "user-a",
      content: "Hello",
      sentAt,
    });
    expect(message.messageId).toBe("msg-1");
    expect(message.threadId).toBe("thread-1");
    expect(message.authorId).toBe("user-a");
    expect(message.content).toBe("Hello");
    expect(message.sentAt).toBe(sentAt);
    expect(message.deleted_at).toBeNull();
  });

  it("softDelete sets deleted_at", () => {
    const message = new Message({
      messageId: "msg-1",
      threadId: "thread-1",
      authorId: "user-a",
      content: "Hi",
      sentAt: new Date(),
    });
    expect(message.deleted_at).toBeNull();
    message.softDelete();
    expect(message.deleted_at).not.toBeNull();
    expect(message.deleted_at).toBeInstanceOf(Date);
  });

  it("softDelete is idempotent", () => {
    const message = new Message({
      messageId: "msg-1",
      threadId: "t1",
      authorId: "u1",
      content: "x",
      sentAt: new Date(),
    });
    message.softDelete();
    const firstDeletedAt = message.deleted_at;
    message.softDelete();
    expect(message.deleted_at).toBe(firstDeletedAt);
  });

  it("throws when messageId is empty", () => {
    expect(
      () =>
        new Message({
          messageId: "",
          threadId: "t1",
          authorId: "u1",
          content: "x",
          sentAt: new Date(),
        })
    ).toThrow("messageId cannot be empty");
  });

  it("throws when threadId is empty", () => {
    expect(
      () =>
        new Message({
          messageId: "m1",
          threadId: "",
          authorId: "u1",
          content: "x",
          sentAt: new Date(),
        })
    ).toThrow("threadId cannot be empty");
  });

  it("throws when authorId is empty", () => {
    expect(
      () =>
        new Message({
          messageId: "m1",
          threadId: "t1",
          authorId: "",
          content: "x",
          sentAt: new Date(),
        })
    ).toThrow("authorId cannot be empty");
  });

  it("throws when sentAt is invalid", () => {
    expect(
      () =>
        new Message({
          messageId: "m1",
          threadId: "t1",
          authorId: "u1",
          content: "x",
          sentAt: new Date("not-a-date"),
        })
    ).toThrow("sentAt must be a valid Date");
  });
});
