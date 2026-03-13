/**
 * DLQ processor worker (COMP-034.3).
 *
 * Subscribes to *.dlq topics; retries each message 3 times with 5s / 30s / 5min
 * backoff; after max retries persists to dlq_archive table.
 */

import { createLogger } from "@syntropy/platform-core";
import {
  createKafkaClient,
  getKafkaConfigFromEnv,
  type ConsumedMessage,
} from "@syntropy/event-bus";
import pg from "pg";
import type { Worker } from "../types.js";

const { Pool } = pg;
type PgPool = InstanceType<typeof Pool>;

const log = createLogger("workers:dlq");
const CONSUMER_GROUP_ID = "dlq-processor";
const MAX_RETRIES = 3;
const BACKOFF_MS = [5_000, 30_000, 300_000]; // 5s, 30s, 5min
const DLQ_TOPICS_ENV = "DLQ_TOPICS";
const DEFAULT_DLQ_TOPIC = "default.dlq";

function getDlqTopics(): string[] {
  const env = process.env[DLQ_TOPICS_ENV];
  if (!env) return [DEFAULT_DLQ_TOPIC];
  return env.split(",").map((t) => t.trim()).filter(Boolean);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to process a DLQ message (e.g. republish to original topic).
 * Returns true if processing succeeded. For now we always "fail" so messages get archived
 * after retries; real implementation would republish using originalTopic from payload.
 */
async function tryProcessMessage(_message: ConsumedMessage): Promise<boolean> {
  return false;
}

export function createDlqProcessor(): Worker {
  let client: ReturnType<typeof createKafkaClient> | null = null;
  let pool: PgPool | null = null;

  return {
    name: "dlq-processor",

    async start(): Promise<void> {
      const databaseUrl = process.env.DATABASE_URL;
      if (databaseUrl) {
        pool = new Pool({ connectionString: databaseUrl, max: 2 });
        log.info("PostgreSQL pool created for dlq_archive");
      } else {
        log.warn("DATABASE_URL not set; DLQ archive will be skipped");
      }

      const topics = getDlqTopics();
      const config = getKafkaConfigFromEnv();
      client = createKafkaClient({
        ...config,
        consumerGroupId: CONSUMER_GROUP_ID,
      });
      await client.consumer.connect();
      client.consumer.subscribeMany(topics, async (message: ConsumedMessage) => {
        let lastError: string | null = null;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          if (attempt > 0) {
            const delay = BACKOFF_MS[attempt - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
            log.debug({ attempt, delayMs: delay }, "Backoff before retry");
            await sleep(delay);
          }
          try {
            const ok = await tryProcessMessage(message);
            if (ok) return;
          } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
            log.warn({ attempt: attempt + 1, error: lastError }, "DLQ process attempt failed");
          }
        }
        if (pool) {
          try {
            await pool.query(
              `INSERT INTO platform_core.dlq_archive (topic, message_key, payload, error_message, retry_count)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                message.topic,
                message.key,
                message.value ?? Buffer.alloc(0),
                lastError,
                MAX_RETRIES,
              ]
            );
            log.info({ topic: message.topic, offset: message.offset }, "Archived message to dlq_archive");
          } catch (insertErr) {
            log.error({ err: insertErr }, "Failed to insert into dlq_archive");
          }
        }
      });
      log.info({ topics }, "DLQ processor started");
    },

    async stop(): Promise<void> {
      if (client) {
        await client.consumer.disconnect();
        client = null;
      }
      if (pool) {
        await pool.end();
        pool = null;
      }
      log.info("DLQ processor stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
