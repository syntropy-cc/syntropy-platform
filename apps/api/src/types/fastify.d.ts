/**
 * Fastify request extensions for the API (COMP-033).
 */

import type { Logger } from "@syntropy/platform-core";
import type { ActorId } from "@syntropy/identity";

/** Authenticated user set by auth middleware (COMP-033.2). */
export interface RequestUser {
  userId: string;
  actorId: ActorId;
  roles: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    correlationId: string;
    requestLog: Logger | null;
    /** Set by auth middleware when Bearer token is valid. */
    user?: RequestUser;
  }
}
