/**
 * Generic AppendOnlyLog interface for domain packages (COMP-039.2).
 *
 * Implemented by MockAppendOnlyLog (tests) and by adapters over Postgres event log.
 * Architecture: COMP-009, COMP-039, PAT-004
 */

/**
 * Filter for querying the log. All fields optional; combine for narrow results.
 */
export interface AppendOnlyLogQueryFilter {
  correlationId?: string;
  actorId?: string;
  /** Inclusive range by recorded_at (or equivalent timestamp). */
  from?: Date;
  to?: Date;
}

/**
 * Generic append-only log: append events and query by filter.
 * No update or delete. Used throughout domain packages.
 * TRead is the type returned by query(); TAppend is the type for append (defaults to TRead).
 */
export interface IAppendOnlyLog<TRead, TAppend = TRead> {
  append(event: TAppend): Promise<void>;
  query(filter?: AppendOnlyLogQueryFilter): Promise<TRead[]>;
}
