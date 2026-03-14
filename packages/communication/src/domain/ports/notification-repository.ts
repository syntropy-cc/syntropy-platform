/**
 * Notification repository port (COMP-028.3).
 * Architecture: communication domain, PAT-004
 */

import type { Notification } from "../notification.js";

/**
 * Repository for persisting notifications created by NotificationEventConsumer.
 */
export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
}
