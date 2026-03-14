/**
 * Oracle adapter for liquidation exchange rates (COMP-008.5).
 * Wraps external HTTP price feed with circuit breaker and timeout.
 * Architecture: DIP Value Distribution & Treasury; ADR-009; PAT-005 Adapter.
 */

import type { LiquidationOraclePort } from "../domain/ports/liquidation-oracle-port.js";
import {
  CircuitBreaker,
  withTimeout,
  DEFAULT_HTTP_TIMEOUT_MS,
} from "@syntropy/platform-core";

export interface OracleLiquidationAdapterConfig {
  /** Base URL of the oracle API (e.g. "https://oracle.example.com"). */
  baseUrl: string;
  /** HTTP timeout in ms. Defaults to DEFAULT_HTTP_TIMEOUT_MS. */
  timeoutMs?: number;
  /** Failure threshold before circuit opens. */
  failureThreshold?: number;
  /** Reset timeout in ms before half-open. */
  resetTimeoutMs?: number;
}

const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_RESET_TIMEOUT_MS = 30_000;

/**
 * Fetches AVU-to-currency rate from an external HTTP endpoint.
 * Expects GET {baseUrl}/rates/{currency} to return JSON: { rate: number }.
 * Rate = units of currency per 1 AVU.
 */
export class OracleLiquidationAdapter implements LiquidationOraclePort {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly circuit: CircuitBreaker;

  constructor(config: OracleLiquidationAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
    this.circuit = new CircuitBreaker({
      name: "liquidation-oracle",
      failureThreshold: config.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
      successThreshold: 1,
      resetTimeoutMs: config.resetTimeoutMs ?? DEFAULT_RESET_TIMEOUT_MS,
    });
  }

  async getRate(currency: string): Promise<number> {
    return this.circuit.execute(() => this.fetchRate(currency));
  }

  private async fetchRate(currency: string): Promise<number> {
    const url = `${this.baseUrl}/rates/${encodeURIComponent(currency)}`;
    const response = await withTimeout(
      () => fetch(url, { method: "GET" }),
      this.timeoutMs,
      "oracle-getRate"
    );
    if (!response.ok) {
      throw new Error(
        `Oracle rate fetch failed: ${response.status} ${response.statusText}`
      );
    }
    const body = (await response.json()) as { rate?: number };
    if (typeof body?.rate !== "number" || body.rate < 0) {
      throw new Error("Oracle returned invalid rate");
    }
    return body.rate;
  }
}
