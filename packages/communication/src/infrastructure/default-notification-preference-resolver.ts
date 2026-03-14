/**
 * Default preference resolver — returns all channels for every user (COMP-028.4).
 * COMP-028.5 will replace with real NotificationPreferences-based implementation.
 */

import type { NotificationPreferenceResolver } from "../domain/ports/notification-preference-resolver.js";
import type { DeliveryChannel } from "../domain/delivery-channel.js";

const ALL_CHANNELS: DeliveryChannel[] = ["in_app", "email", "push"];

/**
 * Stub implementation that enables all channels for all users.
 * Used until COMP-028.5 implements per-user notification preferences.
 */
export class DefaultNotificationPreferenceResolver implements NotificationPreferenceResolver {
  async getEnabledChannels(_userId: string, _notificationType: string): Promise<DeliveryChannel[]> {
    return [...ALL_CHANNELS];
  }
}
