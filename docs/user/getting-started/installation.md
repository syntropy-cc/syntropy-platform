# Installation

This page describes how to set up the Syntropy Platform for local development or self-hosted deployment. The platform runs as a monorepo with a REST API, Next.js web apps, and background services.

## Prerequisites

- **Node.js** 20.x (LTS)
- **pnpm** 9.x
- **Docker** and **Docker Compose** (for PostgreSQL, Redis, Kafka)
- **Git**

## Steps

### 1. Clone the repository

```bash
git clone https://github.com/syntropy-cc/syntropy-platform.git
cd syntropy-platform
```

### 2. Install dependencies

From the repository root:

```bash
pnpm install
```

### 3. Start infrastructure services

The platform expects PostgreSQL, Redis, and Kafka. Using the provided Docker Compose file:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on port 5432 (database: `syntropy`, user: `syntropy`, password: `syntropy_dev`)
- Redis on port 6379
- Kafka and Zookeeper on default ports

### 4. Configure environment

Copy the example environment file and set required values:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `DATABASE_URL` — must match the PostgreSQL container (default: `postgresql://syntropy:syntropy_dev@localhost:5432/syntropy`)
- `REDIS_URL` — default `redis://localhost:6379`
- `KAFKA_BROKERS` — default `localhost:9092`
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (use Supabase local or a project)
- Optional: `NOSTR_RELAY_URLS`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_*`, `DATACITE_API_KEY` for full feature set

See [Configuration Reference](../reference/configuration.md) for all options.

### 5. Run database migrations

If the project provides migrations:

```bash
pnpm run db:migrate
```

(Adjust to the actual script name in `package.json` if different.)

### 6. Build and run

Build the monorepo:

```bash
pnpm run build
```

Start the API server (typically on port 8080):

```bash
pnpm --filter api run start
```

Start the web app (typically port 3000):

```bash
pnpm --filter platform run dev
```

Learn, Hub, and Labs are part of the same web application; some setups may use other ports (e.g. 3001, 3002, 3003) — check each app’s `package.json` and docs.

## Verify installation

1. **Health check** — Open `http://localhost:8080/health` (or the configured API port). You should see a JSON response with `"status": "ok"`.
2. **Login** — Open the web app (e.g. the institutional home or `http://localhost:3000/login`) and sign in with a Supabase-backed user.
3. **API with auth** — Call `GET /api/v1/auth/me` with a valid Bearer token; without a token you should get `401 UNAUTHORIZED`.

## See Also

- [Quick Start](quick-start.md)
- [Configuration Reference](../reference/configuration.md)
- [API Overview](../reference/api/overview.md)
