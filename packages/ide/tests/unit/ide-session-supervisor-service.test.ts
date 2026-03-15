/**
 * Unit tests for runSupervisorTick (COMP-034.6).
 */

import { describe, it, expect, vi } from "vitest";
import { runSupervisorTick } from "../../src/application/ide-session-supervisor-service.js";
import { IDESession } from "../../src/domain/ide-session.js";
import { IDESessionStatus } from "../../src/domain/ide-session-status.js";

describe("runSupervisorTick (COMP-034.6)", () => {
  it("suspends all inactive sessions and returns counts", async () => {
    const inactiveSession = IDESession.create({
      sessionId: "sess-1",
      userId: "user-1",
    })
      .start()
      .withContainerStarted("container-1");
    const sessionRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      findActiveSessionsInactiveSince: vi.fn().mockResolvedValue([inactiveSession]),
    };
    const suspendService = {
      suspend: vi.fn().mockResolvedValue(undefined),
    };

    const result = await runSupervisorTick(
      sessionRepository as never,
      suspendService as never,
      30 * 60 * 1000
    );

    expect(result.scanned).toBe(1);
    expect(result.suspended).toBe(1);
    expect(result.errors).toBe(0);
    expect(suspendService.suspend).toHaveBeenCalledOnce();
    expect(suspendService.suspend).toHaveBeenCalledWith("sess-1", []);
  });

  it("returns scanned and zero suspended when no inactive sessions", async () => {
    const sessionRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      findActiveSessionsInactiveSince: vi.fn().mockResolvedValue([]),
    };
    const suspendService = { suspend: vi.fn() };

    const result = await runSupervisorTick(
      sessionRepository as never,
      suspendService as never
    );

    expect(result.scanned).toBe(0);
    expect(result.suspended).toBe(0);
    expect(result.errors).toBe(0);
    expect(suspendService.suspend).not.toHaveBeenCalled();
  });

  it("increments errors when suspend throws", async () => {
    const inactiveSession = IDESession.create({
      sessionId: "sess-2",
      userId: "user-2",
    })
      .start()
      .withContainerStarted("container-2");
    const sessionRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      findActiveSessionsInactiveSince: vi.fn().mockResolvedValue([inactiveSession]),
    };
    const suspendService = {
      suspend: vi.fn().mockRejectedValue(new Error("stop failed")),
    };

    const result = await runSupervisorTick(
      sessionRepository as never,
      suspendService as never
    );

    expect(result.scanned).toBe(1);
    expect(result.suspended).toBe(0);
    expect(result.errors).toBe(1);
  });
});
