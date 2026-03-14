/**
 * Portfolio REST routes (COMP-010.8).
 *
 * GET /api/v1/portfolios/:userId — full portfolio.
 * GET /api/v1/portfolios/:userId/achievements — achievements only.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Portfolio } from "@syntropy/platform-core";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { PortfolioContext } from "../types/portfolio-context.js";

/** Achievement DTO for API response. */
export interface AchievementDto {
  achievementType: string;
  unlockedAt: string;
}

/** Skill record DTO for API response. */
export interface SkillRecordDto {
  skillName: string;
  level: string;
  evidenceEventIds: string[];
}

/** Full portfolio DTO for API response. */
export interface PortfolioDto {
  userId: string;
  xp: number;
  reputationScore: number;
  skills: SkillRecordDto[];
  achievements: AchievementDto[];
}

function portfolioToDto(portfolio: Portfolio): PortfolioDto {
  return {
    userId: portfolio.userId,
    xp: portfolio.xp,
    reputationScore: portfolio.reputationScore,
    skills: portfolio.skills.map((s) => ({
      skillName: s.skillName,
      level: s.level,
      evidenceEventIds: [...s.evidenceEventIds],
    })),
    achievements: portfolio.achievements.map((a) => ({
      achievementType: a.achievementType,
      unlockedAt:
        a.unlockedAt instanceof Date
          ? a.unlockedAt.toISOString()
          : new Date(a.unlockedAt).toISOString(),
    })),
  };
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function portfolioRoutes(
  fastify: FastifyInstance,
  opts: { portfolio: PortfolioContext }
): Promise<void> {
  const { portfolioRepository } = opts.portfolio;
  const requireAuth = fastify.requireAuth;

  fastify.get<{ Params: { userId: string } }>(
    "/api/v1/portfolios/:userId",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { userId } = request.params;
      const portfolio = await portfolioRepository.findByUserId(userId);
      if (portfolio === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Portfolio not found for user ${userId}`,
            getRequestId(request)
          )
        );
      }
      return reply
        .status(200)
        .send(successEnvelope(portfolioToDto(portfolio), getRequestId(request)));
    }
  );

  fastify.get<{ Params: { userId: string } }>(
    "/api/v1/portfolios/:userId/achievements",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { userId } = request.params;
      const portfolio = await portfolioRepository.findByUserId(userId);
      if (portfolio === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Portfolio not found for user ${userId}`,
            getRequestId(request)
          )
        );
      }
      const achievements = portfolio.achievements.map((a) => ({
        achievementType: a.achievementType,
        unlockedAt:
          a.unlockedAt instanceof Date
            ? a.unlockedAt.toISOString()
            : new Date(a.unlockedAt).toISOString(),
      }));
      return reply
        .status(200)
        .send(
          successEnvelope(
            { achievements },
            getRequestId(request)
          )
        );
    }
  );
}
