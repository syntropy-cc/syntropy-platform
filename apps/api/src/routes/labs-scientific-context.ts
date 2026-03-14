/**
 * Labs scientific context REST routes (COMP-022.5).
 *
 * GET  /api/v1/labs/subject-areas   — taxonomy tree (public)
 * GET  /api/v1/labs/methodologies   — methodology catalog (public)
 * POST /api/v1/labs/hypotheses      — create hypothesis (auth)
 * GET  /api/v1/labs/hypotheses/:id  — get hypothesis by id (auth)
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  HypothesisRecord,
  createHypothesisId,
} from "@syntropy/labs-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LabsScientificContext } from "../types/labs-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function labsScientificContextRoutes(
  fastify: FastifyInstance,
  opts: { labs: LabsScientificContext }
): Promise<void> {
  const {
    subjectAreaRepository,
    methodologyRepository,
    hypothesisRecordRepository,
  } = opts.labs;

  fastify.get(
    "/api/v1/labs/subject-areas",
    { preHandler: [] },
    async (request, reply) => {
      try {
        const tree = await subjectAreaRepository.getTree();
        return reply
          .status(200)
          .send(successEnvelope(tree, getRequestId(request)));
      } catch (err) {
        fastify.log.error({ err }, "Subject areas query failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load subject areas.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get(
    "/api/v1/labs/methodologies",
    { preHandler: [] },
    async (request, reply) => {
      try {
        const list = await methodologyRepository.listAll();
        const data = list.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          description: m.description,
        }));
        return reply
          .status(200)
          .send(successEnvelope(data, getRequestId(request)));
      } catch (err) {
        fastify.log.error({ err }, "Methodologies query failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load methodologies.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.post<{
    Body: { statement: string; projectId: string };
  }>(
    "/api/v1/labs/hypotheses",
    { preHandler: [fastify.requireAuth] },
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
      if (!body?.statement?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "statement is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      if (!body?.projectId?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "projectId is required and cannot be empty.",
            getRequestId(request)
          )
        );
      }
      try {
        const hypothesisId = createHypothesisId(randomUUID());
        const record = new HypothesisRecord({
          hypothesisId,
          projectId: body.projectId.trim(),
          statement: body.statement.trim(),
          status: "proposed",
          createdBy: userId,
        });
        await hypothesisRecordRepository.save(record);
        return reply.status(201).send(
          successEnvelope(
            {
              id: record.hypothesisId,
              projectId: record.projectId,
              statement: record.statement,
              status: record.status,
              createdBy: record.createdBy,
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        fastify.log.error({ err }, "Create hypothesis failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to create hypothesis.",
            getRequestId(request)
          )
        );
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/labs/hypotheses/:id",
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      let id: ReturnType<typeof createHypothesisId>;
      try {
        id = createHypothesisId(request.params.id);
      } catch {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Invalid hypothesis id format.",
            getRequestId(request)
          )
        );
      }
      try {
        const record = await hypothesisRecordRepository.findById(id);
        if (!record) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Hypothesis not found.",
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(
            {
              id: record.hypothesisId,
              projectId: record.projectId,
              statement: record.statement,
              status: record.status,
              experimentId: record.experimentId ?? undefined,
              createdBy: record.createdBy,
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        fastify.log.error({ err }, "Get hypothesis failed");
        return reply.status(500).send(
          errorEnvelope(
            "INTERNAL_ERROR",
            "Failed to load hypothesis.",
            getRequestId(request)
          )
        );
      }
    }
  );
}
