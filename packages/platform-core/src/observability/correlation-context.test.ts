/**
 * Unit tests for correlation context (COMP-038.2).
 */

import { describe, it, expect } from "vitest";
import {
  runWithCorrelationId,
  getCorrelationId,
  getCausationId,
  fetchWithCorrelationId,
} from "./correlation-context.js";

describe("correlation-context", () => {
  it("getCorrelationId returns undefined outside context", () => {
    expect(getCorrelationId()).toBeUndefined();
    expect(getCausationId()).toBeUndefined();
  });

  it("getCorrelationId returns id inside runWithCorrelationId", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    let seen: string | undefined;
    runWithCorrelationId(id, undefined, () => {
      seen = getCorrelationId();
    });
    expect(seen).toBe(id);
  });

  it("getCausationId returns causation when provided", () => {
    const corr = "550e8400-e29b-41d4-a716-446655440000";
    const cause = "660e8400-e29b-41d4-a716-446655440001";
    let seenCause: string | undefined;
    runWithCorrelationId(corr, cause, () => {
      seenCause = getCausationId();
    });
    expect(seenCause).toBe(cause);
  });

  it("nested runWithCorrelationId uses inner context", () => {
    const outer = "outer-id";
    const inner = "inner-id";
    let innerSeen: string | undefined;
    runWithCorrelationId(outer, undefined, () => {
      runWithCorrelationId(inner, undefined, () => {
        innerSeen = getCorrelationId();
      });
    });
    expect(innerSeen).toBe(inner);
  });

  it("async fn runs inside context", async () => {
    const id = "async-id";
    let seen: string | undefined;
    await runWithCorrelationId(id, undefined, async () => {
      await Promise.resolve();
      seen = getCorrelationId();
    });
    expect(seen).toBe(id);
  });

  it("fetchWithCorrelationId adds header when context is set", async () => {
    const id = "fetch-id";
    let capturedInit: RequestInit | undefined;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url: string | URL, init?: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(new Response());
    };
    try {
      await runWithCorrelationId(id, undefined, () =>
        fetchWithCorrelationId("http://example.com")
      );
      expect(capturedInit?.headers).toBeDefined();
      const headers = capturedInit!.headers as Headers;
      expect(headers.get("x-correlation-id")).toBe(id);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fetchWithCorrelationId does not add header when context is missing", async () => {
    let capturedInit: RequestInit | undefined;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url: string | URL, init?: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(new Response());
    };
    try {
      await fetchWithCorrelationId("http://example.com");
      const headers = new Headers(capturedInit?.headers);
      expect(headers.get("x-correlation-id")).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
