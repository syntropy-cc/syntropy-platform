/**
 * Learn content hierarchy REST routes (COMP-015.6).
 *
 * GET /api/v1/learn/careers — list careers.
 * GET /api/v1/learn/careers/:id/tracks — list tracks for career with fog-of-war applied.
 * GET /api/v1/learn/courses/:id — get course by id.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import type { CareerId, CourseId } from "@syntropy/types";
import {
  FogOfWarNavigationService,
  type Course,
} from "@syntropy/learn-package";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { LearnContext } from "../types/learn-context.js";

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Career list item DTO. */
interface CareerDto {
  id: string;
  title: string;
  trackIds: string[];
}

/** Track with fog-of-war applied: unlocked and locked courses. */
interface TrackWithVisibilityDto {
  id: string;
  careerId: string;
  title: string;
  courseIds: string[];
  unlocked: Array<{ courseId: string; title: string; orderPosition: number }>;
  locked: Array<{ courseId: string; title: string; orderPosition: number; reason: string }>;
}

/** Course detail DTO. */
interface CourseDto {
  id: string;
  trackId: string;
  title: string;
  orderPosition: number;
  fragmentIds: string[];
  status: string;
}

export async function learnRoutes(
  fastify: FastifyInstance,
  opts: { learn: LearnContext }
): Promise<void> {
  const {
    careerRepository,
    trackRepository,
    courseRepository,
    getCompletedCourseIds,
  } = opts.learn;
  const requireAuth = fastify.requireAuth;
  const fogOfWar = new FogOfWarNavigationService();

  fastify.get<{ Params: Record<string, never> }>(
    "/api/v1/learn/careers",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const careers = await careerRepository.listAll();
      const data: CareerDto[] = careers.map((c) => ({
        id: c.careerId,
        title: c.title,
        trackIds: [...c.tracks],
      }));
      return reply
        .status(200)
        .send(successEnvelope(data, getRequestId(request)));
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/learn/careers/:id/tracks",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const careerId = request.params.id as CareerId;
      const career = await careerRepository.findById(careerId);
      if (career === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Career not found: ${request.params.id}`,
            getRequestId(request)
          )
        );
      }
      const tracks = await trackRepository.listByCareerId(careerId);
      const userId = request.user?.userId ?? "";
      const completedCourseIds = await getCompletedCourseIds(userId);

      const allCourses: Course[] = [];
      for (const track of tracks) {
        const courses = await courseRepository.listByTrackId(track.id);
        allCourses.push(...courses);
      }

      const result = fogOfWar.getAccessible(
        career,
        tracks,
        allCourses,
        completedCourseIds
      );

      const trackIdToUnlocked = new Map<string, typeof result.unlocked>();
      const trackIdToLocked = new Map<string, typeof result.locked>();
      for (const u of result.unlocked) {
        const list = trackIdToUnlocked.get(u.trackId) ?? [];
        list.push(u);
        trackIdToUnlocked.set(u.trackId, list);
      }
      for (const l of result.locked) {
        const list = trackIdToLocked.get(l.trackId) ?? [];
        list.push(l);
        trackIdToLocked.set(l.trackId, list);
      }

      const data: TrackWithVisibilityDto[] = tracks.map((track) => ({
        id: track.id,
        careerId: track.careerId,
        title: track.title,
        courseIds: [...track.courseIds],
        unlocked: (trackIdToUnlocked.get(track.id) ?? []).map((u) => ({
          courseId: u.courseId,
          title: u.title,
          orderPosition: u.orderPosition,
        })),
        locked: (trackIdToLocked.get(track.id) ?? []).map((l) => ({
          courseId: l.courseId,
          title: l.title,
          orderPosition: l.orderPosition,
          reason: l.reason,
        })),
      }));

      return reply
        .status(200)
        .send(successEnvelope(data, getRequestId(request)));
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/learn/courses/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const courseId = request.params.id as CourseId;
      const course = await courseRepository.findById(courseId);
      if (course === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Course not found: ${request.params.id}`,
            getRequestId(request)
          )
        );
      }
      const data: CourseDto = {
        id: course.id,
        trackId: course.trackId,
        title: course.title,
        orderPosition: course.orderPosition,
        fragmentIds: [...course.fragmentIds],
        status: course.status,
      };
      return reply
        .status(200)
        .send(successEnvelope(data, getRequestId(request)));
    }
  );
}
