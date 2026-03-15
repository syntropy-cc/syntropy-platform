# mTLS Setup for Internal API (COMP-037.4)

Internal routes (`/internal/*`) can require client certificates when `MTLS_REQUIRED=true`. This document describes how to configure mTLS for development and production, and how to add new internal services.

## Overview

- **Public API** (`/api/v1/*`, `/health`): No client certificate; standard auth (Bearer, etc.).
- **Internal API** (`/internal/*`): When mTLS is enabled, requests must present a valid client certificate.

The API server enforces client certificates for `/internal/*` only when:

1. `MTLS_REQUIRED=true` is set, and
2. The connection is over TLS (so the server must be started with HTTPS and `requestCert: true`).

## Development: self-signed certificates with mkcert

1. **Install mkcert** (e.g. `brew install mkcert` on macOS, or see [mkcert](https://github.com/FiloSottile/mkcert)).

2. **Create a local CA and certificates**:
   ```bash
   mkcert -install
   mkcert -client -key-file apps/api/certs/client-key.pem -cert-file apps/api/certs/client-cert.pem localhost
   mkcert -key-file apps/api/certs/server-key.pem -cert-file apps/api/certs/server-cert.pem localhost
   ```

3. **Start the API with HTTPS and request client certs** (e.g. via env or a small script that passes `https: { key, cert, requestCert: true }` to `app.listen()`).

4. **Call internal endpoints with the client cert**:
   ```bash
   curl --cert apps/api/certs/client-cert.pem --key apps/api/certs/client-key.pem \
     https://localhost:8080/internal/event-schemas
   ```

5. Set `MTLS_REQUIRED=true` when running the server to enforce client certs on `/internal/*`.

## Production: Kubernetes and cert-manager

- Terminate TLS at the ingress or a sidecar; use **cert-manager** to issue and rotate server and client CA/certs.
- Configure the ingress or proxy to require client certificates for paths under `/internal/*` and to forward the client cert (or validated identity) to the API.
- The API can run behind the proxy without direct TLS if the proxy validates mTLS and forwards a header (e.g. `X-Client-Cert` or `X-Forwarded-Client-Cert`); in that case the API may trust that header when `MTLS_REQUIRED=true` and the connection is from the proxy. Alternatively, run the API with HTTPS and requestCert when it receives traffic directly from the mesh/proxy with client certs.

## Adding new internal services

1. **Define routes under `/internal/*`** in the API (e.g. new route file or plugin registered with prefix `/internal/...`).
2. **Ensure the route is registered** in `apps/api/src/router.ts` (internal routes are registered there like `internalEventSchemasPlugin`).
3. **Document the new endpoint** in this repo and in any internal service docs.
4. **Certificates**: New services that call the API’s internal endpoints need a client certificate issued from the same CA the API trusts (dev: mkcert CA; prod: cert-manager / cluster CA).

## References

- [COMP-037 Security](../../../docs/implementation/components/COMP-037-security.md)
- [REST API Architecture](../../platform/rest-api/ARCHITECTURE.md)
