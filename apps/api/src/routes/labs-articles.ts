/**
 * Labs article editor REST routes (COMP-023.7).
 *
 * POST  /api/v1/labs/articles           — create draft article (auth)
 * GET   /api/v1/labs/articles           — list articles by current user (auth)
 * GET   /api/v1/labs/articles/:id       — get article by id (auth)
 * PUT   /api/v1/labs/articles/:id       — update draft (auth)
 * POST  /api/v1/labs/articles/:id/submit — submit for review (auth)
 * GET   /api/v1/labs/articles/:id/versions — list versions (auth)
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { createArticleId } from "@syntropy/types";
import {
  ScientificArticle,
  createSubjectAreaId,
  ArticleNotFoundError,
  ArticleForbiddenError,
} from "@syntropy/labs-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LabsScientificContext } from "../types/labs-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

function articleToPayload(article: ScientificArticle) {
  return {
    id: article.articleId,
    title: article.title,
    content: article.content,
    subjectAreaId: article.subjectAreaId,
    authorId: article.authorId,
    status: article.status,
    publishedArtifactId: article.publishedArtifactId ?? undefined,
    publishedAt: article.publishedAt?.toISOString() ?? undefined,
  };
}

export async function labsArticlesRoutes(
  fastify: FastifyInstance,
  opts: { labs: LabsScientificContext }
): Promise<void> {
  const {
    scientificArticleRepository,
    articleVersionRepository,
    articleSubmissionService,
  } = opts.labs;

  if (
    !scientificArticleRepository ||
    !articleVersionRepository ||
    !articleSubmissionService
  ) {
    fastify.log.warn(
      "Labs article routes not registered: missing article repos or submission service"
    );
    return;
  }

  const requireAuth = fastify.requireAuth;

  fastify.post<{
    Body: { title: string; content: string; subjectAreaId: string };
  }>(
    "/api/v1/labs/articles",
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
      const body = request.body;
      if (!body?.title?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "title is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      if (typeof body?.content !== "string") {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "content is required.",
            getRequestId(request)
          )
        );
      }
      if (!body?.subjectAreaId?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "subjectAreaId is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      let subjectAreaId: ReturnType<typeof createSubjectAreaId>;
      try {
        subjectAreaId = createSubjectAreaId(body.subjectAreaId.trim());
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid subjectAreaId format.",
            getRequestId(request)
          )
        );
      }
      try {
        const articleId = createArticleId(randomUUID());
        const article = new ScientificArticle({
          articleId,
          title: body.title.trim(),
          content: body.content,
          subjectAreaId,
          authorId: userId,
          status: "draft",
        });
        await scientificArticleRepository.save(article);
        return reply.status(201).send(
          successEnvelope(articleToPayload(article), getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Create article failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to create article.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get(
    "/api/v1/labs/articles",
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
      try {
        const articles = await scientificArticleRepository.findByAuthor(userId);
        return reply.status(200).send(
          successEnvelope(
            articles.map((a) => articleToPayload(a)),
            getRequestId(request)
          )
        );
      } catch (err) {
        fastify.log.error({ err }, "List articles failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to list articles.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id",
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
      try {
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
        return reply.status(200).send(
          successEnvelope(articleToPayload(article), getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Get article failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load article.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: { title?: string; content?: string };
  }>(
    "/api/v1/labs/articles/:id",
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
      try {
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
        const updates: { title?: string; content?: string } = {};
        if (request.body?.title !== undefined) updates.title = request.body.title;
        if (request.body?.content !== undefined)
          updates.content = request.body.content;
        if (Object.keys(updates).length === 0) {
          return reply.status(200).send(
            successEnvelope(articleToPayload(article), getRequestId(request))
          );
        }
        const updated = article.updateDraft(updates);
        await scientificArticleRepository.save(updated);
        return reply.status(200).send(
          successEnvelope(articleToPayload(updated), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("only draft")) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "Only draft articles can be updated.",
              getRequestId(request)
            )
          );
        }
        fastify.log.error({ err }, "Update article failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to update article.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id/submit",
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
      try {
        await articleSubmissionService.submit(articleId, userId);
        return reply.status(200).send(
          successEnvelope(
            { submitted: true },
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
        if (err instanceof ArticleForbiddenError) {
          return reply.status(403).send(
            errorEnvelope(
              "FORBIDDEN",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("expected draft")) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "Only draft articles can be submitted.",
              getRequestId(request)
            )
          );
        }
        fastify.log.error({ err }, "Submit article failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to submit article.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/articles/:id/versions",
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
      try {
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
        const versions = await articleVersionRepository.listByArticleId(articleId);
        const data = versions.map((v) => ({
          articleId: v.articleId,
          versionNumber: v.versionNumber,
          mystContent: v.mystContent,
          contentHash: v.contentHash ?? undefined,
          createdBy: v.createdBy,
          createdAt: v.createdAt.toISOString(),
        }));
        return reply.status(200).send(
          successEnvelope(data, getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Get article versions failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load article versions.",
            getRequestId(request)
          )
        );
      }
    }
  );
}
