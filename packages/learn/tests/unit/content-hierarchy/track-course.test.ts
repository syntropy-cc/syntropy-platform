/**
 * Unit tests for Track and Course entities (COMP-015.1).
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
import { Track } from "../../../src/domain/content-hierarchy/track.js";

describe("Track", () => {
  it("create builds track with id careerId title and courseIds", () => {
    const id = createTrackId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const careerId = createCareerId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const c1 = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const c2 = createCourseId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");

    const track = Track.create({
      id,
      careerId,
      title: "Full-Stack Web",
      courseIds: [c1, c2],
    });

    expect(track.id).toBe(id);
    expect(track.careerId).toBe(careerId);
    expect(track.title).toBe("Full-Stack Web");
    expect(track.courseIds).toEqual([c1, c2]);
    expect(track.courseIds).toHaveLength(2);
  });

  it("create accepts optional prerequisites and returns them", () => {
    const id = createTrackId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const careerId = createCareerId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const c1 = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const c2 = createCourseId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");

    const track = Track.create({
      id,
      careerId,
      title: "Advanced Track",
      courseIds: [c1, c2],
      prerequisites: [c1],
    });

    expect(track.prerequisites).toEqual([c1]);
    expect(track.prerequisites).toHaveLength(1);
  });

  it("prerequisites default to empty array when not provided", () => {
    const id = createTrackId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");
    const careerId = createCareerId("f6a7b8c9-d0e1-4f0a-8b4c-5d6e7f8a9b0c");
    const c1 = createCourseId("a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d");

    const track = Track.create({
      id,
      careerId,
      title: "Simple Track",
      courseIds: [c1],
    });

    expect(track.prerequisites).toEqual([]);
  });
});

describe("Course", () => {
  it("create builds course with id trackId title orderPosition and fragmentIds", () => {
    const id = createCourseId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");
    const trackId = createTrackId("f6a7b8c9-d0e1-4f0a-8b4c-5d6e7f8a9b0c");
    const f1 = createFragmentId("a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d");

    const course = Course.create({
      id,
      trackId,
      title: "Introduction to React",
      orderPosition: 1,
      fragmentIds: [f1],
    });

    expect(course.id).toBe(id);
    expect(course.trackId).toBe(trackId);
    expect(course.title).toBe("Introduction to React");
    expect(course.orderPosition).toBe(1);
    expect(course.fragmentIds).toEqual([f1]);
    expect(course.fragmentIds).toHaveLength(1);
  });

  it("create defaults status to Draft when not provided", () => {
    const id = createCourseId("b8c9d0e1-f2a3-4b1c-8d5e-6f7a8b9c0d1e");
    const trackId = createTrackId("c9d0e1f2-a3b4-4c2d-8e6f-7a8b9c0d1e2f");

    const course = Course.create({
      id,
      trackId,
      title: "Draft Course",
      orderPosition: 0,
      fragmentIds: [],
    });

    expect(course.status).toBe(CourseStatus.Draft);
  });

  it("create accepts status Published", () => {
    const id = createCourseId("d0e1f2a3-b4c5-4d3e-8f7a-8b9c0d1e2f3a");
    const trackId = createTrackId("e1f2a3b4-c5d6-4e4f-8a8b-9c0d1e2f3a4b");

    const course = Course.create({
      id,
      trackId,
      title: "Published Course",
      orderPosition: 1,
      fragmentIds: [],
      status: CourseStatus.Published,
    });

    expect(course.status).toBe(CourseStatus.Published);
  });

  it("orderPosition enforces ordering of courses within track", () => {
    const trackId = createTrackId("f2a3b4c5-d6e7-4f5a-8b9c-0d1e2f3a4b5c");
    const first = Course.create({
      id: createCourseId("a3b4c5d6-e7f8-4a6b-8c0d-1e2f3a4b5c6d"),
      trackId,
      title: "First",
      orderPosition: 0,
      fragmentIds: [],
    });
    const second = Course.create({
      id: createCourseId("b4c5d6e7-f8a9-4b7c-8d1e-2f3a4b5c6d7e"),
      trackId,
      title: "Second",
      orderPosition: 1,
      fragmentIds: [],
    });

    expect(first.orderPosition).toBe(0);
    expect(second.orderPosition).toBe(1);
  });
});

describe("Career-Track-Course hierarchy", () => {
  it("enforces hierarchy via ids only", () => {
    const careerId = createCareerId("b1c2d3e4-f5a6-4b5c-9d0e-1f2a3b4c5d6e");
    const trackId = createTrackId("c2d3e4f5-a6b7-4c6d-8e1f-2a3b4c5d6e7f");
    const courseId = createCourseId("d3e4f5a6-b7c8-4d7e-8f2a-3b4c5d6e7f8a");

    const course = Course.create({
      id: courseId,
      trackId,
      title: "Course One",
      orderPosition: 0,
      fragmentIds: [],
    });
    const track = Track.create({
      id: trackId,
      careerId,
      title: "Track One",
      courseIds: [course.id],
    });
    const career = Career.create({
      careerId,
      title: "Career One",
      trackIds: [track.id],
    });

    expect(career.tracks[0]).toBe(track.id);
    expect(track.courseIds[0]).toBe(course.id);
    expect(course.trackId).toBe(track.id);
    expect(track.careerId).toBe(career.careerId);
  });
});
