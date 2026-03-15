/**
 * Data retention purge job (COMP-039.5).
 *
 * Runs daily; applies DataRetentionPolicy via DataRetentionService.
 * event_log is never purged. Audit log records all purge operations.
 */

import {
  createLogger,
  DataRetentionService,
  DEFAULT_DATA_RETENTION_POLICY,
  type PurgeAuditSink,
} from "@syntropy/platform-core";

const log = createLogger("workers:data-retention-purge");

/** Audit sink that logs purge operations (production would append to immutable store). */
const logAuditSink: PurgeAuditSink = {
  async recordPurge(result) {
    log.info(
      {
        entityType: result.entityType,
        purgedCount: result.purgedCount,
        purgedAt: result.purgedAt.toISOString(),
      },
      "Data retention purge recorded (audit)"
    );
  },
};

let serviceInstance: DataRetentionService | null = null;

function getService(): DataRetentionService {
  if (!serviceInstance) {
    serviceInstance = new DataRetentionService({
      policy: DEFAULT_DATA_RETENTION_POLICY,
      audit: logAuditSink,
      // repositories can be wired when domain repos are available
    });
  }
  return serviceInstance;
}

/**
 * Run the data retention purge job. Call from cron scheduler daily.
 */
export async function runDataRetentionPurge(): Promise<void> {
  const service = getService();
  const results = await service.runRetentionPurge();
  log.info({ results }, "Data retention purge job finished");
}
