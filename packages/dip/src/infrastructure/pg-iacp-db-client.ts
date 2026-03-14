/**
 * pg.Pool adapter for IacpDbClient (COMP-005.6).
 */

import type { Pool } from "pg";
import type { IacpDbClient } from "./iacp-db-client.js";

/**
 * Wraps a pg Pool to implement IacpDbClient.
 */
export class PgIacpDbClient implements IacpDbClient {
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
