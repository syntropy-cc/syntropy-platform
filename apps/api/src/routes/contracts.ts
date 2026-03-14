/**
 * Contract REST routes (COMP-004.6).
 *
 * POST /api/v1/contracts — create contract from DSL.
 * GET /api/v1/contracts/:id — get contract by id.
 * POST /api/v1/contracts/:id/evaluate — evaluate contract with context.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { ContractDSLParseError } from "@syntropy/dip-contracts";
import type { ContractClause } from "@syntropy/dip-contracts";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { DipContext } from "../types/dip-context.js";

/** Response DTO for GovernanceContract (CONV-017 data shape). */
export interface ContractDto {
  id: string;
  institutionId: string;
  clauses: ContractClause[];
}

function contractToDto(contract: { id: string; institutionId: string; clauses: readonly ContractClause[] }): ContractDto {
  return {
    id: contract.id,
    institutionId: contract.institutionId,
    clauses: [...contract.clauses],
  };
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/contracts. */
interface CreateContractBody {
  dsl: string;
}

function isCreateContractBody(value: unknown): value is CreateContractBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.dsl === "string";
}

/** Body for POST /api/v1/contracts/:id/evaluate — matches EvaluationContext. */
interface EvaluateBody {
  institutionId: string;
  hasPublicRecord?: boolean;
  disclosedItems?: string[];
  participationPercent?: number;
  currentParticipants?: number;
  totalEligible?: number;
  vetoHolderHasVetoed?: boolean;
  approvalPercent?: number;
  quorumReached?: boolean;
}

function isEvaluateBody(value: unknown): value is EvaluateBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.institutionId === "string";
}

export async function contractRoutes(
  fastify: FastifyInstance,
  opts: { dip: DipContext }
): Promise<void> {
  const { contractRepository, smartContractEvaluator, contractDSLParser } = opts.dip;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/contracts",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateContractBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { dsl: string }.",
            getRequestId(request)
          )
        );
      }
      try {
        const contract = contractDSLParser.parse(body.dsl);
        await contractRepository.save(contract);
        return reply.status(201).send(
          successEnvelope(contractToDto(contract), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof ContractDSLParseError) {
          return reply.status(400).send(
            errorEnvelope(
              "BAD_REQUEST",
              err.message,
              getRequestId(request),
              err.message
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/contracts/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const contract = await contractRepository.findById(id);
      if (!contract) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Contract not found.",
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope(contractToDto(contract), getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/v1/contracts/:id/evaluate",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const body = request.body;
      if (body === undefined || body === null || !isEvaluateBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must include { institutionId: string }.",
            getRequestId(request)
          )
        );
      }
      const contract = await contractRepository.findById(id);
      if (!contract) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Contract not found.",
            getRequestId(request)
          )
        );
      }
      const context = {
        institutionId: body.institutionId,
        hasPublicRecord: body.hasPublicRecord,
        disclosedItems: body.disclosedItems,
        participationPercent: body.participationPercent,
        currentParticipants: body.currentParticipants,
        totalEligible: body.totalEligible,
        vetoHolderHasVetoed: body.vetoHolderHasVetoed,
        approvalPercent: body.approvalPercent,
        quorumReached: body.quorumReached,
      };
      const result = smartContractEvaluator.evaluate(contract, context);
      return reply.status(200).send(
        successEnvelope(
          { permitted: result.permitted, ...(result.details !== undefined && { details: result.details }) },
          getRequestId(request)
        )
      );
    }
  );
}
