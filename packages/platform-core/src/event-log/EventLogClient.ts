/**
 * Client interface for event_log SQL operations (COMP-009.6).
 *
 * Implement with pg.Client, Supabase client, or test double.
 */

/**
 * Client that can execute parameterized SQL.
 * - execute: for INSERT/UPDATE (no rows returned).
 * - query: for SELECT (returns rows).
 */
export interface EventLogClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = unknown>(sql: string, params: unknown[]): Promise<T[]>;
}
