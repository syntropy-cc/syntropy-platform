/**
 * Labs experiment design REST routes (COMP-024.5).
 *
 * POST  /api/v1/labs/experiments           — create experiment design (auth)
 * GET   /api/v1/labs/experiments/:id       — get experiment by id (auth)
 * POST  /api/v1/labs/experiments/:id/results — record result (auth; anonymization applied)
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  createArticleId,
  createExperimentId,
  createExperimentResultId,
} from "@syntropy/types";
import {
  ExperimentDesign,
  ExperimentResult,
  AnonymizationPolicyEnforcer,
  createHypothesisId,
} from "@syntropy/labs-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LabsScientificContext } from "../types/labs-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Default PII keys redacted before storing experiment results (COMP-024.5). */
const DEFAULT_PII_KEYS = [
  "participantId",
  "participant_id",
  "email",
  "name",
  "identifier",
];

const defaultAnonymizationPolicy = { piiKeys: DEFAULT_PII_KEYS };

function designToPayload(design: ExperimentDesign) {
  return {
    id: design.experimentId,
    articleId: design.articleId,
    researcherId: design.researcherId,
    title: design.title,
    methodologyId: design.methodologyId,
    hypothesisRecordId: design.hypothesisRecordId ?? undefined,
    protocol: design.protocol,
    variables: design.variables,
    ethicalApprovalStatus: design.ethicalApprovalStatus,
    status: design.status,
    preRegisteredAt: design.preRegisteredAt?.toISOString() ?? undefined,
  };
}

function resultToPayload(result: ExperimentResult) {
  return {
    id: result.id,
    experimentId: result.experimentId,
    rawDataLocation: result.rawDataLocation,
    statisticalSummary: result.statisticalSummary,
    pValue: result.pValue,
    collectedAt: result.collectedAt.toISOString(),
  };
}

export async function labsExperimentsRoutes(
  fastify: FastifyInstance,
  opts: { labs: LabsScientificContext }
): Promise<void> {
  const { experimentDesignRepository, experimentResultRepository } = opts.labs;

  if (!experimentDesignRepository || !experimentResultRepository) {
    fastify.log.warn(
      "Labs experiment routes not registered: missing experiment design or result repository"
    );
    return;
  }

  const enforcer = new AnonymizationPolicyEnforcer();
  const requireAuth = fastify.requireAuth;

  fastify.post<{
    Body: {
      articleId: string;
      title: string;
      methodologyId: string;
      hypothesisRecordId?: string | null;
      protocol?: Record<string, unknown>;
      variables?: Record<string, unknown>;
      ethicalApprovalStatus?: string;
    };
  }>(
    "/api/v1/labs/experiments",
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
      if (!body?.articleId?.trim() || !body?.methodologyId?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "articleId and methodologyId are required.",
            getRequestId(request)
          )
        );
      }
      let articleId: ReturnType<typeof createArticleId>;
      try {
        articleId = createArticleId(body.articleId.trim());
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid articleId format.",
            getRequestId(request)
          )
        );
      }
      try {
        const experimentId = createExperimentId(randomUUID());
        const design = new ExperimentDesign({
          experimentId,
          articleId,
          researcherId: userId,
          title: body.title.trim(),
          methodologyId: body.methodologyId.trim(),
          hypothesisRecordId: body.hypothesisRecordId?.trim()
            ? createHypothesisId(body.hypothesisRecordId.trim())
            : null,
          protocol: body.protocol ?? {},
          variables: body.variables ?? {},
          ethicalApprovalStatus: body.ethicalApprovalStatus ?? "pending",
          status: "designing",
        });
        await experimentDesignRepository.save(design);
        return reply.status(201).send(
          successEnvelope(designToPayload(design), getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Create experiment failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to create experiment.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/experiments/:id",
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
      let experimentId: ReturnType<typeof createExperimentId>;
      try {
        experimentId = createExperimentId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid experiment id format.",
            getRequestId(request)
          )
        );
      }
      try {
        const design = await experimentDesignRepository.findById(experimentId);
        if (!design) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Experiment not found.",
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(designToPayload(design), getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Get experiment failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load experiment.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.post<{
    Params: { id: string };
    Body: {
      rawDataLocation: string;
      statisticalSummary?: Record<string, unknown>;
      pValue?: number | null;
      collectedAt?: string;
    };
  }>(
    "/api/v1/labs/experiments/:id/results",
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
      let experimentId: ReturnType<typeof createExperimentId>;
      try {
        experimentId = createExperimentId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid experiment id format.",
            getRequestId(request)
          )
        );
      }
      const design = await experimentDesignRepository.findById(experimentId);
      if (!design) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Experiment not found.",
            getRequestId(request)
          )
        );
      }
      const body = request.body;
      if (!body?.rawDataLocation?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "rawDataLocation is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      const collectedAt = body.collectedAt
        ? new Date(body.collectedAt)
        : new Date();
      if (Number.isNaN(collectedAt.getTime())) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "collectedAt must be a valid ISO date string.",
            getRequestId(request)
          )
        );
      }
      if (
        body.pValue != null &&
        (typeof body.pValue !== "number" ||
          body.pValue < 0 ||
          body.pValue > 1)
      ) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "pValue must be a number between 0 and 1.",
            getRequestId(request)
          )
        );
      }
      try {
        const resultId = createExperimentResultId(randomUUID());
        const rawResult = new ExperimentResult({
          id: resultId,
          experimentId,
          rawDataLocation: body.rawDataLocation.trim(),
          statisticalSummary: body.statisticalSummary ?? {},
          pValue: body.pValue ?? null,
          collectedAt,
        });
        const redacted = enforcer.enforce(rawResult, defaultAnonymizationPolicy);
        await experimentResultRepository.save(redacted);
        return reply.status(201).send(
          successEnvelope(resultToPayload(redacted), getRequestId(request))
        );
      } catch (err) {
        fastify.log.error({ err }, "Record experiment result failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to record result.",
            getRequestId(request)
          )
        );
      }
    }
  );
}
