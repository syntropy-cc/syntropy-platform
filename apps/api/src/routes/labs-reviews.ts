/**
 * Labs peer review REST routes (COMP-025.7).
 *
 * POST  /api/v1/labs/articles/:id/reviews   — create and submit a review (auth; reviewer = requester)
 * GET   /api/v1/labs/articles/:id/reviews   — list reviews for article (visibility enforced)
 * POST  /api/v1/labs/reviews/:id/responses  — submit author response (auth)
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { createArticleId, createReviewId } from "@syntropy/types";
import {
  Review,
  AuthorResponse,
  ReviewVisibilityEvaluator,
} from "@syntropy/labs-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LabsScientificContext } from "../types/labs-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

function reviewToPayload(
  review: Review,
  visibilityEvaluator: ReviewVisibilityEvaluator,
  requestingActorId: string | null
): Record<string, unknown> {
  const contentVisible = visibilityEvaluator.isReviewContentVisible(review);
  const reviewerVisible = visibilityEvaluator.isReviewerIdentityVisible(
    review,
    requestingActorId
  );
  return {
    id: review.reviewId,
    articleId: review.articleId,
    ...(reviewerVisible && { reviewerId: review.reviewerId }),
    status: review.status,
    ...(contentVisible && { content: review.content }),
    submittedAt: review.submittedAt?.toISOString() ?? undefined,
    publishedAt: review.publishedAt?.toISOString() ?? undefined,
    embargoUntil: review.embargoUntil?.toISOString() ?? undefined,
  };
}

export async function labsReviewsRoutes(
  fastify: FastifyInstance,
  opts: { labs: LabsScientificContext }
): Promise<void> {
  const {
    reviewRepository,
    authorResponseRepository,
    scientificArticleRepository,
    reviewVisibilityEvaluator,
  } = opts.labs;

  if (!reviewRepository || !authorResponseRepository) {
    fastify.log.warn(
      "Labs review routes not registered: missing review or author response repository"
    );
    return;
  }

  const evaluator = reviewVisibilityEvaluator ?? new ReviewVisibilityEvaluator();
  const requireAuth = fastify.requireAuth;

  fastify.post<{
    Params: { id: string };
    Body: { content: string };
  }>(
    "/api/v1/labs/articles/:id/reviews",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send(
          errorEnvelope(
            "UNAUTHORIZED",
            "Authentication required.",
            getRequestId(request)
          )
        );
      }
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
      const content = request.body?.content;
      if (typeof content !== "string" || !content.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "content is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      if (scientificArticleRepository) {
        const article = await scientificArticleRepository.findById(articleId);
        if (!article) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Article not found.",
              getRequestId(request)
            )
          );
        }
      }
      try {
        const reviewId = createReviewId(randomUUID());
        const review = new Review({
          reviewId,
          articleId,
          reviewerId: userId,
          status: "in_progress",
          content: content.trim(),
        });
        const submitted = review.submit();
        await reviewRepository.save(submitted);
        return reply.status(201).send(
          successEnvelope(
            reviewToPayload(submitted, evaluator, userId),
            getRequestId(request)
          )
        );
      } catch (err) {
        fastify.log.error({ err }, "Create review failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to create review.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id/reviews",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user?.userId ?? null;
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
        const reviews = await reviewRepository.findByArticleId(articleId);
        const data = reviews.map((r) =>
          reviewToPayload(r, evaluator, userId)
        );
        return reply.status(200).send(
          successEnvelope(data, getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "List reviews failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load reviews.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.post<{
    Params: { id: string };
    Body: { responseText: string; reviewPassageLinkId?: string | null };
  }>(
    "/api/v1/labs/reviews/:id/responses",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send(
          errorEnvelope(
            "UNAUTHORIZED",
            "Authentication required.",
            getRequestId(request)
          )
        );
      }
      let reviewId: ReturnType<typeof createReviewId>;
      try {
        reviewId = createReviewId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid review id format.",
            getRequestId(request)
          )
        );
      }
      const responseText = request.body?.responseText;
      if (typeof responseText !== "string" || !responseText.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "responseText is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      const reviewPassageLinkId =
        request.body?.reviewPassageLinkId ?? null;
      try {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Review not found.",
              getRequestId(request)
            )
          );
        }
        const articleId = review.articleId;
        const response = new AuthorResponse({
          id: randomUUID(),
          reviewId,
          articleId,
          reviewPassageLinkId:
            typeof reviewPassageLinkId === "string" && reviewPassageLinkId
              ? reviewPassageLinkId
              : null,
          responderId: userId,
          responseText: responseText.trim(),
          createdAt: new Date(),
        });
        await authorResponseRepository.save(response);
        return reply.status(201).send(
          successEnvelope(
            {
              id: response.id,
              reviewId: response.reviewId,
              articleId: response.articleId,
              responseText: response.responseText,
              responderId: response.responderId,
              createdAt: response.createdAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        fastify.log.error({ err }, "Create author response failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to create response.",
            getRequestId(request)
          )
        );
      }
    }
  );
}
