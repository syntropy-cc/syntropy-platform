/**
 * API proxy — forwards requests to REST API gateway with auth (COMP-032.7).
 * Architecture: platform/web-application, CONV-017 envelope.
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function getApiUrl(): string {
  return process.env.API_URL ?? "http://localhost:8080";
}

/** Headers to forward from incoming request (excluding auth, host, connection). */
const FORWARD_HEADERS = ["content-type", "accept", "x-correlation-id"] as const;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context, undefined);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context, await request.text());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context, await request.text());
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context, await request.text());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context, undefined);
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  body: string | undefined
): Promise<NextResponse> {
  const { path } = await context.params;
  const pathStr = path.length > 0 ? path.join("/") : "";
  const search = request.nextUrl.searchParams.toString();
  const url = `${getApiUrl()}/api/v1/${pathStr}${search ? `?${search}` : ""}`;

  const headers: Record<string, string> = {};
  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers["authorization"] = `Bearer ${session.access_token}`;
  }

  try {
    const res = await fetch(url, {
      method: request.method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body ?? undefined,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json() : await res.text();

    if (isJson && res.status >= 400) {
      return NextResponse.json(payload, {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }
    if (isJson) {
      return NextResponse.json(payload, {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }
    return new NextResponse(payload, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json(
      {
        error: { code: "BAD_GATEWAY", message },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 502 }
    );
  }
}
