/**
 * Hub institution orchestration REST routes (COMP-020.6).
 *
 * POST /api/v1/hub/institutions/create — start workflow and create institution via DIP.
 * GET /api/v1/hub/institutions/:id — get institution profile.
 * GET /api/v1/hub/contract-templates — list contract templates.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  InstitutionCreationWorkflow,
  InstitutionOrchestrationInvalidPhaseError,
  InstitutionOrchestrationTemplateNotFoundError,
} from "@syntropy/hub-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { HubCollaborationContext } from "../types/hub-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/hub/institutions/create. */
interface CreateInstitutionBody {
  templateId: string;
  founderIds?: string[];
}

function isCreateInstitutionBody(value: unknown): value is CreateInstitutionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.templateId !== "string") return false;
  if (o.founderIds !== undefined && !Array.isArray(o.founderIds)) return false;
  if (
    Array.isArray(o.founderIds) &&
    o.founderIds.some((x: unknown) => typeof x !== "string")
  ) {
    return false;
  }
  return true;
}

export async function hubInstitutionsRoutes(
  fastify: FastifyInstance,
  opts: { hub: HubCollaborationContext }
): Promise<void> {
  const {
    contractTemplateRepository,
    institutionWorkflowRepository,
    institutionOrchestrationService,
    institutionProfileProjector,
  } = opts.hub;

  if (
    !contractTemplateRepository ||
    !institutionWorkflowRepository ||
    !institutionOrchestrationService ||
    !institutionProfileProjector
  ) {
    return;
  }

  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/hub/institutions/create",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === null || body === undefined || !isCreateInstitutionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { templateId: string, founderIds?: string[] }.",
            getRequestId(request)
          )
        );
      }
      const templateId = body.templateId.trim();
      if (!templateId) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "templateId must be non-empty.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      const founderIds = body.founderIds?.length
        ? body.founderIds.map((id: string) => String(id).trim())
        : [userId];

      try {
        const workflowId = "wf-" + randomUUID().slice(0, 8);
        let workflow = InstitutionCreationWorkflow.start({
          id: workflowId,
          templateId,
        });
        workflow = workflow.proceed({ founderIds });
        await institutionWorkflowRepository.save(workflow);

        const result = await institutionOrchestrationService.createInstitution(
          workflow
        );

        return reply.status(201).send(
          successEnvelope(
            {
              institutionId: result.institutionId,
              workflowId: result.workflow.id,
              status: result.workflow.currentPhase,
            },
            getRequestId(request)
          )
        );
      } catch (err: unknown) {
        if (err instanceof InstitutionOrchestrationInvalidPhaseError) {
          return reply.status(400).send(
            errorEnvelope("BAD_REQUEST", err.message, getRequestId(request))
          );
        }
        if (err instanceof InstitutionOrchestrationTemplateNotFoundError) {
          return reply.status(404).send(
            errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/hub/institutions/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const id = request.params.id?.trim();
      if (!id) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Institution id is required.",
            getRequestId(request)
          )
        );
      }
      const profile = await institutionProfileProjector.getProfile(id);
      if (!profile) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Institution ${id} not found.`,
            getRequestId(request)
          )
        );
      }
      return reply
        .status(200)
        .send(successEnvelope(profile, getRequestId(request)));
    }
  );

  fastify.get<{ Params: Record<string, string> }>(
    "/api/v1/hub/contract-templates",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const templates = await contractTemplateRepository.list();
      const data = templates.map((t: { templateId: string; name: string; type: string }) => ({
        templateId: t.templateId,
        name: t.name,
        type: t.type,
      }));
      return reply.status(200).send(successEnvelope(data, getRequestId(request)));
    }
  );
}
