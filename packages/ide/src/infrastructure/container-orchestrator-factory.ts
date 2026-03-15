/**
 * Factory for ContainerOrchestrator based on CONTAINER_ORCHESTRATOR env (COMP-035.3).
 */

import type { ContainerOrchestrator } from "../domain/ports/container-orchestrator.js";
import { DockerContainerAdapter } from "./docker-container-adapter.js";
import { KubernetesContainerAdapter } from "./kubernetes-container-adapter.js";

const ENV_KEY = "CONTAINER_ORCHESTRATOR";

/**
 * Returns a ContainerOrchestrator based on CONTAINER_ORCHESTRATOR.
 * - "k8s" -> KubernetesContainerAdapter
 * - "docker" or unset -> DockerContainerAdapter (default for dev)
 */
export function createContainerOrchestrator(): ContainerOrchestrator {
  const value = process.env[ENV_KEY]?.toLowerCase();
  if (value === "k8s") {
    return new KubernetesContainerAdapter();
  }
  return new DockerContainerAdapter();
}
