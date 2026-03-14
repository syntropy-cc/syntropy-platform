/**
 * ExternalIndexingNotifier — submit DOI to CrossRef, DOAJ (COMP-026.4).
 * Fire-and-forget per target with retry; one failure does not block others.
 */

import { RetryPolicy } from "@syntropy/platform-core";
import type { DOIRecord } from "../domain/doi-publication/doi-record.js";

export interface ExternalIndexingNotifierConfig {
  /** CrossRef webhook URL (optional; if not set, CrossRef is skipped). */
  crossrefWebhookUrl?: string;
  /** DOAJ webhook URL (optional; if not set, DOAJ is skipped). */
  doajWebhookUrl?: string;
  /** Optional base URL for article metadata (e.g. https://api.example.com/labs/articles). */
  articleMetadataBaseUrl?: string;
  /** Retry policy for each target. Default: maxAttempts 3. */
  retryPolicy?: RetryPolicy;
  /** Optional callback when a target fails after all retries (DLQ fallback). */
  onNotifyFailure?: (target: string, doi: string, error: unknown) => void;
}

type FetchFn = (url: string, options: RequestInit) => Promise<Response>;

/**
 * Notifies external indexing services (CrossRef, DOAJ) when a DOI is registered.
 * Each target is notified independently; failures are retried and optionally reported via onNotifyFailure.
 */
export class ExternalIndexingNotifier {
  private readonly retryPolicy: RetryPolicy;
  private readonly fetchFn: FetchFn;

  constructor(
    private readonly config: ExternalIndexingNotifierConfig,
    fetchFn: FetchFn = fetch
  ) {
    this.retryPolicy = config.retryPolicy ?? new RetryPolicy({ maxAttempts: 3 });
    this.fetchFn = fetchFn;
  }

  /**
   * Submit the DOI record to configured external indexers.
   * Non-blocking: all targets are attempted; one failure does not block others.
   */
  async notify(doiRecord: DOIRecord): Promise<void> {
    const metadataUrl = this.config.articleMetadataBaseUrl
      ? `${this.config.articleMetadataBaseUrl}/${doiRecord.articleId}`
      : undefined;
    const payload = {
      doi: doiRecord.doi,
      ...(metadataUrl && { metadataUrl }),
    };
    const body = JSON.stringify(payload);

    const tasks: Promise<void>[] = [];

    if (this.config.crossrefWebhookUrl) {
      tasks.push(
        this.notifyOne("crossref", this.config.crossrefWebhookUrl, body, doiRecord.doi)
      );
    }
    if (this.config.doajWebhookUrl) {
      tasks.push(
        this.notifyOne("doaj", this.config.doajWebhookUrl, body, doiRecord.doi)
      );
    }

    await Promise.allSettled(tasks);
  }

  private async notifyOne(
    target: string,
    url: string,
    body: string,
    doi: string
  ): Promise<void> {
    try {
      await this.retryPolicy.execute(async () => {
        const res = await this.fetchFn(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (!res.ok) {
          const err = new Error(`ExternalIndexingNotifier ${target}: ${res.status} ${await res.text()}`) as Error & { status?: number };
          err.status = res.status;
          throw err;
        }
      });
    } catch (error) {
      this.config.onNotifyFailure?.(target, doi, error);
    }
  }
}
