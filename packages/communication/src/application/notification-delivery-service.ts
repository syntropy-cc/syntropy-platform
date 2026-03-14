/**
 * Notification delivery service — delivers via in-app, email, push (COMP-028.4).
 * Respects user preferences; uses RetryPolicy for external channels.
 */

import type { Notification } from "../domain/notification.js";
import type { NotificationRepository } from "../domain/ports/notification-repository.js";
import type { NotificationPreferenceResolver } from "../domain/ports/notification-preference-resolver.js";
import type { UserEmailResolver } from "../domain/ports/user-email-resolver.js";
import type { PushTokenProvider } from "../domain/ports/push-token-provider.js";
import type { EmailNotificationSender } from "../domain/ports/email-notification-sender.js";
import type { PushNotificationSender } from "../domain/ports/push-notification-sender.js";
import type { DeliveryResult } from "../domain/delivery-channel.js";
import { RetryPolicy } from "@syntropy/platform-core";

function buildEmailSubject(notificationType: string): string {
  const label = notificationType.replace(/_/g, " ");
  return `Notification: ${label}`;
}

function buildEmailBody(notificationType: string, payload: Record<string, unknown>): string {
  const title = (payload.title as string) ?? (payload.name as string) ?? notificationType;
  return `You have a new notification: ${title}.`;
}

function buildPushTitle(notificationType: string): string {
  return notificationType.replace(/_/g, " ");
}

function buildPushBody(payload: Record<string, unknown>): string {
  return (payload.title as string) ?? (payload.name as string) ?? "New notification";
}

export interface NotificationDeliveryServiceOptions {
  repository: NotificationRepository;
  preferenceResolver: NotificationPreferenceResolver;
  userEmailResolver: UserEmailResolver;
  pushTokenProvider: PushTokenProvider;
  emailSender?: EmailNotificationSender | null;
  pushSender?: PushNotificationSender | null;
  retryPolicy?: RetryPolicy | null;
}

/**
 * Delivers a notification to all enabled channels (in-app, email, push).
 * Respects user preferences; retries email and push on transient failure.
 */
export class NotificationDeliveryService {
  private readonly repository: NotificationRepository;
  private readonly preferenceResolver: NotificationPreferenceResolver;
  private readonly userEmailResolver: UserEmailResolver;
  private readonly pushTokenProvider: PushTokenProvider;
  private readonly emailSender: EmailNotificationSender | null;
  private readonly pushSender: PushNotificationSender | null;
  private readonly retryPolicy: RetryPolicy;

  constructor(options: NotificationDeliveryServiceOptions) {
    this.repository = options.repository;
    this.preferenceResolver = options.preferenceResolver;
    this.userEmailResolver = options.userEmailResolver;
    this.pushTokenProvider = options.pushTokenProvider;
    this.emailSender = options.emailSender ?? null;
    this.pushSender = options.pushSender ?? null;
    this.retryPolicy = options.retryPolicy ?? new RetryPolicy();
  }

  async deliver(notification: Notification): Promise<DeliveryResult> {
    const channels = await this.preferenceResolver.getEnabledChannels(
      notification.userId,
      notification.notificationType
    );

    const result: DeliveryResult = {
      inApp: false,
      emailSent: false,
      pushSent: false,
    };

    if (channels.includes("in_app")) {
      await this.repository.save(notification);
      result.inApp = true;
    }

    if (channels.includes("email") && this.emailSender) {
      const to = await this.userEmailResolver.resolveEmail(notification.userId);
      if (to) {
        await this.retryPolicy.execute(async () => {
          await this.emailSender!.send({
            to,
            subject: buildEmailSubject(notification.notificationType),
            body: buildEmailBody(notification.notificationType, notification.payload),
          });
        });
        result.emailSent = true;
      }
    }

    if (channels.includes("push") && this.pushSender) {
      const tokens = await this.pushTokenProvider.getTokens(notification.userId);
      if (tokens.length > 0) {
        await this.retryPolicy.execute(async () => {
          await this.pushSender!.send({
            tokens,
            title: buildPushTitle(notification.notificationType),
            body: buildPushBody(notification.payload),
            data: {
              notificationId: notification.id,
              notificationType: notification.notificationType,
            },
          });
        });
        result.pushSent = true;
      }
    }

    return result;
  }
}
