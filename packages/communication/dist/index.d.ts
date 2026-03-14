/**
 * Communication domain package (COMP-028).
 * Architecture: communication domain
 */
export { Thread, type ThreadParams } from "./domain/thread.js";
export { isThreadType, type ThreadType } from "./domain/thread-type.js";
export { Message, type MessageParams } from "./domain/message.js";
export { Notification, type NotificationParams } from "./domain/notification.js";
export { NotificationPreferences, type NotificationPreferencesParams, } from "./domain/notification-preferences.js";
export type { DeliveryChannel, DeliveryResult } from "./domain/delivery-channel.js";
export type { NotificationRepository, FindByUserIdOptions, } from "./domain/ports/notification-repository.js";
export type { NotificationPreferencesRepository } from "./domain/ports/notification-preferences-repository.js";
export type { ThreadRepository } from "./domain/ports/thread-repository.js";
export type { MessageRepository } from "./domain/ports/message-repository.js";
export type { NotificationPreferenceResolver } from "./domain/ports/notification-preference-resolver.js";
export type { UserEmailResolver } from "./domain/ports/user-email-resolver.js";
export type { PushTokenProvider } from "./domain/ports/push-token-provider.js";
export type { EmailNotificationSender, EmailSendParams, } from "./domain/ports/email-notification-sender.js";
export type { PushNotificationSender, PushSendParams, } from "./domain/ports/push-notification-sender.js";
export { NotificationDeliveryService } from "./application/notification-delivery-service.js";
export type { NotificationDeliveryServiceOptions } from "./application/notification-delivery-service.js";
export { InMemoryNotificationRepository } from "./infrastructure/repositories/in-memory-notification-repository.js";
export { PostgresNotificationRepository } from "./infrastructure/repositories/postgres-notification-repository.js";
export { InMemoryNotificationPreferencesRepository } from "./infrastructure/repositories/in-memory-notification-preferences-repository.js";
export { PostgresNotificationPreferencesRepository } from "./infrastructure/repositories/postgres-notification-preferences-repository.js";
export { InMemoryThreadRepository } from "./infrastructure/repositories/in-memory-thread-repository.js";
export { InMemoryMessageRepository } from "./infrastructure/repositories/in-memory-message-repository.js";
export { DefaultNotificationPreferenceResolver } from "./infrastructure/default-notification-preference-resolver.js";
export { PreferenceBackedNotificationPreferenceResolver } from "./infrastructure/preference-backed-notification-preference-resolver.js";
export { StubUserEmailResolver } from "./infrastructure/stub-user-email-resolver.js";
export type { StubUserEmailResolverOptions } from "./infrastructure/stub-user-email-resolver.js";
export { StubPushTokenProvider } from "./infrastructure/stub-push-token-provider.js";
export { SendGridEmailSender } from "./infrastructure/sendgrid-email-sender.js";
export type { SendGridEmailSenderOptions } from "./infrastructure/sendgrid-email-sender.js";
export { FCMPushSender } from "./infrastructure/fcm-push-sender.js";
export type { CommunicationDbClient } from "./infrastructure/communication-db-client.js";
export { NotificationEventConsumer, NOTIFICATION_TOPICS, NOTIFICATION_CONSUMER_GROUP_ID, } from "./infrastructure/consumers/notification-event-consumer.js";
export type { NotificationEventConsumerOptions } from "./infrastructure/consumers/notification-event-consumer.js";
export { mapEventToNotifications, NOTIFICATION_TRIGGER_EVENT_TYPES, recipientFromPayload, eventTypeToNotificationType, } from "./infrastructure/notification-event-mapping.js";
export type { NotificationDto } from "./infrastructure/notification-event-mapping.js";
//# sourceMappingURL=index.d.ts.map