/**
 * Unit tests for DockerContainerAdapter (COMP-035.3).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContainerStatus } from "../../src/domain/container.js";
import { DockerContainerAdapter } from "../../src/infrastructure/docker-container-adapter.js";

const mockContainer = {
  id: "abc123",
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  kill: vi.fn().mockResolvedValue(undefined),
  inspect: vi.fn().mockResolvedValue({ State: { Status: "running" } }),
};

const mockDocker = {
  createContainer: vi.fn().mockResolvedValue(mockContainer),
  getContainer: vi.fn().mockReturnValue({
    stop: mockContainer.stop,
    kill: mockContainer.kill,
    inspect: mockContainer.inspect,
  }),
};

vi.mock("dockerode", () => ({
  default: vi.fn().mockImplementation(() => mockDocker),
}));

describe("DockerContainerAdapter (COMP-035.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContainer.inspect.mockResolvedValue({ State: { Status: "running" } });
  });

  it("provision creates container with correct image and limits and returns Container", async () => {
    const adapter = new DockerContainerAdapter();
    const container = await adapter.provision({
      image: "alpine:latest",
      cpuLimit: 1,
      memoryLimit: 512,
    });

    expect(mockDocker.createContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        Image: "alpine:latest",
        HostConfig: expect.objectContaining({
          Memory: 512 * 1024 * 1024,
          NanoCpus: 1e9,
          AutoRemove: true,
        }),
      })
    );
    expect(mockContainer.start).toHaveBeenCalled();
    expect(container.containerId).toBe("abc123");
    expect(container.image).toBe("alpine:latest");
    expect(container.status).toBe(ContainerStatus.Running);
  });

  it("stop calls container stop with timeout", async () => {
    const adapter = new DockerContainerAdapter();
    await adapter.stop("abc123");

    expect(mockDocker.getContainer).toHaveBeenCalledWith("abc123");
    expect(mockContainer.stop).toHaveBeenCalledWith({ t: 10 });
  });

  it("getStatus returns running when inspect State.Status is running", async () => {
    const adapter = new DockerContainerAdapter();
    const status = await adapter.getStatus("abc123");
    expect(status).toBe(ContainerStatus.Running);
  });

  it("getStatus returns stopped when inspect State.Status is exited", async () => {
    mockContainer.inspect.mockResolvedValueOnce({ State: { Status: "exited" } });
    const adapter = new DockerContainerAdapter();
    const status = await adapter.getStatus("abc123");
    expect(status).toBe(ContainerStatus.Stopped);
  });
});
