/**
 * IDE session supervisor service — one tick: find inactive sessions and suspend (COMP-034.6).
 * Architecture: IDE domain, application layer
 */

import type { IDESessionRepository } from "../domain/ports/ide-session-repository.js";

/** Minimal port for suspending a session (implemented by IDESessionProvisioningService). */
export interface SuspendSessionPort {
  suspend(sessionId: string, files: readonly unknown[]): Promise<unknown>;
}

const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export interface SupervisorTickResult {
  scanned: number;
  suspended: number;
  errors: number;
}

/**
 * Runs one supervisor tick: find active sessions inactive since threshold, suspend each.
 */
export async function runSupervisorTick(
  sessionRepository: IDESessionRepository,
  suspendService: SuspendSessionPort,
  inactivityMs: number = INACTIVITY_THRESHOLD_MS
): Promise<SupervisorTickResult> {
  const since = new Date(Date.now() - inactivityMs);
  const sessions = await sessionRepository.findActiveSessionsInactiveSince(since);
  let suspended = 0;
  let errors = 0;

  for (const session of sessions) {
    try {
      await suspendService.suspend(session.sessionId, []);
      suspended++;
    } catch {
      errors++;
    }
  }

  return { scanned: sessions.length, suspended, errors };
}
