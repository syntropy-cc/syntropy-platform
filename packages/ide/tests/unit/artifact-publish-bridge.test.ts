/**
 * Unit tests for IDEArtifactBridge (COMP-030.5).
 */

import { describe, it, expect, vi } from "vitest";
import { IDESession } from "../../src/domain/ide-session.js";
import { IDESessionStatus } from "../../src/domain/ide-session-status.js";
import type { WorkspaceSnapshotFile } from "../../src/domain/workspace-snapshot.js";
import type { DIPArtifactPort, PublishArtifactParams } from "../../src/domain/ports/dip-artifact-port.js";
import { IDEArtifactBridge, SessionNotActiveError } from "../../src/application/artifact-publish-bridge.js";

describe("IDEArtifactBridge (COMP-030.5)", () => {
  const sampleFiles: WorkspaceSnapshotFile[] = [
    { path: "src/index.ts", content: "export {};" },
    { path: "README.md", content: "# Hello" },
  ];

  function createMockPort(result: { artifactId: string }): DIPArtifactPort {
    return {
      publish: vi.fn().mockResolvedValue(result),
    };
  }

  describe("publish", () => {
    it("calls DIP port with session and files and returns artifact ID when session is active", async () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
        projectId: "proj-1",
      }).start();

      expect(session.status).toBe(IDESessionStatus.Active);

      const mockPort = createMockPort({ artifactId: "art-123" });
      const bridge = new IDEArtifactBridge(mockPort);

      const artifactId = await bridge.publish(session, sampleFiles);

      expect(artifactId).toBe("art-123");
      expect(mockPort.publish).toHaveBeenCalledTimes(1);
      const publishMock = vi.mocked(mockPort.publish);
      const callParams = publishMock.mock.calls[0][0] as PublishArtifactParams;
      expect(callParams.sessionId).toBe("sess-1");
      expect(callParams.userId).toBe("user-1");
      expect(callParams.files).toEqual(sampleFiles);
      expect(callParams.metadata?.projectId).toBe("proj-1");
    });

    it("throws SessionNotActiveError when session is not active", async () => {
      const session = IDESession.create({
        sessionId: "sess-1",
        userId: "user-1",
      });
      expect(session.status).toBe(IDESessionStatus.Pending);

      const mockPort = createMockPort({ artifactId: "art-1" });
      const bridge = new IDEArtifactBridge(mockPort);

      await expect(bridge.publish(session, sampleFiles)).rejects.toThrow(
        SessionNotActiveError
      );
      await expect(bridge.publish(session, sampleFiles)).rejects.toThrow(
        "Cannot publish artifact: session sess-1 is not active"
      );

      expect(mockPort.publish).not.toHaveBeenCalled();
    });

    it("throws SessionNotActiveError when session is suspended", async () => {
      const session = IDESession.create({
        sessionId: "sess-2",
        userId: "user-2",
      })
        .start()
        .suspend();

      expect(session.status).toBe(IDESessionStatus.Suspended);

      const mockPort = createMockPort({ artifactId: "art-2" });
      const bridge = new IDEArtifactBridge(mockPort);

      await expect(bridge.publish(session, sampleFiles)).rejects.toThrow(
        SessionNotActiveError
      );
      expect(mockPort.publish).not.toHaveBeenCalled();
    });

    it("throws SessionNotActiveError when session is terminated", async () => {
      const session = IDESession.create({
        sessionId: "sess-3",
        userId: "user-3",
      })
        .start()
        .terminate();

      const mockPort = createMockPort({ artifactId: "art-3" });
      const bridge = new IDEArtifactBridge(mockPort);

      await expect(bridge.publish(session, sampleFiles)).rejects.toThrow(
        SessionNotActiveError
      );
      expect(mockPort.publish).not.toHaveBeenCalled();
    });

    it("passes metadata with null projectId when session has no project", async () => {
      const session = IDESession.create({
        sessionId: "sess-4",
        userId: "user-4",
      }).start();

      const mockPort = createMockPort({ artifactId: "art-4" });
      const bridge = new IDEArtifactBridge(mockPort);

      await bridge.publish(session, sampleFiles);

      const publishMock = vi.mocked(mockPort.publish);
      const callParams = publishMock.mock.calls[0][0] as PublishArtifactParams;
      expect(callParams.metadata?.projectId).toBeNull();
    });
  });
});
