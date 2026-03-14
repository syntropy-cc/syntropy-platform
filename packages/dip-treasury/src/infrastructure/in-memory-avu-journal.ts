/**
 * In-memory AVU transaction journal for tests (COMP-008.3).
 */

import type { AVUTransaction } from "../domain/avu-transaction.js";
import type { AVUTransactionJournalPort } from "../domain/ports/avu-transaction-journal-port.js";

export class InMemoryAVUJournal implements AVUTransactionJournalPort {
  private readonly entries: AVUTransaction[] = [];

  async append(transaction: AVUTransaction): Promise<void> {
    this.entries.push(transaction);
  }

  getEntries(): readonly AVUTransaction[] {
    return this.entries;
  }

  clear(): void {
    this.entries.length = 0;
  }
}
