/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040, COMP-037
 */
export { validateEnv, type ValidateEnvOptions, } from "./config/env-validator.js";
export { encryptField, decryptField, getEncryptionKey, type EncryptedField, } from "./security/encrypted-field.js";
export { SoftDeletableMixin, type SoftDeletable, type WithDeletedOption, } from "./data-integrity/soft-deletable.js";
export { AuditColumnsMixin, getAuditColumnsMigrationSnippet, type AuditColumns, } from "./data-integrity/audit-columns.js";
export { appendToLog, type AppendOnlyLogEntry, type AppendOnlyLogClient, } from "./data-integrity/append-only-log.js";
export { type IAppendOnlyLog, type AppendOnlyLogQueryFilter, } from "./data-integrity/append-only-log-interface.js";
export { MockAppendOnlyLog, type MockLogEntry, type LogEventWithMeta, } from "./data-integrity/MockAppendOnlyLog.js";
export { createLogger, withCorrelationId, type LoggerOptions, } from "./observability/logger.js";
export type { Logger } from "pino";
export { runWithCorrelationId, getCorrelationId, getCausationId, fetchWithCorrelationId, runWithMessageContext, setCorrelationContextForRequest, } from "./observability/correlation-context.js";
export { initTracing, shutdownTracing, type TracingOptions, } from "./observability/tracing.js";
export { createMetrics, type PlatformMetrics, } from "./observability/metrics.js";
export { CircuitBreaker, type CircuitState, type CircuitBreakerConfig, type CircuitBreakerCallbacks, } from "./resilience/circuit-breaker.js";
export { CircuitOpenError, TimeoutError } from "./resilience/errors.js";
export { withTimeout, DEFAULT_HTTP_TIMEOUT_MS, DEFAULT_DB_TIMEOUT_MS, DEFAULT_JOB_TIMEOUT_MS, } from "./resilience/timeout.js";
export { RetryPolicy, isRetryableError, type RetryPolicyConfig, type RetryExecuteOptions, type RetryLogger, } from "./resilience/retry-policy.js";
export { Bulkhead, BulkheadRejectedError, type BulkheadConfig, } from "./resilience/bulkhead.js";
export { PostgresAppendOnlyLogRepository, PgEventLogClient, CausalChainTracer, AuditLogConsumer, AUDIT_LOG_TOPICS, AUDIT_LOG_CONSUMER_GROUP, AppendOnlyLogAdapter, type AppendOnlyLogRepository, type EventLogClient, type EventLogEntry, type EventLogEntryToAppend, type DateRange, type AuditLogConsumerOptions, } from "./event-log/index.js";
export { Portfolio, type PortfolioEvent, type PortfolioParams, } from "./domain/portfolio-aggregation/portfolio.js";
export { XPTotal, ReputationScore, type SkillLevel } from "./domain/portfolio-aggregation/value-objects.js";
export type { Achievement } from "./domain/portfolio-aggregation/achievement.js";
export { createAchievement } from "./domain/portfolio-aggregation/achievement.js";
export type { SkillRecord } from "./domain/portfolio-aggregation/skill-record.js";
export { createSkillRecord } from "./domain/portfolio-aggregation/skill-record.js";
export { calculate as calculateXp, XPCalculator, type XPCalculatorEvent, type XPCalculatorResult, } from "./domain/portfolio-aggregation/xp-calculator.js";
export { DEFAULT_XP_WEIGHTS, LEVEL_THRESHOLDS, levelFromXp, } from "./domain/portfolio-aggregation/xp-weights.js";
export { evaluate as evaluateAchievements, AchievementService, type AchievementEvaluationEvent, type AchievementUnlockResult, } from "./domain/portfolio-aggregation/achievement-service.js";
export { DEFAULT_ACHIEVEMENT_DEFINITIONS, type AchievementDefinition, } from "./domain/portfolio-aggregation/achievement-definitions.js";
export { ACHIEVEMENT_UNLOCKED, createAchievementUnlockedEvent, type AchievementUnlockedPayload, type AchievementUnlockedEvent, } from "./domain/portfolio-aggregation/events/achievement-unlocked.js";
export { type SkillProfile, createSkillProfile, } from "./domain/portfolio-aggregation/skill-profile.js";
export { compute as computeSkillProfile, SkillProfileService, } from "./domain/portfolio-aggregation/services/skill-profile-service.js";
export { KNOWN_SKILL_AREAS, SIGNAL_COUNT_TO_LEVEL, levelFromSignalCount, normalizeSkillName, } from "./domain/portfolio-aggregation/skill-taxonomy.js";
export { type ReputationSignals, REPUTATION_WEIGHTS, DECAY_AFTER_DAYS, } from "./domain/portfolio-aggregation/reputation-signals.js";
export { calculate as calculateReputation, ReputationService, } from "./domain/portfolio-aggregation/services/reputation-service.js";
export type { PortfolioRepository } from "./domain/portfolio-aggregation/ports/portfolio-repository.js";
export { PostgresPortfolioRepository } from "./infrastructure/repositories/postgres-portfolio-repository.js";
export { applyEvent } from "./domain/portfolio-aggregation/portfolio-update.js";
export { PortfolioEventConsumer, PORTFOLIO_TOPICS, PORTFOLIO_CONSUMER_GROUP_ID, type PortfolioEventConsumerOptions, } from "./infrastructure/consumers/portfolio-event-consumer.js";
export { SearchIndex, type SearchIndexParams, } from "./domain/search-recommendation/search-index.js";
export type { SearchRepository, SearchFilters, SearchByVectorOptions, } from "./domain/search-recommendation/ports/search-repository.js";
export type { EmbeddingPort } from "./domain/search-recommendation/ports/embedding-port.js";
export { SearchService } from "./domain/search-recommendation/services/search-service.js";
export { SemanticSearchService } from "./domain/search-recommendation/services/semantic-search-service.js";
export { RecommendationService } from "./domain/search-recommendation/services/recommendation-service.js";
export { OpenAIEmbeddingAdapter, type OpenAIEmbeddingAdapterConfig, } from "./infrastructure/embedding/openai-embedding-adapter.js";
export { PostgresSearchRepository } from "./infrastructure/repositories/postgres-search-repository.js";
export { Recommendation, type RecommendationParams, type OpportunityType, } from "./domain/search-recommendation/recommendation.js";
export { RecommendationSet, type RecommendationSetParams, } from "./domain/search-recommendation/recommendation-set.js";
export type { RecommendationRepository } from "./domain/search-recommendation/ports/recommendation-repository.js";
export { PostgresRecommendationRepository } from "./infrastructure/repositories/postgres-recommendation-repository.js";
export { EventIndexingConsumer, SEARCH_INDEX_TOPICS, EVENT_INDEXING_CONSUMER_GROUP_ID, type EventIndexingConsumerOptions, } from "./infrastructure/consumers/event-indexing-consumer.js";
//# sourceMappingURL=index.d.ts.map