/**
 * Client interface for project table SQL operations (COMP-006.4).
 * Implement with pg.Pool or a test double.
 */

/**
 * Client that can execute parameterized SQL for the project repository.
 */
export interface ProjectDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<T[]>;
}
