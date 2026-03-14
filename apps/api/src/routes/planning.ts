/**
 * Planning REST routes (COMP-029.6).
 *
 * POST /api/v1/planning/tasks — create task (auth).
 * GET  /api/v1/planning/tasks — list tasks for current user (auth).
 * GET  /api/v1/planning/goals — list goals for current user (auth).
 * POST /api/v1/planning/study-plans/generate — generate study plan (auth).
 * POST /api/v1/planning/mentor-sessions — schedule mentor session (auth).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  Task,
  MentorNotAvailableError,
} from "@syntropy/planning";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { PlanningContext } from "../types/planning-context.js";

/** Request body for POST /api/v1/planning/tasks */
interface CreateTaskBody {
  title: string;
}

function isCreateTaskBody(value: unknown): value is CreateTaskBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.title === "string" && o.title.trim().length > 0;
}

/** Request body for POST /api/v1/planning/study-plans/generate */
interface GenerateStudyPlanBody {
  careerId: string;
}

function isGenerateStudyPlanBody(value: unknown): value is GenerateStudyPlanBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.careerId === "string" && o.careerId.trim().length > 0;
}

/** Request body for POST /api/v1/planning/mentor-sessions */
interface CreateMentorSessionBody {
  mentorId: string;
  learnerId: string;
  scheduledAt: string;
  durationMinutes: number;
}

function isCreateMentorSessionBody(
  value: unknown
): value is CreateMentorSessionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.mentorId !== "string" || !o.mentorId.trim()) return false;
  if (typeof o.learnerId !== "string" || !o.learnerId.trim()) return false;
  if (typeof o.scheduledAt !== "string" || !o.scheduledAt.trim()) return false;
  if (typeof o.durationMinutes !== "number" || o.durationMinutes <= 0)
    return false;
  return true;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function planningRoutes(
  fastify: FastifyInstance,
  opts: { planning: PlanningContext }
): Promise<void> {
  const {
    taskRepository,
    goalRepository,
    mentorSessionRepository,
    studyPlanService,
    mentorSessionSchedulingService,
  } = opts.planning;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/planning/tasks",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateTaskBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { title: string }.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      const taskId = randomUUID();
      const task = Task.create({ taskId, userId, title: body.title.trim() });
      await taskRepository.save(task);
      return reply.status(201).send(
        successEnvelope(
          {
            id: task.taskId,
            taskId: task.taskId,
            userId: task.userId,
            title: task.title,
            status: task.status,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get(
    "/api/v1/planning/tasks",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const tasks = await taskRepository.findByUserId(userId);
      return reply.status(200).send(
        successEnvelope(
          tasks.map((t) => ({
            id: t.taskId,
            taskId: t.taskId,
            userId: t.userId,
            title: t.title,
            status: t.status,
          })),
          getRequestId(request)
        )
      );
    }
  );

  fastify.get(
    "/api/v1/planning/goals",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const goals = await goalRepository.findByUserId(userId);
      return reply.status(200).send(
        successEnvelope(
          goals.map((g) => ({
            id: g.goalId,
            goalId: g.goalId,
            userId: g.userId,
            description: g.description,
            dueDate: g.dueDate.toISOString(),
            targetValue: g.targetValue,
            currentValue: g.currentValue,
            status: g.status,
            progress: g.progress,
          })),
          getRequestId(request)
        )
      );
    }
  );

  fastify.post<{ Body: unknown }>(
    "/api/v1/planning/study-plans/generate",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isGenerateStudyPlanBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { careerId: string }.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      const plan = await studyPlanService.generate(
        userId,
        body.careerId.trim()
      );
      return reply.status(200).send(
        successEnvelope(
          {
            id: plan.id,
            userId: plan.userId,
            careerId: plan.careerId,
            suggestedPath: plan.suggestedPath,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.post<{ Body: unknown }>(
    "/api/v1/planning/mentor-sessions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateMentorSessionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { mentorId: string, learnerId: string, scheduledAt: string (ISO), durationMinutes: number }.",
            getRequestId(request)
          )
        );
      }
      const scheduledAt = new Date(body.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "scheduledAt must be a valid ISO 8601 date string.",
            getRequestId(request)
          )
        );
      }
      const sessionId = randomUUID();
      try {
        const session =
          await mentorSessionSchedulingService.schedule({
            sessionId,
            mentorId: body.mentorId.trim(),
            learnerId: body.learnerId.trim(),
            scheduledAt,
            durationMinutes: body.durationMinutes,
          });
        await mentorSessionRepository.save(session);
        return reply.status(201).send(
          successEnvelope(
            {
              sessionId: session.sessionId,
              mentorId: session.mentorId,
              learnerId: session.learnerId,
              scheduledAt: session.scheduledAt.toISOString(),
              status: session.status,
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof MentorNotAvailableError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request),
              { mentorId: err.mentorId }
            )
          );
        }
        throw err;
      }
    }
  );
}
