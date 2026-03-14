/**
 * Unit tests for ArtifactGalleryService (COMP-018.3).
 */

import { createTrackId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { ArtifactGalleryService } from "../../../src/application/artifact-gallery-service.js";
import type {
  ArtifactQueryPort,
  PortfolioQueryPort,
} from "../../../src/application/ports/artifact-gallery-ports.js";

const TRACK_ID = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");

function createMockArtifactQuery(
  byCreator: Record<string, { artifactId: string; title: string; trackId: ReturnType<typeof createTrackId> }[]>,
  byTrack: Record<string, { artifactId: string; title: string; creatorId: string }[]>
): ArtifactQueryPort {
  return {
    getPublishedByCreator: vi.fn(async (creatorId: string) => {
      const list = byCreator[creatorId] ?? [];
      return list.map((a) => ({
        artifactId: a.artifactId,
        title: a.title,
        creatorId,
        trackId: a.trackId,
        artifactType: "fragment",
        publishedAt: new Date("2026-01-01T00:00:00Z"),
      }));
    }),
    getPublishedByTrack: vi.fn(async (trackId: string) => {
      const list = byTrack[trackId] ?? [];
      return list.map((a) => ({
        artifactId: a.artifactId,
        title: a.title,
        creatorId: a.creatorId,
        trackId,
        artifactType: "fragment",
        publishedAt: new Date("2026-01-01T00:00:00Z"),
      }));
    }),
  };
}

function createMockPortfolioQuery(
  xpByCreator: Record<string, number> = {},
  skillByCreator: Record<string, number | null> = {}
): PortfolioQueryPort {
  return {
    getCreatorXp: vi.fn(async (creatorId: string) => xpByCreator[creatorId] ?? 0),
    getCreatorSkillLevel: vi.fn(
      async (creatorId: string) => skillByCreator[creatorId] ?? null
    ),
  };
}

describe("ArtifactGalleryService", () => {
  it("getGallery returns artifacts for user with portfolio data enriched", async () => {
    const artifactQuery = createMockArtifactQuery(
      {
        "user-1": [
          {
            artifactId: "art-1",
            title: "My Fragment",
            trackId: TRACK_ID,
          },
        ],
      },
      {}
    );
    const portfolioQuery = createMockPortfolioQuery(
      { "user-1": 150 },
      { "user-1": 3 }
    );
    const service = new ArtifactGalleryService({
      artifactQuery,
      portfolioQuery,
    });

    const gallery = await service.getGallery("user-1");

    expect(gallery).toHaveLength(1);
    expect(gallery[0]).toMatchObject({
      artifactId: "art-1",
      title: "My Fragment",
      creatorId: "user-1",
      trackId: TRACK_ID,
      creatorXp: 150,
      creatorSkillLevel: 3,
    });
    expect(artifactQuery.getPublishedByCreator).toHaveBeenCalledWith("user-1");
  });

  it("getForCreator returns artifacts for creator", async () => {
    const artifactQuery = createMockArtifactQuery(
      {
        "creator-1": [
          { artifactId: "a1", title: "One", trackId: TRACK_ID },
          { artifactId: "a2", title: "Two", trackId: TRACK_ID },
        ],
      },
      {}
    );
    const portfolioQuery = createMockPortfolioQuery();
    const service = new ArtifactGalleryService({
      artifactQuery,
      portfolioQuery,
    });

    const gallery = await service.getForCreator("creator-1");

    expect(gallery).toHaveLength(2);
    expect(gallery[0]?.title).toBe("One");
    expect(gallery[1]?.title).toBe("Two");
    expect(artifactQuery.getPublishedByCreator).toHaveBeenCalledWith(
      "creator-1"
    );
  });

  it("getForTrack returns artifacts for track with creator XP and skill enriched", async () => {
    const artifactQuery = createMockArtifactQuery(
      {},
      {
        [TRACK_ID]: [
          { artifactId: "art-1", title: "F1", creatorId: "c1" },
          { artifactId: "art-2", title: "F2", creatorId: "c2" },
        ],
      }
    );
    const portfolioQuery = createMockPortfolioQuery(
      { c1: 100, c2: 200 },
      { c1: 2, c2: 4 }
    );
    const service = new ArtifactGalleryService({
      artifactQuery,
      portfolioQuery,
    });

    const gallery = await service.getForTrack(TRACK_ID);

    expect(gallery).toHaveLength(2);
    expect(gallery[0]).toMatchObject({
      artifactId: "art-1",
      creatorId: "c1",
      creatorXp: 100,
      creatorSkillLevel: 2,
    });
    expect(gallery[1]).toMatchObject({
      artifactId: "art-2",
      creatorId: "c2",
      creatorXp: 200,
      creatorSkillLevel: 4,
    });
    expect(artifactQuery.getPublishedByTrack).toHaveBeenCalledWith(TRACK_ID);
  });

  it("getGallery returns empty array when user has no published artifacts", async () => {
    const artifactQuery = createMockArtifactQuery({}, {});
    const portfolioQuery = createMockPortfolioQuery();
    const service = new ArtifactGalleryService({
      artifactQuery,
      portfolioQuery,
    });

    const gallery = await service.getGallery("no-artifacts");

    expect(gallery).toEqual([]);
  });
});
