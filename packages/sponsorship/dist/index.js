/**
 * Sponsorship domain package (COMP-027).
 * Architecture: sponsorship domain
 */
export { Sponsorship, isSponsorshipType, } from "./domain/sponsorship.js";
export { isSponsorshipStatus, } from "./domain/sponsorship-status.js";
export { SponsorshipDomainError, InvalidSponsorshipTransitionError, } from "./domain/errors.js";
export { StripePaymentAdapter } from "./infrastructure/stripe-payment-adapter.js";
export { MockPaymentGateway } from "./infrastructure/mock-payment-gateway.js";
export { ImpactMetric } from "./domain/impact-metric.js";
export { ImpactMetricService } from "./application/impact-metric-service.js";
export { PostgresSponsorshipRepository } from "./infrastructure/repositories/postgres-sponsorship-repository.js";
export { PostgresImpactMetricRepository } from "./infrastructure/repositories/postgres-impact-metric-repository.js";
export { SponsorshipEventPublisher, } from "./infrastructure/sponsorship-event-publisher.js";
