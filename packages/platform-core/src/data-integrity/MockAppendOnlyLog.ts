/**
 * In-memory implementation of IAppendOnlyLog for tests (COMP-039.2).
 */

import type {
  IAppendOnlyLog,
  AppendOnlyLogQueryFilter,
} from "./append-only-log-interface.js";

/** Stored entry with optional metadata for filtering. */
export interface MockLogEntry<T> {
  event: T;
  sequence: number;
  recordedAt: Date;
  /** Optional; set if T has correlation_id. */
  correlationId?: string | null;
  /** Optional; set if T has actor_id. */
  actorId?: string | null;
}

/**
 * Type for events that may have correlation_id / actor_id for filtering.
 * MockAppendOnlyLog uses these when present.
 */
export interface LogEventWithMeta {
  correlation_id?: string | null;
  actor_id?: string | null;
  recorded_at?: Date;
}

/**
 * In-memory append-only log. Thread-safe for single-threaded tests.
 * Query filters by correlationId, actorId, and from/to when present on stored entries.
 */
export class MockAppendOnlyLog<T extends LogEventWithMeta = LogEventWithMeta>
  implements IAppendOnlyLog<T, T>
{
  private readonly entries: MockLogEntry<T>[] = [];
  private nextSequence = 0;

  async append(event: T): Promise<void> {
    const record: MockLogEntry<T> = {
      event,
      sequence: this.nextSequence++,
      recordedAt:
        (event as { recorded_at?: Date }).recorded_at ?? new Date(),
      correlationId:
        (event as { correlation_id?: string | null }).correlation_id,
      actorId: (event as { actor_id?: string | null }).actor_id,
    };
    this.entries.push(record);
  }

  async query(filter?: AppendOnlyLogQueryFilter): Promise<T[]> {
    if (!filter || Object.keys(filter).length === 0) {
      return this.entries.map((e) => e.event);
    }

    let result = this.entries;

    if (filter.correlationId !== undefined) {
      result = result.filter(
        (e) => e.correlationId === filter.correlationId
      );
    }
    if (filter.actorId !== undefined) {
      result = result.filter((e) => e.actorId === filter.actorId);
    }
    if (filter.from !== undefined) {
      const from = filter.from.getTime();
      result = result.filter((e) => e.recordedAt.getTime() >= from);
    }
    if (filter.to !== undefined) {
      const to = filter.to.getTime();
      result = result.filter((e) => e.recordedAt.getTime() <= to);
    }

    return result.map((e) => e.event);
  }

  /** Test helper: clear all entries. */
  clear(): void {
    this.entries.length = 0;
    this.nextSequence = 0;
  }

  /** Test helper: number of appended events. */
  get length(): number {
    return this.entries.length;
  }
}
