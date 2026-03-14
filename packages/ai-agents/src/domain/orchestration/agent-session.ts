/**
 * AgentSession aggregate — session lifecycle and conversation history.
 * Architecture: COMP-012.2, orchestration-context-engine
 */

/** Session lifecycle status. */
export type AgentSessionStatus = "active" | "completed" | "expired";

/** Single message in session history. */
export interface SessionMessage {
  readonly role: string;
  readonly content: string;
}

/**
 * Aggregate root for an AI agent session.
 * Tracks session identity, status, and conversation history.
 * Immutable updates: addMessage and close return new instances.
 */
export class AgentSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly agentId: string;
  readonly status: AgentSessionStatus;
  readonly history: readonly SessionMessage[];
  readonly startedAt: Date;
  readonly endedAt: Date | undefined;

  private constructor(params: {
    sessionId: string;
    userId: string;
    agentId: string;
    status: AgentSessionStatus;
    history: readonly SessionMessage[];
    startedAt: Date;
    endedAt?: Date;
  }) {
    this.sessionId = params.sessionId;
    this.userId = params.userId;
    this.agentId = params.agentId;
    this.status = params.status;
    this.history = params.history;
    this.startedAt = params.startedAt;
    this.endedAt = params.endedAt;
  }

  /**
   * Creates a new active session.
   *
   * @param params.userId - User identifier
   * @param params.agentId - Agent identifier
   * @param params.sessionId - Optional; generated if omitted
   * @returns New AgentSession with status 'active' and empty history
   */
  static create(params: {
    userId: string;
    agentId: string;
    sessionId?: string;
  }): AgentSession {
    const sessionId =
      params.sessionId ?? crypto.randomUUID?.() ?? `session-${Date.now()}`;
    return new AgentSession({
      sessionId,
      userId: params.userId,
      agentId: params.agentId,
      status: "active",
      history: [],
      startedAt: new Date(),
      endedAt: undefined,
    });
  }

  /**
   * Appends a message to history. Returns a new session; does not mutate.
   *
   * @param role - Message role (e.g. 'user', 'assistant')
   * @param content - Message content
   * @returns New AgentSession with message appended
   * @throws Error if session is not active
   */
  addMessage(role: string, content: string): AgentSession {
    if (this.status !== "active") {
      throw new Error(
        `Cannot add message to session in status '${this.status}'`
      );
    }
    const message: SessionMessage = { role, content };
    return new AgentSession({
      sessionId: this.sessionId,
      userId: this.userId,
      agentId: this.agentId,
      status: this.status,
      history: [...this.history, message],
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    });
  }

  /**
   * Terminates the session. Returns a new session with status 'completed'.
   *
   * @returns New AgentSession with status 'completed' and endedAt set
   * @throws Error if session is not active
   */
  close(): AgentSession {
    if (this.status !== "active") {
      throw new Error(`Cannot close session in status '${this.status}'`);
    }
    return new AgentSession({
      sessionId: this.sessionId,
      userId: this.userId,
      agentId: this.agentId,
      status: "completed",
      history: this.history,
      startedAt: this.startedAt,
      endedAt: new Date(),
    });
  }
}
