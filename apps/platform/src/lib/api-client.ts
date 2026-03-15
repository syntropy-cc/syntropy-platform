/**
 * Server-side API client — fetches REST API with auth (COMP-032.7).
 * Use in Server Components; token from Supabase session. Calls API_URL directly.
 */

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const API_BASE = `${API_URL}/api/v1`;

export interface ApiEnvelope<T> {
  data: T;
  meta: { timestamp: string; request_id?: string };
}

export interface ApiErrorEnvelope {
  error: { code: string; message: string; details?: unknown };
  meta: { timestamp: string; request_id?: string };
}

/**
 * Fetches from REST API gateway with auth. Call from server only; session from cookies.
 */
export async function fetchApi<T>(
  path: string,
  options?: { method?: string; body?: string; headers?: Record<string, string> }
): Promise<{ ok: boolean; status: number; data?: T; error?: ApiErrorEnvelope["error"]; meta?: ApiEnvelope<T>["meta"] }> {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...options?.headers,
  };
  if (session?.access_token) {
    headers["authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body,
  });

  const json = await res.json().catch(() => ({}));
  const meta = json.meta as ApiEnvelope<T>["meta"] | undefined;
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: json.error as ApiErrorEnvelope["error"],
      meta,
    };
  }
  return {
    ok: true,
    status: res.status,
    data: json.data as T,
    meta,
  };
}
