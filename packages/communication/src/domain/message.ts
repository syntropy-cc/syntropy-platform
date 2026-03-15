/**
 * Message entity — single message in a thread (COMP-028.2).
 * Soft-deletable for audit and data retention.
 * Architecture: COMP-028, communication domain, COMP-039.1
 */

import { SoftDeletableMixin } from "@syntropy/platform-core";

export interface MessageParams {
  messageId: string;
  threadId: string;
  authorId: string;
  content: string;
  sentAt: Date;
}

/**
 * Message entity. Extends SoftDeletableMixin; use softDelete() to mark deleted.
 */
export class Message extends SoftDeletableMixin {
  readonly messageId: string;
  readonly threadId: string;
  readonly authorId: string;
  readonly content: string;
  readonly sentAt: Date;

  constructor(params: MessageParams) {
    super();
    if (!params.messageId?.trim()) {
      throw new Error("Message messageId cannot be empty");
    }
    if (!params.threadId?.trim()) {
      throw new Error("Message threadId cannot be empty");
    }
    if (!params.authorId?.trim()) {
      throw new Error("Message authorId cannot be empty");
    }
    if (typeof params.content !== "string") {
      throw new Error("Message content must be a string");
    }
    if (!(params.sentAt instanceof Date) || Number.isNaN(params.sentAt.getTime())) {
      throw new Error("Message sentAt must be a valid Date");
    }
    this.messageId = params.messageId.trim();
    this.threadId = params.threadId.trim();
    this.authorId = params.authorId.trim();
    this.content = params.content;
    this.sentAt = params.sentAt;
  }
}
