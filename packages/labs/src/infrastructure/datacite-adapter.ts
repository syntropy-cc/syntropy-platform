/**
 * DataCiteAdapter — ACL for DataCite DOI API (COMP-026.2).
 * Maps domain ArticleDOIMetadata to DataCite JSON:API; circuit breaker applied.
 */

import { CircuitBreaker, CircuitOpenError } from "@syntropy/platform-core";
import type {
  DOIProvider,
  ArticleDOIMetadata,
  RegisterDOIResult,
} from "../domain/doi-publication/ports/doi-provider.js";

export interface DataCiteAdapterConfig {
  baseUrl: string;
  username: string;
  password: string;
  /** Optional prefix (e.g. 10.1234) for minted DOIs. */
  prefix?: string;
  /** Circuit breaker config; defaults to 3 failures, 30s reset. */
  circuitBreaker?: {
    failureThreshold?: number;
    successThreshold?: number;
    resetTimeoutMs?: number;
  };
}

/**
 * Maps domain article metadata to DataCite JSON:API draft payload.
 * DataCite vocabulary is confined to this adapter (ACL).
 */
function toDataCitePayload(article: ArticleDOIMetadata, prefix?: string): object {
  const creators = article.authors.map((name) => ({ name }));
  const now = new Date().toISOString().slice(0, 4);
  const year = article.year ?? parseInt(now, 10);
  const attributes: Record<string, unknown> = {
    titles: [{ title: article.title }],
    creators,
    publicationYear: year,
    publisher: "Syntropy",
    types: { resourceType: "Text", resourceTypeGeneral: "Text" },
  };
  if (article.url) {
    attributes.url = article.url;
  }
  const attrs: Record<string, unknown> = {
    ...attributes,
    event: "draft",
  };
  if (prefix) {
    attrs.prefix = prefix;
  }
  return { data: { type: "dois", attributes: attrs } };
}

/**
 * Adapter for the DataCite REST API. Implements DOIProvider; wraps all
 * HTTP calls in a circuit breaker.
 */
export class DataCiteAdapter implements DOIProvider {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly prefix?: string;
  private readonly circuit: CircuitBreaker;

  constructor(config: DataCiteAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.prefix = config.prefix;
    const token = Buffer.from(`${config.username}:${config.password}`).toString(
      "base64"
    );
    this.authHeader = `Basic ${token}`;
    const cbConfig = config.circuitBreaker ?? {};
    this.circuit = new CircuitBreaker({
      failureThreshold: cbConfig.failureThreshold ?? 3,
      successThreshold: cbConfig.successThreshold ?? 1,
      resetTimeoutMs: cbConfig.resetTimeoutMs ?? 30_000,
      name: "datacite",
    });
  }

  async register(article: ArticleDOIMetadata): Promise<RegisterDOIResult> {
    return this.circuit.execute(async () => {
      const payload = toDataCitePayload(article, this.prefix);
      const res = await fetch(`${this.baseUrl}/dois`, {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          Authorization: this.authHeader,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`DataCite register failed: ${res.status} ${body}`);
      }
      const json = (await res.json()) as {
        data?: { id?: string; attributes?: { doi?: string } };
      };
      const doi =
        json.data?.attributes?.doi ??
        json.data?.id ??
        (json as { data?: { id: string } }).data?.id;
      if (!doi) {
        throw new Error("DataCite response missing DOI");
      }
      return { doi };
    });
  }

  async deactivate(doi: string): Promise<void> {
    return this.circuit.execute(async () => {
      const res = await fetch(`${this.baseUrl}/dois/${encodeURIComponent(doi)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          Authorization: this.authHeader,
        },
        body: JSON.stringify({
          data: {
            type: "dois",
            id: doi,
            attributes: { event: "hide" },
          },
        }),
      });
      if (!res.ok && res.status !== 404) {
        const body = await res.text();
        throw new Error(`DataCite deactivate failed: ${res.status} ${body}`);
      }
    });
  }

  /** Expose circuit state for tests. */
  getCircuitState(): "closed" | "open" | "half_open" {
    return this.circuit.getState();
  }
}

export { CircuitOpenError };
