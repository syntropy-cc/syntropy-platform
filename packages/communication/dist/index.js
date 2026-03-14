/**
 * Communication domain package (COMP-028).
 * Architecture: communication domain
 */
export { Thread } from "./domain/thread.js";
export { isThreadType } from "./domain/thread-type.js";
export { Message } from "./domain/message.js";
export { Notification } from "./domain/notification.js";
export { NotificationDeliveryService } from "./application/notification-delivery-service.js";
export { InMemoryNotificationRepository } from "./infrastructure/repositories/in-memory-notification-repository.js";
export { PostgresNotificationRepository } from "./infrastructure/repositories/postgres-notification-repository.js";
export { DefaultNotificationPreferenceResolver } from "./infrastructure/default-notification-preference-resolver.js";
export { StubUserEmailResolver } from "./infrastructure/stub-user-email-resolver.js";
export { StubPushTokenProvider } from "./infrastructure/stub-push-token-provider.js";
export { SendGridEmailSender } from "./infrastructure/sendgrid-email-sender.js";
export { FCMPushSender } from "./infrastructure/fcm-push-sender.js";
export { NotificationEventConsumer, NOTIFICATION_TOPICS, NOTIFICATION_CONSUMER_GROUP_ID, } from "./infrastructure/consumers/notification-event-consumer.js";
export { mapEventToNotifications, NOTIFICATION_TRIGGER_EVENT_TYPES, recipientFromPayload, eventTypeToNotificationType, } from "./infrastructure/notification-event-mapping.js";
