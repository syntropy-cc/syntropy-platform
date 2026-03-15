/**
 * API versioning middleware (COMP-033.5).
 *
 * Extracts version from URL path (/api/v1/... → v1) or Accept header
 * (application/vnd.syntropy.v1+json). Sets request.apiVersion and
 * adds API-Version response header.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

const VERSION_PREFIX = "/api/v";
const ACCEPT_VERSION_REGEX = /application\/vnd\.syntropy\.(v\d+)\+json/;

function extractVersionFromPath(url: string): string | null {
  if (!url.startsWith(VERSION_PREFIX)) return null;
  const rest = url.slice(VERSION_PREFIX.length);
  const match = /^(\d+)(?:\/|$)/.exec(rest);
  return match ? `v${match[1]}` : null;
}

function extractVersionFromAccept(accept: string | undefined): string | null {
  if (!accept) return null;
  const match = ACCEPT_VERSION_REGEX.exec(accept);
  return match ? match[1] : null;
}

async function apiVersionPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorateRequest("apiVersion", "v1");

  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const fromPath = extractVersionFromPath(request.url);
    const fromAccept = extractVersionFromAccept(request.headers.accept);
    const version = fromPath ?? fromAccept ?? "v1";
    (request as FastifyRequest & { apiVersion: string }).apiVersion = version;
    reply.header("API-Version", version);
  });
}

export const apiVersionPluginFp = fp(apiVersionPlugin, {
  name: "api-version",
});

/** Sets Deprecation and Sunset headers on the reply. Call from deprecated route handlers. */
export function setDeprecationHeaders(
  reply: FastifyReply,
  sunsetDate: string
): void {
  reply.header("Deprecation", "true");
  reply.header("Sunset", sunsetDate);
}
