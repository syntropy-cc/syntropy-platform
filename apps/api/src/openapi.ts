/**
 * OpenAPI 3.1 and Swagger UI registration (COMP-033.6).
 *
 * Call registerSwagger before routes; call registerOpenApiEndpoints after routes.
 */

import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

const OPENAPI_VERSION = "3.1.0";

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  const appVersion =
    process.env.API_VERSION ?? process.env.npm_package_version ?? "0.1.0";

  await app.register(swagger, {
    openapi: {
      openapi: OPENAPI_VERSION,
      info: {
        title: "Syntropy Platform API",
        description:
          "REST API for the Syntropy Platform (DIP, Learn, Hub, Labs, AI Agents, and supporting domains).",
        version: appVersion,
      },
      servers: [{ url: "http://localhost:8080", description: "Development" }],
      tags: [
        { name: "health", description: "Health and readiness" },
        { name: "auth", description: "Authentication" },
        { name: "learn", description: "Learn pillar" },
        { name: "hub", description: "Hub pillar" },
        { name: "labs", description: "Labs pillar" },
        { name: "ai-agents", description: "AI agents and sessions" },
        { name: "sponsorships", description: "Sponsorships" },
        { name: "notifications", description: "Notifications and messages" },
        { name: "moderation", description: "Moderation" },
        { name: "community-proposals", description: "Community proposals" },
      ],
    },
  });
}

/**
 * Register GET /api/v1/openapi.json and Swagger UI at /api/v1/docs.
 * Call after registerApiRoutes so the spec includes all routes.
 */
export async function registerOpenApiEndpoints(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/api/v1/openapi.json",
    {
      schema: {
        description: "OpenAPI 3.1 specification",
        tags: ["health"],
        response: {
          200: {
            description: "OpenAPI JSON document",
            type: "object",
          },
        },
      },
    },
    async (_request, reply) => {
      const spec = await app.swagger();
      return reply.type("application/json").send(spec);
    }
  );

  await app.register(swaggerUi, {
    routePrefix: "/api/v1/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}
