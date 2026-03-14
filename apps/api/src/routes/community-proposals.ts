/**
 * Community proposals REST routes (COMP-031.6).
 *
 * POST /api/v1/community-proposals — create proposal (auth).
 * POST /api/v1/community-proposals/:id/vote — cast vote (auth).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { GovernanceModerationContext } from "../types/governance-moderation-context.js";

/** Request body for POST /api/v1/community-proposals */
interface CreateProposalBody {
  title: string;
  description: string;
  proposalType: string;
}

function isCreateProposalBody(value: unknown): value is CreateProposalBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    o.title.trim().length > 0 &&
    typeof o.description === "string" &&
    o.description.trim().length > 0 &&
    typeof o.proposalType === "string" &&
    o.proposalType.trim().length > 0
  );
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

function proposalToJson(p: {
  id: string;
  authorId: string;
  title: string;
  description: string;
  proposalType: string;
  status: string;
  voteCount: number;
  discussionThreadId?: string;
  createdAt: Date;
  resolvedAt?: Date;
}) {
  return {
    id: p.id,
    authorId: p.authorId,
    title: p.title,
    description: p.description,
    proposalType: p.proposalType,
    status: p.status,
    voteCount: p.voteCount,
    discussionThreadId: p.discussionThreadId ?? null,
    createdAt: p.createdAt.toISOString(),
    resolvedAt: p.resolvedAt?.toISOString() ?? null,
  };
}

export async function communityProposalsRoutes(
  fastify: FastifyInstance,
  opts: { governanceModeration: GovernanceModerationContext }
): Promise<void> {
  const ctx = opts.governanceModeration;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/community-proposals",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateProposalBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { title: string, description: string, proposalType: string }.",
            getRequestId(request)
          )
        );
      }
      const authorId = request.user!.userId;
      const proposal = await ctx.createProposal({
        authorId,
        title: body.title.trim(),
        description: body.description.trim(),
        proposalType: body.proposalType.trim(),
      });
      return reply.status(201).send(
        successEnvelope(proposalToJson(proposal), getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/community-proposals/:id/vote",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const proposalId = request.params.id.trim();
      if (!proposalId) {
        return reply.status(400).send(
          errorEnvelope("BAD_REQUEST", "Proposal id is required.", getRequestId(request))
        );
      }
      const userId = request.user!.userId;
      try {
        const proposal = await ctx.voteProposal(proposalId, userId);
        return reply.status(200).send(
          successEnvelope(proposalToJson(proposal), getRequestId(request))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Vote failed.";
        return reply.status(400).send(
          errorEnvelope("BAD_REQUEST", message, getRequestId(request))
        );
      }
    }
  );
}
