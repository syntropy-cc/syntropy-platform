/**
 * DIP Treasury package (COMP-008).
 * Architecture: DIP Value Distribution & Treasury subdomain
 */

export { TreasuryAccount, InsufficientBalanceError } from "./domain/treasury-account.js";
export type { UsageRegistryPort, UsageContributionRecord } from "./domain/ports/usage-registry-port.js";
export { InMemoryUsageRegistry } from "./infrastructure/in-memory-usage-registry.js";
export {
  UsageRegisteredConsumer,
  computeUsageContribution,
} from "./infrastructure/usage-registered-consumer.js";
export { AVUTransaction } from "./domain/avu-transaction.js";
export type { AVUTransactionType, AVUTransactionParams } from "./domain/avu-transaction.js";
export type { TreasuryAccountRepositoryPort } from "./domain/ports/treasury-account-repository-port.js";
export type { AVUTransactionJournalPort } from "./domain/ports/avu-transaction-journal-port.js";
export type { AVUTransactionQueryPort } from "./domain/ports/avu-transaction-query-port.js";
export { PostgresAVUTransactionQuery } from "./infrastructure/repositories/postgres-avu-transaction-query.js";
export {
  TreasuryDistributionExecutor,
  TreasuryDistributionExecutorError,
} from "./domain/services/treasury-distribution-executor.js";
export { AVUAccountingService } from "./domain/services/avu-accounting-service.js";
export type { RecordTransactionParams } from "./domain/services/avu-accounting-service.js";
export { InMemoryTreasuryAccountRepository } from "./infrastructure/in-memory-treasury-account-repository.js";
export { InMemoryAVUJournal } from "./infrastructure/in-memory-avu-journal.js";
export type {
  ContributorScoreQueryPort,
  DistributionPeriod,
  ContributorScore,
} from "./domain/ports/contributor-score-query-port.js";
export type { DistributionResult, DistributionAllocation } from "./domain/distribution-result.js";
export { ValueDistributionService } from "./domain/services/value-distribution-service.js";
export type { LiquidationOraclePort } from "./domain/ports/liquidation-oracle-port.js";
export {
  OracleLiquidationAdapter,
  type OracleLiquidationAdapterConfig,
} from "./infrastructure/oracle-adapter.js";
export { TreasuryTransfer } from "./domain/treasury-transfer.js";
export type { TreasuryTransferParams } from "./domain/treasury-transfer.js";
export {
  TREASURY_TRANSFER_RECORDED,
  type TransferRecordedPayload,
} from "./domain/events/treasury-transfer-events.js";
export type { TreasuryTransferRepositoryPort } from "./domain/ports/treasury-transfer-repository-port.js";
export type { TreasuryDbClient } from "./infrastructure/treasury-db-client.js";
export { PostgresTreasuryAccountRepository } from "./infrastructure/repositories/postgres-treasury-account-repository.js";
export { PostgresAVUJournal } from "./infrastructure/repositories/postgres-avu-journal.js";
export { PostgresTreasuryTransferRepository } from "./infrastructure/repositories/postgres-treasury-transfer-repository.js";
export { PgTreasuryDbClient } from "./infrastructure/pg-treasury-db-client.js";
