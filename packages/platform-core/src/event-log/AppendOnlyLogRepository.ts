/**
 * Append-only log repository interface (COMP-009.6).
 *
 * Architecture: COMP-009, PAT-004
 */

import type { EventLogEntry, EventLogEntryToAppend, DateRange } from "./types.js";

/**
 * Repository for platform_core.event_log. Insert-only; no update/delete.
 */
export interface AppendOnlyLogRepository {
  /**
   * Appends one entry to the event log.
   */
  append(entry: EventLogEntryToAppend): Promise<void>;

  /**
   * Returns all events with the given correlation_id, in recorded_at order.
   */
  findByCorrelationId(correlationId: string): Promise<EventLogEntry[]>;

  /**
   * Returns events for the actor in the given date range, in recorded_at order.
   */
  findByActorId(actorId: string, dateRange: DateRange): Promise<EventLogEntry[]>;
}
