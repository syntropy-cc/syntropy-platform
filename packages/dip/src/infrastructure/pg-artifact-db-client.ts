/**
 * pg.Pool adapter for ArtifactDbClient (COMP-003.4).
 */

import type { Pool } from "pg";
import type { ArtifactDbClient } from "./artifact-db-client.js";

/**
 * Wraps a pg Pool to implement ArtifactDbClient.
 */
export class PgArtifactDbClient implements ArtifactDbClient {
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
