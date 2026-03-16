/**
 * API proxy route tests (COMP-032.7).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route.js";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClient = await import("@/lib/supabase/server").then((m) => m.createClient);

describe("API proxy route", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.API_URL;

  beforeEach(() => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: "test-token" } },
        }),
      },
    } as never);
    process.env.API_URL = "http://backend:8080";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.API_URL = originalEnv;
    vi.clearAllMocks();
  });

  it("forwards GET with Authorization header when session exists", async () => {
    const captured: { url: string | null; init: RequestInit | null } = {
      url: null,
      init: null,
    };
    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      captured.url = url;
      captured.init = init ?? null;
      return Promise.resolve(
        new Response(JSON.stringify({ data: [], meta: { timestamp: new Date().toISOString() } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
    });

    const req = new NextRequest("http://localhost:3000/api/v1/moderation/flags");
    const res = await GET(req, { params: Promise.resolve({ path: ["moderation", "flags"] }) });

    expect(res.status).toBe(200);
    expect(captured.url).toBe("http://backend:8080/api/v1/moderation/flags");
    expect(captured.init?.headers).toBeDefined();
    const headers = captured.init?.headers;
    const auth =
      headers instanceof Headers
        ? headers.get("authorization")
        : (headers as Record<string, string> | undefined)?.authorization ?? null;
    expect(auth).toBe("Bearer test-token");
  });

  it("returns 502 and error envelope when backend fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const req = new NextRequest("http://localhost:3000/api/v1/health");
    const res = await GET(req, { params: Promise.resolve({ path: ["health"] }) });
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.error?.code).toBe("BAD_GATEWAY");
    expect(body.error?.message).toContain("Network error");
    expect(body.meta?.timestamp).toBeDefined();
  });

  it("returns backend error body and status for 403", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "PlatformModerator role required" },
          meta: { timestamp: new Date().toISOString(), request_id: "req-123" },
        }),
        { status: 403, headers: { "content-type": "application/json" } }
      )
    );

    const req = new NextRequest("http://localhost:3000/api/v1/moderation/flags");
    const res = await GET(req, { params: Promise.resolve({ path: ["moderation", "flags"] }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error?.code).toBe("FORBIDDEN");
    expect(body.meta?.request_id).toBe("req-123");
  });
});
