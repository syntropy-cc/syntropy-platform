/**
 * IDE session inactivity supervisor worker (COMP-034.6).
 *
 * Every 2 minutes scans active IDE sessions for inactivity > 30min and suspends them.
 * Uses IDESessionRepository.findActiveSessionsInactiveSince and IDESessionProvisioningService.suspend.
 */

import { createLogger } from "@syntropy/platform-core";
import { Pool } from "pg";
import {
  PostgresIDESessionRepository,
  IDESessionProvisioningService,
  runSupervisorTick,
  Container,
  ContainerStatus,
} from "@syntropy/ide";
import type {
  ContainerOrchestrator,
  WorkspaceSnapshotRepository,
  IDEEventPublisher,
} from "@syntropy/ide";
import type { Worker } from "../types.js";
import { getIDESupervisorCounters } from "../metrics.js";

const log = createLogger("workers:ide-session-supervisor");
const TICK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

function getDatabaseUrl(): string | undefined {
  return process.env.IDE_DATABASE_URL ?? process.env.DATABASE_URL;
}

function createStubContainerOrchestrator(): ContainerOrchestrator {
  return {
    async provision() {
      return Container.create({
        containerId: "stub",
        image: "stub",
        cpuLimit: 1,
        memoryLimit: 512,
        status: ContainerStatus.Running,
      });
    },
    async stop() {
      // No-op when supervisor runs without real container backend
    },
    async getStatus() {
      return ContainerStatus.Stopped;
    },
  };
}

function createStubSnapshotRepository(): WorkspaceSnapshotRepository {
  return {
    async save() {},
    async getLatestBySessionId() {
      return null;
    },
  };
}

function createStubEventPublisher(): IDEEventPublisher {
  return {
    async publish() {},
  };
}

/**
 * Creates the IDE session supervisor worker. When IDE_DATABASE_URL or DATABASE_URL
 * is set, wires PostgresIDESessionRepository and IDESessionProvisioningService
 * (with stub container/snapshot/event); otherwise runs a no-op stub.
 */
export function createIDESessionSupervisorWorker(): Worker {
  let pool: Pool | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const workerName = "ide-session-supervisor";
  const counters = getIDESupervisorCounters(workerName);

  return {
    name: workerName,

    async start(): Promise<void> {
      const databaseUrl = getDatabaseUrl();
      if (!databaseUrl) {
        log.warn("IDE_DATABASE_URL/DATABASE_URL not set; ide-session-supervisor running as stub");
        return;
      }

      pool = new Pool({ connectionString: databaseUrl });
      const sessionRepository = new PostgresIDESessionRepository(pool);
      const containerOrchestrator = createStubContainerOrchestrator();
      const snapshotRepository = createStubSnapshotRepository();
      const eventPublisher = createStubEventPublisher();
      const provisioningService = new IDESessionProvisioningService(
        sessionRepository,
        snapshotRepository,
        containerOrchestrator,
        eventPublisher
      );

      const tick = async (): Promise<void> => {
        try {
          const result = await runSupervisorTick(sessionRepository, provisioningService);
          counters.recordActiveScanned(result.scanned);
          counters.recordSuspended(result.suspended);
          if (result.scanned > 0 || result.suspended > 0 || result.errors > 0) {
            log.info(
              { scanned: result.scanned, suspended: result.suspended, errors: result.errors },
              "IDE supervisor tick"
            );
          }
        } catch (err) {
          log.error({ err }, "IDE supervisor tick failed");
        }
      };

      await tick();
      intervalId = setInterval(tick, TICK_INTERVAL_MS);
      log.info("IDE session supervisor started");
    },

    async stop(): Promise<void> {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (pool) {
        await pool.end();
        pool = null;
      }
      log.info("IDE session supervisor stopped");
    },

    async health(): Promise<{ status: "ok" | "degraded" | "unhealthy"; message?: string }> {
      if (!getDatabaseUrl()) {
        return { status: "degraded", message: "running as stub (no DB)" };
      }
      return { status: "ok" };
    },
  };
}
