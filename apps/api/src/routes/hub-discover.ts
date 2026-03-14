/**
 * Hub Public Square discover REST route (COMP-021.5).
 *
 * GET /api/v1/hub/discover — returns top institutions by prominence.
 * GET /api/v1/hub/discover?search=... — filter by institution name (optional).
 * GET /api/v1/hub/discover?limit=... — max number of results (default 20, max 100).
 * Public endpoint; no auth required. Responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { HubCollaborationContext } from "../types/hub-context.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Discovery document DTO for API response. */
interface DiscoverItemDto {
  institutionId: string;
  name: string;
  prominenceScore: number;
  projectCount: number;
  contributorCount: number;
}

export async function hubDiscoverRoutes(
  fastify: FastifyInstance,
  opts: { hub: HubCollaborationContext }
): Promise<void> {
  const { discoveryRepository } = opts.hub;
  if (!discoveryRepository) {
    return;
  }

  fastify.get<{ Querystring: { search?: string; limit?: string } }>(
    "/api/v1/hub/discover",
    { preHandler: [] },
    async (request, reply) => {
      const limitParam = request.query.limit;
      let limit = DEFAULT_LIMIT;
      if (limitParam !== undefined) {
        const n = parseInt(limitParam, 10);
        if (!Number.isNaN(n) && n >= 1) {
          limit = Math.min(n, MAX_LIMIT);
        }
      }

      try {
        let items = await discoveryRepository.findTop(limit);
        const search = request.query.search?.trim();
        if (search) {
          const lower = search.toLowerCase();
          items = items.filter((doc) =>
            doc.name.toLowerCase().includes(lower)
          );
        }
        const data: DiscoverItemDto[] = items.map((doc) => ({
          institutionId: doc.institutionId,
          name: doc.name,
          prominenceScore: doc.prominenceScore,
          projectCount: doc.projectCount,
          contributorCount: doc.contributorCount,
        }));
        return reply
          .status(200)
          .send(successEnvelope(data, getRequestId(request)));
      } catch (err) {
        fastify.log.error({ err }, "Discover query failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load discover list.",
            getRequestId(request)
          )
        );
      }
    }
  );
}
