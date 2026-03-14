/**
 * Notification event consumer worker (COMP-028.3).
 *
 * Subscribes to learn.events, hub.events, labs.events, dip.events; creates
 * Notification entities from domain events and persists via NotificationRepository.
 * When DATABASE_URL is set uses Postgres; otherwise in-memory (stub).
 */

import { Pool } from "pg";
import { createLogger } from "@syntropy/platform-core";
import { createKafkaClient, getKafkaConfigFromEnv } from "@syntropy/event-bus";
import {
  NotificationEventConsumer,
  NOTIFICATION_CONSUMER_GROUP_ID,
  InMemoryNotificationRepository,
  PostgresNotificationRepository,
  type CommunicationDbClient,
} from "@syntropy/communication";
import type { Worker } from "../types.js";

const log = createLogger("workers:notifications");

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

function createDbClient(pool: Pool): CommunicationDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: async <T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]> =>
      pool.query(sql, params).then((r) => r.rows as T[]),
  };
}

export function createNotificationEventConsumerWorker(): Worker {
  let consumer: NotificationEventConsumer | null = null;
  let kafkaClient: ReturnType<typeof createKafkaClient> | null = null;
  let pool: Pool | null = null;

  return {
    name: "notifications",

    async start(): Promise<void> {
      const config = getKafkaConfigFromEnv();
      kafkaClient = createKafkaClient({
        ...config,
        consumerGroupId: NOTIFICATION_CONSUMER_GROUP_ID,
      });
      await kafkaClient.consumer.connect();

      const databaseUrl = getDatabaseUrl();
      const repository = databaseUrl
        ? (() => {
            pool = new Pool({ connectionString: databaseUrl });
            const client = createDbClient(pool);
            return new PostgresNotificationRepository(client);
          })()
        : new InMemoryNotificationRepository();

      if (!databaseUrl) {
        log.warn("DATABASE_URL not set; notifications worker using in-memory repository");
      }

      consumer = new NotificationEventConsumer({
        consumer: kafkaClient.consumer,
        repository,
      });
      consumer.start();
      log.info("Notification event consumer started");
    },

    async stop(): Promise<void> {
      if (consumer) {
        await consumer.disconnect();
        consumer = null;
      }
      if (kafkaClient) {
        kafkaClient = null;
      }
      if (pool) {
        await pool.end();
        pool = null;
      }
      log.info("Notification event consumer stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
