/**
 * pg.Pool adapter for AgentSessionDbClient (COMP-012.7).
 */

import type { Pool } from "pg";
import type { AgentSessionDbClient } from "./agent-session-db-client.js";

/**
 * Wraps a pg Pool to implement AgentSessionDbClient.
 */
export class PgAgentSessionDbClient implements AgentSessionDbClient {
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
