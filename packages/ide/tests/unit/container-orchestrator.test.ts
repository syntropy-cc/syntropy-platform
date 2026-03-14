/**
 * Unit tests for ContainerOrchestrator interface (COMP-030.2).
 * Uses a fake implementation to verify the contract.
 */

import { describe, it, expect } from "vitest";
import { Container, ContainerStatus } from "../../src/domain/container.js";
import type {
  ContainerOrchestrator,
  ProvisionParams,
} from "../../src/domain/ports/container-orchestrator.js";

function createFakeContainerOrchestrator(): ContainerOrchestrator {
  const containers = new Map<string, Container>();
  let nextId = 0;
  return {
    async provision(params: ProvisionParams): Promise<Container> {
      const containerId = `fake-${++nextId}`;
      const c = Container.create({
        containerId,
        image: params.image,
        cpuLimit: params.cpuLimit,
        memoryLimit: params.memoryLimit,
        status: ContainerStatus.Running,
      });
      containers.set(containerId, c);
      return c;
    },
    async stop(containerId: string): Promise<void> {
      const c = containers.get(containerId);
      if (c) {
        containers.set(
          containerId,
          Container.create({
            containerId: c.containerId,
            image: c.image,
            cpuLimit: c.cpuLimit,
            memoryLimit: c.memoryLimit,
            status: ContainerStatus.Stopped,
          })
        );
      }
    },
    async getStatus(containerId: string): Promise<Container["status"]> {
      const c = containers.get(containerId);
      return c?.status ?? ContainerStatus.Stopped;
    },
  };
}

describe("ContainerOrchestrator interface (COMP-030.2)", () => {
  it("provision returns a Container with correct params", async () => {
    const orch = createFakeContainerOrchestrator();
    const c = await orch.provision({
      image: "node:20",
      cpuLimit: 1,
      memoryLimit: 512,
    });
    expect(c.containerId).toMatch(/^fake-\d+$/);
    expect(c.image).toBe("node:20");
    expect(c.cpuLimit).toBe(1);
    expect(c.memoryLimit).toBe(512);
    expect(c.status).toBe(ContainerStatus.Running);
  });

  it("getStatus returns status for provisioned container", async () => {
    const orch = createFakeContainerOrchestrator();
    const c = await orch.provision({
      image: "node:20",
      cpuLimit: 1,
      memoryLimit: 512,
    });
    const status = await orch.getStatus(c.containerId);
    expect(status).toBe(ContainerStatus.Running);
  });

  it("stop does not throw and getStatus returns stopped after stop", async () => {
    const orch = createFakeContainerOrchestrator();
    const c = await orch.provision({
      image: "node:20",
      cpuLimit: 1,
      memoryLimit: 512,
    });
    await orch.stop(c.containerId);
    const status = await orch.getStatus(c.containerId);
    expect(status).toBe(ContainerStatus.Stopped);
  });

  it("getStatus returns stopped for unknown containerId", async () => {
    const orch = createFakeContainerOrchestrator();
    const status = await orch.getStatus("nonexistent");
    expect(status).toBe(ContainerStatus.Stopped);
  });
});
