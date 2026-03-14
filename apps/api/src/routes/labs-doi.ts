/**
 * Labs DOI REST routes (COMP-026.5).
 *
 * POST /api/v1/labs/articles/:id/doi — register DOI for article (auth)
 * GET  /api/v1/labs/articles/:id/doi — get DOI status for article
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { createArticleId } from "@syntropy/types";
import {
  ArticleNotFoundError,
  ArticleNotEligibleForDOIError,
} from "@syntropy/labs-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LabsScientificContext } from "../types/labs-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function labsDoiRoutes(
  fastify: FastifyInstance,
  opts: { labs: LabsScientificContext }
): Promise<void> {
  const { doiRegistrationService, doiRecordRepository } = opts.labs;

  if (!doiRegistrationService || !doiRecordRepository) {
    fastify.log.warn(
      "Labs DOI routes not registered: missing doiRegistrationService or doiRecordRepository"
    );
    return;
  }

  const requireAuth = fastify.requireAuth;

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id/doi",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      let articleId: ReturnType<typeof createArticleId>;
      try {
        articleId = createArticleId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid article id format.",
            getRequestId(request)
          )
        );
      }

      try {
        const record = await doiRegistrationService.register(articleId);
        const notifier = opts.labs.externalIndexingNotifier;
        if (notifier) {
          notifier.notify(record).catch((err) => {
            fastify.log.warn({ err, articleId: String(articleId) }, "External indexing notify failed");
          });
        }
        return reply.status(201).send(
          successEnvelope(
            {
              doi: record.doi,
              articleId: String(record.articleId),
              status: record.status,
              registeredAt: record.registeredAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof ArticleNotFoundError) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof ArticleNotEligibleForDOIError) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              err.message,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id/doi",
    async (request, reply) => {
      let articleId: ReturnType<typeof createArticleId>;
      try {
        articleId = createArticleId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid article id format.",
            getRequestId(request)
          )
        );
      }

      const record = await doiRecordRepository.findByArticleId(articleId);
      if (!record) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "No DOI registered for this article.",
            getRequestId(request)
          )
        );
      }

      return reply.send(
        successEnvelope(
          {
            doi: record.doi,
            articleId: String(record.articleId),
            status: record.status,
            registeredAt: record.registeredAt.toISOString(),
          },
          getRequestId(request)
        )
      );
    }
  );
}
