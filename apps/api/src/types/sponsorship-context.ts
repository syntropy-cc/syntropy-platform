/**
 * Sponsorship context for REST API sponsorship routes (COMP-027.6).
 *
 * Injected when registering sponsorship routes; provides repository,
 * impact metric, and payment gateway ports from the sponsorship domain.
 */

import type { SponsorshipRepositoryPort } from "@syntropy/sponsorship";
import type { ImpactMetricRepositoryPort } from "@syntropy/sponsorship";
import type { PaymentGateway } from "@syntropy/sponsorship";
import type { SponsorshipEventPublisher } from "@syntropy/sponsorship";

export interface SponsorshipContext {
  sponsorshipRepository: SponsorshipRepositoryPort;
  impactMetricRepository: ImpactMetricRepositoryPort;
  paymentGateway: PaymentGateway;
  /** Optional: publish sponsorship.created after create. Omit in tests. */
  eventPublisher?: SponsorshipEventPublisher | null;
}
