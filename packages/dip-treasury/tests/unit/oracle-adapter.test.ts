/**
 * Unit tests for OracleLiquidationAdapter (COMP-008.5).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OracleLiquidationAdapter } from "../../src/infrastructure/oracle-adapter.js";
import { CircuitOpenError } from "@syntropy/platform-core";

describe("OracleLiquidationAdapter", () => {
  const baseUrl = "https://oracle.test";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns rate when oracle responds with valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rate: 0.01 }),
    } as Response);

    const adapter = new OracleLiquidationAdapter({
      baseUrl,
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });

    const rate = await adapter.getRate("USD");

    expect(rate).toBe(0.01);
    expect(fetch).toHaveBeenCalledWith(
      "https://oracle.test/rates/USD",
      expect.any(Object)
    );
  });

  it("encodes currency in URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rate: 0.85 }),
    } as Response);

    const adapter = new OracleLiquidationAdapter({ baseUrl });
    await adapter.getRate("EUR");

    expect(fetch).toHaveBeenCalledWith(
      "https://oracle.test/rates/EUR",
      expect.any(Object)
    );
  });

  it("throws when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const adapter = new OracleLiquidationAdapter({
      baseUrl,
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });

    await expect(adapter.getRate("USD")).rejects.toThrow(
      "Oracle rate fetch failed: 500 Internal Server Error"
    );
  });

  it("throws when response body has invalid rate", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rate: "invalid" }),
    } as Response);

    const adapter = new OracleLiquidationAdapter({
      baseUrl,
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });

    await expect(adapter.getRate("USD")).rejects.toThrow(
      "Oracle returned invalid rate"
    );
  });

  it("throws CircuitOpenError after failure threshold", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const adapter = new OracleLiquidationAdapter({
      baseUrl,
      failureThreshold: 2,
      resetTimeoutMs: 100_000,
    });

    await expect(adapter.getRate("USD")).rejects.toThrow("Network error");
    await expect(adapter.getRate("USD")).rejects.toThrow("Network error");
    await expect(adapter.getRate("USD")).rejects.toThrow(CircuitOpenError);
  });
});
