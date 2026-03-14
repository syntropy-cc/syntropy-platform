/**
 * Event log repository and causal chain tracer (COMP-009.5, COMP-009.6).
 */

export type { EventLogEntry, EventLogEntryToAppend, DateRange } from "./types.js";
export type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
export type { EventLogClient } from "./EventLogClient.js";
export { PgEventLogClient } from "./PgEventLogClient.js";
export { PostgresAppendOnlyLogRepository } from "./PostgresAppendOnlyLogRepository.js";
export { AppendOnlyLogAdapter } from "./AppendOnlyLogAdapter.js";
export { CausalChainTracer } from "./CausalChainTracer.js";
export {
  AuditLogConsumer,
  AUDIT_LOG_TOPICS,
  AUDIT_LOG_CONSUMER_GROUP,
  type AuditLogConsumerOptions,
} from "./AuditLogConsumer.js";
