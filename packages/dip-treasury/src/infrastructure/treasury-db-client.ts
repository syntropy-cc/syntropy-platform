/**
 * Client interface for treasury tables SQL operations (COMP-008.7).
 * Implement with pg.Pool or a test double for integration tests.
 */

/**
 * Client that can execute parameterized SQL for treasury repositories.
 */
export interface TreasuryDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]>;
}
