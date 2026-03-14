/**
 * Ports for ArtifactGallery read model (COMP-018.3).
 * Architecture: mentorship-community.md, PAT-005.
 */

import type { TrackId } from "@syntropy/types";

import type { ArtifactGalleryItem } from "../../domain/mentorship/artifact-gallery.js";

/**
 * Fetches published artifact metadata (from DIP or search index).
 * Learn domain does not own this data; adapter translates external model.
 */
export interface ArtifactQueryPort {
  getPublishedByCreator(creatorId: string): Promise<ArtifactGalleryItem[]>;
  getPublishedByTrack(trackId: TrackId): Promise<ArtifactGalleryItem[]>;
}

/**
 * Fetches creator portfolio context (XP, skill level) from Platform Core.
 */
export interface PortfolioQueryPort {
  getCreatorXp(creatorId: string): Promise<number>;
  getCreatorSkillLevel(creatorId: string): Promise<number | null>;
}
