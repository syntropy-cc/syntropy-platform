/**
 * Port for appending AVU transactions to the journal (COMP-008.3).
 * Architecture: append-only journal; atomic with balance update in COMP-008.7.
 */

import type { AVUTransaction } from "../avu-transaction.js";

export interface AVUTransactionJournalPort {
  append(transaction: AVUTransaction): Promise<void>;
}
