/**
 * pg.Pool adapter for GovernanceDbClient (COMP-007.9).
 * Allows API and other apps to use real Postgres with the governance package.
 */

import type { Pool } from "pg";
import type { GovernanceDbClient } from "./governance-db-client.js";

/**
 * Wraps a pg Pool to implement GovernanceDbClient for dip schema tables.
 */
export class PgGovernanceDbClient implements GovernanceDbClient {
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
