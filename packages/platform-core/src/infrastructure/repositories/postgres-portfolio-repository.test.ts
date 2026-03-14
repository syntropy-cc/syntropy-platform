/**
 * Integration tests for PostgresPortfolioRepository (COMP-010.7).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, it, expect } from "vitest";
import { PostgresPortfolioRepository } from "./postgres-portfolio-repository.js";
import type { EventLogClient } from "../../event-log/EventLogClient.js";
import { Portfolio } from "../../domain/portfolio-aggregation/portfolio.js";
import { XPTotal } from "../../domain/portfolio-aggregation/value-objects.js";
import { ReputationScore } from "../../domain/portfolio-aggregation/value-objects.js";
import { createAchievement } from "../../domain/portfolio-aggregation/achievement.js";
import { createSkillRecord } from "../../domain/portfolio-aggregation/skill-record.js";

interface PortfolioRow {
  id: string;
  user_id: string;
  total_xp: number;
  reputation_score: number;
  version: number;
}

function createMockClient(): EventLogClient & {
  portfolios: Map<string, PortfolioRow>;
  achievements: Array<{ portfolio_id: string; achievement_type: string; unlocked_at: Date }>;
  skillRecords: Array<{ portfolio_id: string; skill_name: string; level: string; evidence_event_ids: string[] }>;
} {
  const portfolios = new Map<string, PortfolioRow>();
  const achievements: Array<{ portfolio_id: string; achievement_type: string; unlocked_at: Date }> = [];
  const skillRecords: Array<{ portfolio_id: string; skill_name: string; level: string; evidence_event_ids: string[] }> = [];
  let idCounter = 1;

  return {
    portfolios,
    achievements,
    skillRecords,
    async execute(sql: string, params: unknown[]): Promise<void> {
      const s = sql.trim();
      if (s.startsWith("UPDATE platform_core.portfolios")) {
        const userId = String(params[0]);
        const row = portfolios.get(userId);
        if (!row || row.version !== Number(params[3])) return;
        row.total_xp = Number(params[1]);
        row.reputation_score = Number(params[2]);
        row.version += 1;
      } else if (s.startsWith("DELETE FROM platform_core.achievements")) {
        const pid = String(params[0]);
        for (let i = achievements.length - 1; i >= 0; i--) {
          if (achievements[i].portfolio_id === pid) achievements.splice(i, 1);
        }
      } else if (s.startsWith("DELETE FROM platform_core.skill_records")) {
        const pid = String(params[0]);
        for (let i = skillRecords.length - 1; i >= 0; i--) {
          if (skillRecords[i].portfolio_id === pid) skillRecords.splice(i, 1);
        }
      } else if (s.startsWith("INSERT INTO platform_core.achievements")) {
        achievements.push({
          portfolio_id: String(params[0]),
          achievement_type: String(params[1]),
          unlocked_at: params[2] instanceof Date ? params[2] : new Date(String(params[2])),
        });
      } else if (s.startsWith("INSERT INTO platform_core.skill_records")) {
        const ids = typeof params[3] === "string" ? JSON.parse(params[3]) : params[3];
        skillRecords.push({
          portfolio_id: String(params[0]),
          skill_name: String(params[1]),
          level: String(params[2]),
          evidence_event_ids: Array.isArray(ids) ? ids : [],
        });
      }
    },
    async query<T>(sql: string, params: unknown[]): Promise<T[]> {
      const s = sql.trim();
      if (s.includes("INSERT INTO platform_core.portfolios") && s.includes("RETURNING id")) {
        const id = `p-${idCounter++}`;
        const userId = String(params[0]);
        portfolios.set(userId, {
          id,
          user_id: userId,
          total_xp: Number(params[1]),
          reputation_score: Number(params[2]),
          version: 0,
        });
        return [{ id }] as T[];
      }
      if (s.includes("FROM platform_core.portfolios WHERE user_id")) {
        const userId = String(params[0]);
        const row = portfolios.get(userId);
        return (row ? [row] : []) as T[];
      }
      if (s.includes("FROM platform_core.achievements")) {
        const pid = String(params[0]);
        return achievements.filter((a) => a.portfolio_id === pid).map((a) => ({ achievement_type: a.achievement_type, unlocked_at: a.unlocked_at })) as T[];
      }
      if (s.includes("FROM platform_core.skill_records")) {
        const pid = String(params[0]);
        return skillRecords.filter((r) => r.portfolio_id === pid).map((r) => ({ skill_name: r.skill_name, level: r.level, evidence_event_ids: r.evidence_event_ids })) as T[];
      }
      if (s.includes("UPDATE platform_core.portfolios") && s.includes("RETURNING id")) {
        const userId = String(params[0]);
        const row = portfolios.get(userId);
        if (row && row.version === Number(params[3])) {
          row.total_xp = Number(params[1]);
          row.reputation_score = Number(params[2]);
          row.version += 1;
          return [{ id: row.id }] as T[];
        }
        return [] as T[];
      }
      return [];
    },
  };
}

describe("PostgresPortfolioRepository", () => {
  it("findByUserId returns null when no portfolio exists", async () => {
    const client = createMockClient();
    const repo = new PostgresPortfolioRepository(client);
    const found = await repo.findByUserId("user-1");
    expect(found).toBeNull();
  });

  it("save inserts new portfolio and findByUserId returns it", async () => {
    const client = createMockClient();
    const repo = new PostgresPortfolioRepository(client);

    const portfolio = Portfolio.create({
      userId: "user-1",
      xp: XPTotal.create(100),
      reputationScore: ReputationScore.create(0.5),
      achievements: [createAchievement("first_fragment")],
      skills: [createSkillRecord("typescript", "intermediate", ["evt-1"])],
    });
    await repo.save(portfolio);

    const found = await repo.findByUserId("user-1");
    expect(found).not.toBeNull();
    expect(found!.userId).toBe("user-1");
    expect(found!.xp).toBe(100);
    expect(found!.reputationScore).toBe(0.5);
    expect(found!.achievements).toHaveLength(1);
    expect(found!.achievements[0].achievementType).toBe("first_fragment");
    expect(found!.skills).toHaveLength(1);
    expect(found!.skills[0].skillName).toBe("typescript");
    expect(found!.skills[0].level).toBe("intermediate");
    expect(found!.skills[0].evidenceEventIds).toEqual(["evt-1"]);
  });

  it("save updates existing portfolio and increments version", async () => {
    const client = createMockClient();
    const repo = new PostgresPortfolioRepository(client);

    const p1 = Portfolio.create({
      userId: "user-2",
      xp: XPTotal.create(50),
      reputationScore: ReputationScore.create(0),
      achievements: [],
      skills: [],
    });
    await repo.save(p1);
    const loaded1 = await repo.findByUserId("user-2");
    expect(loaded1!.version).toBe(0);

    const p2 = Portfolio.create({
      userId: "user-2",
      xp: XPTotal.create(150),
      reputationScore: ReputationScore.create(0.2),
      achievements: [...loaded1!.achievements],
      skills: [...loaded1!.skills],
      version: loaded1!.version,
    });
    await repo.save(p2);
    const loaded2 = await repo.findByUserId("user-2");
    expect(loaded2!.xp).toBe(150);
    expect(loaded2!.reputationScore).toBe(0.2);
    expect(loaded2!.version).toBe(1);
  });
});
