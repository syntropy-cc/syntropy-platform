/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040, COMP-037
 */
export { validateEnv, type ValidateEnvOptions, } from "./config/env-validator.js";
export { encryptField, decryptField, getEncryptionKey, type EncryptedField, } from "./security/encrypted-field.js";
export { SoftDeletableMixin, type SoftDeletable, type WithDeletedOption, } from "./data-integrity/soft-deletable.js";
export { AuditColumnsMixin, getAuditColumnsMigrationSnippet, type AuditColumns, } from "./data-integrity/audit-columns.js";
export { appendToLog, type AppendOnlyLogEntry, type AppendOnlyLogClient, } from "./data-integrity/append-only-log.js";
export { createLogger, withCorrelationId, type LoggerOptions, } from "./observability/logger.js";
export type { Logger } from "pino";
export { CircuitBreaker, type CircuitState, type CircuitBreakerConfig, type CircuitBreakerCallbacks, } from "./resilience/circuit-breaker.js";
export { CircuitOpenError, TimeoutError } from "./resilience/errors.js";
export { withTimeout, DEFAULT_HTTP_TIMEOUT_MS, DEFAULT_DB_TIMEOUT_MS, DEFAULT_JOB_TIMEOUT_MS, } from "./resilience/timeout.js";
export { RetryPolicy, isRetryableError, type RetryPolicyConfig, type RetryExecuteOptions, type RetryLogger, } from "./resilience/retry-policy.js";
export { Bulkhead, BulkheadRejectedError, type BulkheadConfig, } from "./resilience/bulkhead.js";
export { PostgresAppendOnlyLogRepository, CausalChainTracer, type AppendOnlyLogRepository, type EventLogClient, type EventLogEntry, type EventLogEntryToAppend, type DateRange, } from "./event-log/index.js";
//# sourceMappingURL=index.d.ts.map