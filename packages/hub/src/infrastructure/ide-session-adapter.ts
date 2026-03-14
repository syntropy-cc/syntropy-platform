/**
 * IDESessionAdapter — ACL implementing ContainerOrchestratorPort using IDE domain (COMP-019.6).
 * Does not import @syntropy/ide; app wires IDESessionProvisioningPort with real IDE services.
 */

import type { ContainerOrchestratorPort, ProvisionResult } from "../domain/collaboration/ports/container-orchestrator-port.js";
import type { IDESessionProvisioningPort } from "../domain/collaboration/ports/ide-session-provisioning-port.js";

/**
 * Adapter that provisions IDE sessions for contribution sandboxes via the IDE session provisioning port.
 */
export class IDESessionAdapter implements ContainerOrchestratorPort {
  constructor(private readonly idePort: IDESessionProvisioningPort) {}

  async provision(
    _sandboxId: string,
    options?: { userId: string; projectId?: string | null }
  ): Promise<ProvisionResult> {
    if (!options?.userId) {
      throw new Error("IDESessionAdapter.provision: userId is required");
    }
    const { sessionId } = await this.idePort.createAndStart({
      userId: options.userId,
      projectId: options.projectId ?? null,
    });
    return { ideSessionId: sessionId };
  }

  async terminate(sessionId: string): Promise<void> {
    await this.idePort.suspend(sessionId);
  }
}
