# FAQ

Common questions about the Syntropy Platform. For step-by-step tasks, see [How-to Guides](how-to/index.md); for concepts, see [Concepts](concepts/index.md).

## Setup and access

### How do I get an account?

Sign up through the platform’s login page (email/password or OAuth, e.g. GitHub or Google). One account gives you access to Learn, Hub, and Labs. If you are using a self-hosted or demo instance, follow the link and instructions provided by your administrator.

### What do I need to run the API locally?

You need Node.js 20+, pnpm, Docker (for PostgreSQL, Redis, Kafka), and a Supabase project (or local Supabase). Copy `.env.example` to `.env`, set `DATABASE_URL`, `SUPABASE_*`, and other variables, then run `docker compose up -d` and start the API. See [Installation](getting-started/installation.md) and [Configuration](reference/configuration.md).

### Why do I get 401 on every API call?

Protected endpoints require `Authorization: Bearer <token>`. Get a token with `POST /api/v1/auth/login` (email and password). If you get 401 after that, the token may be expired or invalid; sign in again and use the new token. See [How to authenticate with the API](how-to/authenticate-api.md).

## Usage

### What is the difference between Learn, Hub, and Labs?

- **Learn** — Education: tracks, courses, fragments. You learn by building; every fragment ends in an artifact you create. Your progress and collectibles are recorded automatically.
- **Hub** — Collaboration: digital institutions, projects, issues, contributions. You create or join institutions, work on issues, and submit artifacts as contributions. Governance and value distribution are defined by contracts.
- **Labs** — Research: laboratories, research lines, articles, peer review. You write and publish articles (with optional DOI), and the community can review them. Reviews are public and reputation-filtered.

All three share one identity and one portfolio; events from each pillar feed the same event bus and portfolio.

### Why can’t I publish my artifact?

Publishing requires the artifact to be in **submitted** state first. Use `PUT /api/v1/artifacts/:id/submit`, then `PUT /api/v1/artifacts/:id/publish`. If you get 409 CONFLICT, the lifecycle transition is invalid (e.g. already published or not yet submitted). See [Artifacts API](reference/api/artifacts.md) and [How to create an artifact](how-to/create-artifact.md).

### Why can’t I submit a contribution to an issue?

The issue must be **open** and the artifact must be **published** (and anchored if the platform requires it). If the issue is closed, you get 409 CONFLICT. If the artifact is still draft or not anchored, you get 422 DOMAIN_ERROR. See [How to submit a contribution](how-to/submit-contribution.md).

### How do I get a DOI for my Labs article?

Publish the article via the Labs UI or `POST /api/v1/labs/articles/:id/submit` (or the equivalent publish endpoint). The platform registers a DOI with DataCite/CrossRef when that feature is configured (`DATACITE_API_KEY`). The article response may include `doi_registration_status`. See [Labs API](reference/api/labs.md) and [Tutorial: Publish a Labs Article](tutorials/05-publish-labs-article.md).

## Errors and limits

### What do API error codes mean?

- **400 BAD_REQUEST / VALIDATION_ERROR** — Invalid request body or parameters; check the `details` array in the response.
- **401 UNAUTHORIZED** — Missing or invalid Bearer token. Sign in again.
- **403 FORBIDDEN** — You are authenticated but lack permission for this action (e.g. role or resource ownership).
- **404 NOT_FOUND** — The resource (artifact, project, user, etc.) does not exist or you do not have access.
- **409 CONFLICT** — State conflict (e.g. duplicate enrollment, invalid lifecycle transition, or invariant violation).
- **422 DOMAIN_ERROR** — Business rule violation (e.g. fragment missing a section, IACP phase order, or article not human-approved before publish).
- **429 RATE_LIMITED** — Too many requests; wait and retry. Check `Retry-After` and rate-limit headers.
- **503 SERVICE_UNAVAILABLE** — An upstream service (database, Supabase, Kafka, etc.) is unavailable. Retry later.

See [API Overview](reference/api/overview.md#error-codes).

### I hit rate limit (429). What do I do?

Wait until the rate limit window resets (see `X-RateLimit-Reset` or `Retry-After`). Limits are per user per minute (e.g. 600 for learners, 1200 for creators). Reduce request frequency or batch operations where the API allows. See [API Overview — Rate limiting](reference/api/overview.md#rate-limiting).

## See Also

- [Getting Started](getting-started/installation.md)
- [How-to Guides](how-to/index.md)
- [API Overview](reference/api/overview.md)
- [Glossary](glossary.md)
