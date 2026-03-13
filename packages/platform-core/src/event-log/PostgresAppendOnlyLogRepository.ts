/**
 * PostgreSQL implementation of AppendOnlyLogRepository (COMP-009.6).
 *
 * Uses platform_core.event_log table from migration 20260313200000.
 */

import type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
import type { EventLogClient } from "./EventLogClient.js";
import type { EventLogEntry, EventLogEntryToAppend, DateRange } from "./types.js";

const INSERT_SQL = `
  INSERT INTO platform_core.event_log
    (actor_id, event_type, payload, schema_version, correlation_id, causation_id)
  VALUES ($1, $2, $3::jsonb, $4, $5, $6)
`;

const SELECT_BY_CORRELATION = `
  SELECT id, sequence_number, actor_id, event_type, payload, schema_version,
         correlation_id, causation_id, recorded_at
  FROM platform_core.event_log
  WHERE correlation_id = $1
  ORDER BY recorded_at ASC
`;

const SELECT_BY_ACTOR_RANGE = `
  SELECT id, sequence_number, actor_id, event_type, payload, schema_version,
         correlation_id, causation_id, recorded_at
  FROM platform_core.event_log
  WHERE actor_id = $1 AND recorded_at >= $2 AND recorded_at <= $3
  ORDER BY recorded_at ASC
`;

function rowToEntry(row: Record<string, unknown>): EventLogEntry {
  return {
    id: Number(row.id),
    sequence_number: Number(row.sequence_number),
    actor_id: String(row.actor_id),
    event_type: String(row.event_type),
    payload: (row.payload as Record<string, unknown>) ?? {},
    schema_version: String(row.schema_version),
    correlation_id: row.correlation_id != null ? String(row.correlation_id) : null,
    causation_id: row.causation_id != null ? String(row.causation_id) : null,
    recorded_at: row.recorded_at instanceof Date ? row.recorded_at : new Date(String(row.recorded_at)),
  };
}

export class PostgresAppendOnlyLogRepository implements AppendOnlyLogRepository {
  constructor(private readonly client: EventLogClient) {}

  async append(entry: EventLogEntryToAppend): Promise<void> {
    const params = [
      entry.actor_id,
      entry.event_type,
      JSON.stringify(entry.payload),
      entry.schema_version,
      entry.correlation_id ?? null,
      entry.causation_id ?? null,
    ];
    await this.client.execute(INSERT_SQL.trim(), params);
  }

  async findByCorrelationId(correlationId: string): Promise<EventLogEntry[]> {
    const rows = await this.client.query<Record<string, unknown>>(SELECT_BY_CORRELATION, [correlationId]);
    return rows.map(rowToEntry);
  }

  async findByActorId(actorId: string, dateRange: DateRange): Promise<EventLogEntry[]> {
    const params = [actorId, dateRange.from, dateRange.to];
    const rows = await this.client.query<Record<string, unknown>>(SELECT_BY_ACTOR_RANGE, params);
    return rows.map(rowToEntry);
  }
}
