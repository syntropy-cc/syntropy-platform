/**
 * Public Square indexer Kafka consumer worker (COMP-021.3).
 *
 * Subscribes to dip.governance.events and hub.events; updates DiscoveryDocument
 * index and recomputes prominence. Uses Postgres when DATABASE_URL is set (COMP-021.4).
 */

import { Pool } from "pg";
import { createLogger } from "@syntropy/platform-core";
import { createKafkaClient, getKafkaConfigFromEnv } from "@syntropy/event-bus";
import {
  PublicSquareIndexer,
  PUBLIC_SQUARE_INDEXER_GROUP_ID,
  InMemoryDiscoveryRepository,
  PostgresDiscoveryRepository,
  type HubCollaborationDbClient,
} from "@syntropy/hub-package";
import type { Worker } from "../types.js";

const log = createLogger("workers:public-square-indexer");

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

function createDbClient(pool: Pool): HubCollaborationDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: async <T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]> =>
      pool.query(sql, params).then((r) => r.rows as T[]),
  };
}

export function createPublicSquareIndexerWorker(): Worker {
  let indexer: PublicSquareIndexer | null = null;
  let kafkaClient: ReturnType<typeof createKafkaClient> | null = null;
  let pool: Pool | null = null;

  return {
    name: "public-square-indexer",

    async start(): Promise<void> {
      const config = getKafkaConfigFromEnv();
      kafkaClient = createKafkaClient({
        ...config,
        consumerGroupId: PUBLIC_SQUARE_INDEXER_GROUP_ID,
      });
      await kafkaClient.consumer.connect();

      const databaseUrl = getDatabaseUrl();
      const repository = databaseUrl
        ? (() => {
            pool = new Pool({ connectionString: databaseUrl });
            const client = createDbClient(pool);
            return new PostgresDiscoveryRepository(client);
          })()
        : new InMemoryDiscoveryRepository();

      if (!databaseUrl) {
        log.warn("DATABASE_URL not set; public-square-indexer using in-memory repository");
      }

      indexer = new PublicSquareIndexer({
        consumer: kafkaClient.consumer,
        repository,
      });
      indexer.start();
      log.info("Public square indexer started");
    },

    async stop(): Promise<void> {
      if (indexer) {
        await indexer.disconnect();
        indexer = null;
      }
      if (kafkaClient) {
        kafkaClient = null;
      }
      if (pool) {
        await pool.end();
        pool = null;
      }
      log.info("Public square indexer stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
