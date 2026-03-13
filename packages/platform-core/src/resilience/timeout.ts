/**
 * Timeout wrapper for promise-based operations.
 *
 * Ensures external calls respect timeout limits (CON-002). Use withTimeout to wrap
 * any async operation; it rejects with TimeoutError if the operation does not
 * settle within the given milliseconds.
 *
 * Architecture: COMP-040.3, cross-cutting/resilience/ARCHITECTURE.md
 */

import { TimeoutError } from "./errors.js";

/**
 * Default timeout for HTTP external calls (CON-002).
 */
export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

/**
 * Default timeout for database queries (CON-002).
 */
export const DEFAULT_DB_TIMEOUT_MS = 10_000;

/**
 * Default timeout for background jobs (CON-002).
 */
export const DEFAULT_JOB_TIMEOUT_MS = 300_000; // 5 minutes

/**
 * Wraps a promise-returning function with a timeout.
 *
 * If the function does not settle (resolve or reject) within `timeoutMs`, the
 * returned promise rejects with TimeoutError. The timer is cleared when the
 * inner promise settles to avoid leaking the timeout handle.
 *
 * @param fn - Async function to execute (no arguments).
 * @param timeoutMs - Maximum time in milliseconds before timing out.
 * @param operation - Optional name for the operation (included in TimeoutError).
 * @returns The result of fn(), or rejects with TimeoutError if timeout is exceeded.
 *
 * @example
 * const result = await withTimeout(() => fetch(url), 5000, "fetch");
 * @example
 * await withTimeout(() => db.query(sql), DEFAULT_DB_TIMEOUT_MS, "db.query");
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operation = "operation"
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      reject(new TimeoutError(operation, timeoutMs));
    }, timeoutMs);
  });

  const wrapped = fn();

  return Promise.race([
    wrapped.then(
      (value) => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        return value;
      },
      (err) => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        throw err;
      }
    ),
    timeoutPromise,
  ]);
}
