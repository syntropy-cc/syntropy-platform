/**
 * Container value object — resource allocation and status (COMP-030.2).
 * Architecture: IDE domain, PAT-004
 */

export const ContainerStatus = {
  Creating: "creating",
  Running: "running",
  Stopped: "stopped",
} as const;

export type ContainerStatusValue =
  (typeof ContainerStatus)[keyof typeof ContainerStatus];

export interface ContainerParams {
  containerId: string;
  image: string;
  cpuLimit: number;
  memoryLimit: number;
  status: ContainerStatusValue;
}

/**
 * Immutable value object for a provisioned container.
 */
export class Container {
  readonly containerId: string;
  readonly image: string;
  readonly cpuLimit: number;
  readonly memoryLimit: number;
  readonly status: ContainerStatusValue;

  private constructor(params: ContainerParams) {
    this.containerId = params.containerId;
    this.image = params.image;
    this.cpuLimit = params.cpuLimit;
    this.memoryLimit = params.memoryLimit;
    this.status = params.status;
  }

  static create(params: {
    containerId: string;
    image: string;
    cpuLimit: number;
    memoryLimit: number;
    status?: ContainerStatusValue;
  }): Container {
    if (!params.containerId?.trim()) {
      throw new Error("Container.containerId cannot be empty");
    }
    if (!params.image?.trim()) {
      throw new Error("Container.image cannot be empty");
    }
    if (typeof params.cpuLimit !== "number" || params.cpuLimit <= 0) {
      throw new Error("Container.cpuLimit must be a positive number");
    }
    if (typeof params.memoryLimit !== "number" || params.memoryLimit <= 0) {
      throw new Error("Container.memoryLimit must be a positive number");
    }
    return new Container({
      containerId: params.containerId.trim(),
      image: params.image.trim(),
      cpuLimit: params.cpuLimit,
      memoryLimit: params.memoryLimit,
      status: params.status ?? ContainerStatus.Creating,
    });
  }
}
