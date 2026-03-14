/**
 * Unit tests for FogOfWarNavigationService (COMP-015.3).
 */

import {
  createCareerId,
  createCourseId,
  createFragmentId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { Career } from "../../../src/domain/content-hierarchy/career.js";
import { Course } from "../../../src/domain/content-hierarchy/course.js";
import { CourseStatus } from "../../../src/domain/content-hierarchy/course-status.js";
import { FogOfWarNavigationService } from "../../../src/domain/content-hierarchy/services/fog-of-war-navigation-service.js";
import { Track } from "../../../src/domain/content-hierarchy/track.js";

const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
const course1Id = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
const course2Id = createCourseId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");
const course3Id = createCourseId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");

function makeCareer(): Career {
  return Career.create({
    careerId,
    title: "Software Engineering",
    trackIds: [trackId],
  });
}

function makeTrack(): Track {
  return Track.create({
    id: trackId,
    careerId,
    title: "Full-Stack Web",
    courseIds: [course1Id, course2Id, course3Id],
  });
}

function makeCourses(): Course[] {
  const f1 = createFragmentId("f1a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b4c");
  return [
    Course.create({
      id: course1Id,
      trackId,
      title: "Intro to Web",
      orderPosition: 0,
      fragmentIds: [f1],
      status: CourseStatus.Published,
    }),
    Course.create({
      id: course2Id,
      trackId,
      title: "Frontend Basics",
      orderPosition: 1,
      fragmentIds: [],
      status: CourseStatus.Published,
    }),
    Course.create({
      id: course3Id,
      trackId,
      title: "Backend Basics",
      orderPosition: 2,
      fragmentIds: [],
      status: CourseStatus.Published,
    }),
  ];
}

describe("FogOfWarNavigationService", () => {
  const service = new FogOfWarNavigationService();

  it("returns only first course unlocked when no progress", () => {
    const career = makeCareer();
    const tracks = [makeTrack()];
    const courses = makeCourses();
    const completedCourseIds = new Set<string>();

    const result = service.getAccessible(career, tracks, courses, completedCourseIds);

    expect(result.unlocked).toHaveLength(1);
    expect(result.unlocked[0].courseId).toBe(course1Id);
    expect(result.unlocked[0].title).toBe("Intro to Web");
    expect(result.locked).toHaveLength(2);
    expect(result.locked[0].courseId).toBe(course2Id);
    expect(result.locked[0].reason).toContain("Intro to Web");
    expect(result.locked[1].courseId).toBe(course3Id);
  });

  it("unlocks second course when first is completed", () => {
    const career = makeCareer();
    const tracks = [makeTrack()];
    const courses = makeCourses();
    const completedCourseIds = new Set([course1Id]);

    const result = service.getAccessible(career, tracks, courses, completedCourseIds);

    expect(result.unlocked).toHaveLength(2);
    expect(result.unlocked[0].courseId).toBe(course1Id);
    expect(result.unlocked[1].courseId).toBe(course2Id);
    expect(result.locked).toHaveLength(1);
    expect(result.locked[0].courseId).toBe(course3Id);
    expect(result.locked[0].reason).toContain("Frontend Basics");
  });

  it("unlocks all courses when all completed", () => {
    const career = makeCareer();
    const tracks = [makeTrack()];
    const courses = makeCourses();
    const completedCourseIds = new Set([course1Id, course2Id, course3Id]);

    const result = service.getAccessible(career, tracks, courses, completedCourseIds);

    expect(result.unlocked).toHaveLength(3);
    expect(result.locked).toHaveLength(0);
  });

  it("accepts completedCourseIds as array", () => {
    const career = makeCareer();
    const tracks = [makeTrack()];
    const courses = makeCourses();
    const completedCourseIds = [course1Id];

    const result = service.getAccessible(career, tracks, courses, completedCourseIds);

    expect(result.unlocked).toHaveLength(2);
    expect(result.locked).toHaveLength(1);
  });

  it("includes lock reason for locked courses", () => {
    const career = makeCareer();
    const tracks = [makeTrack()];
    const courses = makeCourses();
    const completedCourseIds = new Set<string>();

    const result = service.getAccessible(career, tracks, courses, completedCourseIds);

    expect(result.locked[0]).toMatchObject({
      courseId: course2Id,
      trackId,
      title: "Frontend Basics",
      orderPosition: 1,
    });
    expect(result.locked[0].reason).toBe('Complete "Intro to Web" first');
  });
});
