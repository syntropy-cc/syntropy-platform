/**
 * In-memory implementation of MessageRepository (COMP-028.6).
 * Used in tests and when persistence is not required.
 */

import type { Message } from "../../domain/message.js";
import type { MessageRepository } from "../../domain/ports/message-repository.js";

export class InMemoryMessageRepository implements MessageRepository {
  private readonly messages: Message[] = [];

  async save(message: Message): Promise<void> {
    this.messages.push(message);
  }

  async findByThreadId(threadId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
}
