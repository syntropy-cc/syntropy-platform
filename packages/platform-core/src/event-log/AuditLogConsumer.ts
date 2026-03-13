/**
 * Kafka consumer that writes validated events to the event log (COMP-009.7).
 *
 * Subscribes to domain event topics, verifies signature, appends to event_log.
 * On validation failure routes message to DLQ.
 */

import type { KafkaConsumer as EventBusKafkaConsumer } from "@syntropy/event-bus";
import type { ConsumedMessage } from "@syntropy/event-bus";
import { ActorSignatureVerifier, validateEventEnvelope, InvalidEventEnvelopeError } from "@syntropy/event-bus";
import type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
import type { EventLogEntryToAppend } from "./types.js";

const DEFAULT_TOPICS = [
  "identity.events",
  "dip.events",
  "learn.events",
  "hub.events",
  "labs.events",
  "ai_agents.events",
];

const CONSUMER_GROUP_ID = "platform-core-audit-log";

/**
 * Options for AuditLogConsumer.
 */
export interface AuditLogConsumerOptions {
  /** Kafka consumer (from createKafkaClient). Use consumerGroupId CONSUMER_GROUP_ID. */
  consumer: EventBusKafkaConsumer;
  /** Repository for event_log. */
  repository: AppendOnlyLogRepository;
  /** Verifier for event signatures. If not provided, signature check is skipped (not recommended). */
  signatureVerifier?: ActorSignatureVerifier | null;
  /** Topics to subscribe to. Defaults to DEFAULT_TOPICS. */
  topics?: string[];
  /** Optional: publish failed messages to this topic. */
  dlqTopic?: string | null;
  /** Optional: producer for DLQ. Required if dlqTopic is set. */
  dlqProducer?: { publish(topic: string, event: unknown): Promise<void> } | null;
}

/**
 * Extracts actor_id from envelope payload or headers. Defaults to "system" if missing.
 */
function actorIdFromEnvelope(payload: unknown, _headers?: Record<string, Buffer | undefined>): string {
  if (payload !== null && typeof payload === "object" && "actorId" in payload && typeof (payload as Record<string, unknown>).actorId === "string") {
    return (payload as Record<string, unknown>).actorId as string;
  }
  if (payload !== null && typeof payload === "object" && "actor_id" in payload && typeof (payload as Record<string, unknown>).actor_id === "string") {
    return (payload as Record<string, unknown>).actor_id as string;
  }
  if (payload !== null && typeof payload === "object" && "userId" in payload && typeof (payload as Record<string, unknown>).userId === "string") {
    return (payload as Record<string, unknown>).userId as string;
  }
  return "system";
}

/**
 * Consumer that appends validated events to the event log. Use with WorkerRegistry.
 */
export class AuditLogConsumer {
  private readonly repository: AppendOnlyLogRepository;
  private readonly signatureVerifier: ActorSignatureVerifier | null;
  private readonly topics: string[];
  private readonly dlqTopic: string | null;
  private readonly dlqProducer: { publish(topic: string, event: unknown): Promise<void> } | null;
  private readonly consumer: EventBusKafkaConsumer;

  constructor(options: AuditLogConsumerOptions) {
    this.consumer = options.consumer;
    this.repository = options.repository;
    this.signatureVerifier = options.signatureVerifier ?? null;
    this.topics = options.topics ?? DEFAULT_TOPICS;
    this.dlqTopic = options.dlqTopic ?? null;
    this.dlqProducer = options.dlqProducer ?? null;
  }

  /**
   * Starts consuming. Call after consumer.connect().
   */
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
      await this.sendToDlq(message, new Error("Invalid JSON"));
      return;
    }

    try {
      const validated = validateEventEnvelope(envelope);
      const raw = envelope as Record<string, unknown>;
      const signed = {
        ...validated,
        signature: typeof raw.signature === "string" ? raw.signature : undefined,
        actorPublicKey: typeof raw.actorPublicKey === "string" ? raw.actorPublicKey : undefined,
      };

      if (this.signatureVerifier) {
        await this.signatureVerifier.verify(signed);
      }

      const actorId = actorIdFromEnvelope(validated.payload, message.headers);
      const entry: EventLogEntryToAppend = {
        actor_id: actorId,
        event_type: validated.eventType,
        payload: (validated.payload !== null && typeof validated.payload === "object" ? validated.payload : {}) as Record<string, unknown>,
        schema_version: String(validated.schemaVersion ?? 1),
        correlation_id: validated.correlationId ?? null,
        causation_id: validated.causationId ?? null,
      };
      await this.repository.append(entry);
    } catch (err) {
      if (err instanceof InvalidEventEnvelopeError || (err as Error).name === "InvalidSignatureError") {
        await this.sendToDlq(message, err as Error);
      } else {
        throw err;
      }
    }
  }

  private async sendToDlq(message: ConsumedMessage, error: Error): Promise<void> {
    if (!this.dlqTopic || !this.dlqProducer) return;
    const raw = message.value ? message.value.toString("utf8") : "{}";
    await this.dlqProducer.publish(this.dlqTopic, {
      originalMessage: raw,
      topic: message.topic,
      partition: message.partition,
      offset: message.offset,
      error: error.message,
      at: new Date().toISOString(),
    });
  }
}

export { DEFAULT_TOPICS as AUDIT_LOG_TOPICS, CONSUMER_GROUP_ID as AUDIT_LOG_CONSUMER_GROUP };
