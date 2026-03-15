/**
 * Notification repository port (COMP-028.3, COMP-028.6).
 * Architecture: COMP-028, communication domain, PAT-004
 */

import type { Notification } from "../notification.js";

export interface FindByUserIdOptions {
  limit?: number;
  offset?: number;
  /** When set, return only notifications with createdAt > since (for SSE stream / reconnection). */
  since?: Date;
}

/**
 * Repository for persisting and querying notifications.
 */
export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findByUserId(
    userId: string,
    options?: FindByUserIdOptions
  ): Promise<Notification[]>;
  markAsRead(id: string, userId: string): Promise<boolean>;
}
