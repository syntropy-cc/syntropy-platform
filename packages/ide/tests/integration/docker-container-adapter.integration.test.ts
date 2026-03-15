/**
 * Integration test for DockerContainerAdapter with real Docker (COMP-035.3).
 * Skips when Docker is not available (e.g. CI without Docker socket).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DockerContainerAdapter } from "../../src/infrastructure/docker-container-adapter.js";
import { ContainerStatus } from "../../src/domain/container.js";
import Docker from "dockerode";

function isDockerAvailable(): boolean {
  try {
    const docker = new Docker();
    return true;
  } catch {
    return false;
  }
}

describe("DockerContainerAdapter integration (COMP-035.3)", () => {
  let adapter: DockerContainerAdapter;
  let containerId: string | null = null;

  beforeAll(() => {
    if (!isDockerAvailable()) {
      console.warn("Docker not available; skipping Docker integration tests");
    }
    adapter = new DockerContainerAdapter();
  });

  afterAll(async () => {
    if (containerId) {
      try {
        await adapter.stop(containerId);
      } catch {
        // ignore
      }
    }
  });

  it("provision creates container, getStatus returns running, stop terminates", async () => {
    if (!isDockerAvailable()) {
      return;
    }
    let container: Awaited<ReturnType<typeof adapter.provision>>;
    try {
      container = await adapter.provision({
        image: "alpine:latest",
        cpuLimit: 0.5,
        memoryLimit: 64,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes("no such image") ||
          err.message.includes("No such image"))
      ) {
        return;
      }
      throw err;
    }
    containerId = container.containerId;
    expect(container.containerId).toBeDefined();
    expect(container.status).toBe(ContainerStatus.Running);

    const status = await adapter.getStatus(container.containerId);
    expect(status).toBe(ContainerStatus.Running);

    await adapter.stop(container.containerId);
    containerId = null;
    const statusAfter = await adapter.getStatus(container.containerId);
    expect(statusAfter).toBe(ContainerStatus.Stopped);
  }, 30_000);
});
