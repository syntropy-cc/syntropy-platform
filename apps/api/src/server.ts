/**
 * REST API server factory (COMP-033.1).
 *
 * Builds Fastify app with CORS, correlation-id, request logging, and health route.
 * Does not call .listen(); see main.ts for bootstrap and graceful shutdown.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { correlationIdPlugin } from "./middleware/correlation-id.js";
import { requestLoggerPlugin } from "./middleware/request-logger.js";
import type { AuthProvider } from "@syntropy/identity";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authContextPluginFp } from "./plugins/auth-context.js";
import { authMiddlewarePluginFp } from "./plugins/auth-middleware.js";
import { rateLimitPluginFp } from "./plugins/rate-limit.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { usersRoutes } from "./routes/users.js";
import { aiAgentsRoutes } from "./routes/ai-agents.js";
import { agentsRoutes } from "./routes/agents.js";
import { artifactRoutes } from "./routes/artifacts.js";
import { contractRoutes } from "./routes/contracts.js";
import { projectRoutes } from "./routes/projects.js";
import { iacpRoutes } from "./routes/iacp.js";
import { governanceRoutes } from "./routes/governance.js";
import { treasuryRoutes } from "./routes/treasury.js";
import { internalEventSchemasPlugin } from "./routes/internal-event-schemas.js";
import type { AiAgentsContext } from "./types/ai-agents-context.js";
import type { DipContext } from "./types/dip-context.js";
import type { GovernanceContext } from "./types/governance-context.js";
import type { PortfolioContext } from "./types/portfolio-context.js";
import type { TreasuryContext } from "./types/treasury-context.js";
import { portfolioRoutes } from "./routes/portfolios.js";

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

function getCorsOrigins(): string[] | true {
  const env = process.env.CORS_ORIGIN;
  if (!env) return DEFAULT_ORIGINS;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

export type { DipContext } from "./types/dip-context.js";

export interface CreateAppOptions {
  auth?: AuthProvider | null;
  supabaseClient?: SupabaseClient | null;
  dip?: DipContext | null;
  governance?: GovernanceContext | null;
  portfolio?: PortfolioContext | null;
  treasury?: TreasuryContext | null;
  aiAgents?: AiAgentsContext | null;
}

export async function createApp(options?: CreateAppOptions) {
  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: getCorsOrigins(),
  });
  await app.register(fp(correlationIdPlugin));
  await app.register(fp(requestLoggerPlugin));
  await app.register(fp(authContextPluginFp), options ?? {});
  await app.register(fp(authMiddlewarePluginFp));
  await app.register(fp(rateLimitPluginFp));
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(usersRoutes);
  if (options?.dip) {
    await app.register(artifactRoutes, { dip: options.dip });
    await app.register(contractRoutes, { dip: options.dip });
    await app.register(projectRoutes, { dip: options.dip });
    await app.register(iacpRoutes, { dip: options.dip });
  }
  if (options?.governance) {
    await app.register(governanceRoutes, { governance: options.governance });
  }
  if (options?.portfolio) {
    await app.register(portfolioRoutes, { portfolio: options.portfolio });
  }
  if (options?.treasury) {
    await app.register(treasuryRoutes, { treasury: options.treasury });
  }
  if (options?.aiAgents) {
    await app.register(aiAgentsRoutes, { aiAgents: options.aiAgents });
    await app.register(agentsRoutes, { aiAgents: options.aiAgents });
  }
  await app.register(internalEventSchemasPlugin);

  return app;
}
