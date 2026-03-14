/**
 * ImpactMetricRepositoryPort — persistence for ImpactMetric snapshots (COMP-027.4).
 * Implemented by PostgresImpactMetricRepository in infrastructure.
 */

import type { ImpactMetric } from "../impact-metric.js";

export interface ImpactMetricRepositoryPort {
  save(metric: ImpactMetric, period: Date): Promise<void>;
  findBySponsorship(sponsorshipId: string): Promise<ImpactMetric | null>;
}
