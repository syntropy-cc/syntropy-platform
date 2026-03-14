/**
 * Client interface for governance_contracts table SQL operations (COMP-004.5).
 * Implement with pg.Pool or a test double.
 */

/**
 * Client that can execute parameterized SQL for the contract repository.
 */
export interface ContractDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<T[]>;
}
