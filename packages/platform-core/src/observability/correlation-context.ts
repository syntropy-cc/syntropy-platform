/**
 * Correlation ID context using AsyncLocalStorage (COMP-038.2).
 *
 * Enables thread-local-like propagation of correlation_id and causation_id
 * so that any code (HTTP clients, Kafka producers) can attach them without
 * explicit passing. Used by API (per request) and workers (per message).
 *
 * Architecture: ARCH-009, cross-cutting/observability/ARCHITECTURE.md
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

interface CorrelationContext {
  correlationId: string;
  causationId?: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

/**
 * Runs the given function inside a correlation context. Nested calls use
 * the innermost context. Used by API preHandler and worker message handlers.
 *
 * @param correlationId - Root correlation ID (e.g. from X-Correlation-ID).
 * @param causationId - Optional ID of the event that caused this work.
 * @param fn - Function to run inside the context.
 * @returns The return value of fn.
 */
export function runWithCorrelationId<T>(
  correlationId: string,
  causationId: string | undefined,
  fn: () => T
): T {
  return storage.run({ correlationId, causationId }, fn);
}

/**
 * Enters a correlation context for the remainder of the current async flow.
 * Use in HTTP request middleware so that getCorrelationId() is available
 * in route handlers and downstream async work (Node may propagate this).
 *
 * @param correlationId - Root correlation ID (e.g. from X-Correlation-ID).
 * @param causationId - Optional causation ID.
 */
export function setCorrelationContextForRequest(
  correlationId: string,
  causationId?: string
): void {
  storage.enterWith({ correlationId, causationId });
}

/**
 * Returns the current correlation ID if running inside runWithCorrelationId.
 * Otherwise returns undefined.
 */
export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

/**
 * Returns the current causation ID if running inside runWithCorrelationId
 * and one was provided. Otherwise returns undefined.
 */
export function getCausationId(): string | undefined {
  return storage.getStore()?.causationId;
}

const CORRELATION_HEADER = "x-correlation-id";
const KAFKA_CORRELATION_HEADER = "correlation_id";

/**
 * Runs an async function inside a correlation context taken from Kafka message headers.
 * Use in worker message handlers so that getCorrelationId() is available during processing.
 *
 * @param headers - Message headers (e.g. message.headers from ConsumedMessage).
 * @param causationId - Optional causation ID (e.g. message.offset or message key).
 * @param fn - Async function to run inside the context.
 */
export async function runWithMessageContext(
  headers: Record<string, Buffer | undefined> | undefined,
  causationId: string | undefined,
  fn: () => Promise<void>
): Promise<void> {
  const raw = headers?.[KAFKA_CORRELATION_HEADER];
  const correlationId =
    raw != null ? (Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw)) : undefined;
  const id = correlationId ?? randomUUID();
  return runWithCorrelationId(id, causationId, fn);
}

/**
 * fetch wrapper that adds X-Correlation-ID from current context when present.
 * Use for internal service-to-service HTTP calls so correlation is propagated.
 */
export async function fetchWithCorrelationId(
  url: string | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const id = getCorrelationId();
  if (id) headers.set(CORRELATION_HEADER, id);
  return fetch(url, { ...init, headers });
}
