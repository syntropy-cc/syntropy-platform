/**
 * PostgreSQL implementation of TreasuryTransferRepositoryPort (COMP-008.7).
 */

import { TreasuryTransfer } from "../../domain/treasury-transfer.js";
import type { TreasuryTransferRepositoryPort } from "../../domain/ports/treasury-transfer-repository-port.js";
import type { TreasuryDbClient } from "../treasury-db-client.js";

const TABLE = "dip.treasury_transfers";
const COLS = "transfer_id, from_account_id, to_account_id, amount, created_at";
const INSERT_SQL = `
  INSERT INTO ${TABLE} (transfer_id, from_account_id, to_account_id, amount, created_at)
  VALUES ($1, $2, $3, $4, $5)
`;
const SELECT_BY_ID = `SELECT ${COLS} FROM ${TABLE} WHERE transfer_id = $1`;

function rowToTransfer(row: Record<string, unknown>): TreasuryTransfer {
  const createdAt = row.created_at;
  return TreasuryTransfer.record({
    transferId: String(row.transfer_id),
    fromAccountId: String(row.from_account_id),
    toAccountId: String(row.to_account_id),
    amount: Number(row.amount),
    createdAt:
      createdAt instanceof Date
        ? createdAt
        : new Date(String(createdAt)),
  });
}

export class PostgresTreasuryTransferRepository
  implements TreasuryTransferRepositoryPort
{
  constructor(private readonly db: TreasuryDbClient) {}

  async save(transfer: TreasuryTransfer): Promise<void> {
    await this.db.execute(INSERT_SQL, [
      transfer.transferId,
      transfer.fromAccountId,
      transfer.toAccountId,
      transfer.amount,
      transfer.createdAt,
    ]);
  }

  async findById(transferId: string): Promise<TreasuryTransfer | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      SELECT_BY_ID,
      [transferId]
    );
    if (rows.length === 0) return null;
    return rowToTransfer(rows[0]);
  }
}
