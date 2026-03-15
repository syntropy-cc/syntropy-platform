/**
 * Port for resolving which delivery channels are enabled for a user (COMP-028.4).
 * Architecture: COMP-028. Stub in 028.4; real implementation in COMP-028.5 (user notification preferences).
 */

import type { DeliveryChannel } from "../delivery-channel.js";

/**
 * Resolves which channels are enabled for a user and notification type.
 * Used by NotificationDeliveryService to respect user preferences.
 */
export interface NotificationPreferenceResolver {
  getEnabledChannels(userId: string, notificationType: string): Promise<DeliveryChannel[]>;
}
