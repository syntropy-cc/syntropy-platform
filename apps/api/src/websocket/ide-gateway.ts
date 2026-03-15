/**
 * IDE WebSocket gateway (COMP-035.2, COMP-035.4, COMP-035.6).
 *
 * GET /api/v1/ide/sessions/:id/ws — WebSocket upgrade for terminal, filesystem, LSP, heartbeat.
 * Auth validated on handshake; welcome message includes session_id for reconnection.
 * Reconnection within 5min resumes; after 5min returns session_expired (COMP-035.4).
 * Workspace: restore before welcome when resuming; auto-save every 2min; save on close (COMP-035.6).
 */

import type { FastifyInstance } from "fastify";
import { IDESessionStatus } from "@syntropy/ide";
import type { IDEContext } from "../types/ide-context.js";
import {
  startAutoSave,
  saveSnapshot,
  restoreSnapshot,
} from "./workspace-sync.js";

const RECONNECTION_WINDOW_MS = 5 * 60 * 1000;

interface SocketLike {
  send(data: string | Buffer): void;
  close(code?: number, reason?: string): void;
  on(event: string, cb: (data: Buffer) => void): void;
}

export type IDEWebSocketMessage =
  | { type: "terminal"; payload?: unknown }
  | { type: "filesystem"; payload?: unknown }
  | { type: "lsp"; payload?: unknown }
  | { type: "heartbeat"; payload?: { ts?: number } };

function parseMessage(raw: Buffer | string): IDEWebSocketMessage | null {
  try {
    const s = typeof raw === "string" ? raw : raw.toString("utf8");
    const parsed = JSON.parse(s) as unknown;
    if (parsed !== null && typeof parsed === "object" && "type" in parsed) {
      return parsed as IDEWebSocketMessage;
    }
  } catch {
    // ignore
  }
  return null;
}

function sendJson(socket: SocketLike, obj: Record<string, unknown>): void {
  try {
    socket.send(JSON.stringify(obj));
  } catch {
    // connection may be closed
  }
}

export async function ideWebSocketGateway(
  fastify: FastifyInstance,
  opts: { ide: IDEContext }
): Promise<void> {
  const { sessionRepository, workspaceSnapshotRepository } = opts.ide;
  const requireAuth = fastify.requireAuth;

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/ide/sessions/:id/ws",
    { preHandler: [requireAuth], websocket: true },
    (socket, request) => {
      const sessionId = request.params.id;
      const userId = request.user!.userId;

      void (async () => {
        const session = await sessionRepository.findById(sessionId);
        if (!session) {
          sendJson(socket, { type: "error", message: "Session not found" });
          socket.close(1008, "Session not found");
          return;
        }
        if (session.userId !== userId) {
          sendJson(socket, { type: "error", message: "Forbidden" });
          socket.close(1008, "Forbidden");
          return;
        }

        if (session.status === IDESessionStatus.Terminated) {
          sendJson(socket, {
            type: "error",
            code: "session_expired",
            message: "Session expired, please start a new session",
          });
          socket.close(1008, "Session terminated");
          return;
        }

        const lastActiveAt = session.lastActiveAt?.getTime();
        if (
          lastActiveAt != null &&
          Date.now() - lastActiveAt > RECONNECTION_WINDOW_MS
        ) {
          sendJson(socket, {
            type: "error",
            code: "session_expired",
            message: "Session expired, please start a new session",
          });
          socket.close(1008, "Session expired");
          return;
        }

        // COMP-035.6: restore workspace before welcome when resuming suspended session
        if (
          workspaceSnapshotRepository &&
          session.status === IDESessionStatus.Suspended
        ) {
          const snapshot = await restoreSnapshot(
            sessionId,
            workspaceSnapshotRepository
          );
          if (snapshot) {
            sendJson(socket, {
              type: "workspace_restore_progress",
              message: "Restoring workspace…",
              fileCount: snapshot.getFiles().length,
            });
            // Apply restore to container is stubbed until filesystem handler is wired
          }
        }

        sendJson(socket, {
          type: "welcome",
          session_id: sessionId,
          status: session.status,
        });

        // COMP-035.6: auto-save every 2min; save on close
        let stopAutoSave: (() => void) | undefined;
        if (workspaceSnapshotRepository) {
          stopAutoSave = startAutoSave(
            sessionId,
            workspaceSnapshotRepository,
            async () => [] // Stub: real files from container when filesystem handler is wired
          );
          const cleanup = () => {
            stopAutoSave?.();
            void saveSnapshot(
              sessionId,
              [],
              workspaceSnapshotRepository
            ).catch(() => {});
          };
          (socket as { on(event: string, cb: (...args: unknown[]) => void): void }).on("close", cleanup);
        }

        socket.on("message", (raw) => {
          const msg = parseMessage(raw as Buffer);
          if (!msg) return;

          switch (msg.type) {
            case "heartbeat":
              sendJson(socket, {
                type: "heartbeat",
                payload: { ts: Date.now() },
              });
              break;
            case "terminal":
              // Stub: terminal stream to container pseudo-TTY wired when 035.3 is integrated
              break;
            case "filesystem":
              // Stub: list/read/write/delete on container filesystem
              break;
            case "lsp":
              // Stub: JSON-RPC to TypeScript Language Server
              break;
            default:
              break;
          }
        });
      })();
    }
  );
}
