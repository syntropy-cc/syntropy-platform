/**
 * Client interface for Communication domain SQL (COMP-028.3).
 * Architecture: COMP-028. Implement with pg.Pool or test double; app wires the implementation.
 */

/**
 * Client that can execute parameterized SQL for Communication repositories.
 */
export interface CommunicationDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]>;
}
