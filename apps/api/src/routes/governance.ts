/**
 * Governance REST routes (COMP-007.9).
 *
 * POST /api/v1/institutions — create institution.
 * GET /api/v1/institutions/:id — get institution summary.
 * POST /api/v1/institutions/:id/proposals — create proposal.
 * POST /api/v1/proposals/:id/vote — cast vote.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  DigitalInstitution,
  Proposal,
  DuplicateVoteError,
  NotEligibleToVoteError,
} from "@syntropy/dip-governance";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { GovernanceContext } from "../types/governance-context.js";

/** Response DTO for created or returned institution. */
export interface InstitutionDto {
  institutionId: string;
  name: string;
  type: string;
  governanceContract: string;
  status: string;
}

/** Response DTO for institution summary (GET). */
export interface InstitutionSummaryDto {
  institutionId: string;
  name: string;
  status: string;
  proposalCount: number;
}

/** Response DTO for proposal. */
export interface ProposalDto {
  proposalId: string;
  institutionId: string;
  type: string;
  status: string;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/institutions. */
interface CreateInstitutionBody {
  name: string;
  type: string;
  governanceContract: string;
}

function isCreateInstitutionBody(value: unknown): value is CreateInstitutionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    typeof o.type === "string" &&
    typeof o.governanceContract === "string"
  );
}

/** Body for POST /api/v1/institutions/:id/proposals. */
interface CreateProposalBody {
  type: string;
}

function isCreateProposalBody(value: unknown): value is CreateProposalBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.type === "string";
}

const VOTE_VALUES = ["for", "against", "abstain"] as const;
type VoteValue = (typeof VOTE_VALUES)[number];

/** Body for POST /api/v1/proposals/:id/vote. */
interface VoteBody {
  vote: VoteValue;
}

function isVoteBody(value: unknown): value is VoteBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.vote === "string" && VOTE_VALUES.includes(o.vote as VoteValue);
}

export async function governanceRoutes(
  fastify: FastifyInstance,
  opts: { governance: GovernanceContext }
): Promise<void> {
  const {
    institutionRepo,
    proposalRepo,
    votingService,
    governanceQueryService,
  } = opts.governance;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/institutions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateInstitutionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { name: string, type: string, governanceContract: string }.",
            getRequestId(request)
          )
        );
      }
      const { name, type, governanceContract } = body;
      if (!name.trim() || !type.trim() || !governanceContract.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "name, type, and governanceContract must be non-empty.",
            getRequestId(request)
          )
        );
      }
      try {
        const institutionId = "inst-" + randomUUID().slice(0, 8);
        const institution = DigitalInstitution.create({
          institutionId,
          name: name.trim(),
          type: type.trim(),
          governanceContract: governanceContract.trim(),
        });
        await institutionRepo.save(institution);
        const dto: InstitutionDto = {
          institutionId: institution.institutionId,
          name: institution.name,
          type: institution.type,
          governanceContract: institution.governanceContract,
          status: institution.status,
        };
        return reply.status(201).send(
          successEnvelope(dto, getRequestId(request))
        );
      } catch (err) {
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/institutions/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const summary = await governanceQueryService.getInstitutionSummary(id);
      if (!summary) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Institution not found.",
            getRequestId(request)
          )
        );
      }
      const dto: InstitutionSummaryDto = {
        institutionId: summary.institutionId,
        name: summary.name,
        status: summary.status,
        proposalCount: summary.proposalCount,
      };
      return reply.status(200).send(
        successEnvelope(dto, getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/v1/institutions/:id/proposals",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id: institutionId } = request.params;
      const body = request.body;
      if (body === undefined || body === null || !isCreateProposalBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { type: string }.",
            getRequestId(request)
          )
        );
      }
      const { type } = body;
      if (!type.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "type must be non-empty.",
            getRequestId(request)
          )
        );
      }
      const institution = await institutionRepo.findById(institutionId);
      if (!institution) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Institution not found.",
            getRequestId(request)
          )
        );
      }
      const proposalId = "prop-" + randomUUID().slice(0, 8);
      const proposal = Proposal.open({
        proposalId,
        institutionId,
        type: type.trim(),
      });
      await proposalRepo.save(proposal);
      const dto: ProposalDto = {
        proposalId: proposal.proposalId,
        institutionId: proposal.institutionId,
        type: proposal.type,
        status: proposal.status,
      };
      return reply.status(201).send(
        successEnvelope(dto, getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/v1/proposals/:id/vote",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id: proposalId } = request.params;
      const body = request.body;
      if (body === undefined || body === null || !isVoteBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { vote: 'for' | 'against' | 'abstain' }.",
            getRequestId(request)
          )
        );
      }
      const actorId = request.user?.actorId;
      if (typeof actorId !== "string" || !actorId) {
        return reply.status(401).send(
          errorEnvelope(
            "UNAUTHORIZED",
            "Authenticated user actorId is required to vote.",
            getRequestId(request)
          )
        );
      }
      try {
        await votingService.castVote(proposalId, actorId, body.vote);
        return reply.status(200).send(
          successEnvelope({ ok: true }, getRequestId(request))
        );
      } catch (err) {
        if (err instanceof DuplicateVoteError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof NotEligibleToVoteError) {
          return reply.status(403).send(
            errorEnvelope(
              "FORBIDDEN",
              err.message,
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              "Proposal not found.",
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("not open")) {
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
