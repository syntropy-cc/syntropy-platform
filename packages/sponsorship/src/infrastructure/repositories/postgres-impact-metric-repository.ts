/**
 * PostgreSQL implementation of ImpactMetricRepositoryPort (COMP-027.4).
 */

import type { Pool } from "pg";
import { ImpactMetric } from "../../domain/impact-metric.js";
import type { ImpactMetricRepositoryPort } from "../../domain/ports/impact-metric-repository-port.js";

const SCHEMA_TABLE = "sponsorship.impact_metrics";
const INSERT =
  `INSERT INTO ${SCHEMA_TABLE} (id, sponsorship_id, period, artifact_views, portfolio_growth, contribution_activity) ` +
  `VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`;
const SELECT_LATEST =
  `SELECT sponsorship_id, artifact_views, portfolio_growth, contribution_activity FROM ${SCHEMA_TABLE} WHERE sponsorship_id = $1 ORDER BY period DESC LIMIT 1`;

interface ImpactMetricRow {
  sponsorship_id: string;
  artifact_views: string;
  portfolio_growth: string;
  contribution_activity: string;
}

function rowToImpactMetric(row: ImpactMetricRow): ImpactMetric {
  return new ImpactMetric({
    sponsorshipId: row.sponsorship_id,
    artifactViews: Number(row.artifact_views),
    portfolioGrowth: Number(row.portfolio_growth),
    contributionActivity: Number(row.contribution_activity),
  });
}

export class PostgresImpactMetricRepository implements ImpactMetricRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async save(metric: ImpactMetric, period: Date): Promise<void> {
    await this.pool.query(INSERT, [
      metric.sponsorshipId,
      period.toISOString().slice(0, 10),
      metric.artifactViews,
      metric.portfolioGrowth,
      metric.contributionActivity,
    ]);
  }

  async findBySponsorship(sponsorshipId: string): Promise<ImpactMetric | null> {
    const result = await this.pool.query<ImpactMetricRow>(SELECT_LATEST, [
      sponsorshipId,
    ]);
    if (result.rows.length === 0) return null;
    return rowToImpactMetric(result.rows[0]!);
  }
}
