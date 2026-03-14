/**
 * ArtifactGallery read model types (COMP-018.3).
 * Architecture: mentorship-community.md — projection of DIP + Platform Core data.
 */

import type { TrackId } from "@syntropy/types";

/**
 * Single item in the artifact gallery: published artifact with creator context.
 * Sourced from DIP (artifact metadata) + Platform Core (portfolio).
 */
export interface ArtifactGalleryItem {
  readonly artifactId: string;
  readonly title: string;
  readonly creatorId: string;
  readonly trackId: TrackId;
  readonly artifactType: string;
  readonly publishedAt: Date;
  readonly creatorSkillLevel?: number | null;
  readonly creatorXp?: number | null;
}

/**
 * Gallery result: list of items (e.g. for a user or track).
 */
export type ArtifactGallery = readonly ArtifactGalleryItem[];
