/**
 * Portfolio context for REST API (COMP-010.8).
 * Injects PortfolioRepository so routes can query portfolio data without depending on infrastructure.
 */

import type { PortfolioRepository } from "@syntropy/platform-core";

export interface PortfolioContext {
  portfolioRepository: PortfolioRepository;
}
