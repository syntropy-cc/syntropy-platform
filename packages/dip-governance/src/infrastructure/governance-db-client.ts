/**
 * Client interface for governance tables SQL operations (COMP-007.6).
 * Implement with pg.Pool or a test double for integration tests.
 */

/**
 * Client that can execute parameterized SQL for governance repositories.
 */
export interface GovernanceDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]>;
}
