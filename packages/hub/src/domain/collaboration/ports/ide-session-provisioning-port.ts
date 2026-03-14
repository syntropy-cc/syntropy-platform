/**
 * IDE session provisioning port — create+start and suspend IDE sessions (COMP-019.6).
 * Implemented by the app using IDE domain services; Hub's IDESessionAdapter depends on this.
 */

/**
 * Port for creating and starting an IDE session, and suspending it.
 * Implementation lives in the app (e.g. apps/api) and uses IDESessionRepository + IDESessionProvisioningService.
 */
export interface IDESessionProvisioningPort {
  /**
   * Create an IDE session and start (provision container). Returns the session id.
   */
  createAndStart(params: {
    userId: string;
    projectId?: string | null;
  }): Promise<{ sessionId: string }>;

  /**
   * Suspend an IDE session (stop container, persist snapshot). Idempotent if already suspended.
   */
  suspend(sessionId: string): Promise<void>;
}
