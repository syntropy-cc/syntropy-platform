/**
 * PostgreSQL implementation of TreasuryAccountRepositoryPort (COMP-008.7).
 */

import { TreasuryAccount } from "../../domain/treasury-account.js";
import type { TreasuryAccountRepositoryPort } from "../../domain/ports/treasury-account-repository-port.js";
import type { TreasuryDbClient } from "../treasury-db-client.js";

const TABLE = "dip.treasury_accounts";
const COLS = "account_id, institution_id, avu_balance";
const INSERT_SQL = `
  INSERT INTO ${TABLE} (account_id, institution_id, avu_balance)
  VALUES ($1, $2, $3)
  ON CONFLICT (account_id) DO UPDATE SET
    avu_balance = EXCLUDED.avu_balance,
    updated_at = now()
`;
const SELECT_BY_ACCOUNT = `SELECT ${COLS} FROM ${TABLE} WHERE account_id = $1`;
const SELECT_BY_INSTITUTION = `SELECT ${COLS} FROM ${TABLE} WHERE institution_id = $1`;

function rowToAccount(row: Record<string, unknown>): TreasuryAccount {
  return TreasuryAccount.fromPersistence({
    accountId: String(row.account_id),
    institutionId: String(row.institution_id),
    avuBalance: Number(row.avu_balance),
  });
}

export class PostgresTreasuryAccountRepository implements TreasuryAccountRepositoryPort {
  constructor(private readonly db: TreasuryDbClient) {}

  async findByAccountId(accountId: string): Promise<TreasuryAccount | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      SELECT_BY_ACCOUNT,
      [accountId]
    );
    if (rows.length === 0) return null;
    return rowToAccount(rows[0]);
  }

  async findByInstitutionId(
    institutionId: string
  ): Promise<TreasuryAccount | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      SELECT_BY_INSTITUTION,
      [institutionId]
    );
    if (rows.length === 0) return null;
    return rowToAccount(rows[0]);
  }

  async save(account: TreasuryAccount): Promise<void> {
    await this.db.execute(INSERT_SQL, [
      account.accountId,
      account.institutionId,
      account.avuBalance,
    ]);
  }
}
