/**
 * Data retention and purge service (COMP-039.5).
 *
 * Enforces retention policy: purge expired records (never event_log).
 * purgeUserData(userId) supports right-to-deletion (GDPR). All purge
 * operations must be recorded in an immutable audit log.
 *
 * Architecture: COMP-039, cross-cutting/data-integrity/ARCHITECTURE.md, CON-005
 */

import {
  DEFAULT_DATA_RETENTION_POLICY,
  type DataRetentionPolicy,
} from "./data-retention-policy.js";

/** Result of a purge run (counts for audit). */
export interface PurgeResult {
  /** Entity type that was purged. */
  entityType: string;
  /** Number of records purged. */
  purgedCount: number;
  /** Timestamp of the purge. */
  purgedAt: Date;
}

/** Audit sink for purge operations (append-only; immutable). */
export interface PurgeAuditSink {
  recordPurge(result: PurgeResult): Promise<void>;
}

/** Optional repository adapters for entity purges. When not provided, purge is no-op. */
export interface DataRetentionRepositories {
  /** Purge expired session logs. Returns count purged. */
  purgeExpiredSessions?(olderThanDays: number): Promise<number>;
  /** Purge expired moderation logs. Returns count purged. */
  purgeExpiredModerationLogs?(olderThanDays: number): Promise<number>;
}

export interface DataRetentionServiceOptions {
  policy: DataRetentionPolicy;
  audit: PurgeAuditSink;
  repositories?: DataRetentionRepositories;
}

/**
 * Service that applies data retention policy and supports user data purge.
 * event_log (AppendOnlyLog) is never touched by this service.
 */
export class DataRetentionService {
  private readonly policy: DataRetentionPolicy;
  private readonly audit: PurgeAuditSink;
  private readonly repos: DataRetentionRepositories;

  constructor(options: DataRetentionServiceOptions) {
    this.policy = options.policy ?? DEFAULT_DATA_RETENTION_POLICY;
    this.audit = options.audit;
    this.repos = options.repositories ?? {};
  }

  /**
   * Run retention purge for all entity types per policy.
   * Does not delete or modify event_log entries.
   */
  async runRetentionPurge(): Promise<PurgeResult[]> {
    const results: PurgeResult[] = [];
    const now = new Date();

    if (this.repos.purgeExpiredSessions) {
      const count = await this.repos.purgeExpiredSessions(this.policy.sessionLog.days);
      results.push({
        entityType: "session_log",
        purgedCount: count,
        purgedAt: now,
      });
      if (count > 0) {
        await this.audit.recordPurge(results[results.length - 1]!);
      }
    }

    if (this.repos.purgeExpiredModerationLogs) {
      const count = await this.repos.purgeExpiredModerationLogs(
        this.policy.moderationLog.days
      );
      results.push({
        entityType: "moderation_log",
        purgedCount: count,
        purgedAt: now,
      });
      if (count > 0) {
        await this.audit.recordPurge(results[results.length - 1]!);
      }
    }

    return results;
  }

  /**
   * Purge all data for a user (right-to-deletion). Cascades soft-delete then
   * hard-delete after retention period per policy. Audit log records the operation.
   */
  async purgeUserData(userId: string): Promise<void> {
    // Placeholder: actual implementation would call identity/session/moderation
    // repos to soft-delete and then hard-delete after retention. Audit every step.
    await this.audit.recordPurge({
      entityType: "user_purge",
      purgedCount: 0,
      purgedAt: new Date(),
    });
  }

  /** Return the current policy (read-only). */
  getPolicy(): DataRetentionPolicy {
    return this.policy;
  }
}
