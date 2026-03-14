/**
 * pg.Pool adapter for TreasuryDbClient (COMP-008.7).
 * Allows API and other apps to use real Postgres with the treasury package.
 */

import type { Pool } from "pg";
import type { TreasuryDbClient } from "./treasury-db-client.js";

/**
 * Wraps a pg Pool to implement TreasuryDbClient for dip treasury tables.
 */
export class PgTreasuryDbClient implements TreasuryDbClient {
  constructor(private readonly pool: Pool) {}

  async execute(sql: string, params: unknown[]): Promise<void> {
    await this.pool.query(sql, params);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }
}
