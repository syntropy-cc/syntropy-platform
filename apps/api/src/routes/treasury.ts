/**
 * Treasury REST routes (COMP-008.8).
 *
 * GET /api/v1/treasury/:institutionId — balance and transaction history.
 * POST /api/v1/treasury/:institutionId/distribute — trigger distribution.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { TreasuryContext } from "../types/treasury-context.js";
import { TreasuryDistributionExecutorError } from "@syntropy/dip-treasury";

/** Response DTO for GET treasury: balance and recent transactions. */
export interface TreasuryBalanceDto {
  institutionId: string;
  accountId: string;
  balance: number;
  history: TreasuryTransactionDto[];
}

export interface TreasuryTransactionDto {
  transactionId: string;
  accountId: string;
  amount: number;
  type: "credit" | "debit";
  sourceEventId?: string;
  createdAt: string;
}

/** Optional body for POST distribute: period for contributor scores. */
interface DistributeBody {
  start?: string;
  end?: string;
}

function isDistributeBody(value: unknown): value is DistributeBody {
  if (value === null || typeof value !== "object") return true;
  const o = value as Record<string, unknown>;
  if (o.start !== undefined && typeof o.start !== "string") return false;
  if (o.end !== undefined && typeof o.end !== "string") return false;
  return true;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function treasuryRoutes(
  fastify: FastifyInstance,
  opts: { treasury: TreasuryContext }
): Promise<void> {
  const {
    accountRepository,
    transactionQuery,
    distributionExecutor,
  } = opts.treasury;
  const requireAuth = fastify.requireAuth;

  fastify.get<{ Params: { institutionId: string } }>(
    "/api/v1/treasury/:institutionId",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { institutionId } = request.params;
      const account = await accountRepository.findByInstitutionId(institutionId);
      if (account == null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Treasury account not found for institution.",
            getRequestId(request)
          )
        );
      }
      const limit = 100;
      const transactions = await transactionQuery.listByAccountId(
        account.accountId,
        limit
      );
      const dto: TreasuryBalanceDto = {
        institutionId: account.institutionId,
        accountId: account.accountId,
        balance: account.avuBalance,
        history: transactions.map((t) => ({
          transactionId: t.transactionId,
          accountId: t.accountId,
          amount: t.amount,
          type: t.type,
          sourceEventId: t.sourceEventId,
          createdAt: t.createdAt.toISOString(),
        })),
      };
      return reply.status(200).send(successEnvelope(dto, getRequestId(request)));
    }
  );

  fastify.post<{
    Params: { institutionId: string };
    Body: unknown;
  }>(
    "/api/v1/treasury/:institutionId/distribute",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { institutionId } = request.params;
      const body = request.body;
      if (body !== undefined && body !== null && !isDistributeBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be optional or { start?: string, end?: string } (ISO dates).",
            getRequestId(request)
          )
        );
      }
      const start = body?.start ? new Date(body.start) : new Date(0);
      const end = body?.end ? new Date(body.end) : new Date();
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "start and end must be valid ISO date strings.",
            getRequestId(request)
          )
        );
      }
      try {
        const result = await distributionExecutor.execute(institutionId, {
          start,
          end,
        });
        return reply.status(200).send(
          successEnvelope(
            {
              allocations: result.allocations,
              totalDistributed: result.totalDistributed,
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof TreasuryDistributionExecutorError) {
          const code =
            err.code === "ACCOUNT_NOT_FOUND"
              ? "NOT_FOUND"
              : err.code === "INSUFFICIENT_BALANCE"
                ? "CONFLICT"
                : "BAD_REQUEST";
          const status =
            err.code === "ACCOUNT_NOT_FOUND"
              ? 404
              : err.code === "INSUFFICIENT_BALANCE"
                ? 409
                : 400;
          return reply.status(status).send(
            errorEnvelope(code, err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );
}
