/**
 * IACP REST routes (COMP-005.8).
 *
 * POST /api/v1/iacp — create IACP (draft, add parties, submit, save).
 * GET /api/v1/iacp/:id — get by id.
 * POST /api/v1/iacp/:id/sign — add signature for authenticated actor.
 * POST /api/v1/iacp/:id/activate — transition to active (after threshold met).
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  IACPRecord,
  IACPStatus,
  createIACPId,
  createIACPParty,
  createSignatureThreshold,
  SignatureCollector,
  InvalidTransitionError,
  DuplicateSignatureError,
} from "@syntropy/dip-iacp";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { DipContext } from "../types/dip-context.js";

/** Response DTO for IACP record (CONV-017 data shape). */
export interface IacpDto {
  id: string;
  type: string;
  status: string;
  institutionId?: string;
  partyActorIds: string[];
}

function recordToDto(record: IACPRecord): IacpDto {
  return {
    id: record.id,
    type: record.type,
    status: record.status,
    institutionId: record.institutionId,
    partyActorIds: record.parties.map((p) => p.actorId),
  };
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/iacp. */
interface CreateIacpBody {
  type: string;
  institutionId?: string;
  partyActorIds: string[];
}

function isCreateIacpBody(value: unknown): value is CreateIacpBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.type !== "string") return false;
  if (o.partyActorIds !== undefined) {
    if (!Array.isArray(o.partyActorIds)) return false;
    if (!o.partyActorIds.every((x: unknown) => typeof x === "string")) return false;
  } else {
    const body = o as unknown as CreateIacpBody;
    body.partyActorIds = [];
  }
  return true;
}

/** Body for POST /api/v1/iacp/:id/sign. */
interface SignBody {
  signature: string;
}

function isSignBody(value: unknown): value is SignBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.signature === "string";
}

export async function iacpRoutes(
  fastify: FastifyInstance,
  opts: { dip: DipContext }
): Promise<void> {
  const { iacpRepository, iacpEngine, iacpEventPublisher } = opts.dip;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/iacp",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isCreateIacpBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { type: string, institutionId?: string, partyActorIds: string[] }.",
            getRequestId(request)
          )
        );
      }
      const id = createIACPId(randomUUID());
      let record = IACPRecord.draft({
        id,
        type: body.type,
        institutionId: body.institutionId,
      });
      for (const actorId of body.partyActorIds) {
        record = record.addParty(createIACPParty({ actorId, role: "signer" }));
      }
      record = record.submit();
      await iacpRepository.save(record);
      if (iacpEventPublisher) {
        await iacpEventPublisher.publishCreated({
          eventType: "dip.iacp.created",
          iacpId: record.id,
          type: record.type,
          institutionId: record.institutionId,
          timestamp: new Date().toISOString(),
        });
      }
      return reply.status(201).send(
        successEnvelope(recordToDto(record), getRequestId(request))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/iacp/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const record = await iacpRepository.findById(createIACPId(id));
      if (!record) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "IACP record not found.",
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope(recordToDto(record), getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/v1/iacp/:id/sign",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const body = request.body;
      if (body === undefined || body === null || !isSignBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { signature: string }.",
            getRequestId(request)
          )
        );
      }
      const actorId = request.user!.actorId;
      const record = await iacpRepository.findById(createIACPId(id));
      if (!record) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "IACP record not found.",
            getRequestId(request)
          )
        );
      }
      if (record.status !== IACPStatus.PendingSignatures) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "IACP record is not in pending_signatures status.",
            getRequestId(request)
          )
        );
      }
      const party = record.parties.find((p) => p.actorId === actorId);
      if (!party) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "You are not a party to this IACP record.",
            getRequestId(request)
          )
        );
      }
      try {
        const threshold = createSignatureThreshold(
          record.parties.length,
          record.parties.length
        );
        let collector = new SignatureCollector(threshold);
        for (const p of record.parties) {
          if (p.signature) collector = collector.addSignature(p, p.signature);
        }
        collector = collector.addSignature(party, body.signature);
        const updatedParties = record.parties.map((p) =>
          p.actorId === actorId
            ? createIACPParty({
                actorId: p.actorId,
                role: p.role,
                signature: body.signature,
              })
            : p
        );
        let updatedRecord = IACPRecord.fromPersistence({
          id: record.id,
          type: record.type,
          parties: updatedParties,
          status: record.status,
          institutionId: record.institutionId,
        });
        if (collector.isThresholdMet()) {
          updatedRecord = updatedRecord.activate();
          if (iacpEventPublisher) {
            await iacpEventPublisher.publishActivated({
              eventType: "dip.iacp.activated",
              iacpId: updatedRecord.id,
              type: updatedRecord.type,
              institutionId: updatedRecord.institutionId,
              timestamp: new Date().toISOString(),
            });
          }
        }
        await iacpRepository.save(updatedRecord);
        return reply.status(200).send(
          successEnvelope(recordToDto(updatedRecord), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof DuplicateSignatureError) {
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

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/iacp/:id/activate",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const record = await iacpRepository.findById(createIACPId(id));
      if (!record) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "IACP record not found.",
            getRequestId(request)
          )
        );
      }
      if (record.status !== IACPStatus.PendingSignatures) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "IACP record is not in pending_signatures status.",
            getRequestId(request)
          )
        );
      }
      const threshold = createSignatureThreshold(
        record.parties.length,
        record.parties.length
      );
      let collector = new SignatureCollector(threshold);
      for (const p of record.parties) {
        if (p.signature) collector = collector.addSignature(p, p.signature);
      }
      if (!collector.isThresholdMet()) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Signature threshold not met; cannot activate.",
            getRequestId(request)
          )
        );
      }
      try {
        if (iacpEngine) {
          const result = await iacpEngine.evaluate(record);
          if (!result.allowed) {
            return reply.status(403).send(
              errorEnvelope(
                "FORBIDDEN",
                result.reason ?? "Governance evaluation denied activation.",
                getRequestId(request)
              )
            );
          }
        }
        const activated = record.activate();
        await iacpRepository.save(activated);
        if (iacpEventPublisher) {
          await iacpEventPublisher.publishActivated({
            eventType: "dip.iacp.activated",
            iacpId: activated.id,
            type: activated.type,
            institutionId: activated.institutionId,
            timestamp: new Date().toISOString(),
          });
        }
        return reply.status(200).send(
          successEnvelope(recordToDto(activated), getRequestId(request))
        );
      } catch (err) {
        if (err instanceof InvalidTransitionError) {
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
}
