/**
 * Treasury context for REST API treasury routes (COMP-008.8).
 */

import type { TreasuryAccountRepositoryPort } from "@syntropy/dip-treasury";
import type { AVUTransactionQueryPort } from "@syntropy/dip-treasury";
import type { ValueDistributionService } from "@syntropy/dip-treasury";
import type { TreasuryDistributionExecutor } from "@syntropy/dip-treasury";

export interface TreasuryContext {
  accountRepository: TreasuryAccountRepositoryPort;
  transactionQuery: AVUTransactionQueryPort;
  distributionService: ValueDistributionService;
  distributionExecutor: TreasuryDistributionExecutor;
}
