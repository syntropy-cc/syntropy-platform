/**
 * Hub collaboration REST routes (COMP-019.8).
 *
 * POST /api/v1/hub/issues — create issue.
 * GET /api/v1/hub/issues — list issues (optional ?projectId=).
 * POST /api/v1/hub/contributions — create contribution.
 * POST /api/v1/hub/contributions/:id/merge — merge accepted contribution (publish DIP artifact, close linked issues).
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  Issue,
  Contribution,
  createIssueId,
  createContributionId,
  ContributionNotReadyForMergeError,
  isIssueType,
} from "@syntropy/hub-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { HubCollaborationContext } from "../types/hub-context.js";

/** Issue DTO for API responses. */
interface IssueDto {
  id: string;
  projectId: string;
  title: string;
  type: string;
  status: string;
  assigneeId: string | null;
}

/** Contribution DTO for API responses. */
interface ContributionDto {
  id: string;
  projectId: string;
  contributorId: string;
  title: string;
  description: string;
  status: string;
  linkedIssueIds: string[];
  dipArtifactId: string | null;
}

/** Merge result DTO. */
interface MergeResultDto {
  contributionId: string;
  dipArtifactId: string;
  closedIssueIds: string[];
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

function toIssueDto(issue: Issue): IssueDto {
  return {
    id: issue.issueId as string,
    projectId: issue.projectId,
    title: issue.title,
    type: issue.type,
    status: issue.status,
    assigneeId: issue.assigneeId,
  };
}

function toContributionDto(c: Contribution): ContributionDto {
  return {
    id: c.id as string,
    projectId: c.projectId,
    contributorId: c.contributorId,
    title: c.title,
    description: c.description,
    status: c.status,
    linkedIssueIds: [...c.linkedIssueIds],
    dipArtifactId: c.dipArtifactId,
  };
}

/** Body for POST /api/v1/hub/issues. */
interface CreateIssueBody {
  projectId: string;
  title: string;
  type: string;
}

function isCreateIssueBody(value: unknown): value is CreateIssueBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.projectId === "string" &&
    typeof o.title === "string" &&
    typeof o.type === "string"
  );
}

/** Body for POST /api/v1/hub/contributions. */
interface CreateContributionBody {
  projectId: string;
  title: string;
  description?: string;
  content?: Record<string, unknown>;
  linkedIssueIds?: string[];
}

function isCreateContributionBody(value: unknown): value is CreateContributionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.projectId !== "string" || typeof o.title !== "string") return false;
  if (o.description !== undefined && typeof o.description !== "string") return false;
  if (o.content !== undefined && (o.content === null || typeof o.content !== "object" || Array.isArray(o.content))) return false;
  if (o.linkedIssueIds !== undefined && !Array.isArray(o.linkedIssueIds)) return false;
  if (Array.isArray(o.linkedIssueIds) && o.linkedIssueIds.some((x: unknown) => typeof x !== "string")) return false;
  return true;
}

export async function hubRoutes(
  fastify: FastifyInstance,
  opts: { hub: HubCollaborationContext }
): Promise<void> {
  const {
    issueRepository,
    contributionRepository,
    contributionIntegrationService,
  } = opts.hub;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/hub/issues",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateIssueBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { projectId: string, title: string, type: string }.",
            getRequestId(request)
          )
        );
      }
      if (!isIssueType(body.type)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            `Invalid type: expected one of bug, feature, task, chore, got "${body.type}".`,
            getRequestId(request)
          )
        );
      }
      try {
        const issueId = createIssueId(randomUUID());
        const { issue } = Issue.open({
          issueId,
          projectId: body.projectId.trim(),
          title: body.title.trim(),
          type: body.type as "bug" | "feature" | "task" | "chore",
        });
        await issueRepository.save(issue);
        return reply.status(201).send(
          successEnvelope(toIssueDto(issue), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("IssueId")) {
          return reply.status(400).send(
            errorEnvelope("BAD_REQUEST", err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );

  fastify.get<{ Querystring: { projectId?: string } }>(
    "/api/v1/hub/issues",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const projectId = request.query.projectId?.trim();
      const issues = await issueRepository.list(
        projectId ? { projectId } : undefined
      );
      const data = issues.map(toIssueDto);
      return reply.status(200).send(successEnvelope(data, getRequestId(request)));
    }
  );

  fastify.post<{ Body: unknown }>(
    "/api/v1/hub/contributions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateContributionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { projectId: string, title: string, description?: string, content?: object, linkedIssueIds?: string[] }.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      try {
        const contributionId = createContributionId(randomUUID());
        const { contribution } = Contribution.submit({
          id: contributionId,
          projectId: body.projectId.trim(),
          contributorId: userId,
          title: body.title.trim(),
          description: body.description?.trim() ?? "",
          content: body.content ?? {},
          linkedIssueIds: body.linkedIssueIds ?? [],
        });
        await contributionRepository.save(contribution);
        return reply.status(201).send(
          successEnvelope(toContributionDto(contribution), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes("ContributionId")) {
          return reply.status(400).send(
            errorEnvelope("BAD_REQUEST", err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/hub/contributions/:id/merge",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const id = request.params.id.trim();
      if (!id) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Contribution id is required.",
            getRequestId(request)
          )
        );
      }
      try {
        const result = await contributionIntegrationService.merge(id);
        const dto: MergeResultDto = {
          contributionId: id,
          dipArtifactId: result.integratedEvent.dipArtifactId,
          closedIssueIds: result.closedIssueEvents.map((e) => e.issueId),
        };
        return reply.status(200).send(successEnvelope(dto, getRequestId(request)));
      } catch (err) {
        if (err instanceof ContributionNotReadyForMergeError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );
}
