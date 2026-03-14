/**
 * Sponsorship REST routes (COMP-027.6).
 *
 * POST /api/v1/sponsorships — create sponsorship (auth).
 * GET /api/v1/sponsorships/:id — get by id (auth).
 * GET /api/v1/sponsorships/:id/impact — get impact metric (auth).
 * POST /api/v1/sponsorships/:id/payment-intent — create payment intent (auth).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { Sponsorship, isSponsorshipType } from "@syntropy/sponsorship";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { SponsorshipContext } from "../types/sponsorship-context.js";

/** Request body for POST /api/v1/sponsorships */
interface CreateSponsorshipBody {
  sponsoredId: string;
  type: "recurring" | "one_time";
  amount: number;
}

function isCreateSponsorshipBody(value: unknown): value is CreateSponsorshipBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.sponsoredId !== "string" || !o.sponsoredId.trim()) return false;
  if (!isSponsorshipType(o.type as string)) return false;
  if (typeof o.amount !== "number" || o.amount < 0) return false;
  return true;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Amount in dollars to cents for Stripe (smallest unit). */
function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export async function sponsorshipRoutes(
  fastify: FastifyInstance,
  opts: { sponsorship: SponsorshipContext }
): Promise<void> {
  const {
    sponsorshipRepository,
    impactMetricRepository,
    paymentGateway,
    eventPublisher,
  } = opts.sponsorship;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/sponsorships",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateSponsorshipBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { sponsoredId: string, type: 'recurring' | 'one_time', amount: number }.",
            getRequestId(request)
          )
        );
      }
      const sponsorId = request.user!.userId;
      const id = randomUUID();
      const sponsorship = new Sponsorship({
        id,
        sponsorId,
        sponsoredId: body.sponsoredId.trim(),
        type: body.type,
        amount: body.amount,
        status: "pending",
      });
      await sponsorshipRepository.save(sponsorship);
      if (eventPublisher) {
        await eventPublisher.publishCreated(sponsorship);
      }
      return reply.status(201).send(
        successEnvelope(
          {
            id: sponsorship.id,
            sponsorId: sponsorship.sponsorId,
            sponsoredId: sponsorship.sponsoredId,
            type: sponsorship.type,
            amount: sponsorship.amount,
            status: sponsorship.status,
            startedAt: sponsorship.startedAt?.toISOString() ?? null,
            cancelledAt: sponsorship.cancelledAt?.toISOString() ?? null,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/sponsorships/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const sponsorship = await sponsorshipRepository.findById(id);
      if (sponsorship == null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      if (sponsorship.sponsorId !== userId) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope(
          {
            id: sponsorship.id,
            sponsorId: sponsorship.sponsorId,
            sponsoredId: sponsorship.sponsoredId,
            type: sponsorship.type,
            amount: sponsorship.amount,
            status: sponsorship.status,
            startedAt: sponsorship.startedAt?.toISOString() ?? null,
            cancelledAt: sponsorship.cancelledAt?.toISOString() ?? null,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/sponsorships/:id/impact",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const sponsorship = await sponsorshipRepository.findById(id);
      if (sponsorship == null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      if (sponsorship.sponsorId !== userId) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      const metric = await impactMetricRepository.findBySponsorship(id);
      if (metric == null) {
        return reply.status(200).send(
          successEnvelope(
            {
              sponsorshipId: id,
              artifactViews: 0,
              portfolioGrowth: 0,
              contributionActivity: 0,
            },
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope(
          {
            sponsorshipId: metric.sponsorshipId,
            artifactViews: metric.artifactViews,
            portfolioGrowth: metric.portfolioGrowth,
            contributionActivity: metric.contributionActivity,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/sponsorships/:id/payment-intent",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const sponsorship = await sponsorshipRepository.findById(id);
      if (sponsorship == null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      if (sponsorship.sponsorId !== userId) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Sponsorship not found.",
            getRequestId(request)
          )
        );
      }
      if (sponsorship.status !== "pending") {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Payment intent can only be created for pending sponsorships.",
            getRequestId(request)
          )
        );
      }
      const amountCents = toCents(sponsorship.amount);
      const result = await paymentGateway.createPaymentIntent(
        amountCents,
        "usd"
      );
      return reply.status(200).send(
        successEnvelope(
          { id: result.id, clientSecret: result.clientSecret },
          getRequestId(request)
        )
      );
    }
  );
}
