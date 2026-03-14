/**
 * PostgreSQL implementation of SponsorshipRepositoryPort (COMP-027.4).
 */

import type { Pool } from "pg";
import { Sponsorship } from "../../domain/sponsorship.js";
import { isSponsorshipStatus } from "../../domain/sponsorship-status.js";
import { isSponsorshipType } from "../../domain/sponsorship.js";
import type { SponsorshipRepositoryPort } from "../../domain/ports/sponsorship-repository-port.js";

const SCHEMA_TABLE = "sponsorship.sponsorships";
const INSERT =
  `INSERT INTO ${SCHEMA_TABLE} (id, sponsor_id, sponsored_id, type, amount, status, stripe_subscription_id, started_at, cancelled_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ` +
  `ON CONFLICT (id) DO UPDATE SET sponsor_id = $2, sponsored_id = $3, type = $4, amount = $5, status = $6, stripe_subscription_id = $7, started_at = $8, cancelled_at = $9, updated_at = $10`;
const SELECT_BY_ID = `SELECT id, sponsor_id, sponsored_id, type, amount, status, stripe_subscription_id, started_at, cancelled_at FROM ${SCHEMA_TABLE} WHERE id = $1`;
const SELECT_BY_SPONSOR = `SELECT id, sponsor_id, sponsored_id, type, amount, status, stripe_subscription_id, started_at, cancelled_at FROM ${SCHEMA_TABLE} WHERE sponsor_id = $1 ORDER BY id`;

interface SponsorshipRow {
  id: string;
  sponsor_id: string;
  sponsored_id: string;
  type: string;
  amount: string;
  status: string;
  stripe_subscription_id: string | null;
  started_at: string | null;
  cancelled_at: string | null;
}

function rowToSponsorship(row: SponsorshipRow): Sponsorship {
  const type = row.type as "recurring" | "one_time";
  const status = row.status as "pending" | "active" | "paused" | "cancelled";
  if (!isSponsorshipType(type) || !isSponsorshipStatus(status)) {
    throw new Error(`Invalid sponsorship type or status in DB: ${row.type}, ${row.status}`);
  }
  return new Sponsorship({
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsoredId: row.sponsored_id,
    type,
    amount: Number(row.amount),
    status,
    startedAt: row.started_at ? new Date(row.started_at) : null,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : null,
  });
}

export class PostgresSponsorshipRepository implements SponsorshipRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async save(sponsorship: Sponsorship): Promise<void> {
    const now = new Date().toISOString();
    await this.pool.query(INSERT, [
      sponsorship.id,
      sponsorship.sponsorId,
      sponsorship.sponsoredId,
      sponsorship.type,
      sponsorship.amount,
      sponsorship.status,
      null,
      sponsorship.startedAt?.toISOString() ?? null,
      sponsorship.cancelledAt?.toISOString() ?? null,
      now,
    ]);
  }

  async findById(id: string): Promise<Sponsorship | null> {
    const result = await this.pool.query<SponsorshipRow>(SELECT_BY_ID, [id]);
    if (result.rows.length === 0) return null;
    return rowToSponsorship(result.rows[0]!);
  }

  async findBySponsor(sponsorId: string): Promise<Sponsorship[]> {
    const result = await this.pool.query<SponsorshipRow>(SELECT_BY_SPONSOR, [
      sponsorId,
    ]);
    return result.rows.map(rowToSponsorship);
  }
}
