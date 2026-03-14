/**
 * Unit tests for DataCiteAdapter and MockDOIProvider (COMP-026.2).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataCiteAdapter, CircuitOpenError } from "../../../src/infrastructure/datacite-adapter.js";
import { MockDOIProvider } from "../../../src/infrastructure/mock-doi-provider.js";
import type { ArticleDOIMetadata } from "../../../src/domain/doi-publication/ports/doi-provider.js";

const ARTICLE: ArticleDOIMetadata = {
  title: "Test Article",
  authors: ["Alice", "Bob"],
  year: 2026,
  url: "https://labs.example.com/articles/1",
};

describe("MockDOIProvider", () => {
  let mock: MockDOIProvider;

  beforeEach(() => {
    mock = new MockDOIProvider("10.1234");
  });

  it("register returns deterministic DOI with incrementing suffix", async () => {
    const r1 = await mock.register(ARTICLE);
    const r2 = await mock.register(ARTICLE);
    expect(r1.doi).toMatch(/^10\.1234\/mock-\d+$/);
    expect(r2.doi).toMatch(/^10\.1234\/mock-\d+$/);
    expect(r1.doi).not.toBe(r2.doi);
  });

  it("deactivate records DOI", async () => {
    const { doi } = await mock.register(ARTICLE);
    await mock.deactivate(doi);
    expect(mock.getDeactivated()).toContain(doi);
  });
});

describe("DataCiteAdapter", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("register sends POST with JSON:API payload and returns doi from response", async () => {
    const adapter = new DataCiteAdapter({
      baseUrl: "https://api.test.datacite.org",
      username: "u",
      password: "p",
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: "10.1234/abc", attributes: { doi: "10.1234/abc" } },
      }),
    });

    const result = await adapter.register(ARTICLE);

    expect(result.doi).toBe("10.1234/abc");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.test.datacite.org/dois",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/vnd.api+json",
          Authorization: expect.stringContaining("Basic "),
        }),
      })
    );
    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.data.type).toBe("dois");
    expect(body.data.attributes.titles).toEqual([{ title: ARTICLE.title }]);
    expect(body.data.attributes.creators).toEqual([{ name: "Alice" }, { name: "Bob" }]);
  });

  it("register throws when API returns non-ok", async () => {
    const adapter = new DataCiteAdapter({
      baseUrl: "https://api.test.datacite.org",
      username: "u",
      password: "p",
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "Unprocessable Entity",
    });

    await expect(adapter.register(ARTICLE)).rejects.toThrow("DataCite register failed");
  });

  it("deactivate sends PATCH with hide event", async () => {
    const adapter = new DataCiteAdapter({
      baseUrl: "https://api.test.datacite.org",
      username: "u",
      password: "p",
    });
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    await adapter.deactivate("10.1234/xyz");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/dois/10.1234%2Fxyz"),
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("hide"),
      })
    );
  });

  it("circuit breaker opens after failureThreshold failures and then throws CircuitOpenError", async () => {
    const adapter = new DataCiteAdapter({
      baseUrl: "https://api.test.datacite.org",
      username: "u",
      password: "p",
      circuitBreaker: { failureThreshold: 2, successThreshold: 1, resetTimeoutMs: 1000 },
    });
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(adapter.register(ARTICLE)).rejects.toThrow("Network error");
    await expect(adapter.register(ARTICLE)).rejects.toThrow("Network error");
    expect(adapter.getCircuitState()).toBe("open");
    await expect(adapter.register(ARTICLE)).rejects.toThrow(CircuitOpenError);
  });
});
