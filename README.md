# Syntropy Platform

Modular monolith implementing the Digital Institutions Protocol (DIP). Built with Turborepo, pnpm workspaces, TypeScript, and Next.js.

## Quick start (< 5 commands)

```bash
git clone <repo-url> syntropy-platform && cd syntropy-platform
pnpm install
cp .env.example .env
pnpm dev:infra
pnpm build
```

Optional: run `./scripts/setup.sh` to install deps and start infrastructure in one step.

## Requirements

- Node.js >= 20
- pnpm >= 9
- Docker and Docker Compose (for local Postgres, Redis, Kafka)

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm install` | Install all workspace dependencies   |
| `pnpm build`   | Build all packages and apps         |
| `pnpm test`    | Run tests across the workspace       |
| `pnpm lint`    | Lint all packages                    |
| `pnpm typecheck` | Type-check all packages           |
| `pnpm dev:infra` | Start Postgres, Redis, Kafka (Docker) |

## Makefile (infrastructure)

- `make infra-start` — start local infra (same as `pnpm dev:infra`)
- `make infra-stop` — stop containers
- `make infra-reset` — stop, remove volumes, start again

## Workspace layout

- `apps/` — Platform (single web app: institutional home, dashboard, admin, institutions), API (Fastify), workers; pillar apps (learn, hub, labs)
- `packages/` — Domain packages and shared libs (platform-core, dip, identity, types, events, ui, …)

See [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) and [docs/implementation/IMPLEMENTATION-PLAN.md](docs/implementation/IMPLEMENTATION-PLAN.md) for details.
