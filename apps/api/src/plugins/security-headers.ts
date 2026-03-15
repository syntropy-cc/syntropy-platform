/**
 * Security headers plugin (COMP-037.2).
 *
 * Registers @fastify/helmet with strict settings: CSP default-src 'self',
 * HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff.
 */

import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";

export async function securityHeadersPlugin(app: FastifyInstance): Promise<void> {
  await app.register(helmet, {
    global: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https://*.supabase.co", "https://*.stripe.com"],
        "frame-src": ["'self'", "https://*.stripe.com"],
        "frame-ancestors": ["'none'"],
      },
    },
    xFrameOptions: "DENY",
    noSniff: true,
  });
}
