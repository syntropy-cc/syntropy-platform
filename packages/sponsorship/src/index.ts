/**
 * Sponsorship domain package (COMP-027).
 * Architecture: sponsorship domain
 */

export {
  Sponsorship,
  isSponsorshipType,
  type SponsorshipParams,
  type SponsorshipType,
} from "./domain/sponsorship.js";
export {
  SponsorshipStatus,
  isSponsorshipStatus,
} from "./domain/sponsorship-status.js";
export {
  SponsorshipDomainError,
  InvalidSponsorshipTransitionError,
} from "./domain/errors.js";
export type {
  PaymentGateway,
  PaymentIntentResult,
  WebhookResult,
} from "./domain/ports/payment-gateway.js";
export { StripePaymentAdapter } from "./infrastructure/stripe-payment-adapter.js";
export { MockPaymentGateway } from "./infrastructure/mock-payment-gateway.js";
export { ImpactMetric, type ImpactMetricParams } from "./domain/impact-metric.js";
export type {
  ImpactDataProvider,
  ImpactDataSnapshot,
} from "./domain/ports/impact-data-provider.js";
export { ImpactMetricService } from "./application/impact-metric-service.js";
export type { SponsorshipRepositoryPort } from "./domain/ports/sponsorship-repository-port.js";
export type { ImpactMetricRepositoryPort } from "./domain/ports/impact-metric-repository-port.js";
export { PostgresSponsorshipRepository } from "./infrastructure/repositories/postgres-sponsorship-repository.js";
export { PostgresImpactMetricRepository } from "./infrastructure/repositories/postgres-impact-metric-repository.js";
export {
  SponsorshipEventPublisher,
  type SponsorshipEventPayload,
} from "./infrastructure/sponsorship-event-publisher.js";
