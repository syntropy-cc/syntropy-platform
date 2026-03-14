/**
 * Agent session repository interface (COMP-012.7).
 * Domain layer — implementation in infrastructure.
 */

import type { AgentSession } from "../agent-session.js";

/**
 * Persistence contract for AgentSession aggregate.
 * Implement with PostgreSQL or in-memory for tests.
 */
export interface AgentSessionRepository {
  findById(sessionId: string): Promise<AgentSession | null>;
  findActiveByUser(userId: string): Promise<AgentSession[]>;
  save(session: AgentSession): Promise<void>;
}
