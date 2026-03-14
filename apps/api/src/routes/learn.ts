/**
 * Learn content hierarchy and fragment REST routes (COMP-015.6, COMP-016.7).
 *
 * GET /api/v1/learn/careers — list careers.
 * GET /api/v1/learn/careers/:id/tracks — list tracks with fog-of-war.
 * GET /api/v1/learn/courses/:id — get course by id.
 * POST /api/v1/learn/fragments — create draft fragment.
 * GET /api/v1/learn/fragments/:id — get fragment by id.
 * POST /api/v1/learn/fragments/:id/complete — learner marks complete.
 * POST /api/v1/learn/fragments/:id/submit — creator submits for review.
 * POST /api/v1/learn/fragments/:id/approve — reviewer approves.
 * POST /api/v1/learn/fragments/:id/reject — reviewer rejects with reason.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import type { CareerId, CourseId, FragmentId } from "@syntropy/types";
import {
  FogOfWarNavigationService,
  Fragment,
  FragmentStatus,
  NotReviewerError,
  type Course,
} from "@syntropy/learn-package";
import { createCourseId, createFragmentId } from "@syntropy/types";
import { randomUUID } from "node:crypto";
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

/** Body for POST /api/v1/learn/fragments. */
interface CreateFragmentBody {
  courseId: string;
  title: string;
}

/** Body for POST /api/v1/learn/fragments/:id/reject. */
interface RejectFragmentBody {
  reason: string;
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
    fragmentRepository,
    fragmentReviewService,
    markFragmentComplete,
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
        completedCourseIds as CourseId[]
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

  // --- Fragment routes (COMP-016.7) ---

  fastify.post<{ Body: CreateFragmentBody }>(
    "/api/v1/learn/fragments",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const { courseId, title } = request.body;
      if (!courseId || !title?.trim()) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "courseId and title are required",
            getRequestId(request)
          )
        );
      }
      const id = createFragmentId(randomUUID());
      const fragment = Fragment.create({
        id,
        courseId: createCourseId(courseId),
        creatorId: userId,
        title: title.trim(),
      });
      await fragmentRepository.save(fragment);
      return reply.status(201).send(
        successEnvelope(
          {
            id: fragment.id,
            courseId: fragment.courseId,
            creatorId: fragment.creatorId,
            title: fragment.title,
            status: fragment.status,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/learn/fragments/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const fragmentId = request.params.id as FragmentId;
      const fragment = await fragmentRepository.findById(fragmentId);
      if (fragment === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Fragment not found: ${request.params.id}`,
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope(
          {
            id: fragment.id,
            courseId: fragment.courseId,
            creatorId: fragment.creatorId,
            title: fragment.title,
            status: fragment.status,
            problemContent: fragment.problemSection.content,
            theoryContent: fragment.theorySection.content,
            artifactContent: fragment.artifactSection.content,
            publishedArtifactId: fragment.publishedArtifactId,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/learn/fragments/:id/complete",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const fragmentId = request.params.id as FragmentId;
      const fragment = await fragmentRepository.findById(fragmentId);
      if (fragment === null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `Fragment not found: ${request.params.id}`,
            getRequestId(request)
          )
        );
      }
      if (fragment.status !== FragmentStatus.Published) {
        return reply.status(400).send(
          errorEnvelope(
            "VALIDATION_ERROR",
            "Only published fragments can be completed",
            getRequestId(request)
          )
        );
      }
      await markFragmentComplete(userId, fragmentId);
      return reply.status(200).send(
        successEnvelope({ ok: true }, getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/learn/fragments/:id/submit",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const fragmentId = request.params.id as FragmentId;
      try {
        await fragmentReviewService.submit(fragmentId);
      } catch (err) {
        if (err instanceof Error && err.message.includes("not found")) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Fragment not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
      return reply.status(200).send(
        successEnvelope({ ok: true }, getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/learn/fragments/:id/approve",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const fragmentId = request.params.id as FragmentId;
      try {
        await fragmentReviewService.approve(fragmentId, userId);
      } catch (err) {
        if (err instanceof NotReviewerError) {
          return reply.status(403).send(
            errorEnvelope(
              "FORBIDDEN",
              "Reviewer role required to approve fragments",
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Fragment not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
      return reply.status(200).send(
        successEnvelope({ ok: true }, getRequestId(request))
      );
    }
  );

  fastify.post<{ Params: { id: string }; Body: RejectFragmentBody }>(
    "/api/v1/learn/fragments/:id/reject",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const fragmentId = request.params.id as FragmentId;
      const reason = request.body?.reason ?? "";
      try {
        await fragmentReviewService.reject(fragmentId, reason, userId);
      } catch (err) {
        if (err instanceof NotReviewerError) {
          return reply.status(403).send(
            errorEnvelope(
              "FORBIDDEN",
              "Reviewer role required to reject fragments",
              getRequestId(request)
            )
          );
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Fragment not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
      return reply.status(200).send(
        successEnvelope({ ok: true }, getRequestId(request))
      );
    }
  );
}
