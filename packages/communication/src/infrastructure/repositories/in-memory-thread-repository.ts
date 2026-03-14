/**
 * In-memory implementation of ThreadRepository (COMP-028.6).
 * Used in tests and when persistence is not required.
 */

import type { Thread } from "../../domain/thread.js";
import type { ThreadRepository } from "../../domain/ports/thread-repository.js";

export class InMemoryThreadRepository implements ThreadRepository {
  private readonly threads = new Map<string, Thread>();

  async save(thread: Thread): Promise<void> {
    this.threads.set(thread.threadId, thread);
  }

  async findById(threadId: string): Promise<Thread | null> {
    return this.threads.get(threadId) ?? null;
  }
}
