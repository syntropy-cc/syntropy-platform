/**
 * Readiness check helpers for COMP-033.7 health endpoints.
 *
 * Each check runs with a short timeout (READINESS_TIMEOUT_MS) so that
 * /health/ready does not hang on unresponsive dependencies.
 */

import { Redis } from "ioredis";
import { Pool, type PoolClient } from "pg";
import {
  createKafkaClient,
  getKafkaConfigFromEnv,
  type KafkaClientConfig,
} from "@syntropy/event-bus";

const READINESS_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export interface CheckResult {
  ok: boolean;
  error?: string;
}

/**
 * Check Redis connectivity by pinging. Creates a short-lived client.
 */
export async function checkRedis(url: string): Promise<CheckResult> {
  const redis = new Redis(url, { maxRetriesPerRequest: 0 });
  try {
    await withTimeout(redis.ping(), READINESS_TIMEOUT_MS);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await redis.quit();
  }
}

/**
 * Check PostgreSQL connectivity with SELECT 1. Uses a small pool with timeout.
 */
export async function checkDatabase(
  connectionString: string
): Promise<CheckResult> {
  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: READINESS_TIMEOUT_MS,
  });
  try {
    const client = (await withTimeout(
      pool.connect(),
      READINESS_TIMEOUT_MS
    )) as PoolClient;
    try {
      await withTimeout(client.query("SELECT 1"), READINESS_TIMEOUT_MS);
      return { ok: true };
    } finally {
      client.release();
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await pool.end();
  }
}

/**
 * Check Kafka broker connectivity by connecting the producer.
 */
export async function checkKafka(config: KafkaClientConfig): Promise<CheckResult> {
  const client = createKafkaClient({
    ...config,
    consumerGroupId: config.consumerGroupId ?? "syntropy-health-check",
  });
  try {
    await withTimeout(client.producer.connect(), READINESS_TIMEOUT_MS);
    await client.producer.disconnect();
    return { ok: true };
  } catch (err) {
    try {
      await client.producer.disconnect();
    } catch {
      // ignore disconnect error
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Run all configured readiness checks from environment.
 * Only runs a check when the corresponding env var is set.
 */
export async function runReadinessChecks(): Promise<{
  status: "ok" | "unhealthy";
  checks: Record<string, "ok" | "failed" | "skipped">;
  errors?: Record<string, string>;
}> {
  const checks: Record<string, "ok" | "failed" | "skipped"> = {};
  const errors: Record<string, string> = {};
  let anyFailed = false;

  if (process.env.REDIS_URL) {
    const result = await checkRedis(process.env.REDIS_URL);
    if (result.ok) {
      checks.redis = "ok";
    } else {
      checks.redis = "failed";
      errors.redis = result.error ?? "unknown";
      anyFailed = true;
    }
  } else {
    checks.redis = "skipped";
  }

  if (process.env.DATABASE_URL) {
    const result = await checkDatabase(process.env.DATABASE_URL);
    if (result.ok) {
      checks.database = "ok";
    } else {
      checks.database = "failed";
      errors.database = result.error ?? "unknown";
      anyFailed = true;
    }
  } else {
    checks.database = "skipped";
  }

  const kafkaBrokers = process.env.KAFKA_BROKERS;
  if (kafkaBrokers && kafkaBrokers.trim().length > 0) {
    const config = getKafkaConfigFromEnv();
    const result = await checkKafka(config);
    if (result.ok) {
      checks.kafka = "ok";
    } else {
      checks.kafka = "failed";
      errors.kafka = result.error ?? "unknown";
      anyFailed = true;
    }
  } else {
    checks.kafka = "skipped";
  }

  return {
    status: anyFailed ? "unhealthy" : "ok",
    checks,
    ...(Object.keys(errors).length > 0 ? { errors } : {}),
  };
}
