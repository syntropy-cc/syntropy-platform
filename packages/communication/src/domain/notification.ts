/**
 * Notification entity — system-generated alert for a user (COMP-028.3).
 * Architecture: COMP-028, communication domain, PAT-004
 */

export interface NotificationParams {
  id: string;
  userId: string;
  notificationType: string;
  sourceEventType: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification entity. Immutable; created by NotificationEventConsumer from domain events.
 */
export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly notificationType: string;
  readonly sourceEventType: string;
  readonly payload: Record<string, unknown>;
  readonly isRead: boolean;
  readonly createdAt: Date;

  constructor(params: NotificationParams) {
    if (!params.id?.trim()) {
      throw new Error("Notification id cannot be empty");
    }
    if (!params.userId?.trim()) {
      throw new Error("Notification userId cannot be empty");
    }
    if (!params.notificationType?.trim()) {
      throw new Error("Notification notificationType cannot be empty");
    }
    if (!params.sourceEventType?.trim()) {
      throw new Error("Notification sourceEventType cannot be empty");
    }
    if (params.payload !== null && typeof params.payload !== "object") {
      throw new Error("Notification payload must be an object");
    }
    if (!(params.createdAt instanceof Date) || Number.isNaN(params.createdAt.getTime())) {
      throw new Error("Notification createdAt must be a valid Date");
    }
    this.id = params.id.trim();
    this.userId = params.userId.trim();
    this.notificationType = params.notificationType.trim();
    this.sourceEventType = params.sourceEventType.trim();
    this.payload = Object.freeze({ ...params.payload });
    this.isRead = Boolean(params.isRead);
    this.createdAt = params.createdAt;
  }
}
