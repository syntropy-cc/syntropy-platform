# Changelog

All notable user-facing changes to the Syntropy Platform are documented here.

This project follows [Semantic Versioning](https://semver.org/). This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

### Added

- (No unreleased changes yet.)

---

## [1.0.0] - 2026-03-16

Initial release of the Syntropy Platform documentation and first stable API surface. The platform delivers Learn, Hub, and Labs on a shared identity, event bus, and Digital Institutions Protocol (DIP).

### Added

- **Unified identity and auth** — Single sign-in (email/password and OAuth) for all pillars. REST API: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`.
- **DIP artifact lifecycle** — Create, submit, and publish artifacts with cryptographic identity anchoring. Endpoints: `POST/GET /api/v1/artifacts`, `PUT /api/v1/artifacts/:id/submit`, `PUT /api/v1/artifacts/:id/publish`. See [Artifacts API](reference/api/artifacts.md).
- **Contracts and projects** — Create and evaluate governance contracts; create projects and read dependency graph. Endpoints under `/api/v1/contracts`, `/api/v1/projects`. See [Contracts API](reference/api/contracts.md), [Projects API](reference/api/projects.md).
- **IACP** — Inter-Artifact Communication Protocol: create, sign, and activate IACP flows. Endpoints under `/api/v1/iacp`. See [IACP API](reference/api/iacp.md).
- **Institutions and governance** — Create institutions from templates; create proposals and vote; public institution discovery. See [Institutions and Governance API](reference/api/institutions-governance.md).
- **Portfolio, search, and recommendations** — Get user portfolio (XP, skills, achievements); cross-pillar search; personalized recommendations. See [Portfolios, Search, Recommendations API](reference/api/portfolios-search.md).
- **Learn** — Tracks, courses, fragments, and enrollment. See [Learn API](reference/api/learn.md) and [Learn: Tracks and Fragments](concepts/learn-track-fragment.md).
- **Hub** — Projects, issues, contributions, and discovery. See [Hub API](reference/api/hub.md) and [Institutions and Governance](concepts/institutions-and-governance.md).
- **Labs** — Articles (create, update, submit, versions), reviews (create, list, author response), and scientific context. See [Labs API](reference/api/labs.md) and [Labs: Research and Review](concepts/labs-research-and-review.md).
- **AI agents** — Create and use agent sessions; admin agent registry and tools. See [AI Agents API](reference/api/ai-agents.md) and [AI Agents](concepts/ai-agents.md).
- **Sponsorships** — Create sponsorship, get impact, create payment intent (Stripe). See [Sponsorships API](reference/api/sponsorships.md).
- **Communication, planning, IDE** — Notifications, planning tasks, IDE sessions (create, start, suspend, WebSocket). See [Communication, Planning, IDE API](reference/api/communication-planning-ide.md).
- **Moderation** — Moderation flags and community proposals (moderator/admin). See [Moderation API](reference/api/moderation.md).
- **OpenAPI** — Machine-readable API spec at `GET /api/v1/openapi.json` and Swagger UI at `/api/v1/docs`.
- **Configuration** — Environment-based configuration for database, Redis, Kafka, Supabase, Nostr, AI, Stripe, and DataCite. See [Configuration](reference/configuration.md).

### Security

- All API endpoints (except auth initiation and designated public GETs) require Bearer JWT. Tokens are obtained via Supabase Auth.
- Rate limiting per user tier (60–2400 requests/minute). See [API Overview — Rate limiting](reference/api/overview.md#rate-limiting).

---

[1.0.0]: https://github.com/syntropy-cc/syntropy-platform/releases/tag/v1.0.0
