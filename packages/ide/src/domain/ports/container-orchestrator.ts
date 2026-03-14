/**
 * Container orchestrator port (COMP-030.2).
 * Architecture: IDE domain, PAT-005 — ACL to Docker/Kubernetes
 */

import type { Container } from "../container.js";

export interface ProvisionParams {
  image: string;
  cpuLimit: number;
  memoryLimit: number;
}

/**
 * Port for provisioning and controlling containers.
 * Implementations wrap Docker or Kubernetes (ACL).
 */
export interface ContainerOrchestrator {
  provision(params: ProvisionParams): Promise<Container>;
  stop(containerId: string): Promise<void>;
  getStatus(containerId: string): Promise<Container["status"]>;
}
