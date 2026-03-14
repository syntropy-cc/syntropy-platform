/**
 * Unit tests for IDESessionProvisioningService (COMP-030.6).
 */

import { describe, it, expect, vi } from "vitest";
import { IDESession } from "../../src/domain/ide-session.js";
import { IDESessionStatus } from "../../src/domain/ide-session-status.js";
import { Container } from "../../src/domain/container.js";
import { ContainerStatus } from "../../src/domain/container.js";
import type { ContainerOrchestrator } from "../../src/domain/ports/container-orchestrator.js";
import type { IDESessionRepository } from "../../src/domain/ports/ide-session-repository.js";
import type { WorkspaceSnapshotRepository } from "../../src/domain/ports/workspace-snapshot-repository.js";
import type { IDEEventPublisher } from "../../src/domain/ports/ide-event-publisher.js";
import {
  IDESessionProvisioningService,
  SessionNotFoundError,
  SessionNotSuspensibleError,
} from "../../src/application/ide-session-provisioning-service.js";

describe("IDESessionProvisioningService (COMP-030.6)", () => {
  const sessionId = "sess-1";
  const containerId = "cont-1";

  function createPendingSession(): IDESession {
    return IDESession.create({
      sessionId,
      userId: "user-1",
      projectId: "proj-1",
    });
  }

  function createMockOrchestrator(container?: Container): ContainerOrchestrator {
    return {
      provision: vi.fn().mockResolvedValue(
        container ??
          Container.create({
            containerId,
            image: "ide-workspace:latest",
            cpuLimit: 1,
            memoryLimit: 512,
            status: ContainerStatus.Running,
          })
      ),
      stop: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockResolvedValue(ContainerStatus.Running),
    };
  }

  function createMockEventPublisher(): IDEEventPublisher {
    return { publish: vi.fn().mockResolvedValue(undefined) };
  }

  describe("start", () => {
    it("provisions container, updates session to active with containerId, saves and emits event", async () => {
      const session = createPendingSession();
      const sessionRepo: IDESessionRepository = {
        findById: vi.fn().mockResolvedValue(session),
        save: vi.fn().mockResolvedValue(undefined),
      };
      const snapshotRepo: WorkspaceSnapshotRepository = {
        save: vi.fn().mockResolvedValue(undefined),
        getLatestBySessionId: vi.fn().mockResolvedValue(null),
      };
      const orchestrator = createMockOrchestrator();
      const eventPublisher = createMockEventPublisher();

      const service = new IDESessionProvisioningService(
        sessionRepo,
        snapshotRepo,
        orchestrator,
        eventPublisher
      );

      const updated = await service.start(sessionId);

      expect(updated.status).toBe(IDESessionStatus.Active);
      expect(updated.containerId).toBe(containerId);
      expect(orchestrator.provision).toHaveBeenCalledTimes(1);
      expect(sessionRepo.save).toHaveBeenCalledTimes(1);
      expect(eventPublisher.publish).toHaveBeenCalledTimes(1);
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ide.container.provisioned",
          sessionId,
          containerId,
        })
      );
    });

    it("throws SessionNotFoundError when session does not exist", async () => {
      const sessionRepo: IDESessionRepository = {
        findById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const snapshotRepo: WorkspaceSnapshotRepository = {
        save: vi.fn(),
        getLatestBySessionId: vi.fn(),
      };
      const service = new IDESessionProvisioningService(
        sessionRepo,
        snapshotRepo,
        createMockOrchestrator(),
        createMockEventPublisher()
      );

      await expect(service.start("nonexistent")).rejects.toThrow(
        SessionNotFoundError
      );
      await expect(service.start("nonexistent")).rejects.toThrow(
        "IDE session not found"
      );
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("suspend", () => {
    it("stops container, saves snapshot, updates session to suspended and saves", async () => {
      const sessionWithContainer = createPendingSession().withContainerStarted(
        containerId
      );

      const sessionRepo: IDESessionRepository = {
        findById: vi.fn().mockResolvedValue(sessionWithContainer),
        save: vi.fn().mockResolvedValue(undefined),
      };
      const snapshotRepo: WorkspaceSnapshotRepository = {
        save: vi.fn().mockResolvedValue(undefined),
        getLatestBySessionId: vi.fn().mockResolvedValue(null),
      };
      const orchestrator = createMockOrchestrator();

      const service = new IDESessionProvisioningService(
        sessionRepo,
        snapshotRepo,
        orchestrator,
        createMockEventPublisher()
      );

      const files = [
        { path: "src/index.ts", content: "export {};" },
      ];
      const suspended = await service.suspend(sessionId, files);

      expect(suspended.status).toBe(IDESessionStatus.Suspended);
      expect(orchestrator.stop).toHaveBeenCalledWith(containerId);
      expect(snapshotRepo.save).toHaveBeenCalledTimes(1);
      const saveMock = vi.mocked(snapshotRepo.save);
      const savedSnapshot = saveMock.mock.calls[0][0];
      expect(savedSnapshot.sessionId).toBe(sessionId);
      expect(savedSnapshot.files).toHaveLength(1);
      expect(sessionRepo.save).toHaveBeenCalledTimes(1);
    });

    it("throws SessionNotFoundError when session does not exist", async () => {
      const sessionRepo: IDESessionRepository = {
        findById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const snapshotRepo: WorkspaceSnapshotRepository = {
        save: vi.fn(),
        getLatestBySessionId: vi.fn(),
      };
      const service = new IDESessionProvisioningService(
        sessionRepo,
        snapshotRepo,
        createMockOrchestrator(),
        createMockEventPublisher()
      );

      await expect(service.suspend("nonexistent", [])).rejects.toThrow(
        SessionNotFoundError
      );
      expect(snapshotRepo.save).not.toHaveBeenCalled();
    });

    it("throws SessionNotSuspensibleError when session is not active", async () => {
      const session = createPendingSession();
      const orchestrator = createMockOrchestrator();

      const sessionRepo: IDESessionRepository = {
        findById: vi.fn().mockResolvedValue(session),
        save: vi.fn(),
      };
      const snapshotRepo: WorkspaceSnapshotRepository = {
        save: vi.fn(),
        getLatestBySessionId: vi.fn(),
      };
      const service = new IDESessionProvisioningService(
        sessionRepo,
        snapshotRepo,
        orchestrator,
        createMockEventPublisher()
      );

      await expect(service.suspend(sessionId, [])).rejects.toThrow(
        SessionNotSuspensibleError
      );
      await expect(service.suspend(sessionId, [])).rejects.toThrow(
        "expected active"
      );
      expect(orchestrator.stop).not.toHaveBeenCalled();
    });
  });
});
