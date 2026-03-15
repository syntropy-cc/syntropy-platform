/**
 * Shared Testcontainers setup for workers integration tests (COMP-034.7).
 * Starts Kafka, Postgres, and optionally Redis; runs platform_core migrations;
 * returns env vars and teardown.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { KafkaContainer } from "@testcontainers/kafka";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { GenericContainer } from "testcontainers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "..", "..", "..", "supabase", "migrations");

const PLATFORM_CORE_MIGRATIONS = [
  "20260313160000_platform_core_append_only_log.sql",
  "20260313210000_dlq_archive.sql",
];

export interface IntegrationEnv {
  KAFKA_BROKERS: string;
  DATABASE_URL: string;
  REDIS_URL?: string;
}

export interface IntegrationContext {
  env: IntegrationEnv;
  pool: Pool;
  stop: () => Promise<void>;
}

async function runPlatformCoreMigrations(pool: Pool): Promise<void> {
  for (const name of PLATFORM_CORE_MIGRATIONS) {
    const path = join(MIGRATIONS_DIR, name);
    const sql = readFileSync(path, "utf8");
    await pool.query(sql);
  }
}

/**
 * Start Kafka container. Returns broker string for KAFKA_BROKERS.
 * KafkaContainer exposes 9093 (TLS) by default; PLAINTEXT may be on 9092.
 */
async function startKafka(): Promise<{ brokers: string; stop: () => Promise<void> }> {
  const container = await new KafkaContainer("confluentinc/cp-kafka:7.5.0").start();
  const host = container.getHost();
  const port = container.getMappedPort(9093);
  const brokers = `${host}:${port}`;
  return {
    brokers,
    stop: async () => {
      await container.stop();
    },
  };
}

/**
 * Start Postgres and run platform_core migrations (schema + dlq_archive).
 */
async function startPostgres(): Promise<{
  databaseUrl: string;
  pool: Pool;
  stop: () => Promise<void>;
}> {
  const container = await new PostgreSqlContainer().start();
  const pool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  });
  await runPlatformCoreMigrations(pool);
  const databaseUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`;
  return {
    databaseUrl,
    pool,
    stop: async () => {
      await pool.end();
      await container.stop();
    },
  };
}

/**
 * Start Redis for cron distributed lock tests.
 */
async function startRedis(): Promise<{ redisUrl: string; stop: () => Promise<void> }> {
  const container = await new GenericContainer("redis:7-alpine")
    .withExposedPorts(6379)
    .start();
  const host = container.getHost();
  const port = container.getMappedPort(6379);
  const redisUrl = `redis://${host}:${port}`;
  return {
    redisUrl,
    stop: async () => {
      await container.stop();
    },
  };
}

/**
 * Start all containers (Kafka, Postgres, Redis) and return env + pool + teardown.
 * Call stop() in afterAll.
 */
export async function startIntegrationContainers(): Promise<IntegrationContext> {
  const [kafka, postgres, redis] = await Promise.all([
    startKafka(),
    startPostgres(),
    startRedis(),
  ]);

  const env: IntegrationEnv = {
    KAFKA_BROKERS: kafka.brokers,
    DATABASE_URL: postgres.databaseUrl,
    REDIS_URL: redis.redisUrl,
  };

  const stop = async (): Promise<void> => {
    await Promise.all([kafka.stop(), postgres.stop(), redis.stop()]);
  };

  return {
    env,
    pool: postgres.pool,
    stop,
  };
}
