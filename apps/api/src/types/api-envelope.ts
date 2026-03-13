/**
 * API response envelope types (CONV-017, COMP-002.6).
 *
 * Success: { data, meta }
 * Error: { error: { code, message, details? }, meta }
 */

export interface ApiMeta {
  timestamp: string;
  request_id?: string;
}

export interface SuccessEnvelope<T> {
  data: T;
  meta: ApiMeta;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export function buildMeta(requestId?: string): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    ...(requestId && { request_id: requestId }),
  };
}

export function successEnvelope<T>(data: T, requestId?: string): SuccessEnvelope<T> {
  return { data, meta: buildMeta(requestId) };
}

export function errorEnvelope(
  code: string,
  message: string,
  requestId?: string,
  details?: unknown
): ErrorEnvelope {
  return {
    error: { code, message, ...(details !== undefined && { details }) },
    meta: buildMeta(requestId),
  };
}
