/**
 * Client interface for artifact table SQL operations (COMP-003.4).
 * Implement with pg.Pool or a test double.
 */

/**
 * Client that can execute parameterized SQL for the artifact repository.
 */
export interface ArtifactDbClient {
  execute(sql: string, params: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]>;
}
