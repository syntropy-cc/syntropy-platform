/**
 * Unit tests for InMemory ThreadRepository and MessageRepository (COMP-028.6).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Thread } from "../../src/domain/thread.js";
import { Message } from "../../src/domain/message.js";
import { InMemoryThreadRepository } from "../../src/infrastructure/repositories/in-memory-thread-repository.js";
import { InMemoryMessageRepository } from "../../src/infrastructure/repositories/in-memory-message-repository.js";

describe("InMemoryThreadRepository (COMP-028.6)", () => {
  let repo: InMemoryThreadRepository;

  beforeEach(() => {
    repo = new InMemoryThreadRepository();
  });

  it("saves and finds thread by id", async () => {
    const thread = new Thread({
      threadId: "thread-1",
      participants: ["user-1", "user-2"],
      type: "direct",
    });
    await repo.save(thread);

    const found = await repo.findById("thread-1");
    expect(found).not.toBeNull();
    expect(found!.threadId).toBe("thread-1");
    expect(found!.participants).toEqual(["user-1", "user-2"]);
    expect(found!.type).toBe("direct");
  });

  it("returns null for unknown thread id", async () => {
    const found = await repo.findById("unknown");
    expect(found).toBeNull();
  });
});

describe("InMemoryMessageRepository (COMP-028.6)", () => {
  let repo: InMemoryMessageRepository;

  beforeEach(() => {
    repo = new InMemoryMessageRepository();
  });

  it("saves and finds messages by thread id", async () => {
    const msg1 = new Message({
      messageId: "msg-1",
      threadId: "thread-1",
      authorId: "user-1",
      content: "Hello",
      sentAt: new Date(1000),
    });
    const msg2 = new Message({
      messageId: "msg-2",
      threadId: "thread-1",
      authorId: "user-2",
      content: "Hi",
      sentAt: new Date(2000),
    });
    await repo.save(msg1);
    await repo.save(msg2);

    const messages = await repo.findByThreadId("thread-1");
    expect(messages).toHaveLength(2);
    expect(messages[0].messageId).toBe("msg-1");
    expect(messages[1].messageId).toBe("msg-2");
  });

  it("returns only messages for the given thread", async () => {
    await repo.save(
      new Message({
        messageId: "m1",
        threadId: "thread-a",
        authorId: "u1",
        content: "A",
        sentAt: new Date(),
      })
    );
    await repo.save(
      new Message({
        messageId: "m2",
        threadId: "thread-b",
        authorId: "u1",
        content: "B",
        sentAt: new Date(),
      })
    );

    const forA = await repo.findByThreadId("thread-a");
    expect(forA).toHaveLength(1);
    expect(forA[0].messageId).toBe("m1");
  });

  it("returns messages ordered by sentAt ascending", async () => {
    await repo.save(
      new Message({
        messageId: "later",
        threadId: "t1",
        authorId: "u1",
        content: "Later",
        sentAt: new Date(2000),
      })
    );
    await repo.save(
      new Message({
        messageId: "earlier",
        threadId: "t1",
        authorId: "u1",
        content: "Earlier",
        sentAt: new Date(1000),
      })
    );

    const messages = await repo.findByThreadId("t1");
    expect(messages[0].messageId).toBe("earlier");
    expect(messages[1].messageId).toBe("later");
  });
});
