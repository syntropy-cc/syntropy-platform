/**
 * Unit tests for ContributionSandboxOrchestrator (COMP-019.6).
 */

import { describe, it, expect, vi } from "vitest";
import { ContributionSandbox } from "../../../src/domain/collaboration/contribution-sandbox.js";
import { ContributionSandboxStatus } from "../../../src/domain/collaboration/contribution-sandbox-status.js";
import type { ContainerOrchestratorPort } from "../../../src/domain/collaboration/ports/container-orchestrator-port.js";
import type { ContributionSandboxRepositoryPort } from "../../../src/domain/collaboration/ports/contribution-sandbox-repository-port.js";
import {
  ContributionSandboxOrchestrator,
  SandboxNotReadyForProvisionError,
} from "../../../src/application/contribution-sandbox-orchestrator.js";

function createSandboxInSettingUp(): ContributionSandbox {
  return ContributionSandbox.create({
    id: "sandbox-1",
    projectId: "proj-1",
    title: "Challenge",
    challengeDescription: "Build something",
  });
}

describe("ContributionSandboxOrchestrator", () => {
  describe("provision", () => {
    it("loads sandbox, calls container orchestrator with sandboxId and userId, activates and saves sandbox", async () => {
      const sandbox = createSandboxInSettingUp();
      const saved: ContributionSandbox[] = [];
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(sandbox),
        save: vi.fn().mockImplementation(async (s) => {
          saved.push(s);
        }),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn().mockResolvedValue({ ideSessionId: "ide-session-123" }),
      };

      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      const result = await orchestrator.provision("sandbox-1", "user-1");

      expect(sandboxRepo.getById).toHaveBeenCalledWith("sandbox-1");
      expect(containerOrchestrator.provision).toHaveBeenCalledWith("sandbox-1", {
        userId: "user-1",
        projectId: "proj-1",
      });
      expect(result.sandbox.status).toBe(ContributionSandboxStatus.Active);
      expect(result.sandbox.ideSessionId).toBe("ide-session-123");
      expect(result.event.type).toBe("hub.hackin.started");
      expect(result.event.sandboxId).toBe("sandbox-1");
      expect(sandboxRepo.save).toHaveBeenCalledWith(result.sandbox);
      expect(saved).toHaveLength(1);
      expect(saved[0].ideSessionId).toBe("ide-session-123");
    });

    it("throws SandboxNotReadyForProvisionError when sandbox not found", async () => {
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn(),
      };
      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      await expect(orchestrator.provision("missing", "user-1")).rejects.toThrow(
        SandboxNotReadyForProvisionError
      );
      await expect(orchestrator.provision("missing", "user-1")).rejects.toThrow(
        "sandbox not found"
      );
      expect(containerOrchestrator.provision).not.toHaveBeenCalled();
    });

    it("throws SandboxNotReadyForProvisionError when sandbox not in setting_up", async () => {
      const sandbox = createSandboxInSettingUp();
      const { sandbox: active } = sandbox.activate("existing-session");
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(active),
        save: vi.fn(),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn(),
      };
      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      await expect(orchestrator.provision("sandbox-1", "user-1")).rejects.toThrow(
        SandboxNotReadyForProvisionError
      );
      await expect(orchestrator.provision("sandbox-1", "user-1")).rejects.toThrow(
        "expected status setting_up"
      );
      expect(containerOrchestrator.provision).not.toHaveBeenCalled();
    });
  });

  describe("terminate", () => {
    it("calls containerOrchestrator.terminate with sandbox ideSessionId when sandbox has session", async () => {
      const sandbox = createSandboxInSettingUp();
      const { sandbox: active } = sandbox.activate("session-to-suspend");
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(active),
        save: vi.fn(),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn(),
        terminate: vi.fn().mockResolvedValue(undefined),
      };
      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      await orchestrator.terminate("sandbox-1");

      expect(sandboxRepo.getById).toHaveBeenCalledWith("sandbox-1");
      expect(containerOrchestrator.terminate).toHaveBeenCalledWith(
        "session-to-suspend"
      );
    });

    it("does nothing when sandbox not found", async () => {
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn(),
        terminate: vi.fn(),
      };
      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      await orchestrator.terminate("missing");

      expect(containerOrchestrator.terminate).not.toHaveBeenCalled();
    });

    it("does nothing when sandbox has no ideSessionId", async () => {
      const sandbox = createSandboxInSettingUp();
      const sandboxRepo: ContributionSandboxRepositoryPort = {
        getById: vi.fn().mockResolvedValue(sandbox),
        save: vi.fn(),
      };
      const containerOrchestrator: ContainerOrchestratorPort = {
        provision: vi.fn(),
        terminate: vi.fn(),
      };
      const orchestrator = new ContributionSandboxOrchestrator(
        sandboxRepo,
        containerOrchestrator
      );

      await orchestrator.terminate("sandbox-1");

      expect(containerOrchestrator.terminate).not.toHaveBeenCalled();
    });
  });
});
