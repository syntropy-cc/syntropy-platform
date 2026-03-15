/**
 * Kubernetes container orchestrator adapter (COMP-035.3).
 * Implements ContainerOrchestrator using Kubernetes API for production.
 * Architecture: PAT-005 — ACL to Kubernetes
 */

import { KubeConfig, CoreV1Api } from "@kubernetes/client-node";
import { Container, ContainerStatus } from "../domain/container.js";
import type { ContainerOrchestrator, ProvisionParams } from "../domain/ports/container-orchestrator.js";
import { randomUUID } from "node:crypto";

const DEFAULT_NAMESPACE = "default";

export interface KubernetesContainerAdapterOptions {
  namespace?: string;
  /** If not set, loads from default kubeconfig (in-cluster or ~/.kube/config). */
  kubeConfig?: KubeConfig;
}

function mapPodStatusToContainerStatus(
  phase: string | undefined
): Container["status"] {
  if (phase === "Running") return ContainerStatus.Running;
  if (phase === "Pending" || phase === "Unknown") return ContainerStatus.Creating;
  return ContainerStatus.Stopped;
}

/**
 * ContainerOrchestrator implementation using Kubernetes.
 * Use when CONTAINER_ORCHESTRATOR=k8s.
 */
export class KubernetesContainerAdapter implements ContainerOrchestrator {
  private readonly api: CoreV1Api;
  private readonly namespace: string;

  constructor(options: KubernetesContainerAdapterOptions = {}) {
    const kc = options.kubeConfig ?? new KubeConfig();
    if (!options.kubeConfig) {
      kc.loadFromDefault();
    }
    this.api = kc.makeApiClient(CoreV1Api);
    this.namespace = options.namespace ?? DEFAULT_NAMESPACE;
  }

  async provision(params: ProvisionParams): Promise<Container> {
    const name = `ide-${randomUUID().slice(0, 8)}`;
    const memoryMi = Math.max(1, Math.floor(params.memoryLimit));
    const cpuCores = Math.max(0.1, params.cpuLimit);

    await this.api.createNamespacedPod(this.namespace, {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name,
        namespace: this.namespace,
      },
      spec: {
        containers: [
          {
            name: "workspace",
            image: params.image,
            command: ["sleep", "infinity"],
            resources: {
              limits: {
                memory: `${memoryMi}Mi`,
                cpu: String(cpuCores),
              },
              requests: {
                memory: `${Math.floor(memoryMi / 2)}Mi`,
                cpu: String(Math.max(0.1, cpuCores / 2)),
              },
            },
          },
        ],
        restartPolicy: "Never",
      },
    });

    return Container.create({
      containerId: name,
      image: params.image,
      cpuLimit: params.cpuLimit,
      memoryLimit: params.memoryLimit,
      status: ContainerStatus.Creating,
    });
  }

  async stop(containerId: string): Promise<void> {
    await this.api.deleteNamespacedPod(containerId, this.namespace);
  }

  async getStatus(containerId: string): Promise<Container["status"]> {
    const res = await this.api.readNamespacedPod(
      containerId,
      this.namespace
    );
    const phase = res.body?.status?.phase;
    return mapPodStatusToContainerStatus(phase);
  }
}
