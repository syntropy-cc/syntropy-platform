/**
 * Thread aggregate — conversation container with participants (COMP-028.1).
 * Architecture: COMP-028, communication domain, PAT-004
 */

import { isThreadType, type ThreadType } from "./thread-type.js";

export interface ThreadParams {
  threadId: string;
  participants: string[];
  type: ThreadType;
}

/**
 * Thread aggregate. Immutable; addParticipant returns a new Thread.
 */
export class Thread {
  readonly threadId: string;
  readonly participants: readonly string[];
  readonly type: ThreadType;

  constructor(params: ThreadParams) {
    if (!params.threadId?.trim()) {
      throw new Error("Thread threadId cannot be empty");
    }
    if (!isThreadType(params.type)) {
      throw new Error(
        `Invalid thread type: ${params.type}. Must be direct, group, or notification.`
      );
    }
    if (!Array.isArray(params.participants)) {
      throw new Error("Thread participants must be an array");
    }
    const participantIds = params.participants.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );
    this.threadId = params.threadId.trim();
    this.participants = Object.freeze([...participantIds]);
    this.type = params.type;
  }

  /**
   * Returns a new Thread with the participant added if not already present.
   */
  addParticipant(participantId: string): Thread {
    const id = participantId?.trim();
    if (!id) {
      throw new Error("Participant id cannot be empty");
    }
    if (this.participants.includes(id)) {
      return this;
    }
    return new Thread({
      threadId: this.threadId,
      participants: [...this.participants, id],
      type: this.type,
    });
  }
}
