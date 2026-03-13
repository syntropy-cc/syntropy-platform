/**
 * Append-only log types and insert helper (COMP-039.3).
 *
 * Persists events to platform_core.append_only_log. No UPDATE/DELETE.
 * Table is created by supabase/migrations/20260313160000_platform_core_append_only_log.sql.
 *
 * Architecture: COMP-039.3, cross-cutting/data-integrity/ARCHITECTURE.md
 */

/**
 * Entry to append to the log. id and recorded_at are set by the database.
 */
export interface AppendOnlyLogEntry {
  actor_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  schema_version: string;
  correlation_id?: string | null;
  causation_id?: string | null;
}

/**
 * Minimal client interface to run a parameterized statement.
 * Implement with pg.Client, Supabase client, or a test double.
 */
export interface AppendOnlyLogClient {
  /**
   * Execute a single statement. Placeholders are $1, $2, ...
   */
  execute(sql: string, params: unknown[]): Promise<void>;
}

const INSERT_SQL = `
  INSERT INTO platform_core.append_only_log
    (actor_id, event_type, payload, schema_version, correlation_id, causation_id)
  VALUES ($1, $2, $3::jsonb, $4, $5, $6)
`;

/**
 * Appends one entry to the append-only log.
 *
 * @param client - Client that can execute SQL (e.g. pg or Supabase adapter).
 * @param entry - The log entry; payload will be serialized as JSONB.
 */
export async function appendToLog(
  client: AppendOnlyLogClient,
  entry: AppendOnlyLogEntry
): Promise<void> {
  const params = [
    entry.actor_id,
    entry.event_type,
    JSON.stringify(entry.payload),
    entry.schema_version,
    entry.correlation_id ?? null,
    entry.causation_id ?? null,
  ];
  await client.execute(INSERT_SQL.trim(), params);
}
