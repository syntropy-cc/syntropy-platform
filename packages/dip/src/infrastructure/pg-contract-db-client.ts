/**
 * pg.Pool adapter for ContractDbClient (COMP-004.5).
 */

import type { Pool } from "pg";
import type { ContractDbClient } from "./contract-db-client.js";

/**
 * Wraps a pg Pool to implement ContractDbClient for governance_contracts table.
 */
export class PgContractDbClient implements ContractDbClient {
  constructor(private readonly pool: Pool) {}

  async execute(sql: string, params: unknown[]): Promise<void> {
    await this.pool.query(sql, params);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }
}
