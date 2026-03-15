/**
 * In-memory implementation of NotificationRepository (COMP-028.3, COMP-028.6).
 * Architecture: COMP-028. Used in tests and when DATABASE_URL is not set (stub mode).
 */

import { Notification } from "../../domain/notification.js";
import type {
  NotificationRepository,
  FindByUserIdOptions,
} from "../../domain/ports/notification-repository.js";

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications: Notification[] = [];

  async save(notification: Notification): Promise<void> {
    this.notifications.push(notification);
  }

  async findByUserId(
    userId: string,
    options?: FindByUserIdOptions
  ): Promise<Notification[]> {
    const limit = options?.limit ?? DEFAULT_LIMIT;
    const offset = options?.offset ?? DEFAULT_OFFSET;
    const since = options?.since;
    let filtered = this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (since != null) {
      const sinceTime = since.getTime();
      filtered = filtered.filter((n) => n.createdAt.getTime() > sinceTime);
    }
    return filtered.slice(offset, offset + limit);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const index = this.notifications.findIndex(
      (n) => n.id === id && n.userId === userId
    );
    if (index === -1) return false;
    const n = this.notifications[index];
    if (n.isRead) return true;
    this.notifications[index] = new Notification({
      id: n.id,
      userId: n.userId,
      notificationType: n.notificationType,
      sourceEventType: n.sourceEventType,
      payload: { ...n.payload },
      isRead: true,
      createdAt: n.createdAt,
    });
    return true;
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
