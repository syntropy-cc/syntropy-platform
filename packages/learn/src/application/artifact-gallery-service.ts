/**
 * ArtifactGalleryService — read model over published artifacts + portfolio (COMP-018.3).
 * Architecture: mentorship-community.md.
 */

import type { TrackId } from "@syntropy/types";

import type {
  ArtifactGallery,
  ArtifactGalleryItem,
} from "../domain/mentorship/artifact-gallery.js";
import type {
  ArtifactQueryPort,
  PortfolioQueryPort,
} from "./ports/artifact-gallery-ports.js";

export interface ArtifactGalleryServiceDeps {
  readonly artifactQuery: ArtifactQueryPort;
  readonly portfolioQuery: PortfolioQueryPort;
}

/**
 * Service that aggregates published artifacts with creator portfolio context
 * for community gallery views. Data from DIP + Platform Core via ports.
 */
export class ArtifactGalleryService {
  constructor(private readonly deps: ArtifactGalleryServiceDeps) {}

  /**
   * Returns gallery for a user (artifacts they published with XP/skill level).
   */
  async getGallery(userId: string): Promise<ArtifactGallery> {
    return this.getForCreator(userId);
  }

  /**
   * Returns published artifacts for a track with creator context.
   */
  async getForTrack(trackId: TrackId): Promise<ArtifactGallery> {
    const items = await this.deps.artifactQuery.getPublishedByTrack(trackId);
    return this.enrichWithPortfolio(items);
  }

  /**
   * Returns published artifacts for a creator with portfolio context.
   */
  async getForCreator(creatorId: string): Promise<ArtifactGallery> {
    const items =
      await this.deps.artifactQuery.getPublishedByCreator(creatorId);
    return this.enrichWithPortfolio(items);
  }

  private async enrichWithPortfolio(
    items: ArtifactGalleryItem[]
  ): Promise<ArtifactGalleryItem[]> {
    const creatorIds = [...new Set(items.map((i) => i.creatorId))];
    const xpByCreator = new Map<string, number>();
    const skillByCreator = new Map<string, number | null>();
    await Promise.all(
      creatorIds.map(async (id) => {
        const [xp, skill] = await Promise.all([
          this.deps.portfolioQuery.getCreatorXp(id),
          this.deps.portfolioQuery.getCreatorSkillLevel(id),
        ]);
        xpByCreator.set(id, xp);
        skillByCreator.set(id, skill);
      })
    );

    return items.map((item) => ({
      ...item,
      creatorXp:
        item.creatorXp ?? xpByCreator.get(item.creatorId) ?? null,
      creatorSkillLevel:
        item.creatorSkillLevel ?? skillByCreator.get(item.creatorId) ?? null,
    }));
  }
}
