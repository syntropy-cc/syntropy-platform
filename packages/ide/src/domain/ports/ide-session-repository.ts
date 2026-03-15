/**
 * IDESession repository port (COMP-030.6/030.7).
 * Architecture: IDE domain, PAT-004
 */

import type { IDESession } from "../ide-session.js";

/**
 * Port for persisting and loading IDESession aggregates.
 * Implemented in infrastructure (COMP-030.7).
 */
export interface IDESessionRepository {
  findById(sessionId: string): Promise<IDESession | null>;
  save(session: IDESession): Promise<void>;

  /**
   * Returns active sessions with last activity (or startedAt) before the given date.
   * Used by IDE session inactivity supervisor (COMP-034.6).
   */
  findActiveSessionsInactiveSince(since: Date): Promise<IDESession[]>;
}
