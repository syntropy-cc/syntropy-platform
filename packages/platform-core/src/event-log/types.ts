/**
 * Event log entry and repository types (COMP-009.6).
 *
 * Architecture: COMP-009, event-bus-audit
 */

/**
 * Entry to append to platform_core.event_log.
 */
export interface EventLogEntryToAppend {
  actor_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  schema_version: string;
  correlation_id?: string | null;
  causation_id?: string | null;
}

/**
 * A single row from the event_log table (read model).
 */
export interface EventLogEntry {
  id: number;
  sequence_number: number;
  actor_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  schema_version: string;
  correlation_id: string | null;
  causation_id: string | null;
  recorded_at: Date;
}

/**
 * Date range for querying by actor and time.
 */
export interface DateRange {
  from: Date;
  to: Date;
}
