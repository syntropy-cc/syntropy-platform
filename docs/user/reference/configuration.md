# Configuration Reference

The Syntropy Platform is configured via environment variables. The API server and apps read these at startup. This page documents the main options used for local development and deployment.

## Configuration method

- **Environment variables** — Primary. Set in `.env` (local), or in your deployment (e.g. Kubernetes secrets, CI env).
- **Default path** — Copy `.env.example` to `.env` in the repository root and fill in values.

Configuration is resolved in this order (highest precedence first):

1. Environment variables (process env)
2. `.env` file (if loaded by the app)
3. Built-in defaults (where defined)

## Common variables

### Database

| Variable | Type | Default (example) | Description |
|----------|------|-------------------|-------------|
| `DATABASE_URL` | string | — | PostgreSQL connection URL (e.g. `postgresql://user:pass@host:5432/dbname`) |

### Redis

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | string | `redis://localhost:6379` | Redis URL for cache and rate limiting |

### Kafka

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `KAFKA_BROKERS` | string | `localhost:9092` | Comma-separated Kafka broker addresses |

### Supabase Auth

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SUPABASE_URL` | string | — | Supabase project URL (e.g. `https://xxx.supabase.co` or local `http://127.0.0.1:54321`) |
| `SUPABASE_ANON_KEY` | string | — | Supabase anon (public) key |
| `SUPABASE_SERVICE_KEY` | string | — | Supabase service_role key (server-side only) |
| `API_URL` | string | `http://localhost:8080` | Public API URL (for callbacks and redirects) |

### Nostr (artifact anchoring)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NOSTR_RELAY_URLS` | string | (empty) | Comma-separated Nostr relay URLs for identity anchoring |

### AI / LLM

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ANTHROPIC_API_KEY` | string | — | Anthropic API key for Claude |
| `OPENAI_API_KEY` | string | — | OpenAI API key (if used) |

### Payments (Stripe)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `STRIPE_SECRET_KEY` | string | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | string | — | Stripe webhook signing secret |

### DOI (Labs)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATACITE_API_KEY` | string | — | DataCite API key for DOI registration |

## Minimal local setup

For a minimal local run (API + Postgres, Redis, Kafka):

```bash
# .env (minimal)
DATABASE_URL=postgresql://syntropy:syntropy_dev@localhost:5432/syntropy
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<your-local-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-local-supabase-service-key>
API_URL=http://localhost:8080
```

Optional: set `NOSTR_RELAY_URLS`, `ANTHROPIC_API_KEY`, `STRIPE_*`, `DATACITE_API_KEY` when you need those features.

## Validation

Invalid configuration (e.g. missing required URL, invalid format) typically causes the server to fail at startup with an error indicating the variable and reason. Check logs for the exact message.

## See Also

- [Installation](../getting-started/installation.md)
- [API Overview](api/overview.md)
