/**
 * Port for sending push notifications (COMP-028.4).
 * Architecture: COMP-028. Implemented by FCM adapter; throw on failure so caller can retry.
 */

export interface PushSendParams {
  tokens: string[];
  title: string;
  body?: string;
  data?: Record<string, string>;
}

/**
 * Sends push notification to the given device tokens.
 * No-op if tokens is empty. Throws on failure so RetryPolicy can retry.
 */
export interface PushNotificationSender {
  send(params: PushSendParams): Promise<void>;
}
