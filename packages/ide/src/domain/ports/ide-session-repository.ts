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
}
