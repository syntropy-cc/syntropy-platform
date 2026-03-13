/**
 * Structured JSON logger with correlation IDs and secret redaction.
 *
 * All services use this logger for consistent JSON output with service name,
 * correlation_id, causation_id, timestamp, and level. Secrets are never logged
 * (ARCH-009, CON-007, ARCH-010).
 *
 * Architecture: COMP-038, cross-cutting/observability/ARCHITECTURE.md
 */

import pino, { type Logger } from "pino";

/** Keys and path patterns that are redacted in log output. */
const REDACT_PATHS = [
  "password",
  "token",
  "secret",
  "key",
  "apiKey",
  "api_key",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "authorization",
  "cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.key",
  "*.apiKey",
  "*.api_key",
];

export interface LoggerOptions {
  /**
   * Log level. If omitted, uses LOG_LEVEL env or defaults to 'debug' in
   * development and 'info' otherwise.
   */
  level?: string;
  /**
   * Optional destination for log output. Used in tests to capture output;
   * production callers omit this (defaults to stdout).
   */
  destination?: { write: (chunk: string) => void };
}

/**
 * Default log level: debug in development, info otherwise.
 */
function defaultLevel(): string {
  const envLevel = process.env.LOG_LEVEL;
  if (envLevel) return envLevel;
  return process.env.NODE_ENV === "development" ? "debug" : "info";
}

/**
 * Creates a structured JSON logger bound to a service name.
 *
 * Every log record includes: service, correlation_id, causation_id (when set via
 * child), timestamp, level. Secrets matching redact patterns are never logged.
 *
 * @param service - Service name (e.g. 'platform_core.event_bus_audit').
 * @param options - Optional level override.
 * @returns A pino Logger instance.
 */
export function createLogger(
  service: string,
  options?: LoggerOptions
): Logger {
  const level = options?.level ?? defaultLevel();
  const dest = options?.destination ?? undefined;
  const opts = {
    level,
    base: {
      service,
      correlation_id: undefined,
      causation_id: undefined,
    },
    redact: {
      paths: REDACT_PATHS,
      censor: "[REDACTED]",
    },
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return dest ? pino(opts, dest) : pino(opts);
}

/**
 * Returns a child logger that includes the given correlation_id and optional
 * causation_id in every log record. Use for request- or event-scoped logging.
 *
 * @param logger - Parent logger from createLogger.
 * @param correlationId - Correlation ID for the request/flow.
 * @param causationId - Optional ID of the event that caused this work.
 * @returns Child logger with correlation_id and causation_id in bindings.
 */
export function withCorrelationId(
  logger: Logger,
  correlationId: string,
  causationId?: string
): Logger {
  const bindings: Record<string, string | undefined> = {
    correlation_id: correlationId,
    causation_id: causationId,
  };
  return logger.child(bindings);
}
