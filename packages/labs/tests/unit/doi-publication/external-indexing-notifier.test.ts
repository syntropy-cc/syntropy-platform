/**
 * Unit tests for ExternalIndexingNotifier (COMP-026.4).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createArticleId } from "@syntropy/types";
import { DOIRecord, createDoiRecordId } from "../../../src/domain/doi-publication/doi-record.js";
import { ExternalIndexingNotifier } from "../../../src/infrastructure/external-indexing-notifier.js";
import { RetryPolicy } from "@syntropy/platform-core";

const ARTICLE_ID = createArticleId("a3000001-0000-4000-8000-000000000001");
const DOI_RECORD = new DOIRecord({
  doiId: createDoiRecordId("doi-id-1"),
  articleId: ARTICLE_ID,
  doi: "10.1234/labs-001",
  registeredAt: new Date(),
  status: "registered",
});

describe("ExternalIndexingNotifier", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("") });
  });

  it("POSTs to CrossRef and DOAJ with DOI payload when both URLs configured", async () => {
    const notifier = new ExternalIndexingNotifier(
      {
        crossrefWebhookUrl: "https://api.crossref.org/webhook",
        doajWebhookUrl: "https://doaj.org/api/webhook",
      },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const crossrefCall = fetchMock.mock.calls.find(
      (c: [string]) => c[0] === "https://api.crossref.org/webhook"
    );
    const doajCall = fetchMock.mock.calls.find(
      (c: [string]) => c[0] === "https://doaj.org/api/webhook"
    );
    expect(crossrefCall).toBeDefined();
    expect(doajCall).toBeDefined();
    const crossrefBody = JSON.parse(crossrefCall![1].body);
    expect(crossrefBody.doi).toBe("10.1234/labs-001");
    expect(doajCall![1].method).toBe("POST");
    expect(doajCall![1].headers["Content-Type"]).toBe("application/json");
  });

  it("includes metadataUrl in payload when articleMetadataBaseUrl is set", async () => {
    const notifier = new ExternalIndexingNotifier(
      {
        crossrefWebhookUrl: "https://api.crossref.org/webhook",
        articleMetadataBaseUrl: "https://api.example.com/labs/articles",
      },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body.metadataUrl).toBe(`https://api.example.com/labs/articles/${ARTICLE_ID}`);
    expect(body.doi).toBe("10.1234/labs-001");
  });

  it("calls only CrossRef when DOAJ URL is not configured", async () => {
    const notifier = new ExternalIndexingNotifier(
      { crossrefWebhookUrl: "https://api.crossref.org/webhook" },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe("https://api.crossref.org/webhook");
  });

  it("calls no endpoints when no URLs configured", async () => {
    const notifier = new ExternalIndexingNotifier({}, fetchMock as unknown as typeof fetch);

    await notifier.notify(DOI_RECORD);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("one target failing does not prevent the other from being called", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("error") })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("") });
    const retryPolicy = new RetryPolicy({ maxAttempts: 1 });
    const notifier = new ExternalIndexingNotifier(
      {
        crossrefWebhookUrl: "https://api.crossref.org/webhook",
        doajWebhookUrl: "https://doaj.org/api/webhook",
        retryPolicy,
      },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("calls onNotifyFailure when target fails after retries", async () => {
    const onNotifyFailure = vi.fn();
    fetchMock.mockRejectedValue(new Error("network error"));
    const retryPolicy = new RetryPolicy({ maxAttempts: 2, baseDelayMs: 1 });
    const notifier = new ExternalIndexingNotifier(
      {
        crossrefWebhookUrl: "https://api.crossref.org/webhook",
        retryPolicy,
        onNotifyFailure,
      },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    expect(onNotifyFailure).toHaveBeenCalledTimes(1);
    expect(onNotifyFailure).toHaveBeenCalledWith(
      "crossref",
      "10.1234/labs-001",
      expect.any(Error)
    );
  });

  it("retries on transient failure and succeeds on second attempt", async () => {
    let attempt = 0;
    fetchMock.mockImplementation(() => {
      attempt++;
      if (attempt === 1) {
        const err = new Error("ECONNRESET") as NodeJS.ErrnoException;
        err.code = "ECONNRESET";
        return Promise.reject(err);
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve("") });
    });
    const retryPolicy = new RetryPolicy({ maxAttempts: 3, baseDelayMs: 1 });
    const notifier = new ExternalIndexingNotifier(
      {
        crossrefWebhookUrl: "https://api.crossref.org/webhook",
        retryPolicy,
      },
      fetchMock as unknown as typeof fetch
    );

    await notifier.notify(DOI_RECORD);

    expect(attempt).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
