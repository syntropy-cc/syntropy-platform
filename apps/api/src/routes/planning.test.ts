/**
 * API tests for Planning routes (COMP-029.6).
 * Verifies POST/GET tasks, GET goals, POST study-plans/generate, POST mentor-sessions with mock context.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { PlanningContext } from "../types/planning-context.js";
import {
  Task,
  Goal,
  MentorSession,
  StudyPlanService,
  MentorSessionSchedulingService,
  type TaskRepository,
  type GoalRepository,
  type MentorSessionRepository,
  type LearnerProgressPort,
  type MentorAvailabilityPort,
} from "@syntropy/planning";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901230";
const VALID_JWT = "valid-planning-test-jwt";
const CAREER_ID = "career-1";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt)
        throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createInMemoryTaskRepository(): TaskRepository {
  const map = new Map<string, Task>();
  return {
    async save(task: Task) {
      map.set(task.taskId, task);
    },
    async findById(taskId: string) {
      return map.get(taskId) ?? null;
    },
    async findByUserId(userId: string) {
      return [...map.values()].filter((t) => t.userId === userId);
    },
  };
}

function createInMemoryGoalRepository(): GoalRepository {
  const map = new Map<string, Goal>();
  return {
    async save(goal: Goal) {
      map.set(goal.goalId, goal);
    },
    async findById(goalId: string) {
      return map.get(goalId) ?? null;
    },
    async findByUserId(userId: string) {
      return [...map.values()].filter((g) => g.userId === userId);
    },
  };
}

function createInMemoryMentorSessionRepository(): MentorSessionRepository {
  const map = new Map<string, MentorSession>();
  return {
    async save(session: MentorSession) {
      map.set(session.sessionId, session);
    },
    async findById(sessionId: string) {
      return map.get(sessionId) ?? null;
    },
    async findByMentorId(mentorId: string) {
      return [...map.values()].filter((s) => s.mentorId === mentorId);
    },
    async findByLearnerId(learnerId: string) {
      return [...map.values()].filter((s) => s.learnerId === learnerId);
    },
  };
}

function createStubLearnerProgressPort(): LearnerProgressPort {
  return {
    async getProgress(params: { userId: string; careerId: string }) {
      return {
        userId: params.userId,
        careerId: params.careerId,
        accessibleStepIds: ["step-1", "step-2", "step-3"],
        completedStepIds: ["step-1"],
      };
    },
  };
}

function createStubMentorAvailabilityPort(
  available = true
): MentorAvailabilityPort {
  return {
    async isAvailable() {
      return available;
    },
  };
}

function createMockPlanningContext(
  mentorAvailable = true
): PlanningContext {
  const taskRepository = createInMemoryTaskRepository();
  const goalRepository = createInMemoryGoalRepository();
  const mentorSessionRepository = createInMemoryMentorSessionRepository();
  const studyPlanService = new StudyPlanService(
    createStubLearnerProgressPort()
  );
  const mentorSessionSchedulingService = new MentorSessionSchedulingService(
    createStubMentorAvailabilityPort(mentorAvailable)
  );
  return {
    taskRepository,
    goalRepository,
    mentorSessionRepository,
    studyPlanService,
    mentorSessionSchedulingService,
  };
}

describe("planning routes (COMP-029.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const mockContext = createMockPlanningContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      planning: mockContext,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/v1/planning/tasks", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/tasks",
        payload: { title: "My task" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 400 when body is invalid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/tasks",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it("returns 201 with task data when body is valid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/tasks",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { title: "Learn TypeScript" },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data.id).toBe("string");
      expect(body.data.taskId).toBe(body.data.id);
      expect(body.data.title).toBe("Learn TypeScript");
      expect(body.data.status).toBe("todo");
      expect(body.data.userId).toBe(TEST_USER_ID);
      expect(body.meta).toBeDefined();
    });
  });

  describe("GET /api/v1/planning/tasks", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/planning/tasks",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 200 with task list when authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/planning/tasks",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toBeDefined();
    });
  });

  describe("GET /api/v1/planning/goals", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/planning/goals",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 200 with goal list when authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/planning/goals",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toBeDefined();
    });
  });

  describe("POST /api/v1/planning/study-plans/generate", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/study-plans/generate",
        payload: { careerId: CAREER_ID },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 400 when careerId is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/study-plans/generate",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it("returns 200 with study plan when body is valid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/study-plans/generate",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { careerId: CAREER_ID },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.userId).toBe(TEST_USER_ID);
      expect(body.data.careerId).toBe(CAREER_ID);
      expect(Array.isArray(body.data.suggestedPath)).toBe(true);
      expect(body.meta).toBeDefined();
    });
  });

  describe("POST /api/v1/planning/mentor-sessions", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/mentor-sessions",
        payload: {
          mentorId: "mentor-1",
          learnerId: TEST_USER_ID,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          durationMinutes: 30,
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 400 when body is invalid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/mentor-sessions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { mentorId: "m1" },
      });
      expect(res.statusCode).toBe(400);
    });

    it("returns 201 with mentor session when body is valid", async () => {
      const scheduledAt = new Date(Date.now() + 86400000);
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/planning/mentor-sessions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          mentorId: "mentor-1",
          learnerId: TEST_USER_ID,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 30,
        },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data.sessionId).toBe("string");
      expect(body.data.mentorId).toBe("mentor-1");
      expect(body.data.learnerId).toBe(TEST_USER_ID);
      expect(body.data.scheduledAt).toBe(scheduledAt.toISOString());
      expect(body.data.status).toBe("scheduled");
      expect(body.meta).toBeDefined();
    });
  });
});
