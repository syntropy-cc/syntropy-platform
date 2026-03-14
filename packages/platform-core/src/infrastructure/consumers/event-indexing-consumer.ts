/**
 * Kafka consumer that indexes published/updated entity events into search_index (COMP-011.3).
 *
 * Subscribes to learn.events, hub.events, labs.events, dip.events; on *.published and *.updated
 * builds SearchIndex from payload and upserts into search_index. Idempotent on duplicate events.
 */

import type { KafkaConsumer as EventBusKafkaConsumer } from "@syntropy/event-bus";
import type { ConsumedMessage } from "@syntropy/event-bus";
import type { SearchRepository } from "../../domain/search-recommendation/ports/search-repository.js";
import { SearchIndex } from "../../domain/search-recommendation/search-index.js";

const SEARCH_INDEX_TOPICS = [
  "learn.events",
  "hub.events",
  "labs.events",
  "dip.events",
];

export const EVENT_INDEXING_CONSUMER_GROUP_ID = "search-index";

function isPublishOrUpdateEvent(eventType: string): boolean {
  return eventType.endsWith(".published") || eventType.endsWith(".updated");
}

/**
 * Extract entity id from payload. Supports common field names.
 */
function entityIdFromPayload(payload: Record<string, unknown>): string {
  const id =
    payload.entityId ??
    payload.entity_id ??
    payload.id ??
    payload.artifact_id ??
    payload.artifactId;
  return typeof id === "string" ? id : String(id ?? "");
}

/**
 * Extract entity type from payload or event type (e.g. "artifact" from "dip.artifact.published").
 */
function entityTypeFromEvent(eventType: string, payload: Record<string, unknown>): string {
  const fromPayload = payload.entityType ?? payload.entity_type;
  if (typeof fromPayload === "string" && fromPayload) return fromPayload;
  const parts = eventType.split(".");
  return parts.length >= 2 ? parts[1]! : "entity";
}

/**
 * Build searchable content string from payload for tsvector.
 */
function contentFromPayload(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  const title = payload.title ?? payload.name;
  if (typeof title === "string") parts.push(title);
  const body = payload.content ?? payload.body ?? payload.summary ?? payload.description ?? payload.text;
  if (typeof body === "string") parts.push(body);
  if (Array.isArray(payload.tags)) {
    parts.push(payload.tags.filter((t): t is string => typeof t === "string").join(" "));
  }
  return parts.join(" ").trim() || " ";
}

export interface EventIndexingConsumerOptions {
  consumer: EventBusKafkaConsumer;
  repository: SearchRepository;
  topics?: string[];
}

/**
 * Consumer that indexes entity events into search_index. Use with WorkerRegistry.
 */
export class EventIndexingConsumer {
  private readonly consumer: EventBusKafkaConsumer;
  private readonly repository: SearchRepository;
  private readonly topics: string[];

  constructor(options: EventIndexingConsumerOptions) {
    this.consumer = options.consumer;
    this.repository = options.repository;
    this.topics = options.topics ?? SEARCH_INDEX_TOPICS;
  }

  start(): void {
    this.consumer.subscribeMany(this.topics, (msg: ConsumedMessage) => this.handleMessage(msg));
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleMessage(message: ConsumedMessage): Promise<void> {
    let envelope: unknown;
    try {
      const raw = message.value ? message.value.toString("utf8") : "{}";
      envelope = JSON.parse(raw) as unknown;
    } catch {
      return;
    }

    if (envelope === null || typeof envelope !== "object") return;
    const env = envelope as Record<string, unknown>;
    const eventType = typeof env.eventType === "string" ? env.eventType : "";
    if (!isPublishOrUpdateEvent(eventType)) return;

    const payload = (env.payload !== null && typeof env.payload === "object"
      ? env.payload
      : {}) as Record<string, unknown>;
    const entityId = entityIdFromPayload(payload);
    if (!entityId) return;

    const entityType = entityTypeFromEvent(eventType, payload);
    const content = contentFromPayload(payload);
    const indexId = `${entityType}:${entityId}`;

    const index = SearchIndex.create({
      indexId,
      entityType,
      entityId,
      tsvectorContent: content,
    });
    await this.repository.upsert(index);
  }
}

export { SEARCH_INDEX_TOPICS };
