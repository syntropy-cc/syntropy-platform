/**
 * Artifact REST routes (COMP-003.7).
 *
 * POST /api/v1/artifacts — create artifact (draft).
 * GET /api/v1/artifacts/:id — get artifact by id.
 * PUT /api/v1/artifacts/:id/submit — transition draft → submitted.
 * PUT /api/v1/artifacts/:id/publish — transition submitted → published.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  Artifact,
  ArtifactNotFoundError,
  InvalidLifecycleTransitionError,
  createAuthorId,
  createArtifactId,
} from "@syntropy/dip";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { DipContext } from "../types/dip-context.js";

/** Response DTO for Artifact (CONV-017 data shape). */
export interface ArtifactDto {
  id: string;
  authorId: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  contentHash: string | null;
  nostrEventId: string | null;
  artifactType: string | null;
  tags: string[];
}

function artifactToDto(artifact: Artifact): ArtifactDto {
  return {
    id: artifact.id,
    authorId: artifact.authorId,
    status: artifact.status,
    createdAt: artifact.createdAt.toISOString(),
    publishedAt: artifact.publishedAt?.toISOString() ?? null,
    contentHash: artifact.contentHash,
    nostrEventId: artifact.nostrEventId,
    artifactType: artifact.artifactType,
    tags: [...artifact.tags],
  };
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Optional body for POST /api/v1/artifacts. */
interface CreateArtifactBody {
  content?: string;
}

function isCreateArtifactBody(value: unknown): value is CreateArtifactBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return o.content === undefined || typeof o.content === "string";
}

export async function artifactRoutes(
  fastify: FastifyInstance,
  opts: { dip: DipContext }
): Promise<void> {
  const { lifecycleService, artifactRepository } = opts.dip;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/artifacts",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body !== undefined && body !== null && !isCreateArtifactBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { content?: string } or empty.",
            getRequestId(request)
          )
        );
      }
      const authorId = createAuthorId(String(request.user!.actorId));
      const content = body?.content;
      try {
        const artifact = await lifecycleService.draft(authorId, content);
        return reply.status(201).send(
          successEnvelope(artifactToDto(artifact), getRequestId(request))
        );
      } catch (err) {
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/artifacts/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const artifactId = createArtifactId(id);
        const artifact = await artifactRepository.findById(artifactId);
        if (!artifact) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Artifact not found.",
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(artifactToDto(artifact), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid ArtifactId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              "Invalid artifact id format.",
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/api/v1/artifacts/:id/submit",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const artifactId = createArtifactId(id);
        const artifact = await lifecycleService.submit(artifactId);
        return reply.status(200).send(
          successEnvelope(artifactToDto(artifact), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof ArtifactNotFoundError) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof InvalidLifecycleTransitionError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("Invalid ArtifactId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              "Invalid artifact id format.",
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/api/v1/artifacts/:id/publish",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const artifactId = createArtifactId(id);
        const artifact = await lifecycleService.publish(artifactId);
        return reply.status(200).send(
          successEnvelope(artifactToDto(artifact), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof ArtifactNotFoundError) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof InvalidLifecycleTransitionError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("Invalid ArtifactId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              "Invalid artifact id format.",
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );
}
