/**
 * Integration tests for Sponsorship and ImpactMetric repositories (COMP-027.4).
 * Uses real Postgres via Testcontainers. Run with SPONSORSHIP_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Sponsorship } from "../../src/domain/sponsorship.js";
import { ImpactMetric } from "../../src/domain/impact-metric.js";
import { PostgresSponsorshipRepository } from "../../src/infrastructure/repositories/postgres-sponsorship-repository.js";
import { PostgresImpactMetricRepository } from "../../src/infrastructure/repositories/postgres-impact-metric-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260328000000_sponsorship.sql"),
    "utf8"
  );
  await pool.query(sql);
}

const describeIntegration =
  process.env.SPONSORSHIP_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("Sponsorship repository (COMP-027.4)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let sponsorshipRepo: PostgresSponsorshipRepository;
  let impactMetricRepo: PostgresImpactMetricRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
    await runMigrations(pool, getMigrationsDir());
    sponsorshipRepo = new PostgresSponsorshipRepository(pool);
    impactMetricRepo = new PostgresImpactMetricRepository(pool);
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("saves and finds sponsorship by id", async () => {
    const sponsorship = new Sponsorship({
      id: "sp-int-1",
      sponsorId: "user-a",
      sponsoredId: "user-b",
      type: "recurring",
      amount: 25.5,
      status: "pending",
    });
    await sponsorshipRepo.save(sponsorship);

    const found = await sponsorshipRepo.findById("sp-int-1");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("sp-int-1");
    expect(found!.sponsorId).toBe("user-a");
    expect(found!.sponsoredId).toBe("user-b");
    expect(found!.type).toBe("recurring");
    expect(found!.amount).toBe(25.5);
    expect(found!.status).toBe("pending");
  });

  it("finds sponsorships by sponsor id", async () => {
    const s1 = new Sponsorship({
      id: "sp-int-2",
      sponsorId: "sponsor-x",
      sponsoredId: "ben-1",
      type: "one_time",
      amount: 100,
      status: "active",
    });
    const s2 = new Sponsorship({
      id: "sp-int-3",
      sponsorId: "sponsor-x",
      sponsoredId: "ben-2",
      type: "recurring",
      amount: 50,
      status: "active",
    });
    await sponsorshipRepo.save(s1);
    await sponsorshipRepo.save(s2);

    const list = await sponsorshipRepo.findBySponsor("sponsor-x");
    expect(list.length).toBe(2);
    const ids = list.map((s) => s.id).sort();
    expect(ids).toEqual(["sp-int-2", "sp-int-3"]);
  });

  it("returns null when sponsorship not found", async () => {
    const found = await sponsorshipRepo.findById("nonexistent");
    expect(found).toBeNull();
  });

  it("saves and finds impact metric by sponsorship", async () => {
    const metric = new ImpactMetric({
      sponsorshipId: "sp-int-1",
      artifactViews: 10,
      portfolioGrowth: 5,
      contributionActivity: 2,
    });
    const period = new Date("2026-03-01");
    await impactMetricRepo.save(metric, period);

    const found = await impactMetricRepo.findBySponsorship("sp-int-1");
    expect(found).not.toBeNull();
    expect(found!.sponsorshipId).toBe("sp-int-1");
    expect(found!.artifactViews).toBe(10);
    expect(found!.portfolioGrowth).toBe(5);
    expect(found!.contributionActivity).toBe(2);
  });

  it("returns null when no impact metric for sponsorship", async () => {
    const found = await impactMetricRepo.findBySponsorship("no-metrics");
    expect(found).toBeNull();
  });
});
