/**
 * Resilience domain errors.
 *
 * Used by CircuitBreaker, TimeoutWrapper, and other resilience utilities.
 * Architecture: COMP-040, cross-cutting/resilience/ARCHITECTURE.md
 */

/**
 * Thrown when an operation is attempted while the circuit breaker is open.
 * Callers should fail fast and not invoke the underlying dependency.
 */
export class CircuitOpenError extends Error {
  readonly circuitName: string;
  readonly state = "open" as const;

  constructor(circuitName: string, message?: string) {
    super(message ?? `Circuit breaker "${circuitName}" is open`);
    this.name = "CircuitOpenError";
    this.circuitName = circuitName;
    Object.setPrototypeOf(this, CircuitOpenError.prototype);
  }
}

/**
 * Thrown when an operation exceeds its configured timeout.
 * Architecture: COMP-040.3, CON-002
 */
export class TimeoutError extends Error {
  readonly operation: string;
  readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number, message?: string) {
    super(
      message ?? `Operation "${operation}" timed out after ${timeoutMs}ms`
    );
    this.name = "TimeoutError";
    this.operation = operation;
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
