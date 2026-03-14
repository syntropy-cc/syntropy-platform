/**
 * Sponsorship domain — aggregate, status, errors (COMP-027).
 * Architecture: sponsorship domain
 */

export {
  Sponsorship,
  isSponsorshipType,
  type SponsorshipParams,
  type SponsorshipType,
} from "./sponsorship.js";
export {
  SponsorshipStatus,
  isSponsorshipStatus,
} from "./sponsorship-status.js";
export {
  SponsorshipDomainError,
  InvalidSponsorshipTransitionError,
} from "./errors.js";
export { ImpactMetric, type ImpactMetricParams } from "./impact-metric.js";
export type {
  PaymentGateway,
  PaymentIntentResult,
  WebhookResult,
} from "./ports/payment-gateway.js";
export type {
  ImpactDataProvider,
  ImpactDataSnapshot,
} from "./ports/impact-data-provider.js";
export type { SponsorshipRepositoryPort } from "./ports/sponsorship-repository-port.js";
export type { ImpactMetricRepositoryPort } from "./ports/impact-metric-repository-port.js";
