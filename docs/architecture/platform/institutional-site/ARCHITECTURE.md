# Institutional Site — Platform Architecture

> **Document Type**: Platform Service Architecture Document
> **Parent**: [System Architecture](../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12
> **Owner**: Syntropy Core Team

---

## Service Overview

The Institutional Site is the public-facing read layer for the Syntropy Ecosystem. It presents platform-level metrics, public DIP entities (institutions, projects, artifacts), and Labs publications to the general public — including people who are not registered users. It has no owned business data or domain logic. Every piece of data it displays is read from other domains.

**This is NOT a domain.** It is a delivery mechanism — a server-rendered static/ISR website powered entirely by reads from Platform Core and DIP.

---

## Architecture

### High-Level Diagram

```mermaid
graph TB
    subgraph instSite [Institutional Site — Next.js SSG/ISR]
        HOME["Home / About"]
        INST_DIR["Institution Directory\n(/institutions)"]
        INST_PAGE["Institution Profile Page\n(/institutions/{slug})"]
        PROJECT_PAGE["Project Page\n(/projects/{slug})"]
        ARTIFACT_PAGE["Artifact Page\n(/artifacts/{id})"]
        ARTICLE_PAGE["Article Page\n(/articles/{doi})"]
        ECOSYSTEM_METRICS["Ecosystem Metrics\n(/about/ecosystem)"]
    end

    subgraph dataSources [Data Sources — Read Only]
        DIP_API["DIP Domain API\n(public entities)"]
        PLAT_CORE_API["Platform Core API\n(ecosystem metrics, search)"]
        LABS_API["Labs Domain API\n(published articles)"]
    end

    INST_DIR -->|"GET /institutions (public)"| DIP_API
    INST_PAGE -->|"GET /institutions/{id}"| DIP_API
    PROJECT_PAGE -->|"GET /projects/{id}"| DIP_API
    ARTIFACT_PAGE -->|"GET /artifacts/{id}/identity-record"| DIP_API
    ARTICLE_PAGE -->|"GET /articles/{doi}"| LABS_API
    ECOSYSTEM_METRICS -->|"GET /metrics/ecosystem"| PLAT_CORE_API
```

---

## Components

### Rendering Strategy

| Route | Strategy | Revalidation | Cache TTL |
|-------|----------|-------------|-----------|
| `/` (home) | SSG | On deploy | 1 day |
| `/institutions` (directory) | ISR | 60 seconds | 60 seconds |
| `/institutions/{slug}` | ISR | 300 seconds | 5 minutes |
| `/projects/{slug}` | ISR | 300 seconds | 5 minutes |
| `/artifacts/{id}` | SSG + on-demand revalidation | On `dip.artifact.anchored` event | Indefinite (immutable) |
| `/articles/{doi}` | ISR | 600 seconds | 10 minutes |
| `/about/ecosystem` | ISR | 3600 seconds | 1 hour |

### Data Read Map

| Page Section | Source Domain | API Endpoint | Data Displayed |
|-------------|---------------|--------------|----------------|
| Institution name, description, type | DIP | `/api/v1/institutions/{id}` | Public institution metadata |
| Governance contract summary | DIP | `/api/v1/institutions/{id}/governance-contract` | Contract type, parameters |
| Legitimacy chain entry count | DIP | `/api/v1/institutions/{id}/legitimacy-chain/count` | Number of governance decisions |
| Artifact identity record | DIP | `/api/v1/artifacts/{id}/identity-record` | Nostr event_id, author, timestamp |
| Project contributors | Platform Core | `/api/v1/portfolio/{user_id}/skills` | Aggregated contributor profiles |
| Ecosystem metrics | Platform Core | `/api/v1/metrics/ecosystem` | Total artifacts anchored, institutions, articles |
| Published article | Labs | `/api/v1/articles/{id}` | Title, abstract, authors, DOI |

---

## Interfaces

The Institutional Site exposes no APIs. It is a pure read-and-render application.

**Data access**: Only public, unauthenticated GET endpoints from domain APIs are used. No authenticated domain data is displayed.

---

## Operational Model

| Environment | Infrastructure |
|-------------|---------------|
| Production | Vercel / CDN (same as web app) |
| Custom domain | `institutions.syntropy.cc` or per-institution subdomain (future) |

---

## Security Considerations

- No user authentication required — all displayed data is public
- No write operations — read-only API calls only
- CSP headers to prevent XSS
- No sensitive data (portfolio, messages, draft content) ever displayed
- Artifact identity records displayed are cryptographically verifiable (Nostr event_id shown for independent verification)
