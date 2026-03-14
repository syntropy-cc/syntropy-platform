/**
 * pg.Pool adapter for ProjectDbClient (COMP-006.4).
 */

import type { Pool } from "pg";
import type { ProjectDbClient } from "./project-db-client.js";

/**
 * Wraps a pg Pool to implement ProjectDbClient.
 */
export class PgProjectDbClient implements ProjectDbClient {
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
