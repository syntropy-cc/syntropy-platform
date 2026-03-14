/**
 * Communication domain package (COMP-028).
 * Architecture: communication domain
 */
export { Thread } from "./domain/thread.js";
export { isThreadType } from "./domain/thread-type.js";
export { Message } from "./domain/message.js";
export { Notification } from "./domain/notification.js";
export { InMemoryNotificationRepository } from "./infrastructure/repositories/in-memory-notification-repository.js";
export { PostgresNotificationRepository } from "./infrastructure/repositories/postgres-notification-repository.js";
export { NotificationEventConsumer, NOTIFICATION_TOPICS, NOTIFICATION_CONSUMER_GROUP_ID, } from "./infrastructure/consumers/notification-event-consumer.js";
export { mapEventToNotifications, NOTIFICATION_TRIGGER_EVENT_TYPES, recipientFromPayload, eventTypeToNotificationType, } from "./infrastructure/notification-event-mapping.js";
