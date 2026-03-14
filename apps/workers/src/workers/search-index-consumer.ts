/**
 * Search index Kafka consumer worker (COMP-011.3).
 *
 * When DATABASE_URL and Kafka config are set, runs EventIndexingConsumer and
 * indexes *.published / *.updated events into platform_core.search_index.
 */

import { createLogger } from "@syntropy/platform-core";
import {
  createKafkaClient,
  getKafkaConfigFromEnv,
} from "@syntropy/event-bus";
import { Pool } from "pg";
import {
  EventIndexingConsumer,
  EVENT_INDEXING_CONSUMER_GROUP_ID,
  PgEventLogClient,
  PostgresSearchRepository,
} from "@syntropy/platform-core";
import type { Worker } from "../types.js";

const log = createLogger("workers:search-index");

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

/**
 * Create the search-index worker. When DATABASE_URL is set, wires real
 * EventIndexingConsumer with PostgresSearchRepository; otherwise runs a no-op stub.
 */
export function createSearchIndexWorker(): Worker {
  let pool: Pool | null = null;
  let consumer: EventIndexingConsumer | null = null;
  let kafkaClient: ReturnType<typeof createKafkaClient> | null = null;

  return {
    name: "search-index",

    async start(): Promise<void> {
      const databaseUrl = getDatabaseUrl();
      if (!databaseUrl) {
        log.warn("DATABASE_URL not set; search-index worker running as stub");
        return;
      }

      pool = new Pool({ connectionString: databaseUrl });
      const client = new PgEventLogClient(pool);
      const repository = new PostgresSearchRepository(client);

      const config = getKafkaConfigFromEnv();
      kafkaClient = createKafkaClient({
        ...config,
        consumerGroupId: EVENT_INDEXING_CONSUMER_GROUP_ID,
      });
      await kafkaClient.consumer.connect();

      consumer = new EventIndexingConsumer({
        consumer: kafkaClient.consumer,
        repository,
      });
      consumer.start();
      log.info("Search index consumer started");
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
      log.info("Search index consumer stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
