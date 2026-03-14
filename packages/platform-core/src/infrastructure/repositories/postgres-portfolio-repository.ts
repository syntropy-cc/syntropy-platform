/**
 * PostgreSQL implementation of PortfolioRepository (COMP-010.7).
 * Architecture: Platform Core — Portfolio Aggregation, PAT-004.
 */

import type { EventLogClient } from "../../event-log/EventLogClient.js";
import type { PortfolioRepository } from "../../domain/portfolio-aggregation/ports/portfolio-repository.js";
import { Portfolio } from "../../domain/portfolio-aggregation/portfolio.js";
import { XPTotal } from "../../domain/portfolio-aggregation/value-objects.js";
import { ReputationScore } from "../../domain/portfolio-aggregation/value-objects.js";
import { createAchievement } from "../../domain/portfolio-aggregation/achievement.js";
import { createSkillRecord } from "../../domain/portfolio-aggregation/skill-record.js";
import type { SkillLevel } from "../../domain/portfolio-aggregation/value-objects.js";

const SELECT_PORTFOLIO = `
  SELECT id, user_id, total_xp, reputation_score, version
  FROM platform_core.portfolios WHERE user_id = $1
`;

const SELECT_ACHIEVEMENTS = `
  SELECT achievement_type, unlocked_at FROM platform_core.achievements
  WHERE portfolio_id = $1 ORDER BY unlocked_at ASC
`;

const SELECT_SKILL_RECORDS = `
  SELECT skill_name, level, evidence_event_ids FROM platform_core.skill_records
  WHERE portfolio_id = $1 ORDER BY skill_name ASC
`;

const INSERT_PORTFOLIO = `
  INSERT INTO platform_core.portfolios (user_id, total_xp, reputation_score, version, updated_at)
  VALUES ($1, $2, $3, 0, now())
  RETURNING id
`;

const UPDATE_PORTFOLIO = `
  UPDATE platform_core.portfolios
  SET total_xp = $2, reputation_score = $3, version = version + 1, updated_at = now()
  WHERE user_id = $1 AND version = $4
  RETURNING id
`;

const DELETE_ACHIEVEMENTS = `DELETE FROM platform_core.achievements WHERE portfolio_id = $1`;
const DELETE_SKILL_RECORDS = `DELETE FROM platform_core.skill_records WHERE portfolio_id = $1`;

const INSERT_ACHIEVEMENT = `
  INSERT INTO platform_core.achievements (portfolio_id, achievement_type, unlocked_at)
  VALUES ($1, $2, $3)
`;

const INSERT_SKILL_RECORD = `
  INSERT INTO platform_core.skill_records (portfolio_id, skill_name, level, evidence_event_ids)
  VALUES ($1, $2, $3, $4::jsonb)
`;

interface PortfolioRow {
  id: string;
  user_id: string;
  total_xp: number;
  reputation_score: number;
  version: number;
}

export class PostgresPortfolioRepository implements PortfolioRepository {
  constructor(private readonly client: EventLogClient) {}

  async findByUserId(userId: string): Promise<Portfolio | null> {
    const rows = await this.client.query<PortfolioRow>(SELECT_PORTFOLIO.trim(), [userId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const portfolioId = row.id;

    const achievementRows = await this.client.query<{ achievement_type: string; unlocked_at: Date }>(
      SELECT_ACHIEVEMENTS.trim(),
      [portfolioId]
    );
    const achievements = achievementRows.map((a) =>
      createAchievement(a.achievement_type, a.unlocked_at instanceof Date ? a.unlocked_at : new Date(a.unlocked_at))
    );

    const skillRows = await this.client.query<{
      skill_name: string;
      level: string;
      evidence_event_ids: string[] | unknown;
    }>(SELECT_SKILL_RECORDS.trim(), [portfolioId]);
    const skills = skillRows.map((s) => {
      const ids = Array.isArray(s.evidence_event_ids)
        ? (s.evidence_event_ids as string[])
        : [];
      return createSkillRecord(s.skill_name, s.level as SkillLevel, ids);
    });

    return Portfolio.create({
      userId: row.user_id,
      xp: XPTotal.create(row.total_xp),
      reputationScore: ReputationScore.create(Number(row.reputation_score)),
      achievements,
      skills,
      version: row.version,
    });
  }

  async save(portfolio: Portfolio): Promise<void> {
    const existing = await this.client.query<PortfolioRow>(SELECT_PORTFOLIO.trim(), [portfolio.userId]);

    const xp = portfolio.xp;
    const rep = portfolio.reputationScore;

    if (existing.length === 0) {
      const inserted = await this.client.query<{ id: string }>(INSERT_PORTFOLIO.trim(), [
        portfolio.userId,
        xp,
        rep,
      ]);
      const portfolioId = inserted[0].id;
      for (const a of portfolio.achievements) {
        await this.client.execute(INSERT_ACHIEVEMENT.trim(), [
          portfolioId,
          a.achievementType,
          a.unlockedAt instanceof Date ? a.unlockedAt : new Date(a.unlockedAt),
        ]);
      }
      for (const s of portfolio.skills) {
        await this.client.execute(INSERT_SKILL_RECORD.trim(), [
          portfolioId,
          s.skillName,
          s.level,
          JSON.stringify(s.evidenceEventIds),
        ]);
      }
      return;
    }

    const row = existing[0];
    const updated = await this.client.query<{ id: string }>(
      UPDATE_PORTFOLIO.trim(),
      [portfolio.userId, xp, rep, portfolio.version]
    );
    if (!updated || updated.length === 0) {
      throw new Error(
        `Optimistic lock failure saving portfolio for user ${portfolio.userId} (version ${portfolio.version})`
      );
    }

    const portfolioId = row.id;
    await this.client.execute(DELETE_ACHIEVEMENTS.trim(), [portfolioId]);
    await this.client.execute(DELETE_SKILL_RECORDS.trim(), [portfolioId]);
    for (const a of portfolio.achievements) {
      await this.client.execute(INSERT_ACHIEVEMENT.trim(), [
        portfolioId,
        a.achievementType,
        a.unlockedAt instanceof Date ? a.unlockedAt : new Date(a.unlockedAt),
      ]);
    }
    for (const s of portfolio.skills) {
      await this.client.execute(INSERT_SKILL_RECORD.trim(), [
        portfolioId,
        s.skillName,
        s.level,
        JSON.stringify(s.evidenceEventIds),
      ]);
    }
  }
}
