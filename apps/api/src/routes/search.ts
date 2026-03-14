/**
 * Search REST route (COMP-011.7).
 * GET /api/v1/search?q=...&type=...&page=...&limit=... — paginated hybrid search results.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { SearchContext } from "../types/search-context.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function searchRoutes(
  fastify: FastifyInstance,
  opts: { search: SearchContext }
): Promise<void> {
  const { searchService } = opts.search;
  const requireAuth = fastify.requireAuth;

  fastify.get<{
    Querystring: { q?: string; type?: string; page?: string; limit?: string };
  }>(
    "/api/v1/search",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const q = (request.query.q ?? "").trim();
      if (!q) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Query parameter 'q' is required",
            getRequestId(request)
          )
        );
      }
      const entityType = request.query.type?.trim() || undefined;
      const limit = Math.min(
        Math.max(1, parseInt(request.query.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
        MAX_LIMIT
      );
      const page = Math.max(1, parseInt(request.query.page ?? "1", 10) || 1);
      const offset = (page - 1) * limit;

      const filters = entityType ? { entityType } : undefined;
      const results = await searchService.hybridSearch(q, { limit: limit + offset, filters });
      const pageResults = results.slice(offset, offset + limit);

      const data = pageResults.map((doc) => ({
        indexId: doc.indexId,
        entityType: doc.entityType,
        entityId: doc.entityId,
      }));

      return reply.status(200).send(
        successEnvelope(
          { items: data, page, limit, total: results.length },
          getRequestId(request)
        )
      );
    }
  );
}
