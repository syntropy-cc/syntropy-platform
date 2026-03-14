/**
 * Learn content hierarchy, fragment, creator tools, and mentorship REST routes (COMP-015.6, COMP-016.7, COMP-017.5, COMP-018.5).
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
 * Creator tools (when context provided):
 *   POST /api/v1/learn/creator/workflows — create workflow.
 *   GET /api/v1/learn/creator/workflows/:id — get workflow.
 *   POST /api/v1/learn/creator/workflows/:id/generate-draft — generate AI draft.
 *   POST /api/v1/learn/creator/workflows/:id/approve — approve phase.
 *   POST /api/v1/learn/creator/workflows/:id/reject — reject phase.
 * Mentorship (when mentorshipService provided):
 *   POST /api/v1/learn/mentorships — propose mentorship.
 *   GET /api/v1/learn/mentorships/:id — get relationship.
 *   PUT /api/v1/learn/mentorships/:id/accept — mentor accepts.
 *   POST /api/v1/learn/mentorships/:id/decline — mentor declines.
 *   POST /api/v1/learn/mentorships/:id/conclude — conclude relationship.
 *   POST /api/v1/learn/mentorships/:id/reviews — submit review.
 * Gallery (when artifactGalleryService provided):
 *   GET /api/v1/learn/users/:id/gallery — get user's artifact gallery.
 * All endpoints require auth; responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import type { CareerId, CourseId, FragmentId } from "@syntropy/types";
import {
  CreatorWorkflow,
  FogOfWarNavigationService,
  Fragment,
  FragmentStatus,
  MentorCapacityExceededError,
  NotMentorError,
  NotReviewerError,
  type Course,
} from "@syntropy/learn-package";
import { createCourseId, createCreatorWorkflowId, createFragmentId, createTrackId } from "@syntropy/types";
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

  // --- Creator tools routes (COMP-017.5) ---

  const {
    creatorWorkflowLoader,
    creatorWorkflowSave,
    approvalService,
    creatorCopilotService,
  } = opts.learn;

  if (
    creatorWorkflowLoader &&
    creatorWorkflowSave &&
    approvalService &&
    creatorCopilotService
  ) {
    /** Body for POST /api/v1/learn/creator/workflows. */
    interface CreateWorkflowBody {
      trackId: string;
    }

    /** Body for POST generate-draft. */
    interface GenerateDraftBody {
      prompt: string;
    }

    /** Body for POST approve/reject. */
    interface ApproveRejectBody {
      comments?: string;
    }

    fastify.post<{ Body: CreateWorkflowBody }>(
      "/api/v1/learn/creator/workflows",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        const { trackId } = request.body ?? {};
        if (!trackId?.trim()) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "trackId is required",
              getRequestId(request)
            )
          );
        }
        const id = createCreatorWorkflowId(randomUUID());
        const workflow = CreatorWorkflow.create({
          id,
          trackId: createTrackId(trackId.trim()),
          creatorId: userId,
          startedAt: new Date(),
        });
        await creatorWorkflowSave.save(workflow);
        return reply.status(201).send(
          successEnvelope(
            {
              id: workflow.id,
              trackId: workflow.trackId,
              creatorId: workflow.creatorId,
              currentPhase: workflow.currentPhase,
              phasesCompleted: [...workflow.phasesCompleted],
              startedAt: workflow.startedAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      }
    );

    fastify.get<{ Params: { id: string } }>(
      "/api/v1/learn/creator/workflows/:id",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const workflowId = createCreatorWorkflowId(request.params.id);
        const workflow = await creatorWorkflowLoader.findById(workflowId);
        if (workflow === null) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Workflow not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(
            {
              id: workflow.id,
              trackId: workflow.trackId,
              creatorId: workflow.creatorId,
              currentPhase: workflow.currentPhase,
              phasesCompleted: [...workflow.phasesCompleted],
              startedAt: workflow.startedAt.toISOString(),
              completedAt: workflow.completedAt?.toISOString() ?? null,
            },
            getRequestId(request)
          )
        );
      }
    );

    fastify.post<{ Params: { id: string }; Body: GenerateDraftBody }>(
      "/api/v1/learn/creator/workflows/:id/generate-draft",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const workflowId = createCreatorWorkflowId(request.params.id);
        const workflow = await creatorWorkflowLoader.findById(workflowId);
        if (workflow === null) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Workflow not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        const prompt = request.body?.prompt ?? "";
        const draft = await creatorCopilotService.generateDraft(workflow, prompt);
        return reply.status(201).send(
          successEnvelope(
            {
              workflowId: draft.workflowId,
              phase: draft.phase,
              content: draft.content,
              agentSessionId: draft.agentSessionId,
              aiGenerated: draft.ai_generated,
              createdAt: draft.createdAt.toISOString(),
            },
            getRequestId(request)
          )
        );
      }
    );

    fastify.post<{ Params: { id: string }; Body: ApproveRejectBody }>(
      "/api/v1/learn/creator/workflows/:id/approve",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        const workflowId = createCreatorWorkflowId(request.params.id);
        try {
          const result = await approvalService.approve(
            workflowId,
            userId,
            request.body?.comments
          );
          return reply.status(200).send(
            successEnvelope(
              {
                recordId: result.record.id,
                phase: result.record.phase,
                decision: result.record.decision,
                nextPhase: result.event.phase,
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof NotReviewerError) {
            return reply.status(403).send(
              errorEnvelope(
                "FORBIDDEN",
                "Reviewer/creator role required to approve",
                getRequestId(request)
              )
            );
          }
          if (err instanceof Error && err.message.includes("Workflow not found")) {
            return reply.status(404).send(
              errorEnvelope(
                "NOT_FOUND",
                `Workflow not found: ${request.params.id}`,
                getRequestId(request)
              )
            );
          }
          if (err instanceof Error && err.message.includes("already at final phase")) {
            return reply.status(400).send(
              errorEnvelope(
                "VALIDATION_ERROR",
                err.message,
                getRequestId(request)
              )
            );
          }
          throw err;
        }
      }
    );

    fastify.post<{ Params: { id: string }; Body: ApproveRejectBody }>(
      "/api/v1/learn/creator/workflows/:id/reject",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        const workflowId = createCreatorWorkflowId(request.params.id);
        try {
          const record = await approvalService.reject(
            workflowId,
            userId,
            request.body?.comments
          );
          return reply.status(200).send(
            successEnvelope(
              {
                recordId: record.id,
                phase: record.phase,
                decision: record.decision,
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof NotReviewerError) {
            return reply.status(403).send(
              errorEnvelope(
                "FORBIDDEN",
                "Reviewer/creator role required to reject",
                getRequestId(request)
              )
            );
          }
          if (err instanceof Error && err.message.includes("Workflow not found")) {
            return reply.status(404).send(
              errorEnvelope(
                "NOT_FOUND",
                `Workflow not found: ${request.params.id}`,
                getRequestId(request)
              )
            );
          }
          throw err;
        }
      }
    );
  }

  // --- Mentorship routes (COMP-018.5) ---

  const { mentorshipService, artifactGalleryService } = opts.learn;

  if (mentorshipService) {
    /** Body for POST /api/v1/learn/mentorships. */
    interface ProposeMentorshipBody {
      mentorId: string;
      learnerId: string;
      trackId: string;
      scopeDescription?: string | null;
    }

    fastify.post<{ Body: ProposeMentorshipBody }>(
      "/api/v1/learn/mentorships",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const body = request.body ?? {};
        if (!body.mentorId?.trim() || !body.learnerId?.trim() || !body.trackId?.trim()) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "mentorId, learnerId, and trackId are required",
              getRequestId(request)
            )
          );
        }
        try {
          const relationship = await mentorshipService.propose({
            mentorId: body.mentorId.trim(),
            learnerId: body.learnerId.trim(),
            trackId: body.trackId.trim(),
            scopeDescription: body.scopeDescription ?? null,
          });
          return reply.status(201).send(
            successEnvelope(
              {
                id: relationship.id,
                mentorId: relationship.mentorId,
                learnerId: relationship.learnerId,
                trackId: relationship.trackId,
                status: relationship.status,
                proposedAt: relationship.proposedAt.toISOString(),
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof Error && err.message.includes("not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          throw err;
        }
      }
    );

    fastify.get<{ Params: { id: string } }>(
      "/api/v1/learn/mentorships/:id",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const relationship = await mentorshipService.findById(request.params.id);
        if (relationship === null) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              `Mentorship not found: ${request.params.id}`,
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(
            {
              id: relationship.id,
              mentorId: relationship.mentorId,
              learnerId: relationship.learnerId,
              trackId: relationship.trackId,
              status: relationship.status,
              scopeDescription: relationship.scopeDescription,
              proposedAt: relationship.proposedAt.toISOString(),
              startedAt: relationship.startedAt?.toISOString() ?? null,
              concludedAt: relationship.concludedAt?.toISOString() ?? null,
            },
            getRequestId(request)
          )
        );
      }
    );

    fastify.put<{ Params: { id: string } }>(
      "/api/v1/learn/mentorships/:id/accept",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        try {
          const relationship = await mentorshipService.accept(
            request.params.id,
            userId
          );
          return reply.status(200).send(
            successEnvelope(
              {
                id: relationship.id,
                status: relationship.status,
                startedAt: relationship.startedAt?.toISOString() ?? null,
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof NotMentorError) {
            return reply.status(403).send(
              errorEnvelope(
                "FORBIDDEN",
                "Only the mentor can accept this relationship",
                getRequestId(request)
              )
            );
          }
          if (err instanceof MentorCapacityExceededError) {
            return reply.status(400).send(
              errorEnvelope(
                "VALIDATION_ERROR",
                (err as Error).message,
                getRequestId(request)
              )
            );
          }
          if (err instanceof Error && err.message.includes("not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          throw err;
        }
      }
    );

    fastify.post<{ Params: { id: string } }>(
      "/api/v1/learn/mentorships/:id/decline",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        try {
          const relationship = await mentorshipService.decline(
            request.params.id,
            userId
          );
          return reply.status(200).send(
            successEnvelope(
              { id: relationship.id, status: relationship.status },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof NotMentorError) {
            return reply.status(403).send(
              errorEnvelope(
                "FORBIDDEN",
                "Only the mentor can decline this relationship",
                getRequestId(request)
              )
            );
          }
          if (err instanceof Error && err.message.includes("not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          throw err;
        }
      }
    );

    fastify.post<{ Params: { id: string } }>(
      "/api/v1/learn/mentorships/:id/conclude",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        try {
          const relationship = await mentorshipService.conclude(
            request.params.id
          );
          return reply.status(200).send(
            successEnvelope(
              {
                id: relationship.id,
                status: relationship.status,
                concludedAt: relationship.concludedAt?.toISOString() ?? null,
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof Error && err.message.includes("not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          if (err instanceof Error && err.message.includes("Only active")) {
            return reply.status(400).send(
              errorEnvelope("VALIDATION_ERROR", err.message, getRequestId(request))
            );
          }
          throw err;
        }
      }
    );

    /** Body for POST /api/v1/learn/mentorships/:id/reviews. */
    interface SubmitReviewBody {
      fragmentId: string;
      rating: number;
      feedback?: string;
    }

    fastify.post<{
      Params: { id: string };
      Body: SubmitReviewBody;
    }>(
      "/api/v1/learn/mentorships/:id/reviews",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const userId = request.user!.userId;
        const body = request.body ?? {};
        if (!body.fragmentId?.trim() || typeof body.rating !== "number") {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "fragmentId and rating (1-5) are required",
              getRequestId(request)
            )
          );
        }
        try {
          const review = await mentorshipService.submitReview({
            relationshipId: request.params.id,
            reviewerId: userId,
            fragmentId: body.fragmentId.trim(),
            rating: body.rating,
            feedback: body.feedback,
          });
          return reply.status(201).send(
            successEnvelope(
              {
                id: review.id,
                relationshipId: review.relationshipId,
                rating: review.rating,
                feedback: review.feedback,
              },
              getRequestId(request)
            )
          );
        } catch (err) {
          if (err instanceof Error && err.message.includes("not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          if (err instanceof Error && (err.message.includes("not the mentor") || err.message.includes("not concluded"))) {
            return reply.status(400).send(
              errorEnvelope("VALIDATION_ERROR", err.message, getRequestId(request))
            );
          }
          if (err instanceof Error && err.message.includes("between 1 and 5")) {
            return reply.status(400).send(
              errorEnvelope("VALIDATION_ERROR", err.message, getRequestId(request))
            );
          }
          throw err;
        }
      }
    );
  }

  if (artifactGalleryService) {
    fastify.get<{ Params: { id: string } }>(
      "/api/v1/learn/users/:id/gallery",
      { preHandler: [requireAuth] },
      async (request, reply) => {
        const gallery = await artifactGalleryService.getGallery(
          request.params.id
        );
        const data = gallery.map((item) => ({
          artifactId: item.artifactId,
          title: item.title,
          creatorId: item.creatorId,
          trackId: item.trackId,
          artifactType: item.artifactType,
          publishedAt: item.publishedAt.toISOString(),
          creatorXp: item.creatorXp ?? null,
          creatorSkillLevel: item.creatorSkillLevel ?? null,
        }));
        return reply.status(200).send(successEnvelope(data, getRequestId(request)));
      }
    );
  }
}
