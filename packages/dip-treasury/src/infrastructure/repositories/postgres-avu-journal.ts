/**
 * PostgreSQL implementation of AVUTransactionJournalPort (COMP-008.7).
 * Append-only journal for AVU transactions.
 */

import type { AVUTransaction } from "../../domain/avu-transaction.js";
import type { AVUTransactionJournalPort } from "../../domain/ports/avu-transaction-journal-port.js";
import type { TreasuryDbClient } from "../treasury-db-client.js";

const TABLE = "dip.avu_transactions";
const INSERT_SQL = `
  INSERT INTO ${TABLE} (transaction_id, account_id, amount, type, source_event_id, created_at)
  VALUES ($1, $2, $3, $4, $5, $6)
`;

export class PostgresAVUJournal implements AVUTransactionJournalPort {
  constructor(private readonly db: TreasuryDbClient) {}

  async append(transaction: AVUTransaction): Promise<void> {
    await this.db.execute(INSERT_SQL, [
      transaction.transactionId,
      transaction.accountId,
      transaction.amount,
      transaction.type,
      transaction.sourceEventId ?? null,
      transaction.createdAt,
    ]);
  }
}
