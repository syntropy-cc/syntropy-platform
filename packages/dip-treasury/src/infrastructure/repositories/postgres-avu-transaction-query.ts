/**
 * PostgreSQL implementation of AVUTransactionQueryPort (COMP-008.8).
 * Reads transaction history from dip.avu_transactions.
 */

import { AVUTransaction } from "../../domain/avu-transaction.js";
import type { AVUTransactionQueryPort } from "../../domain/ports/avu-transaction-query-port.js";
import type { TreasuryDbClient } from "../treasury-db-client.js";

const TABLE = "dip.avu_transactions";
const DEFAULT_LIMIT = 100;

interface AvuTransactionRow {
  transaction_id: string;
  account_id: string;
  amount: number;
  type: string;
  source_event_id: string | null;
  created_at: Date;
}

function rowToTransaction(row: AvuTransactionRow): AVUTransaction {
  return AVUTransaction.create({
    transactionId: row.transaction_id,
    accountId: row.account_id,
    amount: Number(row.amount),
    type: row.type === "debit" ? "debit" : "credit",
    sourceEventId: row.source_event_id ?? undefined,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  });
}

export class PostgresAVUTransactionQuery implements AVUTransactionQueryPort {
  constructor(private readonly db: TreasuryDbClient) {}

  async listByAccountId(
    accountId: string,
    limit: number = DEFAULT_LIMIT
  ): Promise<AVUTransaction[]> {
    const capped = Math.min(Math.max(1, limit), 500);
    const sql = `
      SELECT transaction_id, account_id, amount, type, source_event_id, created_at
      FROM ${TABLE}
      WHERE account_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const rows = await this.db.query<AvuTransactionRow>(sql, [accountId, capped]);
    return rows.map(rowToTransaction);
  }
}
