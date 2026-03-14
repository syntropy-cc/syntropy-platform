/**
 * PostgreSQL implementation of NotificationRepository (COMP-028.3).
 */

import type { Notification } from "../../domain/notification.js";
import type { NotificationRepository } from "../../domain/ports/notification-repository.js";
import type { CommunicationDbClient } from "../communication-db-client.js";

const TABLE = "communication.notifications";

const INSERT_SQL = `
  INSERT INTO ${TABLE} (id, user_id, notification_type, source_event_type, payload, is_read, created_at)
  VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
`;

export class PostgresNotificationRepository implements NotificationRepository {
  constructor(private readonly client: CommunicationDbClient) {}

  async save(notification: Notification): Promise<void> {
    await this.client.execute(INSERT_SQL, [
      notification.id,
      notification.userId,
      notification.notificationType,
      notification.sourceEventType,
      JSON.stringify(notification.payload),
      notification.isRead,
      notification.createdAt,
    ]);
  }
}
