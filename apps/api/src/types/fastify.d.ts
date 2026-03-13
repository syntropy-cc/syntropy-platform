/**
 * Fastify request extensions for the API (COMP-033).
 */

import type { Logger } from "@syntropy/platform-core";

declare module "fastify" {
  interface FastifyRequest {
    correlationId: string;
    requestLog: Logger | null;
  }
}
