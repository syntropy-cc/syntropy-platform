/**
 * Retry policy with exponential backoff and jitter for transient failures.
 *
 * Retries on network errors, 5xx, and 429; does not retry 4xx (except 429) or
 * CircuitOpenError. Integrates with CircuitBreaker: wrap the retried call and
 * pass it to CircuitBreaker.execute() so each attempt counts toward the
 * circuit's failure threshold.
 *
 * Architecture: COMP-040.2, cross-cutting/resilience/ARCHITECTURE.md, CON-009
 */

import { CircuitOpenError } from "./errors.js";

/** Maximum delay cap in ms (architecture: 30s). */
const MAX_DELAY_MS = 30_000;

/** Minimal logger interface for retry attempt logging. */
export interface RetryLogger {
  warn(obj: unknown, msg?: string): void;
  warn(msg: string): void;
}

/** Configuration for retry behavior. */
export interface RetryPolicyConfig {
  /** Maximum total attempts (first try + retries). Default 3. */
  maxAttempts?: number;
  /** Base delay in ms before first retry. Default 1000. */
  baseDelayMs?: number;
  /** Multiplier for exponential backoff. Default 2. */
  backoffMultiplier?: number;
  /** Max random jitter added to delay in ms. Default 200. */
  jitterMs?: number;
  /** Optional logger; retry attempts are logged at warn level. */
  logger?: RetryLogger;
}

/** Options passed to execute(). */
export interface RetryExecuteOptions {
  /** If set, abort will skip further retries. */
  signal?: AbortSignal;
}

const DEFAULTS: Required<Omit<RetryPolicyConfig, "logger">> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  backoffMultiplier: 2,
  jitterMs: 200,
};

/**
 * Returns true if the error is transient and safe to retry.
 * Retries: network errors (e.g. ECONNRESET, ETIMEDOUT), 5xx, 429.
 * Does not retry: 4xx except 429, CircuitOpenError.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof CircuitOpenError) {
    return false;
  }
  const err = error as NodeJS.ErrnoException & { status?: number; statusCode?: number; response?: { status?: number } };
  // Network/connection errors
  if (err?.code && typeof err.code === "string") {
    const code = err.code;
    if (
      code === "ECONNRESET" ||
      code === "ETIMEDOUT" ||
      code === "ENOTFOUND" ||
      code === "ECONNREFUSED" ||
      code === "ENETUNREACH" ||
      code === "EPIPE" ||
      code === "EAI_AGAIN"
    ) {
      return true;
    }
  }
  // HTTP status: 429 retry, 5xx retry, 4xx (except 429) no retry
  const status =
    err?.status ?? err?.statusCode ?? err?.response?.status;
  if (typeof status === "number") {
    if (status === 429) return true;
    if (status >= 500 && status < 600) return true;
    if (status >= 400 && status < 500) return false;
  }
  // Unknown errors: treat as retryable (e.g. generic TimeoutError, connection drops)
  return true;
}

/**
 * Computes delay before the next attempt (1-based attempt number).
 * Delay = min(baseDelayMs * backoffMultiplier^(attempt-1), MAX_DELAY_MS) + jitter in [0, jitterMs].
 */
function getDelayMs(
  attempt: number,
  baseDelayMs: number,
  backoffMultiplier: number,
  jitterMs: number
): number {
  const exponential = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  const capped = Math.min(exponential, MAX_DELAY_MS);
  const jitter = jitterMs > 0 ? Math.random() * jitterMs : 0;
  return Math.floor(capped + jitter);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/**
 * Retry policy that executes a function with exponential backoff and jitter
 * on transient failures.
 */
export class RetryPolicy {
  private readonly config: Required<Omit<RetryPolicyConfig, "logger">> & {
    logger?: RetryLogger;
  };

  constructor(config: RetryPolicyConfig = {}) {
    this.config = {
      ...DEFAULTS,
      ...config,
      logger: config.logger,
    };
  }

  /**
   * Executes the given async function, retrying on retryable errors up to
   * maxAttempts. Uses exponential backoff with jitter between attempts.
   * Respects AbortSignal to cancel retries.
   *
   * @param fn - Async function to execute (e.g. external API call).
   * @param options - Optional execution options (e.g. signal).
   * @returns The result of fn() on success.
   * @throws The last error from fn after max attempts, or non-retryable errors immediately.
   */
  async execute<T>(
    fn: () => Promise<T>,
    options?: RetryExecuteOptions
  ): Promise<T> {
    const { maxAttempts, baseDelayMs, backoffMultiplier, jitterMs, logger } =
      this.config;
    const signal = options?.signal;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (err) {
        lastError = err;
        if (signal?.aborted) throw err;
        if (!isRetryableError(err)) throw err;
        if (attempt === maxAttempts) throw err;
        const delayMs = getDelayMs(attempt, baseDelayMs, backoffMultiplier, jitterMs);
        if (logger) {
          logger.warn(
            { attempt, maxAttempts, delayMs, err: err instanceof Error ? err.message : String(err) },
            "RetryPolicy: retrying after transient error"
          );
        }
        await sleep(delayMs, signal);
      }
    }
    throw lastError;
  }
}
