/**
 * Cron scheduler with distributed lock (COMP-034.4).
 * Review publication job (COMP-025.6): publishes embargoed reviews every 15 min.
 *
 * Uses node-cron; acquires Redis lock (SETNX) before each job; logs execution time;
 * alerts when job exceeds 5 minutes.
 */

import { createLogger } from "@syntropy/platform-core";
import cron from "node-cron";
import Redis from "ioredis";
import { Pool } from "pg";
import {
  runReviewPublication,
  PostgresReviewRepository,
  type LabsDbClient,
} from "@syntropy/labs-package";
import type { Worker } from "../types.js";
import { acquireLock, releaseLock, type LockRedis } from "./distributed-lock.js";

const log = createLogger("workers:cron");
const JOB_ALERT_THRESHOLD_MS = 5 * 60 * 1000; // 5 min

interface RedisWithQuit extends LockRedis {
  quit(): Promise<void>;
}

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

function getLabsDatabaseUrl(): string | undefined {
  return process.env.LABS_DATABASE_URL ?? process.env.DATABASE_URL;
}

function createLabsDbClient(pool: Pool): LabsDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as Record<string, unknown>[]),
  };
}

/** Stub job: just log. Real jobs (prominence refresh, portfolio rebuild, etc.) wired later. */
async function runStubJob(name: string): Promise<void> {
  log.debug({ job: name }, "Cron job executed (stub)");
}

const CRON_JOBS: ReadonlyArray<{ name: string; schedule: string }> = [
  { name: "prominence-refresh", schedule: "0 */6 * * *" }, // every 6 hours
  { name: "portfolio-rebuild", schedule: "0 2 * * *" }, // daily 02:00
  { name: "review-publication", schedule: "*/15 * * * *" }, // every 15 min (COMP-025.6)
  { name: "dlq-sweep", schedule: "*/15 * * * *" }, // every 15 min
];

export function createCronScheduler(): Worker {
  let redis: RedisWithQuit | null = null;
  let labsPool: Pool | null = null;
  const tasks: cron.ScheduledTask[] = [];

  return {
    name: "cron-scheduler",

    async start(): Promise<void> {
      const redisUrl = getRedisUrl();
      if (redisUrl) {
        redis = new (Redis as unknown as new (url: string) => RedisWithQuit)(redisUrl);
        log.info("Redis connected for cron distributed lock");
      } else {
        log.warn("REDIS_URL not set; cron jobs will run without distributed lock");
      }

      const labsDbUrl = getLabsDatabaseUrl();
      if (labsDbUrl) {
        labsPool = new Pool({ connectionString: labsDbUrl });
        log.info("Labs DB pool created for review-publication job");
      } else {
        log.warn("LABS_DATABASE_URL/DATABASE_URL not set; review-publication job will no-op");
      }

      for (const { name, schedule } of CRON_JOBS) {
        const task = cron.schedule(schedule, async () => {
          const start = Date.now();
          const lockKey = `job:${name}`;
          const redisForLock = redis as LockRedis | null;
          if (redisForLock && !(await acquireLock(redisForLock, lockKey, 600))) {
            log.debug({ job: name }, "Skipping job (lock held by another instance)");
            return;
          }
          try {
            if (name === "review-publication" && labsPool) {
              const client = createLabsDbClient(labsPool);
              const reviewRepo = new PostgresReviewRepository(client);
              await runReviewPublication(reviewRepo);
            } else if (name === "review-publication") {
              log.debug({ job: name }, "Skipping (no Labs DB URL)");
            } else {
              await runStubJob(name);
            }
          } finally {
            const durationMs = Date.now() - start;
            log.info({ job: name, durationMs }, "Cron job finished");
            if (durationMs > JOB_ALERT_THRESHOLD_MS) {
              log.warn(
                { job: name, durationMs, thresholdMs: JOB_ALERT_THRESHOLD_MS },
                "Cron job exceeded 5min threshold"
              );
            }
            if (redisForLock) {
              await releaseLock(redisForLock, lockKey);
            }
          }
        });
        tasks.push(task);
      }
      log.info({ count: CRON_JOBS.length }, "Cron scheduler started");
    },

    async stop(): Promise<void> {
      for (const task of tasks) {
        task.stop();
      }
      tasks.length = 0;
      if (redis) {
        await redis.quit();
        redis = null;
      }
      if (labsPool) {
        await labsPool.end();
        labsPool = null;
      }
      log.info("Cron scheduler stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
