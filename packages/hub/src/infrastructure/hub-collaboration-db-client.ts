/**
 * Client interface for Hub collaboration tables (COMP-019.7).
 * Implement with pg.Pool or a test double; app wires the implementation.
 */

/**
 * Client that can execute parameterized SQL for the Hub collaboration repositories.
 */
export interface HubCollaborationDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]>;
}
