/**
 * Client interface for agent_sessions table SQL (COMP-012.7).
 * Implement with pg.Pool or a test double.
 */

/**
 * Client that can execute parameterized SQL for the agent session repository.
 */
export interface AgentSessionDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]>;
}
