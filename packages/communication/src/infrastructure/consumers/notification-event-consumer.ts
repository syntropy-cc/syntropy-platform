/**
 * Kafka consumer that creates Notification entities from domain events (COMP-028.3, 028.4).
 * Subscribes to learn.events, hub.events, labs.events, dip.events; maps events to
 * notifications and delivers via NotificationDeliveryService (in-app, email, push).
 */

import type { KafkaConsumer as EventBusKafkaConsumer } from "@syntropy/event-bus";
import type { ConsumedMessage } from "@syntropy/event-bus";
import { randomUUID } from "crypto";
import { Notification } from "../../domain/notification.js";
import type { NotificationDeliveryService } from "../../application/notification-delivery-service.js";
import { mapEventToNotifications } from "../notification-event-mapping.js";

const NOTIFICATION_TOPICS = [
  "learn.events",
  "hub.events",
  "labs.events",
  "dip.events",
];

export const NOTIFICATION_CONSUMER_GROUP_ID = "notifications";

export interface NotificationEventConsumerOptions {
  consumer: EventBusKafkaConsumer;
  deliveryService: NotificationDeliveryService;
  topics?: string[];
}

/**
 * Consumer that creates notifications from domain events and delivers via NotificationDeliveryService.
 * Use with WorkerRegistry.
 */
export class NotificationEventConsumer {
  private readonly consumer: EventBusKafkaConsumer;
  private readonly deliveryService: NotificationDeliveryService;
  private readonly topics: string[];

  constructor(options: NotificationEventConsumerOptions) {
    this.consumer = options.consumer;
    this.deliveryService = options.deliveryService;
    this.topics = options.topics ?? NOTIFICATION_TOPICS;
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
    const eventType =
      (typeof env.eventType === "string" ? env.eventType : null) ??
      (typeof env.type === "string" ? env.type : "");
    if (!eventType) return;

    const payload =
      env.payload !== null && typeof env.payload === "object"
        ? (env.payload as Record<string, unknown>)
        : { ...env };

    const dtos = mapEventToNotifications(eventType, payload);
    const createdAt = new Date();
    for (const dto of dtos) {
      try {
        const notification = new Notification({
          id: randomUUID(),
          userId: dto.userId,
          notificationType: dto.notificationType,
          sourceEventType: eventType,
          payload: dto.payload,
          isRead: false,
          createdAt,
        });
        await this.deliveryService.deliver(notification);
      } catch (err) {
        // Log and skip so consumer keeps running (ARCH-007)
        console.error(
          `[NotificationEventConsumer] Failed to deliver notification for ${eventType}:`,
          err
        );
      }
    }
  }
}

export { NOTIFICATION_TOPICS };
