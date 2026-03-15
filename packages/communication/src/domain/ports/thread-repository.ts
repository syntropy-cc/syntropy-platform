/**
 * Thread repository port (COMP-028.6).
 * Architecture: COMP-028, communication domain, PAT-004
 */

import type { Thread } from "../thread.js";

/**
 * Repository for persisting and querying message threads.
 */
export interface ThreadRepository {
  save(thread: Thread): Promise<void>;
  findById(threadId: string): Promise<Thread | null>;
}
