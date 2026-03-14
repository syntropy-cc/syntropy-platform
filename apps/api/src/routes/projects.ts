/**
 * Project REST routes (COMP-006.6).
 *
 * POST /api/v1/projects — create project.
 * GET /api/v1/projects/:id — get project by id.
 * GET /api/v1/projects/:id/dag — get project DAG (nodes + edges).
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  createInstitutionId,
  createProjectId,
} from "@syntropy/dip";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { DipContext } from "../types/dip-context.js";

/** Response DTO for DigitalProject (CONV-017 data shape). */
export interface ProjectDto {
  id: string;
  institutionId: string;
  manifestId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Response DTO for project DAG (COMP-006.6). */
export interface DagDto {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/projects. */
interface CreateProjectBody {
  institutionId: string;
  title: string;
  description?: string;
}

function isCreateProjectBody(value: unknown): value is CreateProjectBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.institutionId === "string" &&
    typeof o.title === "string" &&
    (o.description === undefined || typeof o.description === "string")
  );
}

export async function projectRoutes(
  fastify: FastifyInstance,
  opts: { dip: DipContext }
): Promise<void> {
  const { projectRepository, createProjectUseCase } = opts.dip;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/projects",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateProjectBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { institutionId: string, title: string, description?: string }.",
            getRequestId(request)
          )
        );
      }
      try {
        const institutionId = createInstitutionId(body.institutionId);
        const project = await createProjectUseCase.execute(institutionId, {
          title: body.title,
          description: body.description,
        });
        return reply.status(201).send(
          successEnvelope(
            {
              id: project.projectId,
              institutionId: project.institutionId,
              manifestId: project.manifestId,
              title: project.title,
              description: project.description,
              createdAt: project.createdAt.toISOString(),
              updatedAt: project.updatedAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Invalid InstitutionId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
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
    "/api/v1/projects/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const projectId = createProjectId(id);
        const project = await projectRepository.findById(projectId);
        if (!project) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Project not found.",
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(
            {
              id: project.projectId,
              institutionId: project.institutionId,
              manifestId: project.manifestId,
              title: project.title,
              description: project.description,
              createdAt: project.createdAt.toISOString(),
              updatedAt: project.updatedAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid") && err.message.includes("ProjectId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              "Invalid project id format.",
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/projects/:id/dag",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const projectId = createProjectId(id);
        const project = await projectRepository.findById(projectId);
        if (!project) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Project not found.",
              getRequestId(request)
            )
          );
        }
        const edges = await projectRepository.getDagEdges(projectId);
        const nodeSet = new Set<string>();
        for (const edge of edges) {
          nodeSet.add(edge.fromNodeId);
          nodeSet.add(edge.toNodeId);
        }
        const nodes = [...nodeSet];
        const dagDto: DagDto = {
          nodes,
          edges: edges.map((edge) => ({ from: edge.fromNodeId, to: edge.toNodeId })),
        };
        return reply.status(200).send(
          successEnvelope(dagDto, getRequestId(request))
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid") && err.message.includes("ProjectId")) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              "Invalid project id format.",
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );
}
