/**
 * Unit tests for rate-limit plugin (COMP-033.3).
 */

import { describe, it, expect } from "vitest";
import {
  rateLimitKeyGenerator,
  getMaxForKey,
  shouldSkipRateLimit,
} from "./rate-limit.js";

function mockRequest(overrides: {
  user?: { userId: string; actorId: unknown; roles: string[] };
  ip?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
} = {}): { user?: { userId: string }; ip?: string; url?: string; headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } } {
  return {
    ip: "192.168.1.1",
    url: "/api/v1/foo",
    ...overrides,
  };
}

describe("rateLimitKeyGenerator", () => {
  it("returns user:${userId} when request.user is set", () => {
    const request = mockRequest({
      user: { userId: "usr-123", actorId: "actor-1", roles: ["learner"] },
    });
    expect(rateLimitKeyGenerator(request as never)).toBe("user:usr-123");
  });

  it("returns ip:${ip} when request.user is not set and request.ip is set", () => {
    const request = mockRequest({ user: undefined, ip: "10.0.0.1" });
    expect(rateLimitKeyGenerator(request as never)).toBe("ip:10.0.0.1");
  });

  it("uses x-forwarded-for first element when ip is array", () => {
    const request = mockRequest({
      user: undefined,
      ip: undefined,
      headers: { "x-forwarded-for": "client, proxy1, proxy2" },
    });
    expect(rateLimitKeyGenerator(request as never)).toBe("ip:client, proxy1, proxy2");
  });

  it("returns ip:unknown when ip and headers are missing", () => {
    const request = mockRequest({
      user: undefined,
      ip: undefined,
      headers: {},
      socket: {},
    });
    expect(rateLimitKeyGenerator(request as never)).toBe("ip:unknown");
  });
});

describe("getMaxForKey", () => {
  it("returns 1000 for keys starting with user:", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      expect(getMaxForKey(mockRequest() as never, "user:usr-456")).toBe(1000);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it("returns 20 for keys starting with ip: in production", () => {
    const prev = process.env.NODE_ENV;
    const prevTestMax = process.env.RATE_LIMIT_TEST_MAX;
    process.env.NODE_ENV = "production";
    delete process.env.RATE_LIMIT_TEST_MAX;
    try {
      expect(getMaxForKey(mockRequest() as never, "ip:192.168.1.1")).toBe(20);
    } finally {
      process.env.NODE_ENV = prev;
      if (prevTestMax !== undefined) process.env.RATE_LIMIT_TEST_MAX = prevTestMax;
    }
  });

  it("returns 10000 for ip when NODE_ENV is test and RATE_LIMIT_TEST_MAX unset", () => {
    const prev = process.env.NODE_ENV;
    const prevTestMax = process.env.RATE_LIMIT_TEST_MAX;
    process.env.NODE_ENV = "test";
    delete process.env.RATE_LIMIT_TEST_MAX;
    try {
      expect(getMaxForKey(mockRequest() as never, "ip:192.168.1.1")).toBe(10_000);
    } finally {
      process.env.NODE_ENV = prev;
      if (prevTestMax !== undefined) process.env.RATE_LIMIT_TEST_MAX = prevTestMax;
    }
  });
});

describe("shouldSkipRateLimit", () => {
  it("returns true for /health", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/health" }) as never)).toBe(true);
  });

  it("returns true for /health/ready", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/health/ready" }) as never)).toBe(true);
  });

  it("returns true for /health/live", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/health/live" }) as never)).toBe(true);
  });

  it("returns true for /health/ready?foo=1 (path before query)", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/health/ready?foo=1" }) as never)).toBe(true);
  });

  it("returns false for /api/v1/health (path does not match exactly)", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/api/v1/health" }) as never)).toBe(false);
  });

  it("returns false for /other", () => {
    expect(shouldSkipRateLimit(mockRequest({ url: "/other" }) as never)).toBe(false);
  });
});
