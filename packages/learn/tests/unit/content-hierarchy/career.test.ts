/**
 * Unit tests for Career aggregate (COMP-015.1).
 */

import { createCareerId, createTrackId } from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { Career } from "../../../src/domain/content-hierarchy/career.js";

describe("Career", () => {
  it("create builds career with careerId title and trackIds", () => {
    const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const t1 = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const t2 = createTrackId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");

    const career = Career.create({
      careerId,
      title: "Software Engineering",
      trackIds: [t1, t2],
    });

    expect(career.careerId).toBe(careerId);
    expect(career.title).toBe("Software Engineering");
    expect(career.tracks).toEqual([t1, t2]);
    expect(career.tracks).toHaveLength(2);
  });

  it("tracks returns readonly copy of track ids", () => {
    const careerId = createCareerId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");
    const t1 = createTrackId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");

    const career = Career.create({
      careerId,
      title: "Data Science",
      trackIds: [t1],
    });

    const tracks = career.tracks;
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toBe(t1);
  });
});
