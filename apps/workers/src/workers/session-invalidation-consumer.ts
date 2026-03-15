/**
 * Session invalidation Kafka consumer (COMP-002.7).
 *
 * Subscribes to identity.events; on identity.user.banned (or similar)
 * invalidates sessions and clears Redis token cache for that user.
 */

import { createLogger, runWithMessageContext } from "@syntropy/platform-core";
import {
  createKafkaClient,
  getKafkaConfigFromEnv,
  type ConsumedMessage,
} from "@syntropy/event-bus";
import Redis from "ioredis";
import type { Worker } from "../types.js";

/** Minimal Redis-like client for cache clear (ioredis default export typing can be ambiguous in ESM). */
interface RedisLike {
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<number>;
  quit(): Promise<void>;
}

const log = createLogger("workers:session-invalidation");
const IDENTITY_TOPIC = "identity.events";
const CONSUMER_GROUP_ID = "session-invalidation";
const REDIS_KEY_PREFIX = "token:";
const EVENTS_THAT_INVALIDATE = ["identity.user.banned", "identity.session.revoked"];

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

/**
 * Parse message value as JSON and return eventType and userId from payload if present.
 */
function parseIdentityEvent(
  value: Buffer | null
): { eventType: string; userId?: string } | null {
  if (!value || value.length === 0) return null;
  try {
    const body = JSON.parse(value.toString("utf-8"));
    const eventType = typeof body.eventType === "string" ? body.eventType : "";
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
    const userId = typeof payload.userId === "string" ? payload.userId : undefined;
    return { eventType, userId };
  } catch {
    return null;
  }
}

/**
 * Clear Redis keys for a user (token cache). Uses pattern token:userId:* or token:userId.
 */
async function clearUserTokenCache(redis: RedisLike, userId: string): Promise<void> {
  const pattern = `${REDIS_KEY_PREFIX}${userId}*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    log.info({ userId, keysDeleted: keys.length }, "Cleared token cache for user");
  }
}

/**
 * Build the SessionInvalidationConsumer worker.
 * When REDIS_URL is not set, cache clear is skipped (no-op).
 */
export function createSessionInvalidationConsumer(): Worker {
  let redis: RedisLike | null = null;
  let client: ReturnType<typeof createKafkaClient> | null = null;

  return {
    name: "session-invalidation",

    async start(): Promise<void> {
      const redisUrl = getRedisUrl();
      if (redisUrl) {
        redis = new (Redis as unknown as new (url: string, opts?: { maxRetriesPerRequest?: number }) => RedisLike)(
          redisUrl,
          { maxRetriesPerRequest: 3 }
        );
        log.info("Redis connected for session invalidation cache clear");
      } else {
        log.warn("REDIS_URL not set; session invalidation will not clear token cache");
      }

      const config = getKafkaConfigFromEnv();
      client = createKafkaClient({
        ...config,
        consumerGroupId: CONSUMER_GROUP_ID,
      });
      await client.consumer.connect();
      client.consumer.subscribe(IDENTITY_TOPIC, async (message: ConsumedMessage) => {
        await runWithMessageContext(message.headers, message.offset, async () => {
          const parsed = parseIdentityEvent(message.value);
          if (!parsed || !EVENTS_THAT_INVALIDATE.includes(parsed.eventType)) {
            return;
          }
          log.info(
            { eventType: parsed.eventType, userId: parsed.userId },
            "Processing session invalidation event"
          );
          if (redis && parsed.userId) {
            await clearUserTokenCache(redis, parsed.userId);
          }
        });
      });
      log.info({ topic: IDENTITY_TOPIC }, "Session invalidation consumer started");
    },

    async stop(): Promise<void> {
      if (client) {
        await client.consumer.disconnect();
        client = null;
      }
      if (redis) {
        await redis.quit();
        redis = null;
      }
      log.info("Session invalidation consumer stopped");
    },

    async health() {
      return { status: "ok" };
    },
  };
}
