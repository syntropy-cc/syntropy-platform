/**
 * Event envelope and handler types for the event bus.
 *
 * Architecture: COMP-009.1
 */

/**
 * Minimal event envelope required for all messages published via the event bus.
 * Full schema validation (SchemaRegistry) is added in COMP-009.2.
 */
export interface EventEnvelope {
  /** Event type (e.g. "identity.user.created"). Required. */
  eventType: string;
  /** Event payload. Required; must be JSON-serializable. */
  payload: unknown;
  /** Schema version for compatibility. Optional. */
  schemaVersion?: number;
  /** Correlation ID for tracing. Optional. */
  correlationId?: string;
  /** Causation ID (parent event). Optional. */
  causationId?: string;
  /** Event timestamp (ISO 8601). Optional; default is publish time. */
  timestamp?: string;
  /** Optional partition key. */
  key?: string;
}
