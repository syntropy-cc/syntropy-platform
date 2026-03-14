/**
 * PostgreSQL Pool adapter implementing EventLogClient (COMP-010.8).
 * Enables PostgresPortfolioRepository and other event-log consumers to use a pg.Pool.
 */

import type { Pool } from "pg";
import type { EventLogClient } from "./EventLogClient.js";

/**
 * Adapts a pg.Pool to the EventLogClient interface.
 * query: runs SELECT and returns rows; execute: runs INSERT/UPDATE/DELETE.
 */
export class PgEventLogClient implements EventLogClient {
  constructor(private readonly pool: Pool) {}

  async query<T = unknown>(sql: string, params: unknown[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return (result.rows ?? []) as T[];
  }

  async execute(sql: string, params: unknown[]): Promise<void> {
    await this.pool.query(sql, params);
  }
}
