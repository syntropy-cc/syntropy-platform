/**
 * Communication domain package (COMP-028).
 * Architecture: communication domain
 */
export { Thread, type ThreadParams } from "./domain/thread.js";
export { isThreadType, type ThreadType } from "./domain/thread-type.js";
export { Message, type MessageParams } from "./domain/message.js";
export { Notification, type NotificationParams } from "./domain/notification.js";
export type { NotificationRepository } from "./domain/ports/notification-repository.js";
export { InMemoryNotificationRepository } from "./infrastructure/repositories/in-memory-notification-repository.js";
export { PostgresNotificationRepository } from "./infrastructure/repositories/postgres-notification-repository.js";
export type { CommunicationDbClient } from "./infrastructure/communication-db-client.js";
export { NotificationEventConsumer, NOTIFICATION_TOPICS, NOTIFICATION_CONSUMER_GROUP_ID, } from "./infrastructure/consumers/notification-event-consumer.js";
export { mapEventToNotifications, NOTIFICATION_TRIGGER_EVENT_TYPES, recipientFromPayload, eventTypeToNotificationType, } from "./infrastructure/notification-event-mapping.js";
export type { NotificationDto } from "./infrastructure/notification-event-mapping.js";
//# sourceMappingURL=index.d.ts.map