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
export { AVUAccountingService } from "./domain/services/avu-accounting-service.js";
export type { RecordTransactionParams } from "./domain/services/avu-accounting-service.js";
export { InMemoryTreasuryAccountRepository } from "./infrastructure/in-memory-treasury-account-repository.js";
export { InMemoryAVUJournal } from "./infrastructure/in-memory-avu-journal.js";
