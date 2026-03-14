/**
 * Message repository port (COMP-028.6).
 * Architecture: communication domain, PAT-004
 */

import type { Message } from "../message.js";

/**
 * Repository for persisting and querying messages within threads.
 */
export interface MessageRepository {
  save(message: Message): Promise<void>;
  findByThreadId(threadId: string): Promise<Message[]>;
}
