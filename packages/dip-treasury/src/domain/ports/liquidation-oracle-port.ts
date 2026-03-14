/**
 * Port for fetching AVU-to-currency exchange rate from an oracle (COMP-008.5).
 * Architecture: DIP Value Distribution & Treasury; ADR-009.
 * Rate = amount of target currency per 1 AVU (e.g. 0.01 USD per 1 AVU).
 */

/**
 * Liquidation oracle: provides the current exchange rate from AVU to a concrete currency.
 * Implementations wrap external price feeds; circuit breaker should be applied at the adapter.
 */
export interface LiquidationOraclePort {
  /**
   * Returns the exchange rate: units of the given currency per 1 AVU.
   * @param currency - Target currency code (e.g. "USD", "EUR").
   * @throws When the oracle is unavailable or the currency is not supported.
   */
  getRate(currency: string): Promise<number>;
}
