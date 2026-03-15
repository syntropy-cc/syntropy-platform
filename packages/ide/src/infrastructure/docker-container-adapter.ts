/**
 * Docker container orchestrator adapter (COMP-035.3).
 * Implements ContainerOrchestrator using Docker API for local/dev.
 * Architecture: PAT-005 — ACL to Docker
 */

import Docker from "dockerode";
import { Container, ContainerStatus } from "../domain/container.js";
import type { ContainerOrchestrator, ProvisionParams } from "../domain/ports/container-orchestrator.js";
import { randomUUID } from "node:crypto";

function memoryMbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

function cpuToNanoCpus(cpu: number): number {
  return Math.floor(cpu * 1e9);
}

export interface DockerContainerAdapterOptions {
  /** Docker socket or host. Default: undefined (use default socket). */
  socketPath?: string;
}

/**
 * ContainerOrchestrator implementation using Docker.
 * Use when CONTAINER_ORCHESTRATOR=docker or in development.
 */
export class DockerContainerAdapter implements ContainerOrchestrator {
  private readonly docker: Docker;

  constructor(options: DockerContainerAdapterOptions = {}) {
    this.docker = options.socketPath
      ? new Docker({ socketPath: options.socketPath })
      : new Docker();
  }

  async provision(params: ProvisionParams): Promise<Container> {
    const name = `ide-${randomUUID().slice(0, 8)}`;
    const container = await this.docker.createContainer({
      Image: params.image,
      name,
      HostConfig: {
        Memory: memoryMbToBytes(params.memoryLimit),
        NanoCpus: cpuToNanoCpus(params.cpuLimit),
        AutoRemove: true,
      },
      Cmd: ["sleep", "infinity"],
    });
    await container.start();
    return Container.create({
      containerId: container.id,
      image: params.image,
      cpuLimit: params.cpuLimit,
      memoryLimit: params.memoryLimit,
      status: ContainerStatus.Running,
    });
  }

  async stop(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    try {
      await container.stop({ t: 10 });
    } catch {
      await container.kill();
    }
  }

  async getStatus(containerId: string): Promise<Container["status"]> {
    const container = this.docker.getContainer(containerId);
    const inspect = await container.inspect();
    const state = inspect.State?.Status;
    if (state === "running") return ContainerStatus.Running;
    if (state === "created" || state === "restarting") return ContainerStatus.Creating;
    return ContainerStatus.Stopped;
  }
}
