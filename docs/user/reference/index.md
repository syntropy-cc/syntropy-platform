# Reference

This section contains technical reference for the Syntropy Platform: the REST API (all endpoints by resource) and configuration options.

## API Reference

| Resource | Description |
|----------|-------------|
| [API Overview](api/overview.md) | Base URL, authentication, envelope format, error codes, rate limits, pagination |
| [Identity](api/identity.md) | Auth (login, logout, me), users |
| [Artifacts](api/artifacts.md) | DIP artifact lifecycle: create, get, submit, publish |
| [Contracts](api/contracts.md) | DIP governance contracts: create, get, evaluate |
| [Projects](api/projects.md) | DIP projects: create, get, DAG |
| [IACP](api/iacp.md) | Inter-Artifact Communication Protocol: create, sign, activate |
| [Institutions and Governance](api/institutions-governance.md) | Institutions, proposals, public institutions |
| [Portfolios, Search, Recommendations](api/portfolios-search.md) | Portfolio by user, cross-pillar search, recommendations |
| [Learn](api/learn.md) | Tracks, courses, fragments, enrollment |
| [Hub](api/hub.md) | Projects, issues, contributions, discover |
| [Labs](api/labs.md) | Articles, reviews, DOI, experiments, scientific context |
| [AI Agents](api/ai-agents.md) | Agent sessions, agent registry (admin) |
| [Sponsorships](api/sponsorships.md) | Create sponsorship, payment intent, impact |
| [Communication, Planning, IDE](api/communication-planning-ide.md) | Notifications, planning tasks, IDE sessions |
| [Moderation](api/moderation.md) | Moderation flags, community proposals |

## Configuration

| Page | Description |
|------|-------------|
| [Configuration](configuration.md) | Environment variables and configuration options for the API and services |

## OpenAPI

A machine-readable OpenAPI 3.1 spec is available at:

```
GET /api/v1/openapi.json
```

Swagger UI is typically at `/api/v1/docs` when the API server is running.

## See Also

- [Getting Started](../getting-started/installation.md)
- [How to authenticate with the API](../how-to/authenticate-api.md)
- [Concepts](../concepts/index.md)
