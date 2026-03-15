/**
 * Workspace sync for IDE WebSocket sessions (COMP-035.6).
 *
 * Auto-save every 2min while active; save on suspend/close; restore
 * before welcome when resuming a suspended session.
 */

import {
  WorkspaceSnapshot,
  type WorkspaceSnapshotRepository,
  type WorkspaceSnapshotFile,
} from "@syntropy/ide";

const AUTO_SAVE_INTERVAL_MS = 2 * 60 * 1000;

export type GetCurrentFiles = () => Promise<readonly WorkspaceSnapshotFile[]>;

/**
 * Starts a 2-minute auto-save interval for the given session.
 * Returns a function to stop the interval (e.g. on socket close).
 */
export function startAutoSave(
  sessionId: string,
  snapshotRepo: WorkspaceSnapshotRepository,
  getCurrentFiles: GetCurrentFiles
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const files = await getCurrentFiles();
      const snapshot = WorkspaceSnapshot.create(sessionId, files);
      await snapshotRepo.save(snapshot);
    } catch {
      // Log but do not close connection
    }
  }, AUTO_SAVE_INTERVAL_MS);

  return () => clearInterval(intervalId);
}

/**
 * Saves a full workspace snapshot (e.g. on suspend or socket close).
 */
export async function saveSnapshot(
  sessionId: string,
  files: readonly WorkspaceSnapshotFile[],
  snapshotRepo: WorkspaceSnapshotRepository
): Promise<void> {
  const snapshot = WorkspaceSnapshot.create(sessionId, files);
  await snapshotRepo.save(snapshot);
}

/**
 * Loads the latest snapshot for the session, if any.
 * Call before sending welcome when resuming a suspended session.
 */
export async function restoreSnapshot(
  sessionId: string,
  snapshotRepo: WorkspaceSnapshotRepository
): Promise<WorkspaceSnapshot | null> {
  return snapshotRepo.getLatestBySessionId(sessionId);
}
