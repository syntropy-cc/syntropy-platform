/**
 * Client interface for IACP table SQL operations (COMP-005.6).
 * Implement with pg.Pool or a test double.
 */

/**
 * Client that can execute parameterized SQL for the IACP repository.
 */
export interface IacpDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<T[]>;
}
