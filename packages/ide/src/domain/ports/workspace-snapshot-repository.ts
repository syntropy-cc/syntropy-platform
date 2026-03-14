/**
 * WorkspaceSnapshot repository port (COMP-030.6/030.7).
 * Architecture: IDE domain, PAT-004
 */

import type { WorkspaceSnapshot } from "../workspace-snapshot.js";

/**
 * Port for persisting and loading workspace snapshots.
 * Implemented in infrastructure (COMP-030.7).
 */
export interface WorkspaceSnapshotRepository {
  save(snapshot: WorkspaceSnapshot): Promise<void>;
  getLatestBySessionId(sessionId: string): Promise<WorkspaceSnapshot | null>;
}
