/**
 * In-memory implementation of NotificationRepository (COMP-028.3).
 * Used in tests and when DATABASE_URL is not set (stub mode).
 */

import type { Notification } from "../../domain/notification.js";
import type { NotificationRepository } from "../../domain/ports/notification-repository.js";

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications: Notification[] = [];

  async save(notification: Notification): Promise<void> {
    this.notifications.push(notification);
  }

  /** For tests: return all saved notifications. */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /** For tests: find by id. */
  findById(id: string): Notification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  /** For tests: clear storage. */
  clear(): void {
    this.notifications.length = 0;
  }
}
