/**
 * Integration tests for Planning repositories (COMP-029.5).
 * Uses real Postgres via Testcontainers. Run with PLANNING_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Task } from "../../src/domain/task.js";
import { Goal } from "../../src/domain/goal.js";
import { PostgresTaskRepository } from "../../src/infrastructure/repositories/postgres-task-repository.js";
import { PostgresGoalRepository } from "../../src/infrastructure/repositories/postgres-goal-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260330000000_planning.sql"),
    "utf8"
  );
  await pool.query(sql);
}

const describeIntegration =
  process.env.PLANNING_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("Planning repository (COMP-029.5)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let taskRepo: PostgresTaskRepository;
  let goalRepo: PostgresGoalRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
    await runMigrations(pool, getMigrationsDir());
    taskRepo = new PostgresTaskRepository(pool);
    goalRepo = new PostgresGoalRepository(pool);
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("saves and finds task by id", async () => {
    const task = Task.create({
      taskId: "task-int-1",
      userId: "user-a",
      title: "Implement feature",
    });
    await taskRepo.save(task);

    const found = await taskRepo.findById("task-int-1");
    expect(found).not.toBeNull();
    expect(found!.taskId).toBe("task-int-1");
    expect(found!.userId).toBe("user-a");
    expect(found!.title).toBe("Implement feature");
    expect(found!.status).toBe("todo");
  });

  it("saves updated task and finds by id", async () => {
    let task = Task.create({
      taskId: "task-int-2",
      userId: "user-b",
      title: "Review PR",
    });
    await taskRepo.save(task);
    task = task.start();
    await taskRepo.save(task);

    const found = await taskRepo.findById("task-int-2");
    expect(found).not.toBeNull();
    expect(found!.status).toBe("in_progress");
  });

  it("finds tasks by user id", async () => {
    const list = await taskRepo.findByUserId("user-a");
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((t) => t.taskId === "task-int-1")).toBe(true);
  });

  it("returns null when task not found", async () => {
    const found = await taskRepo.findById("nonexistent-task");
    expect(found).toBeNull();
  });

  it("saves and finds goal by id", async () => {
    const goal = Goal.create({
      goalId: "goal-int-1",
      userId: "user-a",
      description: "Complete track",
      dueDate: new Date("2025-12-31"),
      targetValue: 100,
    });
    await goalRepo.save(goal);

    const found = await goalRepo.findById("goal-int-1");
    expect(found).not.toBeNull();
    expect(found!.goalId).toBe("goal-int-1");
    expect(found!.userId).toBe("user-a");
    expect(found!.description).toBe("Complete track");
    expect(found!.targetValue).toBe(100);
    expect(found!.currentValue).toBe(0);
    expect(found!.status).toBe("active");
  });

  it("saves goal after checkAchievement and finds updated", async () => {
    let goal = Goal.create({
      goalId: "goal-int-2",
      userId: "user-b",
      description: "Hit target",
      dueDate: new Date("2025-06-01"),
      targetValue: 10,
    });
    await goalRepo.save(goal);
    goal = goal.checkAchievement(10);
    await goalRepo.save(goal);

    const found = await goalRepo.findById("goal-int-2");
    expect(found).not.toBeNull();
    expect(found!.status).toBe("achieved");
    expect(found!.currentValue).toBe(10);
  });
});
