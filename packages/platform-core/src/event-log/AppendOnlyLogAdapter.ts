/**
 * Adapter that makes AppendOnlyLogRepository implement IAppendOnlyLog (COMP-039.2).
 */

import type { AppendOnlyLogQueryFilter, IAppendOnlyLog } from "../data-integrity/append-only-log-interface.js";
import type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
import type { EventLogEntry, EventLogEntryToAppend, DateRange } from "./types.js";

/**
 * Wraps AppendOnlyLogRepository so it implements the generic IAppendOnlyLog interface.
 * query() supports correlationId, actorId, and from/to date range.
 */
export class AppendOnlyLogAdapter
  implements IAppendOnlyLog<EventLogEntry, EventLogEntryToAppend>
{
  constructor(private readonly repository: AppendOnlyLogRepository) {}

  async append(event: EventLogEntryToAppend): Promise<void> {
    await this.repository.append(event);
  }

  async query(filter?: AppendOnlyLogQueryFilter): Promise<EventLogEntry[]> {
    if (!filter || Object.keys(filter).length === 0) {
      return [];
    }
    if (filter.correlationId !== undefined) {
      return this.repository.findByCorrelationId(filter.correlationId);
    }
    if (
      filter.actorId !== undefined &&
      filter.from !== undefined &&
      filter.to !== undefined
    ) {
      const dateRange: DateRange = { from: filter.from, to: filter.to };
      return this.repository.findByActorId(filter.actorId, dateRange);
    }
    if (filter.actorId !== undefined) {
      const from = filter.from ?? new Date(0);
      const to = filter.to ?? new Date();
      return this.repository.findByActorId(filter.actorId, { from, to });
    }
    return [];
  }
}
