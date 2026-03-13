/**
 * Circuit breaker implementation for external service calls.
 *
 * Transitions: closed → open (on failure threshold) → half-open (after reset
 * timeout) → closed (on success threshold) or open (on failure). When open,
 * execute() throws CircuitOpenError without calling the wrapped function.
 *
 * Architecture: COMP-040.1, cross-cutting/resilience/ARCHITECTURE.md
 */

import { CircuitOpenError } from "./errors.js";

/** Circuit breaker state. */
export type CircuitState = "closed" | "open" | "half_open";

/** Configuration for the circuit breaker. */
export interface CircuitBreakerConfig {
  /** Number of consecutive failures in closed state before opening. */
  failureThreshold: number;
  /** Number of consecutive successes in half-open state before closing. */
  successThreshold: number;
  /** Milliseconds to wait in open state before allowing a test call (half-open). */
  resetTimeoutMs: number;
  /** Optional name for logging and CircuitOpenError. */
  name?: string;
}

/** Optional callbacks for metrics or logging (e.g. Prometheus counters). */
export interface CircuitBreakerCallbacks {
  /** Called when state changes. */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  /** Called after each execute (outcome: 'success' | 'failure' | 'rejected'). */
  onCall?: (outcome: "success" | "failure" | "rejected") => void;
}

const DEFAULT_NAME = "default";

/**
 * Circuit breaker that fails fast when the circuit is open and allows
 * recovery via half-open probe calls after a reset timeout.
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly config: Required<CircuitBreakerConfig> & {
    callbacks?: CircuitBreakerCallbacks;
  };

  constructor(
    config: CircuitBreakerConfig,
    callbacks?: CircuitBreakerCallbacks
  ) {
    this.config = {
      name: config.name ?? DEFAULT_NAME,
      failureThreshold: config.failureThreshold,
      successThreshold: config.successThreshold,
      resetTimeoutMs: config.resetTimeoutMs,
      callbacks,
    };
  }

  /** Current state (read-only). */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Executes the given async function through the circuit.
   * When open, throws CircuitOpenError without invoking fn.
   *
   * @param fn - Async function to execute (e.g. external API call).
   * @returns The result of fn() on success.
   * @throws CircuitOpenError when the circuit is open and reset timeout has not elapsed.
   * @throws Re-throws any error from fn on failure (and updates circuit state).
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const { name, resetTimeoutMs, successThreshold, failureThreshold } =
      this.config;

    if (this.state === "open") {
      const elapsed = now - this.lastFailureTime;
      if (elapsed >= resetTimeoutMs) {
        this.transitionTo("half_open");
        this.successCount = 0;
        try {
          const result = await fn();
          this.successCount += 1;
          if (this.successCount >= successThreshold) {
            this.transitionTo("closed");
            this.failureCount = 0;
            this.successCount = 0;
          }
          this.config.callbacks?.onCall?.("success");
          return result;
        } catch (err) {
          this.recordFailure(now);
          throw err;
        }
      }
      this.config.callbacks?.onCall?.("rejected");
      throw new CircuitOpenError(name);
    }

    if (this.state === "half_open") {
      try {
        const result = await fn();
        this.successCount += 1;
        if (this.successCount >= successThreshold) {
          this.transitionTo("closed");
          this.failureCount = 0;
          this.successCount = 0;
        }
        this.config.callbacks?.onCall?.("success");
        return result;
      } catch (err) {
        this.transitionTo("open");
        this.lastFailureTime = now;
        this.config.callbacks?.onCall?.("failure");
        throw err;
      }
    }

    // closed
    try {
      const result = await fn();
      this.failureCount = 0;
      this.config.callbacks?.onCall?.("success");
      return result;
    } catch (err) {
      this.failureCount += 1;
      if (this.failureCount >= failureThreshold) {
        this.transitionTo("open");
        this.lastFailureTime = now;
      }
      this.config.callbacks?.onCall?.("failure");
      throw err;
    }
  }

  private transitionTo(newState: CircuitState): void {
    const from = this.state;
    this.state = newState;
    this.config.callbacks?.onStateChange?.(from, newState);
  }

  private recordFailure(now: number): void {
    this.lastFailureTime = now;
    this.transitionTo("open");
    this.config.callbacks?.onCall?.("failure");
  }
}
