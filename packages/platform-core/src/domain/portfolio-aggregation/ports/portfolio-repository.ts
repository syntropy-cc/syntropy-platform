/**
 * Portfolio repository port (COMP-010.7).
 * Architecture: Platform Core — Portfolio Aggregation, PAT-004.
 */

import type { Portfolio } from "../portfolio.js";

/**
 * Repository for persisting and loading portfolios.
 * Implementations use optimistic locking via portfolio version.
 */
export interface PortfolioRepository {
  findByUserId(userId: string): Promise<Portfolio | null>;
  save(portfolio: Portfolio): Promise<void>;
}
