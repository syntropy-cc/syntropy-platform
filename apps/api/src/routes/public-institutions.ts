/**
 * Public institution routes for Institutional Site (COMP-036.1).
 * No auth; read-only. Used by apps/platform for ISR (institutions pages).
 *
 * GET /api/v1/public/institutions — list top institution slugs (for generateStaticParams).
 * GET /api/v1/public/institutions/:slug — institution profile by slug (id).
 */

import type { FastifyInstance } from "fastify";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { GovernanceContext } from "../types/governance-context.js";

function getRequestId(request: { correlationId?: string }): string | undefined {
  return request.correlationId;
}

/** Public institution profile (no auth). */
export interface PublicInstitutionDto {
  institutionId: string;
  name: string;
  status: string;
  proposalCount: number;
}

/** List response: slugs for generateStaticParams. */
export interface PublicInstitutionListDto {
  slugs: string[];
}

export async function publicInstitutionsRoutes(
  fastify: FastifyInstance,
  opts: { governance: GovernanceContext }
): Promise<void> {
  const { governanceQueryService } = opts.governance;
  const institutionRepo = opts.governance.institutionRepo as {
    findById(id: string): Promise<{ institutionId: string } | null>;
    findAll?(limit: number): Promise<{ institutionId: string }[]>;
  };

  fastify.get<{ Reply: { data: PublicInstitutionListDto } }>(
    "/api/v1/public/institutions",
    async (request, reply) => {
      const slugs: string[] = [];
      if (typeof institutionRepo.findAll === "function") {
        const list = await institutionRepo.findAll(100);
        slugs.push(...list.map((i) => i.institutionId));
      }
      return reply
        .status(200)
        .send(successEnvelope({ slugs }, getRequestId(request)));
    }
  );

  fastify.get<{ Params: { slug: string } }>(
    "/api/v1/public/institutions/:slug",
    async (request, reply) => {
      const { slug } = request.params;
      const summary = await governanceQueryService.getInstitutionSummary(slug);
      if (!summary) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Institution not found.",
            getRequestId(request)
          )
        );
      }
      const dto: PublicInstitutionDto = {
        institutionId: summary.institutionId,
        name: summary.name,
        status: summary.status,
        proposalCount: summary.proposalCount,
      };
      return reply
        .status(200)
        .send(successEnvelope(dto, getRequestId(request)));
    }
  );
}
