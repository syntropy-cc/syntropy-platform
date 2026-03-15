/**
 * Central API route registration (COMP-033.4).
 *
 * Imports all domain route plugins and registers them with the Fastify app.
 * Route prefixes (paths) are defined inside each route module; this module
 * is the single place that wires all domain routes to the server.
 *
 * Prefixes: /api/v1/auth/*, /api/v1/learn/*, /api/v1/hub/*, /api/v1/labs/*,
 * /api/v1/ai-agents/*, /api/v1/sponsorships/*, /api/v1/notifications/* (communication),
 * /api/v1/moderation/*, /api/v1/community-proposals/*, plus DIP/core routes under /api/v1/*.
 */

import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./routes/health.js";
import { metricsRoutes } from "./routes/metrics.js";
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
import { portfolioRoutes } from "./routes/portfolios.js";
import { searchRoutes } from "./routes/search.js";
import { recommendationRoutes } from "./routes/recommendations.js";
import { learnRoutes } from "./routes/learn.js";
import { hubRoutes } from "./routes/hub.js";
import { hubInstitutionsRoutes } from "./routes/hub-institutions.js";
import { hubDiscoverRoutes } from "./routes/hub-discover.js";
import { labsScientificContextRoutes } from "./routes/labs-scientific-context.js";
import { labsArticlesRoutes } from "./routes/labs-articles.js";
import { labsExperimentsRoutes } from "./routes/labs-experiments.js";
import { labsReviewsRoutes } from "./routes/labs-reviews.js";
import { labsDoiRoutes } from "./routes/labs-doi.js";
import { sponsorshipRoutes } from "./routes/sponsorships.js";
import { communicationRoutes } from "./routes/communication.js";
import { planningRoutes } from "./routes/planning.js";
import { ideRoutes } from "./routes/ide.js";
import { ideWebSocketGateway } from "./websocket/ide-gateway.js";
import { moderationRoutes } from "./routes/moderation.js";
import { communityProposalsRoutes } from "./routes/community-proposals.js";
import { publicInstitutionsRoutes } from "./routes/public-institutions.js";
import type { CreateAppOptions } from "./types/create-app-options.js";

/**
 * Registers all API routes with the Fastify app.
 * Call after core plugins (CORS, correlation-id, request-logger, auth-context, auth-middleware, rate-limit).
 */
export async function registerApiRoutes(
  app: FastifyInstance,
  options?: CreateAppOptions
): Promise<void> {
  await app.register(healthRoutes);
  await app.register(metricsRoutes);

  // /api/v1/auth/* (identity), /api/v1/users/*
  await app.register(authRoutes);
  await app.register(usersRoutes);

  // DIP /api/v1/* (artifacts, contracts, projects, iacp, governance, treasury)
  if (options?.dip) {
    await app.register(artifactRoutes, { dip: options.dip });
    await app.register(contractRoutes, { dip: options.dip });
    await app.register(projectRoutes, { dip: options.dip });
    await app.register(iacpRoutes, { dip: options.dip });
  }
  if (options?.governance) {
    await app.register(governanceRoutes, { governance: options.governance });
    await app.register(publicInstitutionsRoutes, {
      governance: options.governance,
    });
  }
  if (options?.portfolio) {
    await app.register(portfolioRoutes, { portfolio: options.portfolio });
  }
  if (options?.search) {
    await app.register(searchRoutes, { search: options.search });
    await app.register(recommendationRoutes, { search: options.search });
  }
  if (options?.treasury) {
    await app.register(treasuryRoutes, { treasury: options.treasury });
  }

  // /api/v1/ai-agents/*, /api/v1/agents/*
  if (options?.aiAgents) {
    await app.register(aiAgentsRoutes, { aiAgents: options.aiAgents });
    await app.register(agentsRoutes, { aiAgents: options.aiAgents });
  }

  // /api/v1/learn/*
  if (options?.learn) {
    await app.register(learnRoutes, { learn: options.learn });
  }

  // /api/v1/hub/*
  if (options?.hub) {
    await app.register(hubRoutes, { hub: options.hub });
    await app.register(hubInstitutionsRoutes, { hub: options.hub });
    await app.register(hubDiscoverRoutes, { hub: options.hub });
  }

  // /api/v1/labs/*
  if (options?.labs) {
    await app.register(labsScientificContextRoutes, { labs: options.labs });
    await app.register(labsArticlesRoutes, { labs: options.labs });
    await app.register(labsExperimentsRoutes, { labs: options.labs });
    await app.register(labsReviewsRoutes, { labs: options.labs });
    await app.register(labsDoiRoutes, { labs: options.labs });
  }

  // /api/v1/sponsorships/*
  if (options?.sponsorship) {
    await app.register(sponsorshipRoutes, { sponsorship: options.sponsorship });
  }

  // /api/v1/notifications/*, /api/v1/messages/* (communication)
  if (options?.communication) {
    await app.register(communicationRoutes, {
      communication: options.communication,
    });
  }

  // /api/v1/planning/*, /api/v1/ide/*
  if (options?.planning) {
    await app.register(planningRoutes, { planning: options.planning });
  }
  if (options?.ide) {
    await app.register(ideRoutes, { ide: options.ide });
    await app.register(ideWebSocketGateway, { ide: options.ide });
  }

  // /api/v1/moderation/*, /api/v1/community-proposals/*
  if (options?.governanceModeration) {
    await app.register(moderationRoutes, {
      governanceModeration: options.governanceModeration,
    });
    await app.register(communityProposalsRoutes, {
      governanceModeration: options.governanceModeration,
    });
  }

  await app.register(internalEventSchemasPlugin);
}
