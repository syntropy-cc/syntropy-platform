/**
 * IDE session supervisor integration test (COMP-034.7).
 * Uses Postgres with ide schema; runs one supervisor tick.
 * Run with WORKERS_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createIDESessionSupervisorWorker } from "../../src/workers/ide-session-supervisor.js";
import { startIntegrationContainers } from "./setup.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "..", "..", "..", "supabase", "migrations");
const IDE_MIGRATION = "20260331000000_ide_domain.sql";

const describeIntegration =
  process.env.WORKERS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("IDE session supervisor (COMP-034.7)", () => {
  let ctx: Awaited<ReturnType<typeof startIntegrationContainers>>;
  let worker: ReturnType<typeof createIDESessionSupervisorWorker>;

  beforeAll(async () => {
    ctx = await startIntegrationContainers();
    const sql = readFileSync(join(MIGRATIONS_DIR, IDE_MIGRATION), "utf8");
    await ctx.pool.query(sql);
    process.env.DATABASE_URL = ctx.env.DATABASE_URL;
    process.env.IDE_DATABASE_URL = ctx.env.DATABASE_URL;
  }, 90_000);

  afterAll(async () => {
    if (worker) {
      await worker.stop();
    }
    await ctx.stop();
  });

  it("supervisor worker starts, runs tick, and stops without error", async () => {
    worker = createIDESessionSupervisorWorker();
    await worker.start();
    const health = await worker.health();
    expect(health.status).toBe("ok");
    await worker.stop();
    worker = null!;
  });
});
