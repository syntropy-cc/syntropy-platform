/**
 * ContainerOrchestrator port — provision IDE/container for ContributionSandbox (COMP-019.3).
 * Architecture: Hub Collaboration Layer; implementation in COMP-019.6
 */

/**
 * Result of provisioning a sandbox container (e.g. IDE session).
 */
export interface ProvisionResult {
  ideSessionId: string;
}

/**
 * Port for provisioning isolated containers for contribution sandboxes.
 * Stub implementation used in S31; real implementation in COMP-019.6.
 */
export interface ContainerOrchestratorPort {
  /**
   * Provision a container/IDE session for the given sandbox.
   * @param sandboxId - Identifier of the ContributionSandbox
   * @returns Session id for the provisioned environment
   */
  provision(sandboxId: string): Promise<ProvisionResult>;
}

/**
 * Stub implementation for unit tests and S31 business logic only.
 * Returns a fixed session id without calling any external service.
 */
export class StubContainerOrchestrator implements ContainerOrchestratorPort {
  constructor(
    private readonly fixedSessionId: string = "stub-session-00000000-0000-0000-0000-000000000000"
  ) {}

  async provision(_sandboxId: string): Promise<ProvisionResult> {
    return { ideSessionId: this.fixedSessionId };
  }
}
