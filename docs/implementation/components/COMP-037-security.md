# Security Cross-Cutting Implementation Record

> **Component ID**: COMP-037
> **Architecture Reference**: [cross-cutting/security/ARCHITECTURE.md](../../architecture/cross-cutting/security/ARCHITECTURE.md)
> **Stage Assignment**: S13 — Cross-Cutting Concerns
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Security cross-cutting concerns implement defense-in-depth across all layers: API authentication middleware, RBAC enforcement, data encryption at rest and in transit, secret management, SAST/dependency scanning in CI, and audit log data classification (CON-007). These concerns are wired into domain packages and the API gateway—they are not a standalone service but a set of shared utilities and configurations.

**Responsibilities**:
- TLS/mTLS configuration for all service communication
- RBAC enforcement library used by all domain packages
- Data classification enforcement (Confidential → AES-256 encryption at rest)
- Secret management integration (HashiCorp Vault or environment-based)
- Content Security Policy (CSP) headers for all web apps
- SAST pipeline integration (Semgrep/CodeQL)
- Dependency vulnerability scanning (npm audit, Snyk)

**Subdomain Classification**: Generic (buy/integrate) — wraps standard security tooling behind custom interfaces.

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 3 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 3 |
| **Total** | **6** |

**Component Coverage**: 50%

### Item List

#### [COMP-037.1] RBAC enforcement library

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, ARCH-010 |
| **Dependencies** | COMP-002 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build RBAC enforcement utility used by all domain packages to check permissions declaratively.

**Acceptance Criteria**:
- [ ] `hasPermission(actorId: string, resource: string, action: string): Promise<boolean>` function
- [ ] `requirePermission(actorId, resource, action)` — throws `ForbiddenError` if denied
- [ ] `@RequireRole(role: string)` decorator for use on service methods
- [ ] Permission matrix defined in Identity domain (COMP-002) read via internal API
- [ ] Permissions cached in Redis per `actorId` with 5min TTL

**Files Created/Modified**:
- `packages/identity/src/rbac/permission-checker.ts`
- `packages/identity/src/rbac/require-permission.decorator.ts`

---

#### [COMP-037.2] API security headers and CSP

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, ARCH-010 |
| **Dependencies** | COMP-033 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Configure security headers for all HTTP responses including CSP, HSTS, and anti-clickjacking headers.

**Acceptance Criteria**:
- [ ] `helmet.js` (or equivalent Fastify plugin) configured with strict settings
- [ ] CSP policy: `default-src 'self'`, specific allowances for CDN, Supabase, Stripe
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] `X-Frame-Options: DENY` (prevent clickjacking)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] All Next.js apps: CSP headers via `next.config.ts` `headers()` function
- [ ] Validated with `securityheaders.com` score A+

**Files Created/Modified**:
- `apps/api/src/middleware/security-headers.ts`
- `apps/*/next.config.ts` (security headers)

---

#### [COMP-037.3] Data encryption for classified fields

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, CON-007 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement field-level encryption for Confidential-classified data (CON-007) stored in PostgreSQL.

**Acceptance Criteria**:
- [ ] `EncryptedField<T>` TypeScript type for value-level encryption
- [ ] `encryptField(value: string, key: Buffer): string` — AES-256-GCM
- [ ] `decryptField(ciphertext: string, key: Buffer): string` — decrypt
- [ ] Encryption key loaded from environment variable `DATA_ENCRYPTION_KEY` (never logged)
- [ ] Applied to: identity email, user phone, payment card metadata (tokenized by Stripe, not stored)
- [ ] Database migration: encrypt existing plaintext fields

**Files Created/Modified**:
- `packages/platform-core/src/security/encrypted-field.ts`
- `packages/platform-core/src/security/encrypted-field.test.ts`

---

#### [COMP-037.4] mTLS configuration for internal services

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, CON-009 |
| **Dependencies** | COMP-033 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Configure mutual TLS for all internal service-to-service communication.

**Acceptance Criteria**:
- [ ] Internal API routes (`/internal/*`) require client certificates
- [ ] Dev environment: self-signed certificates generated by `mkcert`
- [ ] Production: certificates managed by Kubernetes cert-manager
- [ ] Documentation: how to add a new internal service to the mTLS mesh

**Files Created/Modified**:
- `docker/certs/` (dev certificates)
- `apps/api/src/tls.ts`

---

#### [COMP-037.5] SAST and dependency vulnerability scanning in CI

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, CON-010 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up SAST and dependency scanning in CI pipeline.

**Acceptance Criteria**:
- [ ] GitHub Actions: Semgrep scan on every PR (JavaScript/TypeScript rules)
- [ ] `npm audit` on every PR; fail on high/critical severity
- [ ] Snyk integration (or `trivy`) for Docker image scanning
- [ ] SAST results as PR annotations
- [ ] Block merge if critical findings

**Files Created/Modified**:
- `.github/workflows/security-scan.yml`

---

#### [COMP-037.6] Secret management configuration

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | cross-cutting/security/ARCHITECTURE.md, ARCH-008 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Configure secret management for all environments to prevent secrets in code/config.

**Acceptance Criteria**:
- [ ] `.env.example` in each app with all required variables (values redacted)
- [ ] `.env.*.local` files explicitly in `.gitignore`
- [ ] Production: environment variables injected via GitHub Actions secrets → K8s Secrets
- [ ] `secrets-validator.ts` script: validates all required env vars present at startup
- [ ] `console.log` scanning rule: CI fails if secret-like patterns found in logs

**Files Created/Modified**:
- `packages/platform-core/src/config/env-validator.ts`
- `packages/platform-core/src/config/env-validator.test.ts`
- `apps/admin/.env.example`, `apps/admin/src/env.ts`
- `apps/hub/.env.example`, `apps/hub/src/env.ts`
- `apps/institutional-site/.env.example`, `apps/institutional-site/src/env.ts`
- `apps/labs/.env.example`, `apps/labs/src/env.ts`
- `apps/learn/.env.example`, `apps/learn/src/env.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | CI setup |
| COMP-002 Identity | Internal | ⬜ Not Started | Role/permission data |
| COMP-033 REST API | Internal | ⬜ Not Started | Middleware integration |

---

## References

### Architecture Documents

- [Security Cross-Cutting Architecture](../../architecture/cross-cutting/security/ARCHITECTURE.md)
