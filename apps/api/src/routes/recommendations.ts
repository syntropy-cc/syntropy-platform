/**
 * Recommendations REST route (COMP-011.7).
 * GET /api/v1/recommendations/:userId — personalized recommendation list for the user.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { successEnvelope } from "../types/api-envelope.js";
import type { SearchContext } from "../types/search-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function recommendationRoutes(
  fastify: FastifyInstance,
  opts: { search: SearchContext }
): Promise<void> {
  const { recommendationService, recommendationRepository } = opts.search;
  const requireAuth = fastify.requireAuth;

  fastify.get<{ Params: { userId: string } }>(
    "/api/v1/recommendations/:userId",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { userId } = request.params;
      let set = await recommendationRepository.findByUserId(userId);
      if (set === null) {
        set = await recommendationService.compute(userId);
        await recommendationRepository.saveForUser(userId, set);
      }
      const data = {
        userId: set.userId,
        generatedAt: set.generatedAt.toISOString(),
        recommendations: set.recommendations.map((r) => ({
          id: r.id,
          opportunityType: r.opportunityType,
          entityType: r.entityType,
          entityId: r.entityId,
          relevanceScore: r.relevanceScore,
          reasoning: r.reasoning,
          wasClicked: r.wasClicked,
        })),
      };
      return reply.status(200).send(successEnvelope(data, getRequestId(request)));
    }
  );
}
