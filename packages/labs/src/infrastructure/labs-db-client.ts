/**
 * Client interface for Labs scientific context tables (COMP-022.4).
 * Implement with pg.Pool or a test double; app wires the implementation.
 */

/**
 * Client that can execute parameterized SQL for the Labs repositories.
 */
export interface LabsDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]>;
}
