/**
 * Port for querying AVU transaction history by account (COMP-008.8).
 * Read-only; append remains on AVUTransactionJournalPort.
 */

import type { AVUTransaction } from "../avu-transaction.js";

export interface AVUTransactionQueryPort {
  /**
   * Returns recent transactions for the given account, newest first.
   * @param accountId - Treasury account id
   * @param limit - Max number of transactions to return (default 100)
   */
  listByAccountId(
    accountId: string,
    limit?: number
  ): Promise<AVUTransaction[]>;
}
