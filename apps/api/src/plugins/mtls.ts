/**
 * mTLS enforcement for /internal/* routes (COMP-037.4).
 *
 * When MTLS_REQUIRED=true and the request is over TLS, /internal/* routes
 * require a valid client certificate. In dev use mkcert for self-signed certs;
 * in prod use Kubernetes cert-manager. See docs/architecture/cross-cutting/mtls-setup.md.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const MTLS_REQUIRED = process.env.MTLS_REQUIRED === "true";

function isInternalPath(url: string): boolean {
  return url.startsWith("/internal");
}

function getPeerCertificate(
  request: FastifyRequest
): import("node:tls").PeerCertificate | null {
  const socket = request.raw.socket as import("node:tls").TLSSocket | undefined;
  if (!socket || typeof socket.getPeerCertificate !== "function") return null;
  const cert = socket.getPeerCertificate(true);
  return cert && Object.keys(cert).length > 0 ? cert : null;
}

export async function mtlsPlugin(app: FastifyInstance): Promise<void> {
  if (!MTLS_REQUIRED) return;

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!isInternalPath(request.url)) return;

    const cert = getPeerCertificate(request);
    if (!cert || !cert.subject) {
      return reply.status(403).send({
        error: "Forbidden",
        message:
          "Client certificate required for internal endpoints. Configure mTLS (see docs/architecture/cross-cutting/mtls-setup.md).",
      });
    }
  });
}
