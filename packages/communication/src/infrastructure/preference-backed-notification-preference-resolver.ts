/**
 * Resolver that uses persisted NotificationPreferences (COMP-028.5).
 * Architecture: COMP-028. Returns enabled channels per user and notification type; respects mute_until snooze.
 */

import type { NotificationPreferenceResolver } from "../domain/ports/notification-preference-resolver.js";
import type { NotificationPreferencesRepository } from "../domain/ports/notification-preferences-repository.js";
import type { DeliveryChannel } from "../domain/delivery-channel.js";

const ALL_CHANNELS: DeliveryChannel[] = ["in_app", "email", "push"];

/**
 * Resolves enabled delivery channels from persisted NotificationPreferences.
 * When no preferences exist, returns all channels. When mute_until is in the future, returns none.
 */
export class PreferenceBackedNotificationPreferenceResolver
  implements NotificationPreferenceResolver
{
  constructor(
    private readonly repository: NotificationPreferencesRepository
  ) {}

  async getEnabledChannels(
    userId: string,
    notificationType: string
  ): Promise<DeliveryChannel[]> {
    const prefs = await this.repository.getByUserId(userId);
    if (!prefs) {
      return [...ALL_CHANNELS];
    }
    if (
      prefs.muteUntil != null &&
      prefs.muteUntil.getTime() > Date.now()
    ) {
      return [];
    }
    const channels =
      prefs.channelPreferences[notificationType] ?? ALL_CHANNELS;
    return [...channels];
  }
}
