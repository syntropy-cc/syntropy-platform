/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040
 */
export { createLogger, withCorrelationId, type LoggerOptions, } from "./observability/logger.js";
export type { Logger } from "pino";
export { CircuitBreaker, type CircuitState, type CircuitBreakerConfig, type CircuitBreakerCallbacks, } from "./resilience/circuit-breaker.js";
export { CircuitOpenError, TimeoutError } from "./resilience/errors.js";
//# sourceMappingURL=index.d.ts.map