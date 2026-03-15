/**
 * FCM push notification sender (COMP-028.4).
 * Architecture: COMP-028. No-op implementation; production can inject a real adapter (e.g. Firebase Admin SDK).
 * With StubPushTokenProvider returning [], send() is typically never called with tokens.
 */

import type { PushNotificationSender } from "../domain/ports/push-notification-sender.js";

/**
 * Placeholder push sender that no-ops. Implements the port for wiring;
 * replace with a real FCM adapter (e.g. firebase-admin) when push is required.
 */
export class FCMPushSender implements PushNotificationSender {
  async send(_params: {
    tokens: string[];
    title: string;
    body?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    // No-op; inject a real implementation for production push delivery.
  }
}
