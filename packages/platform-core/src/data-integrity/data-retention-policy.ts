/**
 * Data retention policy configuration (COMP-039.5).
 *
 * Defines retention windows per entity type. event_log (AppendOnlyLog) is
 * never deleted. PII and session/moderation data are purged per CON-005.
 *
 * Architecture: COMP-039, cross-cutting/data-integrity/ARCHITECTURE.md
 */

/** Entity types that have configurable retention (event_log is excluded). */
export type RetentionEntityType =
  | "session_log"
  | "moderation_log"
  | "personal_data_after_deletion";

/** Retention window in days. */
export interface RetentionWindow {
  /** Retention period in days. Records older than this may be purged. */
  days: number;
  /** If true, purge means soft-delete only; otherwise hard-delete after retention. */
  softDeleteOnly?: boolean;
}

/** Policy: retention windows per entity type. */
export interface DataRetentionPolicy {
  /** Session logs (e.g. auth sessions): 90 days. */
  sessionLog: RetentionWindow;
  /** Moderation logs: 3 years (compliance). */
  moderationLog: RetentionWindow;
  /** Personal data (email, name) after account deletion: 7 years (CON-005). */
  personalDataAfterDeletion: RetentionWindow;
}

/** Default policy: session 90d, moderation 3y, personal data 7y after deletion. */
export const DEFAULT_DATA_RETENTION_POLICY: DataRetentionPolicy = {
  sessionLog: { days: 90, softDeleteOnly: true },
  moderationLog: { days: 3 * 365, softDeleteOnly: false },
  personalDataAfterDeletion: { days: 7 * 365, softDeleteOnly: false },
};
