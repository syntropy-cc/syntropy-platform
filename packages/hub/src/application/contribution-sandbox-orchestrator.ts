/**
 * ContributionSandboxOrchestrator — provisions IDE container for sandbox, terminates on merge/close (COMP-019.6).
 * Wires ContributionSandbox aggregate to ContainerOrchestratorPort (real IDE domain via IDESessionAdapter).
 */

import { ContributionSandboxStatus } from "../domain/collaboration/contribution-sandbox-status.js";
import type { ContributionSandbox } from "../domain/collaboration/contribution-sandbox.js";
import type { ContainerOrchestratorPort } from "../domain/collaboration/ports/container-orchestrator-port.js";
import type { ContributionSandboxRepositoryPort } from "../domain/collaboration/ports/contribution-sandbox-repository-port.js";

/**
 * Result of provisioning a sandbox (sandbox updated, event for caller to publish).
 */
export interface ProvisionSandboxResult {
  sandbox: ContributionSandbox;
  event: { type: string; sandboxId: string; projectId: string; title: string; status: string; occurredAt: Date };
}

/**
 * Thrown when sandbox is not found or not in setting_up status.
 */
export class SandboxNotReadyForProvisionError extends Error {
  constructor(
    public readonly sandboxId: string,
    reason: string
  ) {
    super(`Sandbox ${sandboxId} cannot be provisioned: ${reason}`);
    this.name = "SandboxNotReadyForProvisionError";
    Object.setPrototypeOf(this, SandboxNotReadyForProvisionError.prototype);
  }
}

/**
 * Orchestrates sandbox lifecycle: provision (create+start IDE session, activate sandbox), terminate (suspend IDE session).
 */
export class ContributionSandboxOrchestrator {
  constructor(
    private readonly sandboxRepo: ContributionSandboxRepositoryPort,
    private readonly containerOrchestrator: ContainerOrchestratorPort
  ) {}

  /**
   * Provisions an IDE session for the sandbox and activates the sandbox.
   * Loads sandbox, calls ContainerOrchestratorPort.provision(sandboxId, { userId, projectId }), then sandbox.activate(ideSessionId), saves.
   *
   * @param sandboxId - Id of the ContributionSandbox
   * @param userId - User starting the sandbox (owner of the IDE session)
   * @returns Updated sandbox and event (hub.hackin.started) for caller to publish
   */
  async provision(sandboxId: string, userId: string): Promise<ProvisionSandboxResult> {
    const sandbox = await this.sandboxRepo.getById(sandboxId);
    if (!sandbox) {
      throw new SandboxNotReadyForProvisionError(sandboxId, "sandbox not found");
    }
    if (sandbox.status !== ContributionSandboxStatus.SettingUp) {
      throw new SandboxNotReadyForProvisionError(
        sandboxId,
        `expected status setting_up, got ${sandbox.status}`
      );
    }

    const { ideSessionId } = await this.containerOrchestrator.provision(sandboxId, {
      userId,
      projectId: sandbox.projectId,
    });

    const { sandbox: activated, event } = sandbox.activate(ideSessionId);
    await this.sandboxRepo.save(activated);

    return {
      sandbox: activated,
      event: {
        type: event.type,
        sandboxId: event.sandboxId,
        projectId: event.projectId,
        title: event.title,
        status: event.status,
        occurredAt: event.occurredAt,
      },
    };
  }

  /**
   * Terminates the IDE session for the sandbox (suspend container).
   * Loads sandbox; if it has an ideSessionId, calls the port to suspend that session.
   * Does not change sandbox status (caller may complete the sandbox separately).
   *
   * @param sandboxId - Id of the ContributionSandbox
   */
  async terminate(sandboxId: string): Promise<void> {
    const sandbox = await this.sandboxRepo.getById(sandboxId);
    if (!sandbox || !sandbox.ideSessionId) {
      return;
    }
    await this.containerOrchestrator.terminate?.(sandbox.ideSessionId);
  }
}
